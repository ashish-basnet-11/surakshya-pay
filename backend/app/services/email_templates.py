def get_transaction_email_template(
    transaction_type: str,
    amount: float,
    tx_hash: str,
    user_name: str,
    to_username: str = None,
    new_balance: float = None
) -> str:
    """
    HTML email template for transaction notifications
    """
    
    if transaction_type == "DEPOSIT":
        icon = "💰"
        color = "#10B981"  # Green
        title = "Topup Successful"
        description = f"Your wallet has been topped up with <strong>NPR {amount}</strong>"
    elif transaction_type == "WITHDRAWAL":
        icon = "💸"
        color = "#F59E0B"  # Amber
        title = "Withdrawal Successful"
        description = f"Successfully withdrawn <strong>NPR {amount}</strong> from your wallet"
    elif transaction_type == "TRANSFER":
        icon = "📤"
        color = "#3B82F6"  # Blue
        title = "Transfer Successful"
        description = f"Successfully transferred <strong>NPR {amount}</strong> to <strong>{to_username}</strong>"
    else:
        icon = "✅"
        color = "#6B7280"  # Gray
        title = "Transaction Completed"
        description = f"Transaction of <strong>NPR {amount}</strong> completed"
    
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #374151;
                background-color: #f9fafb;
            }}
            
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }}
            
            .header {{
                background: linear-gradient(135deg, {color}, {color}dd);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }}
            
            .header-icon {{
                font-size: 48px;
                margin-bottom: 16px;
                display: block;
            }}
            
            .header-title {{
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }}
            
            .header-subtitle {{
                font-size: 16px;
                opacity: 0.9;
            }}
            
            .content {{
                padding: 40px 30px;
            }}
            
            .greeting {{
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 24px;
                color: #111827;
            }}
            
            .transaction-details {{
                background-color: #f8fafc;
                border-radius: 8px;
                padding: 24px;
                margin-bottom: 24px;
                border-left: 4px solid {color};
            }}
            
            .detail-row {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #e5e7eb;
            }}
            
            .detail-row:last-child {{
                border-bottom: none;
            }}
            
            .detail-label {{
                font-weight: 600;
                color: #6b7280;
            }}
            
            .detail-value {{
                font-weight: 500;
                color: #111827;
            }}
            
            .amount {{
                font-size: 24px;
                font-weight: 700;
                color: {color};
            }}
            
            .tx-hash {{
                font-family: 'Courier New', monospace;
                font-size: 12px;
                background-color: #f3f4f6;
                padding: 8px 12px;
                border-radius: 6px;
                word-break: break-all;
                color: #374151;
            }}
            
            .balance-info {{
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
                border: 1px solid #bae6fd;
            }}
            
            .balance-label {{
                font-size: 14px;
                color: #0369a1;
                margin-bottom: 8px;
            }}
            
            .balance-amount {{
                font-size: 20px;
                font-weight: 700;
                color: #0369a1;
            }}
            
            .footer {{
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }}
            
            .footer-text {{
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 16px;
            }}
            
            .footer-links {{
                display: flex;
                justify-content: center;
                gap: 20px;
            }}
            
            .footer-link {{
                color: {color};
                text-decoration: none;
                font-weight: 500;
            }}
            
            .footer-link:hover {{
                text-decoration: underline;
            }}
            
            .security-note {{
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 16px;
                margin-top: 24px;
            }}
            
            .security-note-title {{
                font-weight: 600;
                color: #92400e;
                margin-bottom: 8px;
            }}
            
            .security-note-text {{
                font-size: 14px;
                color: #92400e;
            }}
            
            @media (max-width: 600px) {{
                .container {{
                    margin: 0;
                    border-radius: 0;
                }}
                
                .header, .content, .footer {{
                    padding: 20px;
                }}
                
                .header-title {{
                    font-size: 24px;
                }}
                
                .detail-row {{
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }}
                
                .footer-links {{
                    flex-direction: column;
                    gap: 12px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="header-icon">{icon}</span>
                <h1 class="header-title">{title}</h1>
                <p class="header-subtitle">Surakshya Pay Transaction Notification</p>
            </div>
            
            <div class="content">
                <p class="greeting">Hello {user_name},</p>
                
                <p style="margin-bottom: 24px; font-size: 16px;">
                    {description}. Your transaction has been successfully processed and confirmed on the blockchain.
                </p>
                
                <div class="transaction-details">
                    <div class="detail-row">
                        <span class="detail-label">Transaction Type:</span>
                        <span class="detail-value">{transaction_type.title()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value amount">NPR {amount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transaction Hash:</span>
                        <span class="detail-value tx-hash">{tx_hash}</span>
                    </div>
                    {f'<div class="detail-row"><span class="detail-label">Recipient:</span><span class="detail-value">{to_username}</span></div>' if to_username else ''}
                </div>
                
                {f'''
                <div class="balance-info">
                    <div class="balance-label">Updated Wallet Balance</div>
                    <div class="balance-amount">NPR {new_balance}</div>
                </div>
                ''' if new_balance else ''}
                
                <div class="security-note">
                    <div class="security-note-title">🔒 Security Reminder</div>
                    <div class="security-note-text">
                        Never share your private keys or wallet credentials. This transaction was initiated from your authorized device.
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p class="footer-text">
                    Thank you for using Surakshya Pay - Your Secure Digital Wallet
                </p>
                <div class="footer-links">
                    <a href="#" class="footer-link">View Transaction</a>
                    <a href="#" class="footer-link">Support</a>
                    <a href="#" class="footer-link">Privacy Policy</a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_template

def get_otp_email_template(
    user_name: str,
    otp_code: str,
    purpose: str = "verification",
    expiry_minutes: int = 10
) -> str:
    """
    HTML email template for OTP notifications
    """
    
    if purpose.lower() == "login":
        icon = "🔐"
        color = "#8B5CF6"  # Purple
        title = "Login Verification"
        description = "Complete your login to Surakshya Pay"
    elif purpose.lower() == "registration":
        icon = "📝"
        color = "#10B981"  # Green
        title = "Account Verification"
        description = "Verify your email address to complete registration"
    elif purpose.lower() == "password_reset":
        icon = "🔑"
        color = "#F59E0B"  # Amber
        title = "Password Reset"
        description = "Reset your Surakshya Pay password"
    else:
        icon = "🔢"
        color = "#3B82F6"  # Blue
        title = "Verification Code"
        description = "Verify your action with Surakshya Pay"
    
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #374151;
                background-color: #f9fafb;
            }}
            
            .container {{
                max-width: 500px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }}
            
            .header {{
                background: linear-gradient(135deg, {color}, {color}dd);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }}
            
            .header-icon {{
                font-size: 48px;
                margin-bottom: 16px;
                display: block;
            }}
            
            .header-title {{
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 8px;
            }}
            
            .header-subtitle {{
                font-size: 16px;
                opacity: 0.9;
            }}
            
            .content {{
                padding: 40px 30px;
            }}
            
            .greeting {{
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 24px;
                color: #111827;
            }}
            
            .otp-container {{
                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                border-radius: 12px;
                padding: 32px;
                margin-bottom: 24px;
                text-align: center;
                border: 2px solid {color}20;
            }}
            
            .otp-label {{
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 16px;
                font-weight: 500;
            }}
            
            .otp-code {{
                font-size: 48px;
                font-weight: 700;
                color: {color};
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                margin-bottom: 16px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }}
            
            .otp-expiry {{
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
            }}
            
            .otp-purpose {{
                font-size: 16px;
                color: #374151;
                font-weight: 500;
            }}
            
            .instructions {{
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
            }}
            
            .instructions-title {{
                font-weight: 600;
                color: #92400e;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }}
            
            .instructions-list {{
                list-style: none;
                padding: 0;
            }}
            
            .instructions-list li {{
                color: #92400e;
                margin-bottom: 8px;
                padding-left: 20px;
                position: relative;
            }}
            
            .instructions-list li:before {{
                content: "•";
                color: #f59e0b;
                font-weight: bold;
                position: absolute;
                left: 0;
            }}
            
            .security-note {{
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 24px;
            }}
            
            .security-note-title {{
                font-weight: 600;
                color: #991b1b;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
            }}
            
            .security-note-text {{
                font-size: 14px;
                color: #991b1b;
            }}
            
            .footer {{
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }}
            
            .footer-text {{
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 16px;
            }}
            
            .footer-links {{
                display: flex;
                justify-content: center;
                gap: 20px;
            }}
            
            .footer-link {{
                color: {color};
                text-decoration: none;
                font-weight: 500;
            }}
            
            .footer-link:hover {{
                text-decoration: underline;
            }}
            
            .copy-button {{
                background-color: {color};
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 8px;
                transition: background-color 0.2s;
            }}
            
            .copy-button:hover {{
                background-color: {color}dd;
            }}
            
            @media (max-width: 600px) {{
                .container {{
                    margin: 0;
                    border-radius: 0;
                }}
                
                .header, .content, .footer {{
                    padding: 20px;
                }}
                
                .otp-code {{
                    font-size: 36px;
                    letter-spacing: 6px;
                }}
                
                .footer-links {{
                    flex-direction: column;
                    gap: 12px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="header-icon">{icon}</span>
                <h1 class="header-title">{title}</h1>
                <p class="header-subtitle">Surakshya Pay Security Code</p>
            </div>
            
            <div class="content">
                <p class="greeting">Hello {user_name},</p>
                
                <p style="margin-bottom: 24px; font-size: 16px;">
                    {description}. Please use the verification code below to complete your action.
                </p>
                
                <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code" id="otp-code">{otp_code}</div>
                    <div class="otp-expiry">Expires in {expiry_minutes} minutes</div>
                    <div class="otp-purpose">Use this code to verify your identity</div>
                    <button class="copy-button" onclick="copyOTP()">Copy Code</button>
                </div>
                
                <div class="instructions">
                    <div class="instructions-title">
                        <span>📋</span>
                        How to use this code:
                    </div>
                    <ul class="instructions-list">
                        <li>Enter the code exactly as shown above</li>
                        <li>Do not share this code with anyone</li>
                        <li>The code will expire in {expiry_minutes} minutes</li>
                        <li>If you didn't request this code, ignore this email</li>
                    </ul>
                </div>
                
                <div class="security-note">
                    <div class="security-note-title">
                        <span>🔒</span>
                        Security Notice
                    </div>
                    <div class="security-note-text">
                        Surakshya Pay will never ask for this code via phone, SMS, or email. 
                        Only enter this code on the official Surakshya Pay website or app.
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p class="footer-text">
                    Thank you for using Surakshya Pay - Your Secure Digital Wallet
                </p>
                <div class="footer-links">
                    <a href="#" class="footer-link">Help & Support</a>
                    <a href="#" class="footer-link">Privacy Policy</a>
                    <a href="#" class="footer-link">Terms of Service</a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
        
        <script>
            function copyOTP() {{
                const otpCode = document.getElementById('otp-code').textContent;
                navigator.clipboard.writeText(otpCode).then(function() {{
                    const button = document.querySelector('.copy-button');
                    button.textContent = 'Copied!';
                    button.style.backgroundColor = '#10B981';
                    setTimeout(function() {{
                        button.textContent = 'Copy Code';
                        button.style.backgroundColor = '{color}';
                    }}, 2000);
                }});
            }}
        </script>
    </body>
    </html>
    """
    
    return html_template

def get_welcome_email_template(user_name: str, generated_user_name: str) -> str:
    """
    welcome email template for new users
    """
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Surakshya Pay</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #374151;
                background-color: #f9fafb;
            }}
            
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }}
            
            .header {{
                background: linear-gradient(135deg, #8B5CF6, #A855F7);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }}
            
            .header-icon {{
                font-size: 48px;
                margin-bottom: 16px;
                display: block;
            }}
            
            .header-title {{
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }}
            
            .header-subtitle {{
                font-size: 16px;
                opacity: 0.9;
            }}
            
            .content {{
                padding: 40px 30px;
            }}
            
            .greeting {{
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 24px;
                color: #111827;
            }}
            
            .wallet-info {{
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
                border: 1px solid #bae6fd;
            }}
            
            .wallet-address {{
                font-family: 'Courier New', monospace;
                font-size: 12px;
                background-color: #f3f4f6;
                padding: 8px 12px;
                border-radius: 6px;
                word-break: break-all;
                color: #374151;
                margin-top: 8px;
            }}
            
            .features {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 24px;
            }}
            
            .feature {{
                background-color: #f8fafc;
                border-radius: 8px;
                padding: 16px;
                text-align: center;
            }}
            
            .feature-icon {{
                font-size: 24px;
                margin-bottom: 8px;
            }}
            
            .feature-title {{
                font-weight: 600;
                margin-bottom: 4px;
                color: #111827;
            }}
            
            .feature-desc {{
                font-size: 14px;
                color: #6b7280;
            }}
            
            .footer {{
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }}
            
            @media (max-width: 600px) {{
                .features {{
                    grid-template-columns: 1fr;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="header-icon">🎉</span>
                <h1 class="header-title">Welcome to Surakshya Pay</h1>
                <p class="header-subtitle">Your Secure Digital Wallet</p>
            </div>
            
            <div class="content">
                <p class="greeting">Hello {user_name},</p>
                
                <p style="margin-bottom: 24px; font-size: 16px;">
                    Welcome to Surakshya Pay! Your digital wallet has been successfully created and is ready to use.
                </p>
                
                <div class="wallet-info">
                    <div style="font-weight: 600; color: #0369a1; margin-bottom: 8px;">Your Username:</div>
                    <div class="wallet-address">{generated_user_name}</div>
                </div>
                
                <div class="features">
                    <div class="feature">
                        <div class="feature-icon">🔒</div>
                        <div class="feature-title">Secure</div>
                        <div class="feature-desc">Zero-knowledge proofs for privacy</div>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">⚡</div>
                        <div class="feature-title">Fast</div>
                        <div class="feature-desc">Instant transactions</div>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🌐</div>
                        <div class="feature-title">Global</div>
                        <div class="feature-desc">Send anywhere, anytime</div>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📊</div>
                        <div class="feature-title">Track</div>
                        <div class="feature-desc">Monitor all transactions</div>
                    </div>
                </div>
                
                <p style="margin-bottom: 24px; font-size: 16px;">
                    You can now start using your wallet to send, receive, and manage your digital assets securely.
                </p>
            </div>
            
            <div class="footer">
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
                    Thank you for choosing Surakshya Pay
                </p>
                <p style="font-size: 12px; color: #9ca3af;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_template 

def get_transfer_received_email_template(
    amount: float,
    tx_hash: str,
    user_name: str,
    from_username: str,
    new_balance: float = None
) -> str:
    """
    HTML email template for transfer received notifications
    """
    
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Money Received</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #374151;
                background-color: #f9fafb;
            }}
            
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }}
            
            .header {{
                background: linear-gradient(135deg, #10B981, #059669);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }}
            
            .header-icon {{
                font-size: 48px;
                margin-bottom: 16px;
                display: block;
            }}
            
            .header-title {{
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }}
            
            .header-subtitle {{
                font-size: 16px;
                opacity: 0.9;
            }}
            
            .content {{
                padding: 40px 30px;
            }}
            
            .greeting {{
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 24px;
                color: #111827;
            }}
            
            .transaction-details {{
                background-color: #f8fafc;
                border-radius: 8px;
                padding: 24px;
                margin-bottom: 24px;
                border-left: 4px solid #10B981;
            }}
            
            .detail-row {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #e5e7eb;
            }}
            
            .detail-row:last-child {{
                border-bottom: none;
            }}
            
            .detail-label {{
                font-weight: 600;
                color: #6b7280;
            }}
            
            .detail-value {{
                font-weight: 500;
                color: #111827;
            }}
            
            .amount {{
                font-size: 24px;
                font-weight: 700;
                color: #10B981;
            }}
            
            .tx-hash {{
                font-family: 'Courier New', monospace;
                font-size: 12px;
                background-color: #f3f4f6;
                padding: 8px 12px;
                border-radius: 6px;
                word-break: break-all;
                color: #374151;
            }}
            
            .balance-info {{
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
                border: 1px solid #bae6fd;
            }}
            
            .balance-label {{
                font-size: 14px;
                color: #0369a1;
                margin-bottom: 8px;
            }}
            
            .balance-amount {{
                font-size: 20px;
                font-weight: 700;
                color: #0369a1;
            }}
            
            .sender-info {{
                background: linear-gradient(135deg, #fef3c7, #fde68a);
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
                border: 1px solid #f59e0b;
            }}
            
            .sender-label {{
                font-size: 14px;
                color: #92400e;
                margin-bottom: 8px;
            }}
            
            .sender-name {{
                font-size: 18px;
                font-weight: 700;
                color: #92400e;
            }}
            
            .footer {{
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }}
            
            .footer-text {{
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 16px;
            }}
            
            .footer-links {{
                display: flex;
                justify-content: center;
                gap: 20px;
            }}
            
            .footer-link {{
                color: #10B981;
                text-decoration: none;
                font-weight: 500;
            }}
            
            .footer-link:hover {{
                text-decoration: underline;
            }}
            
            .security-note {{
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 16px;
                margin-top: 24px;
            }}
            
            .security-note-title {{
                font-weight: 600;
                color: #92400e;
                margin-bottom: 8px;
            }}
            
            .security-note-text {{
                font-size: 14px;
                color: #92400e;
            }}
            
            @media (max-width: 600px) {{
                .container {{
                    margin: 0;
                    border-radius: 0;
                }}
                
                .header, .content, .footer {{
                    padding: 20px;
                }}
                
                .header-title {{
                    font-size: 24px;
                }}
                
                .detail-row {{
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }}
                
                .footer-links {{
                    flex-direction: column;
                    gap: 12px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="header-icon">💰</span>
                <h1 class="header-title">Money Received!</h1>
                <p class="header-subtitle">Surakshya Pay Transfer Notification</p>
            </div>
            
            <div class="content">
                <p class="greeting">Hello {user_name},</p>
                
                <p style="margin-bottom: 24px; font-size: 16px;">
                    Great news! You have received <strong>NPR {amount}</strong> in your wallet. The transaction has been successfully processed and confirmed on the blockchain.
                </p>
                
                <div class="sender-info">
                    <div class="sender-label">Sent by:</div>
                    <div class="sender-name">{from_username}</div>
                </div>
                
                <div class="transaction-details">
                    <div class="detail-row">
                        <span class="detail-label">Transaction Type:</span>
                        <span class="detail-value">Transfer Received</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount Received:</span>
                        <span class="detail-value amount">NPR {amount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transaction Hash:</span>
                        <span class="detail-value tx-hash">{tx_hash}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Sender:</span>
                        <span class="detail-value">{from_username}</span>
                    </div>
                </div>
                
                {f'''
                <div class="balance-info">
                    <div class="balance-label">Updated Wallet Balance</div>
                    <div class="balance-amount">NPR {new_balance}</div>
                </div>
                ''' if new_balance else ''}
                
                <div class="security-note">
                    <div class="security-note-title">🔒 Security Reminder</div>
                    <div class="security-note-text">
                        This transaction was processed securely on the blockchain. Your funds are now available in your wallet.
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p class="footer-text">
                    Thank you for using Surakshya Pay - Your Secure Digital Wallet
                </p>
                <div class="footer-links">
                    <a href="#" class="footer-link">View Transaction</a>
                    <a href="#" class="footer-link">Support</a>
                    <a href="#" class="footer-link">Privacy Policy</a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_template 