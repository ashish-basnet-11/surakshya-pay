"""
Khalti ePay v2 (sandbox) top-ups: the user pays in Khalti's checkout, we confirm the payment with
Khalti's lookup API, then mint the same amount to their on-chain wallet.
"""
import logging
import uuid

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.endpoints.transactions import TOPUP_MAX, _commit_or_report, _private_key, _record, _run_on_chain, _sync_balance
from app.core.config import settings
from app.models.payment import KhaltiPayment
from app.models.user import User
from app.schemas.response import CommonResponse
from app.services.email_queue import send_later
from app.services.notification_service import send_transaction_notification
from app.utils.blockchain import deposit_onchain
from app.utils.dependencies import get_current_user, get_db

logger = logging.getLogger(__name__)
router = APIRouter()

KHALTI_MIN = 10  # Khalti rejects payments under Rs. 10 (1000 paisa)
KHALTI_TIMEOUT = httpx.Timeout(15.0)


class InitiateRequest(BaseModel):
    amount: int = Field(..., ge=KHALTI_MIN, le=TOPUP_MAX, description="Whole NPR")


class VerifyRequest(BaseModel):
    pidx: str = Field(..., min_length=1, max_length=64)


async def _khalti(path: str, payload: dict) -> dict:
    if not settings.KHALTI_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Khalti isn't configured on the server.")
    try:
        async with httpx.AsyncClient(timeout=KHALTI_TIMEOUT) as client:
            res = await client.post(
                f"{settings.KHALTI_BASE_URL}{path}", json=payload,
                headers={"Authorization": f"Key {settings.KHALTI_SECRET_KEY}"},
            )
    except httpx.HTTPError as e:
        logger.warning("[Khalti] %s unreachable: %s", path, e)
        raise HTTPException(status_code=502, detail="Couldn't reach Khalti. Please try again.")
    body = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
    if res.status_code >= 400:
        logger.warning("[Khalti] %s -> HTTP %s %s", path, res.status_code, body or res.text[:300])
        if res.status_code == 401:
            raise HTTPException(status_code=503, detail="Khalti rejected the server's secret key. Check KHALTI_SECRET_KEY.")
        raise HTTPException(status_code=502, detail=body.get("detail") or "Khalti rejected the request.")
    return body


@router.post("/khalti/initiate")
async def initiate_khalti(req: InitiateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _private_key(current_user)  # fail before sending the user to pay if their wallet can't receive funds
    order_id = f"SP-{current_user.id}-{uuid.uuid4().hex[:12]}"
    data = await _khalti("/epayment/initiate/", {
        "return_url": settings.KHALTI_RETURN_URL,
        "website_url": settings.KHALTI_WEBSITE_URL,
        "amount": req.amount * 100,  # paisa
        "purchase_order_id": order_id,
        "purchase_order_name": "Wallet Top Up - Surakshya Pay",
        "customer_info": {"name": current_user.full_name or current_user.username, "email": current_user.email},
    })
    db.add(KhaltiPayment(pidx=data["pidx"], user_id=current_user.id, amount=req.amount))
    db.commit()
    logger.info("[Khalti] initiated pidx=%s order=%s user=%s amount=NPR %s", data["pidx"], order_id, current_user.id, req.amount)
    return CommonResponse(success=True, message="Payment initiated", data={"pidx": data["pidx"], "payment_url": data["payment_url"]})


@router.post("/khalti/verify")
async def verify_khalti(
    req: VerifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(KhaltiPayment).filter(KhaltiPayment.pidx == req.pidx, KhaltiPayment.user_id == current_user.id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found.")
    if payment.status == "Settled":
        return _settled_response(payment, current_user, "Payment already credited")

    lookup = await _khalti("/epayment/lookup/", {"pidx": req.pidx})
    status = lookup.get("status")
    logger.info("[Khalti] lookup pidx=%s status=%s total_amount=%s txn=%s", req.pidx, status, lookup.get("total_amount"), lookup.get("transaction_id"))

    if status != "Completed":
        payment.status = status or "Unknown"
        db.commit()
        message = {
            # Khalti reports an opened-but-unpaid checkout as Pending too.
            "Pending": "The payment wasn't completed in Khalti, so no money was added.",
            "Initiated": "The payment wasn't completed.",
            "User canceled": "You cancelled the payment.",
            "Expired": "The payment link expired. Start a new top-up.",
        }.get(status, f"Khalti reports this payment as {status}.")
        raise HTTPException(status_code=400, detail=message)
    if lookup.get("total_amount") != payment.amount * 100:
        logger.error("[Khalti] amount mismatch pidx=%s expected=%s got=%s", req.pidx, payment.amount * 100, lookup.get("total_amount"))
        raise HTTPException(status_code=400, detail="The paid amount doesn't match this top-up. Contact support.")

    # Claim the payment atomically so a double tap or retry can't mint twice.
    claimed = (
        db.query(KhaltiPayment)
        .filter(KhaltiPayment.pidx == req.pidx, KhaltiPayment.status.notin_(["Processing", "Settled"]))
        .update({"status": "Processing"}, synchronize_session=False)
    )
    db.commit()
    if not claimed:
        db.refresh(payment)
        if payment.status == "Settled":
            return _settled_response(payment, current_user, "Payment already credited")
        raise HTTPException(status_code=409, detail="This payment is already being credited.")

    value = payment.amount
    try:
        tx_hash = await _run_on_chain(deposit_onchain, current_user.wallet_address, value, _private_key(current_user))
    except HTTPException:
        payment.status = "Completed"  # paid but not credited; safe to retry verify
        db.commit()
        raise
    logger.info("[Khalti] settled pidx=%s on-chain deposit NPR %s tx=%s", req.pidx, value, tx_hash)

    balance = await _sync_balance(current_user, value)
    payment.status, payment.tx_hash = "Settled", tx_hash
    _record(
        db, user_id=current_user.id, kind="DEPOSIT", amount=value, tx_hash=tx_hash,
        from_address=current_user.wallet_address, to_address=current_user.wallet_address,
        category="deposit", description=f"Khalti top-up of {value} NPR (pidx {req.pidx})",
        title="Topup Successful", message=f"NPR {value} from Khalti was added to your wallet.",
    )
    _commit_or_report(db, tx_hash)

    send_later(background_tasks, send_transaction_notification, email=current_user.email, user_name=current_user.full_name or "User",
               transaction_type="DEPOSIT", amount=value, tx_hash=tx_hash, new_balance=balance)
    return _settled_response(payment, current_user, "Topup successful")


def _settled_response(payment: KhaltiPayment, user: User, message: str) -> CommonResponse:
    return CommonResponse(success=True, message=message, data={
        "pidx": payment.pidx, "amount": payment.amount, "tx_hash": payment.tx_hash, "new_balance": int(float(user.balance or 0)),
    })


@router.get("/khalti/return", include_in_schema=False)
def khalti_return():
    """Khalti redirects the checkout browser here. The app verifies the payment once the browser closes."""
    return HTMLResponse(
        "<!doctype html><meta name=viewport content='width=device-width'><title>Surakshya Pay</title>"
        "<body style='font-family:system-ui;text-align:center;padding:48px 16px'>"
        "<h2>Payment finished</h2><p>Close this window to return to Surakshya Pay.</p>"
        "<script>window.close()</script></body>"
    )
