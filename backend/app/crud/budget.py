from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate

def get_budget(db: Session, budget_id: int, user_id: int):
    return db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()

def get_budgets(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Budget).filter(Budget.user_id == user_id).offset(skip).limit(limit).all()

def create_budget(db: Session, budget: BudgetCreate, user_id: int):
    db_budget = Budget(**budget.dict(), user_id=user_id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def update_budget(db: Session, db_budget: Budget, budget_in: BudgetUpdate):
    budget_data = budget_in.dict(exclude_unset=True)
    for key, value in budget_data.items():
        setattr(db_budget, key, value)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def delete_budget(db: Session, budget_id: int, user_id: int):
    db_budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    db.delete(db_budget)
    db.commit()
    return db_budget

def get_budget_with_progress(db: Session, budget: Budget):
    spent = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == budget.user_id,
        Transaction.category == budget.category,
        Transaction.transaction_type == 'expense',
        Transaction.timestamp >= budget.start_date,
        Transaction.timestamp <= budget.end_date
    ).scalar() or 0.0
    
    remaining = budget.amount - spent
    
    return {
        "id": budget.id,
        "category": budget.category,
        "amount": budget.amount,
        "start_date": budget.start_date,
        "end_date": budget.end_date,
        "user_id": budget.user_id,
        "spent": spent,
        "remaining": remaining,
    } 