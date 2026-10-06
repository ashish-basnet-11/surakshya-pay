from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import budget as crud_budget
from app.schemas.budget import (
    Budget, BudgetCreate, BudgetUpdate, BudgetSummary, 
    BudgetAnalytics, BudgetStatistics, BudgetStatus, BudgetType
)
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.budget import Budget as BudgetModel

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
def delete_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: int,
    current_user: User = Depends(get_current_user)
):
    """Delete a budget"""
    budget = crud_budget.get_budget(db, budget_id=budget_id, user_id=current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
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
    """Get available budget categories for the user"""
    categories = db.query(BudgetModel.category).filter(BudgetModel.user_id == current_user.id).distinct().all()
    category_list = [cat[0] for cat in categories]
    return CommonResponse(success=True, message="Categories fetched successfully", data=category_list) 