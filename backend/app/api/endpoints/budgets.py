from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import budget as crud_budget
from app.schemas.budget import Budget, BudgetCreate, BudgetUpdate
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=CommonResponse[Budget])
def create_budget(
    *,
    db: Session = Depends(get_db),
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user)
):
    budget = crud_budget.create_budget(db=db, budget=budget_in, user_id=current_user.id)
    budget_with_progress = crud_budget.get_budget_with_progress(db, budget)
    return CommonResponse(success=True, message="Budget created successfully", data=budget_with_progress)

@router.get("/", response_model=CommonResponse[List[Budget]])
def read_budgets(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    budgets = crud_budget.get_budgets(db, user_id=current_user.id, skip=skip, limit=limit)
    budgets_with_progress = [crud_budget.get_budget_with_progress(db, b) for b in budgets]
    return CommonResponse(success=True, message="Budgets fetched successfully", data=budgets_with_progress)

@router.get("/{budget_id}", response_model=CommonResponse[Budget])
def read_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: int,
    current_user: User = Depends(get_current_user)
):
    budget = crud_budget.get_budget(db, budget_id=budget_id, user_id=current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget_with_progress = crud_budget.get_budget_with_progress(db, budget)
    return CommonResponse(success=True, message="Budget fetched successfully", data=budget_with_progress)

@router.put("/{budget_id}", response_model=CommonResponse[Budget])
def update_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: int,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user)
):
    budget = crud_budget.get_budget(db, budget_id=budget_id, user_id=current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget = crud_budget.update_budget(db=db, db_budget=budget, budget_in=budget_in)
    budget_with_progress = crud_budget.get_budget_with_progress(db, budget)
    return CommonResponse(success=True, message="Budget updated successfully", data=budget_with_progress)

@router.delete("/{budget_id}", response_model=CommonResponse[Budget])
def delete_budget(
    *,
    db: Session = Depends(get_db),
    budget_id: int,
    current_user: User = Depends(get_current_user)
):
    budget = crud_budget.get_budget(db, budget_id=budget_id, user_id=current_user.id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    crud_budget.delete_budget(db=db, budget_id=budget_id, user_id=current_user.id)
    return CommonResponse(success=True, message="Budget deleted successfully", data=None) 