from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import ValidationError
from sqlalchemy.orm import Session
from typing import List, Optional
from app.crud import kyc as crud_kyc
from app.crud import user as crud_user
from app.schemas.kyc import KYC, KYCCreate, KYCAdminUpdate
from app.schemas.user import User as UserSchema
from app.schemas.response import CommonResponse
from app.utils.dependencies import get_db, get_current_user, get_current_active_superuser
from app.utils.file_upload import save_upload_file, UPLOAD_DIR
from fastapi.responses import FileResponse
import os
from app.models.kyc import KYCStatus
from app.models.notification import Notification
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=CommonResponse[UserSchema])
async def submit_kyc(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    document_front: UploadFile = File(...),
    selfie: UploadFile = File(...),
    document_back: Optional[UploadFile] = File(None),
    kyc_data: str = Form(...),
):
    try:
        kyc_in = KYCCreate.model_validate_json(kyc_data)
    except ValidationError as e:
        first = e.errors()[0]
        raise HTTPException(status_code=422, detail=str(first.get("msg", "Invalid details")).removeprefix("Value error, "))

    existing = crud_kyc.get_kyc_by_user_id(db, user_id=current_user.id)
    if existing and existing.status not in (KYCStatus.REJECTED, KYCStatus.RESUBMIT_REQUIRED):
        detail = "Your identity is already verified." if existing.status == KYCStatus.APPROVED else "Your documents are already under review."
        raise HTTPException(status_code=400, detail=detail)

    doc_front_url = await save_upload_file(document_front)
    selfie_url = await save_upload_file(selfie)
    doc_back_url = await save_upload_file(document_back) if document_back else None

    if existing:
        crud_kyc.resubmit_kyc(db, existing, kyc_in, doc_front_url, doc_back_url, selfie_url)
    else:
        crud_kyc.create_kyc(db, kyc_in, current_user.id, doc_front_url, doc_back_url, selfie_url)

    db.refresh(current_user)
    return CommonResponse(success=True, message="KYC submitted successfully", data=crud_user.get_user(db, user_id=current_user.id))


@router.get("/me", response_model=CommonResponse[KYC])
def get_my_kyc(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    kyc = crud_kyc.get_kyc_by_user_id(db, user_id=current_user.id)
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC not found")
    return CommonResponse(success=True, message="KYC details fetched successfully", data=kyc)

@router.get("/admin/all", response_model=CommonResponse[List[KYC]], dependencies=[Depends(get_current_active_superuser)])
def get_all_kyc_submissions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    kyc_list = crud_kyc.get_all_kyc(db, skip=skip, limit=limit)
    return CommonResponse(success=True, message="All KYC submissions fetched", data=kyc_list)

@router.put("/admin/{user_id}", response_model=CommonResponse[UserSchema], dependencies=[Depends(get_current_active_superuser)])
def verify_kyc(
    user_id: int,
    kyc_in: KYCAdminUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_active_superuser)
):
    kyc = crud_kyc.get_kyc_by_user_id(db, user_id=user_id)
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC submission not found for this user")
    
    if kyc_in.status in (KYCStatus.REJECTED, KYCStatus.RESUBMIT_REQUIRED) and not (kyc_in.rejection_reason or "").strip():
        raise HTTPException(status_code=422, detail="Give the user a reason so they know what to fix.")
    crud_kyc.admin_update_kyc(db, kyc, kyc_in, admin_user.id)

    title, message = {
        KYCStatus.APPROVED: ("Identity verified", "Your identity verification was approved."),
        KYCStatus.REJECTED: ("Verification not approved", f"Your identity verification was not approved: {kyc_in.rejection_reason}"),
        KYCStatus.RESUBMIT_REQUIRED: ("Please resubmit your documents", f"Your verification needs changes: {kyc_in.rejection_reason}"),
    }.get(kyc_in.status, (None, None))
    if title:
        db.add(Notification(user_id=user_id, title=title, message=message, notification_type="security"))
        db.commit()

    updated_user = crud_user.get_user(db, user_id=user_id)
    return CommonResponse(success=True, message="KYC status updated successfully", data=updated_user) 

@router.get("/admin/status/{status}", response_model=CommonResponse[List[KYC]], dependencies=[Depends(get_current_active_superuser)])
def get_kyc_by_status(
    status: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    kyc_list = crud_kyc.get_kyc_by_status(db, status=status, skip=skip, limit=limit)
    return CommonResponse(success=True, message=f"KYC submissions with status '{status}' fetched", data=kyc_list)

@router.get("/admin/user/{user_id}", response_model=CommonResponse[KYC], dependencies=[Depends(get_current_active_superuser)])
def get_kyc_by_user_id_admin(
    user_id: int,
    db: Session = Depends(get_db)
):
    kyc = crud_kyc.get_kyc_by_user_id(db, user_id=user_id)
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC submission not found for this user")
    return CommonResponse(success=True, message="KYC details fetched successfully", data=kyc) 

@router.get("/admin/document/{filename}", dependencies=[Depends(get_current_active_superuser)])
def get_kyc_document(filename: str):
    """Serve an uploaded KYC image to administrators only (documents are never public)."""
    path = os.path.join(UPLOAD_DIR, os.path.basename(filename))
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(path)
