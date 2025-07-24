from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import crud
from app.schemas.user import User, UserCreate, UserUpdate
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/me", response_model=CommonResponse[User])
def read_users_me(current_user: User = Depends(get_current_user)):
    return CommonResponse(success=True, message="User fetched successfully", data=current_user)

@router.get("/", response_model=CommonResponse[List[User]])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    users = crud.user.get_users(db, skip=skip, limit=limit)
    return CommonResponse(success=True, message="Users fetched successfully", data=users)

@router.post("/", response_model=CommonResponse[User])
async def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
):
    user = crud.user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = await crud.user.create_user(db=db, user=user_in)
    return CommonResponse(success=True, message="User created successfully", data=user)

@router.get("/{user_id}", response_model=CommonResponse[User])
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
):
    db_user = crud.user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return CommonResponse(success=True, message="User fetched successfully", data=db_user)

@router.put("/{user_id}", response_model=CommonResponse[User])
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
):
    db_user = crud.user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system",
        )
    user = crud.user.update_user(db=db, db_user=db_user, user_in=user_in)
    return CommonResponse(success=True, message="User updated successfully", data=user)

@router.delete("/{user_id}", response_model=CommonResponse[User])
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
):
    db_user = crud.user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    user = crud.user.delete_user(db=db, user_id=user_id)
    return CommonResponse(success=True, message="User deleted successfully", data=user) 