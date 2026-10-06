from pydantic import BaseModel
from app.schemas.user import User

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class Token(TokenPair):
    user: User

class TokenData(BaseModel):
    sub: str
