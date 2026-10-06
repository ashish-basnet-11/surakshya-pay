from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_, case, func, or_
from typing import Dict

from app.models.transaction import Transaction
from app.schemas.statistics import Statistics, AdminDashboardStatistics
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from app.crud import user as crud_user
from app.crud import kyc as crud_kyc
from app.crud import transaction as crud_transaction
from app.utils.dependencies import get_current_active_superuser

router = APIRouter()

@router.get("/", response_model=CommonResponse[Statistics])
def get_statistics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Money in = top-ups + transfers received; money out = withdrawals + transfers sent.
    Both parties store a copy of each transfer, so direction comes from the sender address.
    """
    wallet = current_user.wallet_address
    outgoing = or_(
        Transaction.transaction_type == "WITHDRAWAL",
        and_(Transaction.transaction_type == "TRANSFER", Transaction.from_address == wallet),
    )
    incoming = or_(
        Transaction.transaction_type == "DEPOSIT",
        and_(Transaction.transaction_type == "TRANSFER", Transaction.from_address != wallet),
    )
    amount = func.abs(Transaction.amount)
    mine = Transaction.user_id == current_user.id

    totals = db.query(
        func.coalesce(func.sum(case((incoming, amount), else_=0)), 0),
        func.coalesce(func.sum(case((outgoing, amount), else_=0)), 0),
        func.count(Transaction.id),
        func.coalesce(func.avg(amount), 0),
        func.coalesce(func.min(amount), 0),
        func.coalesce(func.max(amount), 0),
    ).filter(mine).one()

    # Spending breakdown: outgoing money only, grouped by the user's own tag.
    # Case-insensitive grouping ("Food" and "food" are one category); show the first spelling.
    key = case(
        (Transaction.transaction_type == "WITHDRAWAL", "withdrawals"),
        (or_(Transaction.category.is_(None), func.lower(Transaction.category) == "transfer"), "transfers"),
        else_=func.lower(Transaction.category),
    )
    label = case((key.in_(["withdrawals", "transfers"]), key), else_=func.min(Transaction.category))
    by_category = db.query(label, func.sum(amount)).filter(mine, outgoing).group_by(key).all()

    recent = db.query(Transaction).filter(mine).order_by(Transaction.timestamp.desc(), Transaction.id.desc()).limit(8).all()
    stats = Statistics(
        total_income=float(totals[0]),
        total_expense=float(totals[1]),
        balance=float(current_user.balance or 0),
        spending_by_category={name: float(total) for name, total in by_category},
        transaction_count=totals[2],
        average_transaction_amount=float(totals[3]),
        min_transaction_amount=float(totals[4]),
        max_transaction_amount=float(totals[5]),
        recent_transactions=[
            {
                "id": t.id,
                "amount": t.amount,
                "category": t.category,
                "description": t.description,
                "timestamp": t.timestamp.isoformat() if t.timestamp else None,
                "transaction_type": t.transaction_type,
                "from_address": t.from_address,
            }
            for t in recent
        ],
    )
    return CommonResponse(success=True, message="Statistics fetched successfully", data=stats)


@router.get("/admin/dashboard", response_model=CommonResponse[AdminDashboardStatistics], dependencies=[Depends(get_current_active_superuser)])
def get_admin_dashboard_statistics(db: Session = Depends(get_db)):
    total_users = crud_user.count_total_users(db)
    total_admins = crud_user.count_total_admins(db)
    total_kyc_submitted = crud_kyc.count_total_kyc(db)
    total_kyc_approved = crud_kyc.count_kyc_by_status(db, "approved")
    total_kyc_pending = crud_kyc.count_kyc_by_status(db, "pending")
    total_kyc_rejected = crud_kyc.count_kyc_by_status(db, "rejected")
    total_transactions = crud_transaction.count_total_transactions(db)
    total_deposit_amount = crud_transaction.sum_transaction_amount_by_type(db, "DEPOSIT")
    total_withdrawal_amount = crud_transaction.sum_transaction_amount_by_type(db, "WITHDRAWAL")
    total_transfer_amount = crud_transaction.sum_transaction_amount_by_type(db, "TRANSFER")
    stats = AdminDashboardStatistics(
        total_users=total_users,
        total_admins=total_admins,
        total_kyc_submitted=total_kyc_submitted,
        total_kyc_approved=total_kyc_approved,
        total_kyc_pending=total_kyc_pending,
        total_kyc_rejected=total_kyc_rejected,
        total_transactions=total_transactions,
        total_deposit_amount=total_deposit_amount,
        total_withdrawal_amount=total_withdrawal_amount,
        total_transfer_amount=total_transfer_amount
    )
    return CommonResponse(success=True, message="Admin dashboard statistics fetched", data=stats) 