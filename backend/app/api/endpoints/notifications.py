from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import notification as crud_notification
from app.schemas.notification import Notification, NotificationCreate, NotificationUpdate
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=CommonResponse[List[Notification]])
def get_notifications(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = Query(False, description="Only fetch unread notifications")
):
    notifications = crud_notification.get_notifications(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        unread_only=unread_only
    )
    return CommonResponse(
        success=True,
        message="Notifications fetched successfully",
        data=notifications
    )

@router.get("/unread-count", response_model=CommonResponse[int])
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = crud_notification.get_unread_count(db=db, user_id=current_user.id)
    return CommonResponse(
        success=True,
        message="Unread count fetched successfully",
        data=count
    )

@router.post("/{notification_id}/read", response_model=CommonResponse[Notification])
def mark_notification_as_read(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    notification_id: int
):
    notification = crud_notification.mark_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return CommonResponse(
        success=True,
        message="Notification marked as read",
        data=notification
    )

@router.post("/mark-all-read", response_model=CommonResponse)
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crud_notification.mark_all_as_read(db=db, user_id=current_user.id)
    return CommonResponse(
        success=True,
        message="All notifications marked as read"
    ) 