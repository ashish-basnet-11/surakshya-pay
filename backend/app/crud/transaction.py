from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.utils.blockchain import (
    get_user_transactions_with_details_onchain,
    TransactionType
)
from typing import List, Optional, Dict, Any
from sqlalchemy import func, or_
from app.crud import budget as crud_budget
import datetime

def get_transaction(db: Session, transaction_id: int, user_id: int):
    return db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == user_id).first()

def get_transaction_by_blockchain_id(db: Session, blockchain_id: int, user_id: int):
    return db.query(Transaction).filter(Transaction.blockchain_id == blockchain_id, Transaction.user_id == user_id).first()

def get_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100, order_by: str = "latest"):
    """
    Get transactions for a user with ordering options
    
    Args:
        db: Database session
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        order_by: Ordering preference - "latest" (default) or "oldest"
    """
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    
    if order_by == "oldest":
        query = query.order_by(Transaction.timestamp.asc())
    else:  # default to latest first
        query = query.order_by(Transaction.timestamp.desc())
    
    return query.offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: TransactionCreate, user_id: int):
    db_transaction = Transaction(**transaction.dict(), user_id=user_id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    # Update budget if this is an expense transaction
    if transaction.transaction_type in ['WITHDRAWAL', 'TRANSFER'] and transaction.amount > 0:
        update_budgets_from_transaction(db, user_id, transaction.category, transaction.amount)
    
    return db_transaction

def update_transaction(db: Session, db_transaction: Transaction, transaction_in: TransactionUpdate):
    transaction_data = transaction_in.dict(exclude_unset=True)
    for key, value in transaction_data.items():
        setattr(db_transaction, key, value)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, transaction_id: int, user_id: int):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == user_id).first()
    db.delete(db_transaction)
    db.commit()
    return db_transaction

def sync_blockchain_transactions(db: Session, user_address: str, user_id: int) -> List[Transaction]:
    """Sync blockchain transactions to local database"""
    blockchain_transactions = get_user_transactions_with_details_onchain(user_address)
    synced_transactions = []
    
    for blockchain_tx in blockchain_transactions:
        # Check if transaction already exists in database
        existing_tx = get_transaction_by_blockchain_id(db, blockchain_tx['id'], user_id)
        
        if not existing_tx:
            # Create new transaction record
            transaction_data = TransactionCreate(
                blockchain_id=blockchain_tx['id'],
                from_address=blockchain_tx['from'],
                to_address=blockchain_tx['to'],
                amount=blockchain_tx['amount'],
                transaction_type=blockchain_tx['transaction_type'],
                blockchain_timestamp=blockchain_tx['timestamp'],
                is_completed=blockchain_tx['is_completed'],
                category=blockchain_tx['transaction_type'].lower(),
                description=f"Blockchain {blockchain_tx['transaction_type'].lower()}"
            )
            
            new_transaction = create_transaction(db, transaction_data, user_id)
            synced_transactions.append(new_transaction)
    
    return synced_transactions

def get_transaction_statistics(db: Session, user_id: int) -> Dict[str, Any]:
    """Get transaction statistics for a user"""
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    
    stats = {
        'total_transactions': len(transactions),
        'total_deposits': 0,
        'total_withdrawals': 0,
        'total_transfers': 0,
        'total_amount_deposited': 0.0,
        'total_amount_withdrawn': 0.0,
        'total_amount_transferred': 0.0
    }
    
    for tx in transactions:
        if tx.transaction_type == 'DEPOSIT':
            stats['total_deposits'] += 1
            stats['total_amount_deposited'] += tx.amount
        elif tx.transaction_type == 'WITHDRAWAL':
            stats['total_withdrawals'] += 1
            stats['total_amount_withdrawn'] += tx.amount
        elif tx.transaction_type == 'TRANSFER':
            stats['total_transfers'] += 1
            stats['total_amount_transferred'] += tx.amount
    
    return stats

def get_transactions_by_type(db: Session, user_id: int, transaction_type: str, skip: int = 0, limit: int = 100):
    """Get transactions filtered by type"""
    return db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == transaction_type
    ).order_by(Transaction.timestamp.desc()).offset(skip).limit(limit).all()

def get_recent_transactions(db: Session, user_id: int, limit: int = 10):
    """Get recent transactions for a user"""
    return db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).order_by(Transaction.timestamp.desc()).limit(limit).all() 

def count_total_transactions(db: Session) -> int:
    return db.query(Transaction).count()

def sum_transaction_amount_by_type(db: Session, transaction_type: str) -> float:
    return db.query(func.sum(Transaction.amount)).filter(Transaction.transaction_type == transaction_type).scalar() or 0.0

def update_budgets_from_transaction(db: Session, user_id: int, category: str, amount: float):
    """Update budget spent amounts when a transaction occurs"""
    from app.models.budget import Budget, BudgetStatus
    
    # Find active budgets for this category
    current_date = datetime.date.today()
    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.category == category,
        Budget.status.in_([BudgetStatus.ACTIVE, BudgetStatus.WARNING]),
        Budget.start_date <= current_date,
        or_(Budget.end_date >= current_date, Budget.end_date.is_(None))
    ).all()
    
    for budget in budgets:
        budget.spent_amount += amount
        
        # Update status based on spent amount
        if budget.spent_amount >= budget.budget_amount:
            budget.status = BudgetStatus.COMPLETED
        elif budget.spent_amount >= budget.budget_amount * 0.9:
            budget.status = BudgetStatus.WARNING
        
        db.add(budget)
    
    db.commit() 