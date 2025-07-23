from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, index=True)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    transaction_type = Column(String, index=True) # e.g., 'income', 'expense'
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="transactions") 