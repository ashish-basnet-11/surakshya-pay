from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import List, Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int

    REDIS_HOST: str
    REDIS_PORT: int

    DATABASE_URL: Optional[str] = None

    # Secrets must come from the environment (.env); never hardcode them here.
    SECRET_KEY: str
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

    # Blockchain settings
    BLOCKCHAIN_RPC_URL: str = "http://127.0.0.1:7545"
    CONTRACT_ADDRESS: str
    FUNDER_PRIVATE_KEY: str

    # Zero-knowledge proof microservice
    ZKP_SERVICE_URL: str = "http://localhost:5001"

    # Browser origins allowed to call the API (Expo web dev server by default).
    CORS_ORIGINS: List[str] = ["http://localhost:8081", "http://127.0.0.1:8081"]
    # Also allow any private-LAN origin on the Expo port, so phones/other machines work in dev.
    CORS_ORIGIN_REGEX: Optional[str] = r"http://(192\.168|10|172\.(1[6-9]|2\d|3[01]))(\.\d{1,3}){2,3}:8081"

    # Khalti ePay v2 (sandbox). Get a test secret key from https://test-admin.khalti.com
    KHALTI_SECRET_KEY: str = ""
    KHALTI_BASE_URL: str = "https://dev.khalti.com/api/v2"
    # Where Khalti sends the browser after checkout; must be an http(s) URL.
    KHALTI_RETURN_URL: str = "http://localhost:8000/api/v1/payments/khalti/return"
    KHALTI_WEBSITE_URL: str = "http://localhost:8000"

    # KYC uploads
    MAX_UPLOAD_MB: int = 10

    @model_validator(mode="after")
    def build_database_url(self) -> "Settings":
        if not self.DATABASE_URL:
            self.DATABASE_URL = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return self


settings = Settings()
