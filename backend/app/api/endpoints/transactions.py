import datetime
import logging
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.security import decrypt_private_key
from app.crud import budget as crud_budget
from app.crud import transaction as crud_transaction
from app.crud import user as crud_user
from app.models.notification import Notification
from app.models.transaction import Transaction as TransactionModel
from app.models.user import User
from app.schemas.response import CommonResponse
from app.schemas.transaction import Transaction
from app.services.email_queue import send_later
from app.services.notification_service import send_transaction_notification, send_transfer_received_notification
from app.utils.blockchain import ChainError, deposit_onchain, get_user_balance_onchain, transfer_onchain, withdraw_onchain
from app.utils.dependencies import get_current_user, get_db

logger = logging.getLogger(__name__)
router = APIRouter()

# Top-ups mint new money on the ledger, so cap them server-side (the app shows the same limit).
TOPUP_MAX = 5000


# ---------------------------------------------------------------- reads

@router.get("/", response_model=CommonResponse[List[Transaction]])
def get_all_transactions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    order_by: str = Query("latest", pattern="^(latest|oldest)$"),
    current_user: User = Depends(get_current_user),
):
    """The current user's transactions."""
    transactions = crud_transaction.get_transactions(db, user_id=current_user.id, skip=skip, limit=limit, order_by=order_by)
    return CommonResponse(success=True, message="Transactions fetched successfully", data=transactions)


@router.get("/{transaction_id:int}", response_model=CommonResponse[Transaction])
def get_transaction_by_id(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transaction = crud_transaction.get_transaction(db, transaction_id=transaction_id, user_id=current_user.id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return CommonResponse(success=True, message="Transaction fetched successfully", data=transaction)


@router.get("/user/{user_id:int}", response_model=CommonResponse[List[Transaction]])
def get_transactions_for_user(
    user_id: int,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    order_by: str = Query("latest", pattern="^(latest|oldest)$"),
    current_user: User = Depends(get_current_user),
):
    """A specific user's transactions: only your own, unless you're an admin."""
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="You can only view your own transactions.")
    transactions = crud_transaction.get_transactions(db, user_id=user_id, skip=skip, limit=limit, order_by=order_by)
    return CommonResponse(success=True, message="User transactions fetched successfully", data=transactions)


# ---------------------------------------------------------------- money movement

def _whole_amount(amount: float) -> int:
    """The ledger contract stores whole rupees; reject anything it can't represent exactly."""
    if amount <= 0 or amount != int(amount):
        raise HTTPException(status_code=400, detail="Enter a whole amount in NPR greater than zero.")
    return int(amount)


def _private_key(user: User) -> str:
    if not user.wallet_address or not user.private_key_encrypted:
        raise HTTPException(status_code=400, detail="Your wallet isn't set up. Please contact support.")
    return decrypt_private_key(user.private_key_encrypted, settings.SECRET_KEY)


async def _run_on_chain(fn, *args) -> str:
    # web3 is blocking; keep it off the event loop so other requests aren't stalled.
    try:
        return await run_in_threadpool(fn, *args)
    except ChainError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        logger.exception("Blockchain call %s failed", fn.__name__)
        raise HTTPException(
            status_code=502,
            detail="The payment network didn't respond. Check your balance before trying again.",
        )


async def _sync_balance(user: User, expected_delta: int) -> int:
    try:
        balance = await run_in_threadpool(get_user_balance_onchain, user.wallet_address)
    except Exception:
        logger.warning("Balance read failed for user %s; using local estimate", user.id)
        balance = int(float(user.balance or 0)) + expected_delta
    user.balance = str(balance)
    return balance


def _commit_or_report(db: Session, tx_hash: str):
    """The money already moved on-chain; if recording it fails, say so instead of claiming failure."""
    try:
        db.commit()
    except Exception:
        db.rollback()
        logger.critical("On-chain tx %s succeeded but could not be recorded", tx_hash, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Your payment went through but we couldn't record it. Contact support with reference {tx_hash}.",
        )


def _record(db: Session, *, user_id: int, kind: str, amount: int, tx_hash: str, from_address: str, to_address: str,
            category: str, description: str, title: str, message: str) -> TransactionModel:
    row = TransactionModel(
        user_id=user_id,
        amount=amount,
        transaction_type=kind,
        category=category,
        description=description,
        blockchain_hash=tx_hash,
        from_address=from_address,
        to_address=to_address,
        blockchain_timestamp=int(datetime.datetime.now().timestamp()),
        is_completed=True,
    )
    db.add(row)
    db.add(Notification(user_id=user_id, title=title, message=f"{message} Transaction hash: {tx_hash}", notification_type="transaction"))
    return row


@router.post("/topup")
async def topup(
    background_tasks: BackgroundTasks,
    amount: float = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    value = _whole_amount(amount)
    if value > TOPUP_MAX:
        raise HTTPException(status_code=400, detail=f"You can add up to NPR {TOPUP_MAX:,} at a time.")
    key = _private_key(current_user)

    tx_hash = await _run_on_chain(deposit_onchain, current_user.wallet_address, value, key)
    balance = await _sync_balance(current_user, value)
    row = _record(
        db, user_id=current_user.id, kind="DEPOSIT", amount=value, tx_hash=tx_hash,
        from_address=current_user.wallet_address, to_address=current_user.wallet_address,
        category="deposit", description=f"Topup of {value} NPR",
        title="Topup Successful", message=f"Your wallet has been topped up with NPR {value}.",
    )
    _commit_or_report(db, tx_hash)

    send_later(background_tasks, send_transaction_notification, email=current_user.email, user_name=current_user.full_name or "User",
               transaction_type="DEPOSIT", amount=value, tx_hash=tx_hash, new_balance=balance)
    return CommonResponse(success=True, message="Topup successful",
                          data={"tx_hash": tx_hash, "amount": value, "new_balance": balance, "transaction_id": row.id})


@router.post("/withdraw")
async def withdraw(
    background_tasks: BackgroundTasks,
    amount: float = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    value = _whole_amount(amount)
    key = _private_key(current_user)

    tx_hash = await _run_on_chain(withdraw_onchain, current_user.wallet_address, value, key)
    balance = await _sync_balance(current_user, -value)
    row = _record(
        db, user_id=current_user.id, kind="WITHDRAWAL", amount=value, tx_hash=tx_hash,
        from_address=current_user.wallet_address, to_address=current_user.wallet_address,
        category="withdrawal", description=f"Withdrawal of {value} NPR",
        title="Withdrawal Successful", message=f"NPR {value} was withdrawn from your wallet.",
    )
    _commit_or_report(db, tx_hash)

    send_later(background_tasks, send_transaction_notification, email=current_user.email, user_name=current_user.full_name or "User",
               transaction_type="WITHDRAWAL", amount=value, tx_hash=tx_hash, new_balance=balance)
    return CommonResponse(success=True, message="Withdrawal successful",
                          data={"tx_hash": tx_hash, "amount": value, "new_balance": balance, "transaction_id": row.id})


@router.post("/transfer")
async def transfer(
    background_tasks: BackgroundTasks,
    to_username: str = Query(..., min_length=1),
    amount: float = Query(...),
    category: Optional[str] = Query(None, max_length=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    value = _whole_amount(amount)
    category = (category or "").strip() or None
    recipient = crud_user.get_user_by_username(db, username=to_username.strip().lstrip("@"))
    if not recipient or not recipient.wallet_address:
        raise HTTPException(status_code=404, detail="No account found with that username.")
    if recipient.id == current_user.id:
        raise HTTPException(status_code=400, detail="You can't send money to yourself.")
    if not recipient.is_active:
        raise HTTPException(status_code=400, detail="That account can't receive payments right now.")
    key = _private_key(current_user)

    tx_hash = await _run_on_chain(transfer_onchain, current_user.wallet_address, recipient.wallet_address, value, key)
    sender_balance = await _sync_balance(current_user, -value)
    recipient_balance = await _sync_balance(recipient, value)

    # Both parties get their own row. The category is the sender's private budgeting tag,
    # so the recipient's copy is always plain "transfer".
    sender_row = _record(
        db, user_id=current_user.id, kind="TRANSFER", amount=value, tx_hash=tx_hash,
        from_address=current_user.wallet_address, to_address=recipient.wallet_address,
        category=category or "transfer", description=f"Transfer of {value} NPR to {recipient.username}",
        title="Transfer Successful", message=f"You sent NPR {value} to {recipient.username}.",
    )
    _record(
        db, user_id=recipient.id, kind="TRANSFER", amount=value, tx_hash=tx_hash,
        from_address=current_user.wallet_address, to_address=recipient.wallet_address,
        category="transfer", description=f"Received {value} NPR from {current_user.username}",
        title="Money Received", message=f"You received NPR {value} from {current_user.username}.",
    )
    if category:
        crud_budget.update_budget_from_transaction(db, user_id=current_user.id, category=category, amount=value)
    _commit_or_report(db, tx_hash)

    send_later(background_tasks, send_transaction_notification, email=current_user.email, user_name=current_user.full_name or "User",
               transaction_type="TRANSFER", amount=value, tx_hash=tx_hash, to_username=recipient.username, new_balance=sender_balance)
    send_later(background_tasks, send_transfer_received_notification, email=recipient.email, user_name=recipient.full_name or "User",
               amount=value, tx_hash=tx_hash, from_username=current_user.username, new_balance=recipient_balance)
    return CommonResponse(success=True, message="Transfer successful",
                          data={"tx_hash": tx_hash, "amount": value, "to_username": recipient.username,
                                "new_balance": sender_balance, "transaction_id": sender_row.id})
