from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
from .email_templates import get_transaction_email_template, get_transfer_received_email_template, get_welcome_email_template, get_otp_email_template

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(email: str, subject: str, body: str):
    """Send a basic email with custom HTML body"""
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=body,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)

async def send_transaction_notification(
    email: str,
    user_name: str,
    transaction_type: str,
    amount: float,
    tx_hash: str,
    to_username: str = None,
    new_balance: float = None
):
    """Send a transaction notification email"""
    
    if transaction_type == "DEPOSIT":
        subject = f"Topup Successful - NPR {amount}"
    elif transaction_type == "WITHDRAWAL":
        subject = f"Withdrawal Successful - NPR {amount}"
    elif transaction_type == "TRANSFER":
        subject = f"Transfer Successful - NPR {amount} Sent"
    else:
        subject = f"Transaction Completed - NPR{amount}"
    
    html_body = get_transaction_email_template(
        transaction_type=transaction_type,
        amount=amount,
        tx_hash=tx_hash,
        user_name=user_name,
        to_username=to_username,
        new_balance=new_balance
    )
    
    # Send the email
    await send_email(email=email, subject=subject, body=html_body)

async def send_transfer_received_notification(
    email: str,
    user_name: str,
    amount: float,
    tx_hash: str,
    from_username: str,
    new_balance: float = None
):
    """Send a transfer received notification email to recipient"""
    
    subject = f"💰 Money Received - NPR {amount} from {from_username}"
    
    html_body = get_transfer_received_email_template(
        amount=amount,
        tx_hash=tx_hash,
        user_name=user_name,
        from_username=from_username,
        new_balance=new_balance
    )
    
    # Send the email
    await send_email(email=email, subject=subject, body=html_body)

async def send_otp_email(
    email: str,
    user_name: str,
    otp_code: str,
    purpose: str = "verification",
    expiry_minutes: int = 10
):
    """Send a OTP verification email"""
    
    if purpose.lower() == "login":
        subject = f"🔐 Login Verification Code - {otp_code}"
    elif purpose.lower() == "registration":
        subject = f"📝 Account Verification Code - {otp_code}"
    elif purpose.lower() == "password_reset":
        subject = f"🔑 Password Reset Code - {otp_code}"
    else:
        subject = f"🔢 Verification Code - {otp_code}"
    
    html_body = get_otp_email_template(
        user_name=user_name,
        otp_code=otp_code,
        purpose=purpose,
        expiry_minutes=expiry_minutes
    )
    
    # Send the email
    await send_email(email=email, subject=subject, body=html_body)

async def send_welcome_email(email: str, user_name: str, generated_user_name: str):
    """Send a welcome email to new users"""
    
    subject = "🎉 Welcome to Surakshya Pay - Your Wallet is Ready!"
    
    html_body = get_welcome_email_template(
        user_name=user_name,
        generated_user_name=generated_user_name
    )
    
    # Send the email
    await send_email(email=email, subject=subject, body=html_body) 