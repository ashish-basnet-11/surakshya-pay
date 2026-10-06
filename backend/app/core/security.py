from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import base64
import os

def _create_token(subject: str, token_type: str, lifetime: timedelta) -> str:
    payload = {"sub": subject, "type": token_type, "exp": datetime.now(timezone.utc) + lifetime}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    return _create_token(data["sub"], "access", expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    return _create_token(data["sub"], "refresh", expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))


def verify_token(token: str, credentials_exception, expected_type: str = "access"):
    """
    Return the token's subject (email). Refresh tokens are only accepted where
    expected_type="refresh", so a long-lived refresh token can't be used as an access token.
    Tokens issued before the "type" claim existed are treated as access tokens.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise credentials_exception
    subject = payload.get("sub")
    if subject is None or payload.get("type", "access") != expected_type:
        raise credentials_exception
    return subject

def encrypt_private_key(private_key: str, secret: str) -> str:
    backend = default_backend()
    key = secret.encode('utf-8')[:32].ljust(32, b'0')
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
    encryptor = cipher.encryptor()
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(private_key.encode('utf-8')) + padder.finalize()
    encrypted = encryptor.update(padded_data) + encryptor.finalize()
    return base64.b64encode(iv + encrypted).decode('utf-8')

def decrypt_private_key(encrypted_data: str, secret: str) -> str:
    backend = default_backend()
    key = secret.encode('utf-8')[:32].ljust(32, b'0')
    data = base64.b64decode(encrypted_data)
    iv = data[:16]
    encrypted = data[16:]
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=backend)
    decryptor = cipher.decryptor()
    padded_data = decryptor.update(encrypted) + decryptor.finalize()
    unpadder = padding.PKCS7(128).unpadder()
    private_key = unpadder.update(padded_data) + unpadder.finalize()
    return private_key.decode('utf-8') 