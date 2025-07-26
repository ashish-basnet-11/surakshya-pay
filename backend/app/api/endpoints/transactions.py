from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import transaction as crud_transaction
from app.crud import notification as crud_notification
from app.crud import user as crud_user
from app.crud import budget as crud_budget
from app.schemas.transaction import (
    Transaction, 
    TransactionCreate, 
    TransactionUpdate
)
from app.schemas.notification import NotificationCreate
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user
from app.models.user import User
from app.utils.blockchain import (
    deposit_onchain,
    transfer_onchain,
    withdraw_onchain,
    get_user_balance_onchain
)
from app.core.security import settings
from app.core.security import decrypt_private_key
from app.services.notification_service import send_transaction_notification, send_transfer_received_notification
import datetime

router = APIRouter()

def get_wallet_address_by_username(db: Session, username: str) -> Optional[str]:
    """Get wallet address from username"""
    user = crud_user.get_user_by_username(db, username=username)
    if user and user.wallet_address:
        return user.wallet_address
    return None

def create_transaction_notification(
    db: Session,
    user_id: int,
    transaction_type: str,
    amount: float,
    tx_hash: str,
    to_username: str = None
):
    """Create notification for completed transaction"""
    if transaction_type == "DEPOSIT":
        title = "Topup Successful"
        message = f"Your wallet has been topped up with {amount} NPR. Transaction hash: {tx_hash}"
    elif transaction_type == "WITHDRAWAL":
        title = "Withdrawal Successful"
        message = f"Successfully withdrawn {amount} NPR from your wallet. Transaction hash: {tx_hash}"
    elif transaction_type == "TRANSFER":
        title = "Transfer Successful"
        message = f"Successfully transferred {amount} NPR to {to_username}. Transaction hash: {tx_hash}"
    else:
        title = "Transaction Completed"
        message = f"Transaction of {amount} NPR completed. Transaction hash: {tx_hash}"
    
    notification_data = NotificationCreate(
        title=title,
        message=message,
        notification_type="transaction"
    )
    
    return crud_notification.create_notification(
        db=db,
        notification=notification_data,
        user_id=user_id,
        send_email_notification=False  # We'll send email separately with template
    )

def create_transfer_received_notification(
    db: Session,
    user_id: int,
    amount: float,
    tx_hash: str,
    from_username: str
):
    """Create notification for transfer received"""
    title = "Money Received"
    message = f"You have received {amount} NPR from {from_username}. Transaction hash: {tx_hash}"
    
    notification_data = NotificationCreate(
        title=title,
        message=message,
        notification_type="transaction"
    )
    
    return crud_notification.create_notification(
        db=db,
        notification=notification_data,
        user_id=user_id,
        send_email_notification=False  # We'll send email separately with template
    )

async def send_transaction_email(
    db: Session,
    user_id: int,
    transaction_type: str,
    amount: float,
    tx_hash: str,
    to_username: str = None,
    new_balance: float = None
):
    """Send transaction notification email"""
    try:
        # Get user details
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.email:
            await send_transaction_notification(
                email=user.email,
                user_name=user.full_name or "User",
                transaction_type=transaction_type,
                amount=amount,
                tx_hash=tx_hash,
                to_username=to_username,
                new_balance=new_balance
            )
    except Exception as e:
        print(f"Failed to send transaction email: {e}")

@router.get("/", response_model=CommonResponse[List[Transaction]])
def get_all_transactions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    order_by: str = Query("latest", description="Order by: 'latest' (default) or 'oldest'"),
    current_user: User = Depends(get_current_user)
):
    """Get all transactions for the current user"""
    transactions = crud_transaction.get_transactions(db, user_id=current_user.id, skip=skip, limit=limit, order_by=order_by)
    return CommonResponse(success=True, message="Transactions fetched successfully", data=transactions)

@router.get("/{transaction_id}", response_model=CommonResponse[Transaction])
def get_transaction_by_id(
    *,
    db: Session = Depends(get_db),
    transaction_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get a specific transaction by ID"""
    transaction = crud_transaction.get_transaction(db, transaction_id=transaction_id, user_id=current_user.id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return CommonResponse(success=True, message="Transaction fetched successfully", data=transaction)

@router.get("/user/{user_id}", response_model=CommonResponse[List[Transaction]])
def get_transactions_for_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    order_by: str = Query("latest", description="Order by: 'latest' (default) or 'oldest'"),
    current_user: User = Depends(get_current_user)
):
    # """Get transactions for a specific user (admin only)"""
    # if not current_user.is_superuser:
    #     raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
    transactions = crud_transaction.get_transactions(db, user_id=user_id, skip=skip, limit=limit, order_by=order_by)
    return CommonResponse(success=True, message="User transactions fetched successfully", data=transactions)

@router.post("/topup")
async def topup(
    *,
    db: Session = Depends(get_db),
    amount: float = 0.0,
    current_user: User = Depends(get_current_user)
):
    """Topup wallet - updates both blockchain and local database"""
    if not current_user.wallet_address or not current_user.private_key_encrypted:
        raise HTTPException(status_code=400, detail="User does not have a wallet set up.")
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    private_key = decrypt_private_key(current_user.private_key_encrypted, settings.SECRET_KEY)
    
    try:
        # Execute blockchain transaction
        tx_hash = deposit_onchain(current_user.wallet_address, amount, private_key)
        
        # Get updated blockchain balance
        blockchain_balance = get_user_balance_onchain(current_user.wallet_address)
        
        # Update local database
        current_user.balance = str(blockchain_balance)
        db.add(current_user)
        
        # Create local transaction record
        transaction_data = TransactionCreate(
            amount=amount,
            category="deposit",
            description=f"Topup of {amount} NPR",
            transaction_type="DEPOSIT",
            blockchain_hash=tx_hash,
            from_address=current_user.wallet_address,
            to_address=current_user.wallet_address,
            blockchain_timestamp=int(datetime.datetime.now().timestamp()),
            is_completed=True
        )
        
        local_transaction = crud_transaction.create_transaction(db, transaction_data, current_user.id)
        
        # Update budget if category matches (for savings/investment goals)
        if local_transaction.category:
            crud_budget.update_budget_from_transaction(
                db=db,
                user_id=current_user.id,
                category=local_transaction.category,
                amount=amount  # Positive for income/deposit
            )
        
        # Create notification
        notification = create_transaction_notification(
            db=db,
            user_id=current_user.id,
            transaction_type="DEPOSIT",
            amount=amount,
            tx_hash=tx_hash
        )
        
        db.commit()
        
        # Send email notification
        await send_transaction_email(
            db=db,
            user_id=current_user.id,
            transaction_type="DEPOSIT",
            amount=amount,
            tx_hash=tx_hash,
            new_balance=blockchain_balance
        )
        
        return CommonResponse(
            success=True, 
            message="Topup successful", 
            data={
                "tx_hash": tx_hash,
                "amount": amount,
                "new_balance": blockchain_balance,
                "local_transaction_id": local_transaction.id,
                "notification_id": notification.id
            }
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Topup failed: {str(e)}")

@router.post("/withdraw")
async def withdraw(
    *,
    db: Session = Depends(get_db),
    amount: float = 0.0,
    current_user: User = Depends(get_current_user)
):
    """Withdraw from wallet - updates both blockchain and local database"""
    if not current_user.wallet_address or not current_user.private_key_encrypted:
        raise HTTPException(status_code=400, detail="User does not have a wallet set up.")
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    
    # Check if user has sufficient balance
    current_balance = float(current_user.balance or 0)
    if current_balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance.")

    private_key = decrypt_private_key(current_user.private_key_encrypted, settings.SECRET_KEY)
    
    try:
        # Execute blockchain transaction
        tx_hash = withdraw_onchain(current_user.wallet_address, amount, private_key)
        
        # Get updated blockchain balance
        blockchain_balance = get_user_balance_onchain(current_user.wallet_address)
        
        # Update local database
        current_user.balance = str(blockchain_balance)
        db.add(current_user)
        
        # Create local transaction record
        transaction_data = TransactionCreate(
            amount=amount,
            category="withdrawal",
            description=f"Withdrawal of {amount} NPR",
            transaction_type="WITHDRAWAL",
            blockchain_hash=tx_hash,
            from_address=current_user.wallet_address,
            to_address=current_user.wallet_address,
            blockchain_timestamp=int(datetime.datetime.now().timestamp()),
            is_completed=True
        )
        
        local_transaction = crud_transaction.create_transaction(db, transaction_data, current_user.id)
        
        # Update budget if category matches
        if local_transaction.category:
            crud_budget.update_budget_from_transaction(
                db=db,
                user_id=current_user.id,
                category=local_transaction.category,
                amount=-amount  # Negative for expense
            )
        
        # Create notification
        notification = create_transaction_notification(
            db=db,
            user_id=current_user.id,
            transaction_type="WITHDRAWAL",
            amount=amount,
            tx_hash=tx_hash
        )
        
        db.commit()
        
        # Send email notification
        await send_transaction_email(
            db=db,
            user_id=current_user.id,
            transaction_type="WITHDRAWAL",
            amount=amount,
            tx_hash=tx_hash,
            new_balance=blockchain_balance
        )
        
        return CommonResponse(
            success=True, 
            message="Withdrawal successful", 
            data={
                "tx_hash": tx_hash,
                "amount": amount,
                "new_balance": blockchain_balance,
                "local_transaction_id": local_transaction.id,
                "notification_id": notification.id
            }
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Withdrawal failed: {str(e)}")

@router.post("/transfer")
async def transfer(
    *,
    db: Session = Depends(get_db),
    to_username: str,
    amount: float = 0.0,
    current_user: User = Depends(get_current_user)
):
    """Transfer funds - updates both blockchain and local database"""
    if not current_user.wallet_address or not current_user.private_key_encrypted:
        raise HTTPException(status_code=400, detail="User does not have a wallet set up.")
    
    if not to_username:
        raise HTTPException(status_code=400, detail="Recipient username is required.")
    
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")
    
    # Check if user has sufficient balance
    current_balance = float(current_user.balance or 0)
    if current_balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance.")
    
    # Get recipient's wallet address from username
    to_wallet_address = get_wallet_address_by_username(db, to_username)
    if not to_wallet_address:
        raise HTTPException(status_code=404, detail="Recipient user not found or does not have a wallet.")
    
    # Get recipient user object
    recipient_user = crud_user.get_user_by_wallet_address(db, to_wallet_address)
    if not recipient_user:
        raise HTTPException(status_code=404, detail="Recipient user not found.")
    
    # Prevent self-transfer
    if to_wallet_address == current_user.wallet_address:
        raise HTTPException(status_code=400, detail="Cannot transfer to yourself.")
    
    private_key = decrypt_private_key(current_user.private_key_encrypted, settings.SECRET_KEY)
    
    try:
        # Execute blockchain transaction
        tx_hash = transfer_onchain(current_user.wallet_address, to_wallet_address, amount, private_key)
        
        # Get updated blockchain balance for sender
        sender_blockchain_balance = get_user_balance_onchain(current_user.wallet_address)
        
        # Get updated blockchain balance for recipient
        recipient_blockchain_balance = get_user_balance_onchain(to_wallet_address)
        
        # Update sender's balance in local database
        current_user.balance = str(sender_blockchain_balance)
        db.add(current_user)
        
        # Update recipient's balance in local database
        recipient_user.balance = str(recipient_blockchain_balance)
        db.add(recipient_user)
        
        # Create local transaction record for sender
        sender_transaction_data = TransactionCreate(
            amount=amount,
            category="transfer",
            description=f"Transfer of {amount} NPR to {to_username}",
            transaction_type="TRANSFER",
            blockchain_hash=tx_hash,
            from_address=current_user.wallet_address,
            to_address=to_wallet_address,
            blockchain_timestamp=int(datetime.datetime.now().timestamp()),
            is_completed=True
        )
        
        sender_transaction = crud_transaction.create_transaction(db, sender_transaction_data, current_user.id)
        
        # Create local transaction record for recipient
        recipient_transaction_data = TransactionCreate(
            amount=amount,
            category="transfer",
            description=f"Received {amount} NPR from {current_user.username}",
            transaction_type="TRANSFER",
            blockchain_hash=tx_hash,
            from_address=current_user.wallet_address,
            to_address=to_wallet_address,
            blockchain_timestamp=int(datetime.datetime.now().timestamp()),
            is_completed=True
        )
        
        recipient_transaction = crud_transaction.create_transaction(db, recipient_transaction_data, recipient_user.id)
        
        # Update budget for sender if category matches (outgoing transfer)
        if sender_transaction.category:
            crud_budget.update_budget_from_transaction(
                db=db,
                user_id=current_user.id,
                category=sender_transaction.category,
                amount=-amount  # Negative for expense
            )
        
        # Create notification for sender
        sender_notification = create_transaction_notification(
            db=db,
            user_id=current_user.id,
            transaction_type="TRANSFER",
            amount=amount,
            tx_hash=tx_hash,
            to_username=to_username
        )
        
        # Create notification for recipient
        recipient_notification = create_transfer_received_notification(
            db=db,
            user_id=recipient_user.id,
            amount=amount,
            tx_hash=tx_hash,
            from_username=current_user.username
        )
        
        db.commit()
        
        # Send email notification to sender
        await send_transaction_email(
            db=db,
            user_id=current_user.id,
            transaction_type="TRANSFER",
            amount=amount,
            tx_hash=tx_hash,
            to_username=to_username,
            new_balance=sender_blockchain_balance
        )
        
        # Send email notification to recipient
        await send_transfer_received_notification(
            email=recipient_user.email,
            user_name=recipient_user.full_name or "User",
            amount=amount,
            tx_hash=tx_hash,
            from_username=current_user.username,
            new_balance=recipient_blockchain_balance
        )
        
        return CommonResponse(
            success=True, 
            message="Transfer successful", 
            data={
                "tx_hash": tx_hash,
                "amount": amount,
                "to_username": to_username,
                "to_address": to_wallet_address,
                "sender_new_balance": sender_blockchain_balance,
                "recipient_new_balance": recipient_blockchain_balance,
                "sender_transaction_id": sender_transaction.id,
                "recipient_transaction_id": recipient_transaction.id,
                "sender_notification_id": sender_notification.id,
                "recipient_notification_id": recipient_notification.id
            }
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transfer failed: {str(e)}") 