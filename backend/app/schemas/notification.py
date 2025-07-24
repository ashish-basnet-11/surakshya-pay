from pydantic import BaseModel
from typing import Optional
import datetime

class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: bool

class NotificationInDBBase(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Notification(NotificationInDBBase):
    pass 