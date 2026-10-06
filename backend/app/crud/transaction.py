from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User


def get_transaction(db: Session, transaction_id: int, user_id: int):
    return db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == user_id).first()


def get_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100, order_by: str = "latest"):
    order = Transaction.timestamp.asc() if order_by == "oldest" else Transaction.timestamp.desc()
    return db.query(Transaction).filter(Transaction.user_id == user_id).order_by(order, Transaction.id.desc()).offset(skip).limit(limit).all()


def count_total_transactions(db: Session) -> int:
    """Each transfer is stored twice (sender's and recipient's copy); count it once."""
    return (
        db.query(Transaction).join(User, Transaction.user_id == User.id)
        .filter((Transaction.transaction_type != "TRANSFER") | (Transaction.from_address == User.wallet_address))
        .count()
    )


def sum_transaction_amount_by_type(db: Session, transaction_type: str) -> float:
    query = db.query(func.sum(Transaction.amount)).filter(Transaction.transaction_type == transaction_type)
    if transaction_type == "TRANSFER":
        # Only the sender's copy, so transfers aren't double-counted.
        query = query.join(User, and_(Transaction.user_id == User.id, Transaction.from_address == User.wallet_address))
    return query.scalar() or 0.0
