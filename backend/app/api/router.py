from fastapi import APIRouter
from app.api.endpoints import users, authentication, transactions, budgets, statistics, notifications, kyc

api_router = APIRouter()
api_router.include_router(authentication.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["statistics"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(kyc.router, prefix="/kyc", tags=["kyc"]) 