from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, BigInteger
from sqlalchemy.orm import relationship
from app.database.session import Base
import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    blockchain_id = Column(BigInteger, unique=True, index=True)  # Transaction ID from blockchain
    from_address = Column(String, index=True)  # Sender address
    to_address = Column(String, index=True)  # Recipient address
    amount = Column(Float, nullable=False)
    category = Column(String, index=True)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    blockchain_timestamp = Column(BigInteger)  # Timestamp from blockchain
    transaction_type = Column(String, index=True)  # DEPOSIT, WITHDRAWAL, TRANSFER
    is_completed = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    blockchain_hash = Column(String)  # Transaction hash from blockchain

    owner = relationship("User", back_populates="transactions") 