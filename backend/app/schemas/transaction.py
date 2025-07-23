from pydantic import BaseModel
from typing import Optional
import datetime

class TransactionBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    transaction_type: str

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class TransactionInDBBase(TransactionBase):
    id: int
    user_id: int
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

class Transaction(TransactionInDBBase):
    pass 