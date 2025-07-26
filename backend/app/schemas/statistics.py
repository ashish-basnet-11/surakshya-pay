from pydantic import BaseModel
from typing import Dict, List, Any

class Statistics(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    spending_by_category: Dict[str, float]
    transaction_count: int
    average_transaction_amount: float
    min_transaction_amount: float
    max_transaction_amount: float
    recent_transactions: List[Dict[str, Any]] 

class AdminDashboardStatistics(BaseModel):
    total_users: int
    total_admins: int
    total_kyc_submitted: int
    total_kyc_approved: int
    total_kyc_pending: int
    total_kyc_rejected: int
    total_transactions: int
    total_deposit_amount: float
    total_withdrawal_amount: float
    total_transfer_amount: float 