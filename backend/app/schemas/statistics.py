from pydantic import BaseModel
from typing import Dict

class Statistics(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    spending_by_category: Dict[str, float] 