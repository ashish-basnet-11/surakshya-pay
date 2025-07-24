from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import Optional
import secrets


class Settings(BaseSettings):
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    
    REDIS_HOST: str
    REDIS_PORT: int

    DATABASE_URL: Optional[str] = None

    SECRET_KEY: str = "3fbf7a147e14474002f5ee1ac267bec9d08df5086be47c210081faa3c3d1da03c5a4e7aedfae7cd7b4f05391f52b4857"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # Email settings
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_FROM_NAME: str

    @model_validator(mode='after')
    def build_database_url(self) -> 'Settings':
        if not self.DATABASE_URL:
            self.DATABASE_URL = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return self

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings() 