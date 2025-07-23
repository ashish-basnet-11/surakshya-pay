from pydantic import BaseModel
from typing import Optional
import datetime

class BudgetBase(BaseModel):
    category: str
    amount: float
    start_date: datetime.date
    end_date: datetime.date

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BudgetBase):
    pass

class BudgetInDBBase(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class Budget(BudgetInDBBase):
    spent: float
    remaining: float 