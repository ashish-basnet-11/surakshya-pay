from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict

from app.models.transaction import Transaction
from app.schemas.statistics import Statistics
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User

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

    balance = total_income - total_expense

    spending_by_category_query = db.query(
        Transaction.category,
        func.sum(Transaction.amount)
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == 'expense'
    ).group_by(Transaction.category).all()

    spending_by_category: Dict[str, float] = {row[0]: row[1] for row in spending_by_category_query}

    stats = Statistics(
        total_income=total_income,
        total_expense=total_expense,
        balance=balance,
        spending_by_category=spending_by_category
    )

    return CommonResponse(success=True, message="Statistics fetched successfully", data=stats) 