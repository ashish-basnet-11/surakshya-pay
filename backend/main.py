from fastapi import FastAPI
from app.api.router import api_router
from app.database.session import engine
from app.database import base


# base.Base.metadata.drop_all(bind=engine)
base.Base.metadata.create_all(bind=engine)

app = FastAPI()

# @app.get("/")
# def root():
#     return {"message": "Backend running"}

app.include_router(api_router, prefix="/api/v1")
