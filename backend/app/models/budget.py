from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum
import datetime

class BudgetStatus(str, enum.Enum):
    ACTIVE = "active"
    WARNING = "warning"
    COMPLETED = "completed"
    EXPIRED = "expired"

class BudgetType(str, enum.Enum):
    EXPENSE = "expense"
    SAVINGS = "savings"
    INVESTMENT = "investment"

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), index=True)
    budget_amount = Column(Float, nullable=False)
    spent_amount = Column(Float, default=0.0)
    budget_type = Column(Enum(BudgetType), default=BudgetType.EXPENSE)
    status = Column(Enum(BudgetStatus), default=BudgetStatus.ACTIVE)
    color = Column(String(7), default="#4CAF50")  # Hex color code
    icon = Column(String(50), default="wallet")
    start_date = Column(Date, default=datetime.date.today)
    end_date = Column(Date)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="budgets") 