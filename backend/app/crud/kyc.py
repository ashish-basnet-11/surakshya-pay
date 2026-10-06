from sqlalchemy.orm import Session
from app.models.kyc import KYC, KYCStatus
from app.schemas.kyc import KYCAdminUpdate, KYCCreate
from datetime import datetime

def get_kyc_by_user_id(db: Session, user_id: int):
    return db.query(KYC).filter(KYC.user_id == user_id).first()

def get_kyc_by_status(db: Session, status: str, skip: int = 0, limit: int = 100):

    try:
        status_enum = KYCStatus(status)
    except ValueError:
        return []
    # Review queue: oldest submissions first.
    return db.query(KYC).filter(KYC.status == status_enum).order_by(KYC.submitted_at.asc()).offset(skip).limit(limit).all()

def create_kyc(db: Session, kyc_in: KYCCreate, user_id: int, doc_front_url: str, doc_back_url: str, selfie_url: str):
    db_kyc = KYC(
        **kyc_in.model_dump(),
        user_id=user_id,
        document_front_url=doc_front_url,
        document_back_url=doc_back_url,
        selfie_url=selfie_url
    )
    db.add(db_kyc)
    db.commit()
    db.refresh(db_kyc)
    return db_kyc

def resubmit_kyc(db: Session, db_kyc: KYC, kyc_in: KYCCreate, doc_front_url: str, doc_back_url: str, selfie_url: str):
    """Replace a rejected submission and put it back in the review queue."""
    for key, value in kyc_in.model_dump().items():
        setattr(db_kyc, key, value)
    db_kyc.document_front_url = doc_front_url
    db_kyc.document_back_url = doc_back_url
    db_kyc.selfie_url = selfie_url
    db_kyc.status = KYCStatus.PENDING
    db_kyc.rejection_reason = None
    db_kyc.reviewed_at = None
    db_kyc.reviewed_by = None
    db_kyc.submitted_at = datetime.utcnow()
    
    db.add(db_kyc)
    db.commit()
    db.refresh(db_kyc)
    return db_kyc

def get_all_kyc(db: Session, skip: int = 0, limit: int = 100):
    return db.query(KYC).order_by(KYC.submitted_at.desc()).offset(skip).limit(limit).all()

def admin_update_kyc(db: Session, db_kyc: KYC, kyc_in: KYCAdminUpdate, admin_id: int):
    db_kyc.status = kyc_in.status
    db_kyc.rejection_reason = kyc_in.rejection_reason if kyc_in.status != KYCStatus.APPROVED else None
    db_kyc.reviewed_by = admin_id
    db_kyc.reviewed_at = datetime.utcnow()
    
    db.add(db_kyc)
    db.commit()
    db.refresh(db_kyc)
    return db_kyc 

def count_total_kyc(db: Session) -> int:
    return db.query(KYC).count()

def count_kyc_by_status(db: Session, status: str) -> int:

    try:
        status_enum = KYCStatus(status)
    except ValueError:
        return 0
    return db.query(KYC).filter(KYC.status == status_enum).count() 