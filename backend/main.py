from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.database.session import engine
from app.database import base


# base.Base.metadata.drop_all(bind=engine)
base.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Expo web dev server runs on :8081; native apps ignore CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081", "http://192.168.101.6:8081"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get("/")
# def root():
#     return {"message": "Backend running"}

app.include_router(api_router, prefix="/api/v1")
