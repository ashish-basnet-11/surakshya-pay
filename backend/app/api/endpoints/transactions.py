from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import transaction as crud_transaction
from app.schemas.transaction import Transaction, TransactionCreate, TransactionUpdate
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=CommonResponse[Transaction])
def create_transaction(
    *,
    db: Session = Depends(get_db),
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user)
):
    transaction = crud_transaction.create_transaction(db=db, transaction=transaction_in, user_id=current_user.id)
    return CommonResponse(success=True, message="Transaction created successfully", data=transaction)

@router.get("/", response_model=CommonResponse[List[Transaction]])
def read_transactions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    transactions = crud_transaction.get_transactions(db, user_id=current_user.id, skip=skip, limit=limit)
    return CommonResponse(success=True, message="Transactions fetched successfully", data=transactions)

@router.get("/{transaction_id}", response_model=CommonResponse[Transaction])
def read_transaction(
    *,
    db: Session = Depends(get_db),
    transaction_id: int,
    current_user: User = Depends(get_current_user)
):
    transaction = crud_transaction.get_transaction(db, transaction_id=transaction_id, user_id=current_user.id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return CommonResponse(success=True, message="Transaction fetched successfully", data=transaction)

@router.put("/{transaction_id}", response_model=CommonResponse[Transaction])
def update_transaction(
    *,
    db: Session = Depends(get_db),
    transaction_id: int,
    transaction_in: TransactionUpdate,
    current_user: User = Depends(get_current_user)
):
    transaction = crud_transaction.get_transaction(db, transaction_id=transaction_id, user_id=current_user.id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    transaction = crud_transaction.update_transaction(db=db, db_transaction=transaction, transaction_in=transaction_in)
    return CommonResponse(success=True, message="Transaction updated successfully", data=transaction)

@router.delete("/{transaction_id}", response_model=CommonResponse[Transaction])
def delete_transaction(
    *,
    db: Session = Depends(get_db),
    transaction_id: int,
    current_user: User = Depends(get_current_user)
):
    transaction = crud_transaction.get_transaction(db, transaction_id=transaction_id, user_id=current_user.id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    transaction = crud_transaction.delete_transaction(db=db, transaction_id=transaction_id, user_id=current_user.id)
    return CommonResponse(success=True, message="Transaction deleted successfully", data=transaction) 