from sqlalchemy.orm import Session
from app.models.kyc import KYC
from app.schemas.kyc import KYCCreate, KYCUpdate, KYCAdminUpdate
from datetime import datetime

def get_kyc_by_user_id(db: Session, user_id: int):
    return db.query(KYC).filter(KYC.user_id == user_id).first()

def get_kyc_by_status(db: Session, status: str, skip: int = 0, limit: int = 100):
    from app.models.kyc import KYCStatus
    try:
        status_enum = KYCStatus(status)
    except ValueError:
        return []
    return db.query(KYC).filter(KYC.status == status_enum).offset(skip).limit(limit).all()

def create_kyc(db: Session, kyc_in: KYCCreate, user_id: int, doc_front_url: str, doc_back_url: str, selfie_url: str):
    db_kyc = KYC(
        **kyc_in.dict(),
        user_id=user_id,
        document_front_url=doc_front_url,
        document_back_url=doc_back_url,
        selfie_url=selfie_url
    )
    db.add(db_kyc)
    db.commit()
    db.refresh(db_kyc)
    return db_kyc

def update_kyc(db: Session, db_kyc: KYC, kyc_in: KYCUpdate, doc_front_url: str, doc_back_url: str, selfie_url: str):
    kyc_data = kyc_in.dict(exclude_unset=True)
    for key, value in kyc_data.items():
        setattr(db_kyc, key, value)
    
    db_kyc.document_front_url = doc_front_url
    db_kyc.document_back_url = doc_back_url
    db_kyc.selfie_url = selfie_url
    
    db.add(db_kyc)
    db.commit()
    db.refresh(db_kyc)
    return db_kyc

def get_all_kyc(db: Session, skip: int = 0, limit: int = 100):
    return db.query(KYC).offset(skip).limit(limit).all()

def admin_update_kyc(db: Session, db_kyc: KYC, kyc_in: KYCAdminUpdate, admin_id: int):
    db_kyc.status = kyc_in.status
    db_kyc.rejection_reason = kyc_in.rejection_reason
    db_kyc.reviewed_by = admin_id
    db_kyc.reviewed_at = datetime.utcnow()
    
    db.add(db_kyc)
    db.commit()
    db.refresh(db_kyc)
    return db_kyc 

def count_total_kyc(db: Session) -> int:
    return db.query(KYC).count()

def count_kyc_by_status(db: Session, status: str) -> int:
    from app.models.kyc import KYCStatus
    try:
        status_enum = KYCStatus(status)
    except ValueError:
        return 0
    return db.query(KYC).filter(KYC.status == status_enum).count() 