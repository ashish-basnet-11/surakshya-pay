from pydantic import BaseModel
from typing import Optional, List
import datetime

class TransactionBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    transaction_type: str

class TransactionCreate(TransactionBase):
    blockchain_id: Optional[int] = None
    from_address: Optional[str] = None
    to_address: Optional[str] = None
    blockchain_timestamp: Optional[int] = None
    is_completed: Optional[bool] = True
    blockchain_hash: Optional[str] = None

class TransactionUpdate(TransactionBase):
    pass

class TransactionInDBBase(TransactionBase):
    id: int
    user_id: int
    timestamp: datetime.datetime
    blockchain_id: Optional[int] = None
    from_address: Optional[str] = None
    to_address: Optional[str] = None
    blockchain_timestamp: Optional[int] = None
    is_completed: Optional[bool] = True
    blockchain_hash: Optional[str] = None

    class Config:
        from_attributes = True

class Transaction(TransactionInDBBase):
    pass

# Blockchain transaction schemas
class BlockchainTransaction(BaseModel):
    id: int
    from_address: str
    to_address: str
    amount: float
    timestamp: int
    transaction_type: str
    is_completed: bool

class BlockchainTransactionResponse(BaseModel):
    success: bool
    message: str
    data: Optional[BlockchainTransaction] = None

class BlockchainTransactionsResponse(BaseModel):
    success: bool
    message: str
    data: List[BlockchainTransaction] = []
    total_count: Optional[int] = None
    offset: Optional[int] = None
    limit: Optional[int] = None

class TransactionStatistics(BaseModel):
    total_transactions: int
    total_deposits: int
    total_withdrawals: int
    total_transfers: int
    total_amount_deposited: float
    total_amount_withdrawn: float
    total_amount_transferred: float 