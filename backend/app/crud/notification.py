from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate
from app.services.notification_service import send_email

def get_notification(db: Session, notification_id: int, user_id: int):
    return db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()

def get_notifications(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False
):
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

def create_notification(
    db: Session,
    notification: NotificationCreate,
    user_id: int,
    send_email_notification: bool = False,
    user_email: str = None
):
    db_notification = Notification(
        **notification.dict(),
        user_id=user_id
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    if send_email_notification and user_email:
        try:
            send_email(
                email=user_email,
                subject=notification.title,
                body=notification.message
            )
        except Exception:
            # Log the error but don't fail if email sending fails
            pass

    return db_notification

def mark_as_read(db: Session, notification_id: int, user_id: int):
    db_notification = get_notification(db, notification_id, user_id)
    if db_notification:
        db_notification.is_read = True
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
    return db_notification

def mark_all_as_read(db: Session, user_id: int):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()

def get_unread_count(db: Session, user_id: int):
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count() 