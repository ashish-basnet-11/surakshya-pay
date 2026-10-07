import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
from typing import List, Optional

from app.api.endpoints.transactions import _commit_or_report, _private_key, _record, _run_on_chain, _sync_balance, _whole_amount

from app.crud import budget as crud_budget
from app.schemas.budget import (
    Budget, BudgetCreate, BudgetUpdate, BudgetSummary, 
    BudgetAnalytics, BudgetStatistics, BudgetStatus, BudgetType
)
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.budget import Budget as BudgetModel
from app.utils.blockchain import get_goal_balance_onchain, release_from_goal_onchain, save_to_goal_onchain

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=CommonResponse[Budget])
def create_budget(
    *,
    db: Session = Depends(get_db),
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new budget"""
    budget = crud_budget.create_budget(db=db, budget=budget_in, user_id=current_user.id)
    return CommonResponse(success=True, message="Budget created successfully", data=crud_budget.get_budget_with_progress(db, budget))

@router.get("/", response_model=CommonResponse[List[Budget]])
def read_budgets(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, pattern="^(active|warning|completed)$"),
    category: Optional[str] = Query(None),
    budget_type: Optional[str] = Query(None, pattern="^(expense|savings|investment)$"),
    sort_by: str = Query("created_at", pattern="^(date|amount|name|category|created_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user)
):
    """Get budgets with filtering and sorting"""
    budgets = crud_budget.get_budgets(
        db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit,
        status=status,
        category=category,
        budget_type=budget_type,
        sort_by=sort_by,
        sort_order=sort_order
    )
    budgets_with_progress = [crud_budget.get_budget_with_progress(db, b) for b in budgets]
    return CommonResponse(success=True, message="Budgets fetched successfully", data=budgets_with_progress)

@router.get("/search", response_model=CommonResponse[List[Budget]])
def search_budgets(
    db: Session = Depends(get_db),
    query: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user)
):
    """Search budgets by name, category, or description"""
    budgets = crud_budget.search_budgets(db, user_id=current_user.id, query=query, skip=skip, limit=limit)
    budgets_with_progress = [crud_budget.get_budget_with_progress(db, b) for b in budgets]
    return CommonResponse(success=True, message="Search completed successfully", data=budgets_with_progress)

@router.get("/{budget_id:int}", response_model=CommonResponse[Budget])
def read_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get a specific budget by ID"""
    budget = crud_budget.get_budget(db, budget_id=budget_id, user_id=current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget_with_progress = crud_budget.get_budget_with_progress(db, budget)
    return CommonResponse(success=True, message="Budget fetched successfully", data=budget_with_progress)

@router.put("/{budget_id:int}", response_model=CommonResponse[Budget])
def update_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: int,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a budget"""
    budget = crud_budget.get_budget(db, budget_id=budget_id, user_id=current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget = crud_budget.update_budget(db=db, db_budget=budget, budget_in=budget_in)
    budget_with_progress = crud_budget.get_budget_with_progress(db, budget)
    return CommonResponse(success=True, message="Budget updated successfully", data=budget_with_progress)

@router.delete("/{budget_id:int}", response_model=CommonResponse)
async def delete_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: int,
    current_user: User = Depends(get_current_user)
):
    """Delete a budget"""
    budget = crud_budget.get_budget(db, budget_id=budget_id, user_id=current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    if budget.budget_type in crud_budget.GOAL_TYPES and (budget.spent_amount or 0) > 0:
        # Never strand locked money: put it back in the wallet before the goal disappears.
        await _move_goal_money(db, budget, current_user, int(budget.spent_amount), save=False)
    crud_budget.delete_budget(db=db, budget_id=budget_id, user_id=current_user.id)
    return CommonResponse(success=True, message="Budget deleted successfully", data=None)

@router.get("/summary/overview", response_model=CommonResponse[BudgetSummary])
def get_budget_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get budget summary and overview"""
    summary = crud_budget.get_budget_summary(db, user_id=current_user.id)
    return CommonResponse(success=True, message="Budget summary fetched successfully", data=summary)

@router.get("/statistics", response_model=CommonResponse[BudgetStatistics])
def get_budget_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive budget statistics"""
    statistics = crud_budget.get_budget_statistics(db, user_id=current_user.id)
    return CommonResponse(success=True, message="Budget statistics fetched successfully", data=statistics)

@router.get("/analytics/complete", response_model=CommonResponse[BudgetAnalytics])
def get_budget_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete budget analytics including trends and category progress"""
    analytics = crud_budget.get_budget_analytics(db, user_id=current_user.id)
    return CommonResponse(success=True, message="Budget analytics fetched successfully", data=analytics)

@router.get("/analytics/category-progress", response_model=CommonResponse[List[dict]])
def get_category_progress(
    db: Session = Depends(get_db),
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user)
):
    """Get budget progress by category"""
    progress = crud_budget.get_category_progress(db, user_id=current_user.id, limit=limit)
    return CommonResponse(success=True, message="Category progress fetched successfully", data=progress)

@router.get("/analytics/trend", response_model=CommonResponse[List[dict]])
def get_trend_data(
    db: Session = Depends(get_db),
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user)
):
    """Get budget vs spending trend data"""
    trend_data = crud_budget.get_trend_data(db, user_id=current_user.id, days=days)
    return CommonResponse(success=True, message="Trend data fetched successfully", data=trend_data)

@router.post("/{budget_id:int}/update-spent", response_model=CommonResponse[Budget])
def update_budget_spent(
    *,
    db: Session = Depends(get_db),
    budget_id: int,
    amount: float = Query(..., gt=0),
    current_user: User = Depends(get_current_user)
):
    """Update spent amount for a budget (used when transactions occur)"""
    budget = crud_budget.get_budget(db, budget_id=budget_id, user_id=current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    if budget.budget_type in crud_budget.GOAL_TYPES:
        raise HTTPException(status_code=400, detail="Savings goals change only by saving into them or moving money back.")

    updated_budget = crud_budget.update_budget_spent_amount(db, budget_id, current_user.id, amount)
    budget_with_progress = crud_budget.get_budget_with_progress(db, updated_budget)
    return CommonResponse(success=True, message="Budget spent amount updated successfully", data=budget_with_progress)

@router.get("/filters/status", response_model=CommonResponse[List[str]])
def get_available_statuses():
    """Get available budget statuses"""
    statuses = [status.value for status in BudgetStatus]
    return CommonResponse(success=True, message="Statuses fetched successfully", data=statuses)

@router.get("/filters/types", response_model=CommonResponse[List[str]])
def get_available_types():
    """Get available budget types"""
    types = [budget_type.value for budget_type in BudgetType]
    return CommonResponse(success=True, message="Budget types fetched successfully", data=types)

@router.get("/filters/categories", response_model=CommonResponse[List[str]])
def get_available_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Spending-budget categories a transfer can be tagged with (savings goals only grow by saving into them)."""
    categories = db.query(BudgetModel.category).filter(
        BudgetModel.user_id == current_user.id, BudgetModel.budget_type == BudgetType.EXPENSE
    ).distinct().all()
    category_list = [cat[0] for cat in categories]
    return CommonResponse(success=True, message="Categories fetched successfully", data=category_list)


# ---------------------------------------------------------------- savings goals (money locked on-chain)

async def _move_goal_money(db: Session, budget: BudgetModel, user: User, value: int, *, save: bool):
    fn = save_to_goal_onchain if save else release_from_goal_onchain
    tx_hash = await _run_on_chain(fn, user.wallet_address, budget.id, value, _private_key(user))
    logger.info("[Savings] %s NPR %s %s goal %s (user %s) tx=%s", "saved" if save else "released", value,
                "to" if save else "from", budget.id, user.id, tx_hash)
    await _sync_balance(user, -value if save else value)
    try:
        budget.spent_amount = await run_in_threadpool(get_goal_balance_onchain, user.wallet_address, budget.id)
    except Exception:
        logger.warning("Goal balance read failed for budget %s; using local estimate", budget.id)
        budget.spent_amount = max(0, (budget.spent_amount or 0) + (value if save else -value))
    budget.status = crud_budget.compute_status(budget)
    _record(
        db, user_id=user.id, kind="SAVE" if save else "RELEASE", amount=value, tx_hash=tx_hash,
        from_address=user.wallet_address, to_address=user.wallet_address, category="savings",
        description=f"Saved {value} NPR to {budget.name}" if save else f"Moved {value} NPR back from {budget.name}",
        title="Saved to goal" if save else "Moved from savings",
        message=f"NPR {value} was locked in your goal \"{budget.name}\"." if save
        else f"NPR {value} from your goal \"{budget.name}\" is back in your wallet.",
    )
    _commit_or_report(db, tx_hash)


def _goal(db: Session, budget_id: int, user: User) -> BudgetModel:
    budget = crud_budget.get_budget(db, budget_id=budget_id, user_id=user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    if budget.budget_type not in crud_budget.GOAL_TYPES:
        raise HTTPException(status_code=400, detail="Only savings and investment goals can hold money.")
    return budget


@router.post("/{budget_id:int}/save", response_model=CommonResponse[Budget])
async def save_to_goal(budget_id: int, amount: float = Query(...), db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    """Lock money from the spendable balance into this goal on-chain."""
    budget = _goal(db, budget_id, current_user)
    await _move_goal_money(db, budget, current_user, _whole_amount(amount), save=True)
    return CommonResponse(success=True, message="Saved to goal", data=crud_budget.get_budget_with_progress(db, budget))


@router.post("/{budget_id:int}/release", response_model=CommonResponse[Budget])
async def release_from_goal(budget_id: int, amount: float = Query(...), db: Session = Depends(get_db),
                            current_user: User = Depends(get_current_user)):
    """Move money from this goal back to the spendable balance."""
    budget = _goal(db, budget_id, current_user)
    await _move_goal_money(db, budget, current_user, _whole_amount(amount), save=False)
    return CommonResponse(success=True, message="Moved back to wallet", data=crud_budget.get_budget_with_progress(db, budget))
