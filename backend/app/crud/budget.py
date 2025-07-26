from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc
from app.models.budget import Budget, BudgetStatus, BudgetType
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate
from typing import List, Dict, Any
import datetime

def get_budget(db: Session, budget_id: int, user_id: int):
    return db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()

def get_budgets(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100,
    status: str = None,
    category: str = None,
    budget_type: str = None,
    sort_by: str = "created_at",
    sort_order: str = "desc"
):
    query = db.query(Budget).filter(Budget.user_id == user_id)
    
    # Apply filters
    if status:
        query = query.filter(Budget.status == status)
    if category:
        query = query.filter(Budget.category == category)
    if budget_type:
        query = query.filter(Budget.budget_type == budget_type)
    
    # Apply sorting
    if sort_by == "date":
        sort_column = Budget.created_at
    elif sort_by == "amount":
        sort_column = Budget.budget_amount
    elif sort_by == "name":
        sort_column = Budget.name
    elif sort_by == "category":
        sort_column = Budget.category
    else:
        sort_column = Budget.created_at
    
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
    
    return query.offset(skip).limit(limit).all()

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
    
    # Update status based on spent amount
    if db_budget.spent_amount >= db_budget.budget_amount:
        db_budget.status = BudgetStatus.COMPLETED
    elif db_budget.spent_amount >= db_budget.budget_amount * 0.9:
        db_budget.status = BudgetStatus.WARNING
    
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def delete_budget(db: Session, budget_id: int, user_id: int):
    db_budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()
    if db_budget:
        db.delete(db_budget)
        db.commit()
    return db_budget

def update_budget_from_transaction(db: Session, user_id: int, category: str, amount: float):
    """
    Update budget spent amount when a transaction occurs.
    This method finds budgets that match the transaction category and updates their spent amounts.
    
    Args:
        db: Database session
        user_id: User ID
        category: Transaction category to match with budget categories
        amount: Transaction amount (positive for income, negative for expense)
    """
    # Find budgets that match the category and belong to the user
    matching_budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.category.ilike(f"%{category}%")  # Case-insensitive partial match
    ).all()
    
    # If no exact category match, try to find budgets with similar categories
    if not matching_budgets:
        # Common category mappings
        category_mappings = {
            "food": ["restaurant", "groceries", "dining", "food"],
            "transport": ["transport", "uber", "taxi", "gas", "fuel"],
            "entertainment": ["entertainment", "movie", "game", "concert"],
            "shopping": ["shopping", "clothes", "electronics", "amazon"],
            "bills": ["bills", "utilities", "electricity", "water", "internet"],
            "transfer": ["transfer", "payment", "transaction"],
            "withdrawal": ["withdrawal", "cash", "atm"],
            "deposit": ["deposit", "topup", "recharge"],
        }
        
        # Check if the category matches any of the mapped categories
        for mapped_category, keywords in category_mappings.items():
            if any(keyword in category.lower() for keyword in keywords):
                matching_budgets = db.query(Budget).filter(
                    Budget.user_id == user_id,
                    Budget.category.ilike(f"%{mapped_category}%")
                ).all()
                if matching_budgets:
                    break
    
    # Update each matching budget
    for budget in matching_budgets:
        # Only update expense budgets for negative amounts (expenses)
        # Only update savings/investment budgets for positive amounts (income)
        if amount < 0 and budget.budget_type in [BudgetType.EXPENSE, BudgetType.SAVINGS, BudgetType.INVESTMENT]:
            # For expenses, add the absolute amount to spent_amount
            budget.spent_amount += abs(amount)
        elif amount > 0 and budget.budget_type in [BudgetType.SAVINGS, BudgetType.INVESTMENT]:
            # For income, add to spent_amount (this represents progress toward savings goal)
            budget.spent_amount += amount
        
        # Update status based on spent amount
        if budget.spent_amount >= budget.budget_amount:
            budget.status = BudgetStatus.COMPLETED
        elif budget.spent_amount >= budget.budget_amount * 0.9:
            budget.status = BudgetStatus.WARNING
        else:
            budget.status = BudgetStatus.ACTIVE
        
        # Update the updated_at timestamp
        budget.updated_at = datetime.datetime.utcnow()
        
        db.add(budget)
    
    # Commit all changes
    if matching_budgets:
        db.commit()
    
    return matching_budgets

def update_budget_spent_amount(db: Session, budget_id: int, user_id: int, amount: float):
    """Update spent amount for a budget when a transaction occurs"""
    budget = get_budget(db, budget_id, user_id)
    if budget:
        budget.spent_amount += amount
        
        # Update status based on spent amount
        if budget.spent_amount >= budget.budget_amount:
            budget.status = BudgetStatus.COMPLETED
        elif budget.spent_amount >= budget.budget_amount * 0.9:
            budget.status = BudgetStatus.WARNING
        
        db.add(budget)
        db.commit()
        db.refresh(budget)
    return budget

def get_budget_with_progress(db: Session, budget: Budget):
    """Get budget with calculated progress and remaining amount"""
    remaining = budget.budget_amount - budget.spent_amount
    progress_percentage = (budget.spent_amount / budget.budget_amount) * 100 if budget.budget_amount > 0 else 0
    is_over_budget = budget.spent_amount > budget.budget_amount
    
    return {
        "id": budget.id,
        "name": budget.name,
        "description": budget.description,
        "category": budget.category,
        "budget_amount": budget.budget_amount,
        "spent_amount": budget.spent_amount,
        "budget_type": budget.budget_type,
        "status": budget.status,
        "color": budget.color,
        "icon": budget.icon,
        "start_date": budget.start_date,
        "end_date": budget.end_date,
        "user_id": budget.user_id,
        "created_at": budget.created_at,
        "updated_at": budget.updated_at,
        "remaining": remaining,
        "progress_percentage": progress_percentage,
        "is_over_budget": is_over_budget,
    }

def get_budget_statistics(db: Session, user_id: int):
    """Get comprehensive budget statistics for a user"""
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    
    total_budgets = len(budgets)
    active_budgets = len([b for b in budgets if b.status == BudgetStatus.ACTIVE])
    warning_budgets = len([b for b in budgets if b.status == BudgetStatus.WARNING])
    completed_budgets = len([b for b in budgets if b.status == BudgetStatus.COMPLETED])
    
    total_budget_amount = sum(b.budget_amount for b in budgets)
    total_spent_amount = sum(b.spent_amount for b in budgets)
    total_remaining_amount = total_budget_amount - total_spent_amount
    
    budget_usage_percentage = (total_spent_amount / total_budget_amount) * 100 if total_budget_amount > 0 else 0
    
    # Calculate on-track percentage (budgets with less than 80% spent)
    on_track_budgets = len([b for b in budgets if (b.spent_amount / b.budget_amount) <= 0.8]) if budgets else 0
    on_track_percentage = (on_track_budgets / total_budgets) * 100 if total_budgets > 0 else 0
    
    return {
        "total_budgets": total_budgets,
        "active_budgets": active_budgets,
        "warning_budgets": warning_budgets,
        "completed_budgets": completed_budgets,
        "total_budget_amount": total_budget_amount,
        "total_spent_amount": total_spent_amount,
        "total_remaining_amount": total_remaining_amount,
        "budget_usage_percentage": budget_usage_percentage,
        "on_track_percentage": on_track_percentage,
    }

def get_budget_summary(db: Session, user_id: int):
    """Get monthly budget summary"""
    current_month = datetime.date.today().replace(day=1)
    next_month = (current_month.replace(day=28) + datetime.timedelta(days=4)).replace(day=1)
    
    monthly_budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.start_date >= current_month,
        Budget.start_date < next_month
    ).all()
    
    monthly_budget = sum(b.budget_amount for b in monthly_budgets)
    monthly_spent = sum(b.spent_amount for b in monthly_budgets)
    monthly_remaining = monthly_budget - monthly_spent
    warning_count = len([b for b in monthly_budgets if b.status == BudgetStatus.WARNING])
    
    statistics = get_budget_statistics(db, user_id)
    
    return {
        "monthly_budget": monthly_budget,
        "monthly_spent": monthly_spent,
        "monthly_remaining": monthly_remaining,
        "warning_count": warning_count,
        "statistics": statistics,
    }

def get_category_progress(db: Session, user_id: int, limit: int = 5):
    """Get budget progress by category"""
    categories = db.query(
        Budget.category,
        func.sum(Budget.budget_amount).label('budget_amount'),
        func.sum(Budget.spent_amount).label('spent_amount'),
        Budget.color
    ).filter(Budget.user_id == user_id).group_by(Budget.category, Budget.color).limit(limit).all()
    
    result = []
    for cat in categories:
        progress_percentage = (cat.spent_amount / cat.budget_amount) * 100 if cat.budget_amount > 0 else 0
        is_over_budget = cat.spent_amount > cat.budget_amount
        
        result.append({
            "category": cat.category,
            "budget_amount": float(cat.budget_amount),
            "spent_amount": float(cat.spent_amount),
            "progress_percentage": progress_percentage,
            "color": cat.color,
            "is_over_budget": is_over_budget,
        })
    
    return result

def get_trend_data(db: Session, user_id: int, days: int = 7):
    """Get budget vs spending trend data for the last N days"""
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=days)
    
    # Get daily budget and spending data
    trend_data = []
    current_date = start_date
    
    while current_date <= end_date:
        # Get budget for this date
        daily_budget = db.query(func.sum(Budget.budget_amount)).filter(
            Budget.user_id == user_id,
            Budget.start_date <= current_date,
            or_(Budget.end_date >= current_date, Budget.end_date.is_(None))
        ).scalar() or 0.0
        
        # Get spending for this date
        daily_spent = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == 'expense',
            func.date(Transaction.timestamp) == current_date
        ).scalar() or 0.0
        
        trend_data.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "budget": float(daily_budget),
            "spent": float(daily_spent),
        })
        
        current_date += datetime.timedelta(days=1)
    
    return trend_data

def get_budget_analytics(db: Session, user_id: int):
    """Get comprehensive budget analytics"""
    category_progress = get_category_progress(db, user_id)
    trend_data = get_trend_data(db, user_id)
    summary = get_budget_summary(db, user_id)
    
    return {
        "category_progress": category_progress,
        "trend_data": trend_data,
        "summary": summary,
    }

def search_budgets(db: Session, user_id: int, query: str, skip: int = 0, limit: int = 100):
    """Search budgets by name or category"""
    return db.query(Budget).filter(
        Budget.user_id == user_id,
        or_(
            Budget.name.ilike(f"%{query}%"),
            Budget.category.ilike(f"%{query}%"),
            Budget.description.ilike(f"%{query}%")
        )
    ).offset(skip).limit(limit).all() 