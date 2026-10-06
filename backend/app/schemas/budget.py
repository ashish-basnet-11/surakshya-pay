from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
import datetime
from enum import Enum

class BudgetStatus(str, Enum):
    ACTIVE = "active"
    WARNING = "warning"
    COMPLETED = "completed"
    EXPIRED = "expired"

class BudgetType(str, Enum):
    EXPENSE = "expense"
    SAVINGS = "savings"
    INVESTMENT = "investment"

class BudgetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    budget_amount: float = Field(..., gt=0)
    budget_type: BudgetType = BudgetType.EXPENSE
    color: str = Field(default="#4CAF50", pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: str = Field(default="wallet", max_length=50)
    start_date: datetime.date
    end_date: Optional[datetime.date] = None

class BudgetCreate(BudgetBase):
    @model_validator(mode="after")
    def end_after_start(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValueError("End date must be on or after the start date.")
        return self

class BudgetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    budget_amount: Optional[float] = Field(None, gt=0)
    budget_type: Optional[BudgetType] = None
    status: Optional[BudgetStatus] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None

class BudgetInDBBase(BudgetBase):
    id: int
    user_id: int
    spent_amount: float
    status: BudgetStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class Budget(BudgetInDBBase):
    remaining: float
    progress_percentage: float
    is_over_budget: bool

class BudgetStatistics(BaseModel):
    total_budgets: int
    active_budgets: int
    warning_budgets: int
    completed_budgets: int
    total_budget_amount: float
    total_spent_amount: float
    total_remaining_amount: float
    budget_usage_percentage: float
    on_track_percentage: float

class BudgetSummary(BaseModel):
    monthly_budget: float
    monthly_spent: float
    monthly_remaining: float
    warning_count: int
    statistics: BudgetStatistics

class BudgetCategoryProgress(BaseModel):
    category: str
    budget_amount: float
    spent_amount: float
    progress_percentage: float
    color: str
    is_over_budget: bool

class BudgetTrendData(BaseModel):
    date: str
    budget: float
    spent: float

class BudgetAnalytics(BaseModel):
    category_progress: List[BudgetCategoryProgress]
    trend_data: List[BudgetTrendData]
    summary: BudgetSummary 