import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.database.session import Base


class KhaltiPayment(Base):
    """One Khalti checkout. Ties a pidx to the user who started it and records whether it was settled on-chain."""
    __tablename__ = "khalti_payments"

    pidx = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    amount = Column(Integer, nullable=False)  # whole NPR
    # Initiated -> Processing -> Settled, or whatever Khalti last reported (Pending, User canceled, Expired, ...)
    status = Column(String, nullable=False, default="Initiated")
    tx_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
