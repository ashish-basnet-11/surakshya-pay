from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
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
def get_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == 'income'
    ).scalar() or 0.0

    total_expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == 'expense'
    ).scalar() or 0.0

    balance = current_user.balance

    spending_by_category_query = db.query(
        Transaction.category,
        func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == 'expense'
    ).group_by(Transaction.category).all()

    spending_by_category: Dict[str, float] = {row[0]: row[1] for row in spending_by_category_query}

    transaction_count = db.query(Transaction).filter(Transaction.user_id == current_user.id).count()
    average_transaction_amount = db.query(func.avg(Transaction.amount)).filter(Transaction.user_id == current_user.id).scalar() or 0.0
    min_transaction_amount = db.query(func.min(Transaction.amount)).filter(Transaction.user_id == current_user.id).scalar() or 0.0
    max_transaction_amount = db.query(func.max(Transaction.amount)).filter(Transaction.user_id == current_user.id).scalar() or 0.0
    recent_transactions_query = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.timestamp.desc()).limit(5).all()
    recent_transactions = [
        {
            "id": t.id,
            "amount": t.amount,
            "category": t.category,
            "description": t.description,
            "timestamp": t.timestamp.isoformat() if t.timestamp else None,
            "transaction_type": t.transaction_type
        }
        for t in recent_transactions_query
    ]
    stats = Statistics(
        total_income=total_income,
        total_expense=total_expense,
        balance=balance,
        spending_by_category=spending_by_category,
        transaction_count=transaction_count,
        average_transaction_amount=average_transaction_amount,
        min_transaction_amount=min_transaction_amount,
        max_transaction_amount=max_transaction_amount,
        recent_transactions=recent_transactions
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