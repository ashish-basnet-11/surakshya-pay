from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.crud import kyc as crud_kyc
from app.schemas.kyc import KYC, KYCCreate, KYCAdminUpdate
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user, get_current_active_superuser
from app.utils.file_upload import save_upload_file
from app.models.user import User
import json

router = APIRouter()

@router.post("/", response_model=CommonResponse[KYC])
async def submit_kyc(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_front: UploadFile = File(...),
    selfie: UploadFile = File(...),
    document_back: Optional[UploadFile] = File(None),
    kyc_data: str = Form(...)
):
    kyc_in = KYCCreate(**json.loads(kyc_data))
    existing_kyc = crud_kyc.get_kyc_by_user_id(db, user_id=current_user.id)
    if existing_kyc:
        raise HTTPException(status_code=400, detail="KYC details already submitted")

    doc_front_url = await save_upload_file(document_front)
    selfie_url = await save_upload_file(selfie)
    doc_back_url = await save_upload_file(document_back) if document_back else None

    kyc = crud_kyc.create_kyc(db, kyc_in, current_user.id, doc_front_url, doc_back_url, selfie_url)
    return CommonResponse(success=True, message="KYC submitted successfully", data=kyc)

@router.get("/me", response_model=CommonResponse[KYC])
def get_my_kyc(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    kyc = crud_kyc.get_kyc_by_user_id(db, user_id=current_user.id)
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC not found")
    return CommonResponse(success=True, message="KYC details fetched successfully", data=kyc)

# Admin routes
@router.get("/admin/all", response_model=CommonResponse[List[KYC]], dependencies=[Depends(get_current_active_superuser)])
def get_all_kyc_submissions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    kyc_list = crud_kyc.get_all_kyc(db, skip=skip, limit=limit)
    return CommonResponse(success=True, message="All KYC submissions fetched", data=kyc_list)

@router.put("/admin/{user_id}", response_model=CommonResponse[KYC], dependencies=[Depends(get_current_active_superuser)])
def verify_kyc(
    user_id: int,
    kyc_in: KYCAdminUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_active_superuser)
):
    kyc = crud_kyc.get_kyc_by_user_id(db, user_id=user_id)
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC submission not found for this user")
    
    updated_kyc = crud_kyc.admin_update_kyc(db, kyc, kyc_in, admin_user.id)
    return CommonResponse(success=True, message="KYC status updated successfully", data=updated_kyc) 