import datetime

from fastapi import HTTPException
from sqlalchemy import and_, asc, desc, func, or_
from sqlalchemy.orm import Session

from app.models.budget import Budget, BudgetStatus, BudgetType
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate

WARNING_RATIO = 0.9
# Goals hold money locked on-chain (spent_amount mirrors the goal's on-chain balance); expenses track spending.
GOAL_TYPES = (BudgetType.SAVINGS, BudgetType.INVESTMENT)


def compute_status(budget: Budget, today: datetime.date | None = None) -> BudgetStatus:
    """
    The one rule for budget status:
    - savings / investment goals are COMPLETED once the target is reached;
    - spending limits are COMPLETED once their end date has passed, WARNING at 90%+
      of the limit (including when over it), otherwise ACTIVE.
    """
    today = today or datetime.date.today()
    spent, limit = budget.spent_amount or 0.0, budget.budget_amount or 0.0
    if budget.budget_type in GOAL_TYPES:
        return BudgetStatus.COMPLETED if limit and spent >= limit else BudgetStatus.ACTIVE
    if budget.end_date and budget.end_date < today:
        return BudgetStatus.COMPLETED
    if limit and spent >= limit * WARNING_RATIO:
        return BudgetStatus.WARNING
    return BudgetStatus.ACTIVE


def _refresh_statuses(db: Session, user_id: int) -> None:
    """Statuses depend on today's date, so bring stored values up to date before reading/filtering."""
    changed = False
    for budget in db.query(Budget).filter(Budget.user_id == user_id).all():
        status = compute_status(budget)
        if budget.status != status:
            budget.status = status
            changed = True
    if changed:
        db.commit()


def _active_on(day: datetime.date):
    return and_(Budget.start_date <= day, or_(Budget.end_date.is_(None), Budget.end_date >= day))


def get_budget(db: Session, budget_id: int, user_id: int):
    return db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == user_id).first()


_SORT_COLUMNS = {"date": Budget.created_at, "amount": Budget.budget_amount, "name": Budget.name, "category": Budget.category}


def get_budgets(db: Session, user_id: int, skip: int = 0, limit: int = 100, status: str = None, category: str = None,
                budget_type: str = None, sort_by: str = "created_at", sort_order: str = "desc"):
    _refresh_statuses(db, user_id)
    query = db.query(Budget).filter(Budget.user_id == user_id)
    if status:
        query = query.filter(Budget.status == BudgetStatus(status))
    if category:
        query = query.filter(func.lower(Budget.category) == category.lower())
    if budget_type:
        query = query.filter(Budget.budget_type == BudgetType(budget_type))
    column = _SORT_COLUMNS.get(sort_by, Budget.created_at)
    query = query.order_by(desc(column) if sort_order == "desc" else asc(column))
    return query.offset(skip).limit(limit).all()


def create_budget(db: Session, budget: BudgetCreate, user_id: int):
    db_budget = Budget(**budget.model_dump(), user_id=user_id, spent_amount=0.0)
    db_budget.status = compute_status(db_budget)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def update_budget(db: Session, db_budget: Budget, budget_in: BudgetUpdate):
    data = budget_in.model_dump(exclude_unset=True)
    data.pop("status", None)  # derived, not user-settable
    if data.get("budget_type") not in (None, db_budget.budget_type) and (db_budget.spent_amount or 0) > 0:
        raise HTTPException(status_code=400, detail="You can't change the type of a budget that already has money in it.")
    for key, value in data.items():
        setattr(db_budget, key, value)
    if db_budget.end_date and db_budget.end_date < db_budget.start_date:
        db.rollback()
        raise HTTPException(status_code=422, detail="End date must be on or after the start date.")
    db_budget.status = compute_status(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def delete_budget(db: Session, budget_id: int, user_id: int):
    db_budget = get_budget(db, budget_id, user_id)
    if db_budget:
        db.delete(db_budget)
        db.commit()
    return db_budget


def update_budget_from_transaction(db: Session, user_id: int, category: str, amount: float):
    """
    Apply an outgoing, user-tagged payment to the spending budgets with exactly that category
    (case-insensitive) that are running today. Savings goals only grow by saving into them.
    Does not commit; the caller's transaction does.
    """
    if not category or amount <= 0:
        return []
    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.budget_type == BudgetType.EXPENSE,
        func.lower(Budget.category) == category.strip().lower(),
        _active_on(datetime.date.today()),
    ).all()
    for budget in budgets:
        budget.spent_amount = (budget.spent_amount or 0.0) + amount
        budget.status = compute_status(budget)
        budget.updated_at = datetime.datetime.utcnow()
    return budgets


def update_budget_spent_amount(db: Session, budget_id: int, user_id: int, amount: float):
    """Manual adjustment (e.g. cash spending outside the wallet)."""
    budget = get_budget(db, budget_id, user_id)
    if budget:
        budget.spent_amount = max(0.0, (budget.spent_amount or 0.0) + amount)
        budget.status = compute_status(budget)
        db.commit()
        db.refresh(budget)
    return budget


def get_budget_with_progress(db: Session, budget: Budget):
    limit = budget.budget_amount or 0.0
    spent = budget.spent_amount or 0.0
    return {
        "id": budget.id,
        "name": budget.name,
        "description": budget.description,
        "category": budget.category,
        "budget_amount": limit,
        "spent_amount": spent,
        "budget_type": budget.budget_type,
        "status": budget.status,
        "color": budget.color,
        "icon": budget.icon,
        "start_date": budget.start_date,
        "end_date": budget.end_date,
        "user_id": budget.user_id,
        "created_at": budget.created_at,
        "updated_at": budget.updated_at,
        "remaining": limit - spent,
        "progress_percentage": (spent / limit) * 100 if limit > 0 else 0,
        "is_over_budget": spent > limit,
    }


def get_budget_statistics(db: Session, user_id: int):
    _refresh_statuses(db, user_id)
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    total = len(budgets)
    total_budget = sum(b.budget_amount for b in budgets)
    total_spent = sum(b.spent_amount or 0.0 for b in budgets)
    on_track = sum(1 for b in budgets if b.budget_amount and (b.spent_amount or 0.0) / b.budget_amount <= 0.8)
    return {
        "total_budgets": total,
        "active_budgets": sum(1 for b in budgets if b.status == BudgetStatus.ACTIVE),
        "warning_budgets": sum(1 for b in budgets if b.status == BudgetStatus.WARNING),
        "completed_budgets": sum(1 for b in budgets if b.status == BudgetStatus.COMPLETED),
        "total_budget_amount": total_budget,
        "total_spent_amount": total_spent,
        "total_remaining_amount": total_budget - total_spent,
        "budget_usage_percentage": (total_spent / total_budget) * 100 if total_budget > 0 else 0,
        "on_track_percentage": (on_track / total) * 100 if total > 0 else 0,
    }


def get_budget_summary(db: Session, user_id: int):
    """This month's spending limits: every expense budget running at any point this month."""
    today = datetime.date.today()
    month_start = today.replace(day=1)
    month_end = (month_start + datetime.timedelta(days=32)).replace(day=1) - datetime.timedelta(days=1)

    statistics = get_budget_statistics(db, user_id)
    monthly = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.budget_type == BudgetType.EXPENSE,
        Budget.start_date <= month_end,
        or_(Budget.end_date.is_(None), Budget.end_date >= month_start),
    ).all()
    monthly_budget = sum(b.budget_amount for b in monthly)
    monthly_spent = sum(b.spent_amount or 0.0 for b in monthly)
    return {
        "monthly_budget": monthly_budget,
        "monthly_spent": monthly_spent,
        "monthly_remaining": monthly_budget - monthly_spent,
        "warning_count": sum(1 for b in monthly if b.status == BudgetStatus.WARNING),
        "statistics": statistics,
    }


def get_category_progress(db: Session, user_id: int, limit: int = 5):
    rows = db.query(
        Budget.category,
        func.sum(Budget.budget_amount).label("budget_amount"),
        func.sum(Budget.spent_amount).label("spent_amount"),
        func.min(Budget.color).label("color"),
    ).filter(Budget.user_id == user_id).group_by(Budget.category).order_by(desc("spent_amount")).limit(limit).all()
    return [
        {
            "category": r.category,
            "budget_amount": float(r.budget_amount or 0),
            "spent_amount": float(r.spent_amount or 0),
            "progress_percentage": (r.spent_amount / r.budget_amount) * 100 if r.budget_amount else 0,
            "color": r.color,
            "is_over_budget": (r.spent_amount or 0) > (r.budget_amount or 0),
        }
        for r in rows
    ]


def get_trend_data(db: Session, user_id: int, days: int = 7):
    """Daily total budgeted vs. money actually spent (withdrawals + outgoing transfers)."""
    end = datetime.date.today()
    start = end - datetime.timedelta(days=days)
    wallet = db.query(User.wallet_address).filter(User.id == user_id).scalar()

    day = func.date(Transaction.timestamp)
    spent_by_day = dict(
        db.query(day, func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            day >= start,
            or_(
                Transaction.transaction_type == "WITHDRAWAL",
                and_(Transaction.transaction_type == "TRANSFER", Transaction.from_address == wallet),
            ),
        ).group_by(day).all()
    )
    budgets = db.query(Budget).filter(Budget.user_id == user_id, Budget.budget_type == BudgetType.EXPENSE).all()

    data = []
    current = start
    while current <= end:
        budgeted = sum(b.budget_amount for b in budgets if b.start_date <= current and (b.end_date is None or b.end_date >= current))
        data.append({"date": current.isoformat(), "budget": float(budgeted), "spent": float(spent_by_day.get(current, 0.0))})
        current += datetime.timedelta(days=1)
    return data


def get_budget_analytics(db: Session, user_id: int):
    return {
        "category_progress": get_category_progress(db, user_id),
        "trend_data": get_trend_data(db, user_id),
        "summary": get_budget_summary(db, user_id),
    }


def search_budgets(db: Session, user_id: int, query: str, skip: int = 0, limit: int = 100):
    pattern = f"%{query}%"
    return db.query(Budget).filter(
        Budget.user_id == user_id,
        or_(Budget.name.ilike(pattern), Budget.category.ilike(pattern), Budget.description.ilike(pattern)),
    ).offset(skip).limit(limit).all()
