import random, string
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, or_, func
from app.database import get_db
from app.models import (
    User, Complaint, ComplaintMedia,
    ComplaintUpdate as UpdateModel,
    ComplaintStatus, UserRole, Department
)
from app.schemas import ComplaintOut, ComplaintListOut, OfficialUpdateCreate, ComplaintRating
from app.utils.auth import get_current_user, require_official
from app.utils.files import save_file
from app.services.classifier import classify, make_title

router = APIRouter(prefix="/complaints", tags=["complaints"])


def _q(db):
    return db.query(Complaint).options(
        joinedload(Complaint.user),
        joinedload(Complaint.media),
        joinedload(Complaint.updates).joinedload(UpdateModel.official),
    )


def gen_number():
    return f"CD-{random.randint(1000,9999)}-{''.join(random.choices(string.ascii_uppercase,k=1))}"


# ── Create ────────────────────────────────────────────────────────────────────
@router.post("/", response_model=ComplaintOut, status_code=201)
async def create(
    description: str = Form(...),
    location: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    department: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[]),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat, ai_dept, priority, conf = classify(description)
    title = make_title(description)

    dept = None
    if department:
        try: dept = Department(department)
        except ValueError: dept = ai_dept
    else:
        dept = ai_dept

    c = Complaint(
        complaint_number=gen_number(), title=title,
        description=description, location=location,
        latitude=latitude, longitude=longitude,
        department=dept, status=ComplaintStatus.ai_categorized,
        priority=priority, ai_category=cat, ai_confidence=conf,
        user_id=user.id, tags=[cat],
    )
    db.add(c); db.flush()

    for f in files:
        if f.filename:
            saved = await save_file(f)
            db.add(ComplaintMedia(complaint_id=c.id, **saved))

    user.civic_points = (user.civic_points or 0) + 10
    db.commit(); db.refresh(c)
    return _q(db).filter(Complaint.id == c.id).first()


# ── List ──────────────────────────────────────────────────────────────────────
@router.get("/", response_model=List[ComplaintListOut])
def list_complaints(
    status: Optional[str] = None, department: Optional[str] = None,
    priority: Optional[str] = None, search: Optional[str] = None,
    skip: int = 0, limit: int = Query(20, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = _q(db)
    if user.role == UserRole.citizen:
        q = q.filter(Complaint.user_id == user.id)
    if status:   q = q.filter(Complaint.status == status)
    if department: q = q.filter(Complaint.department == department)
    if priority: q = q.filter(Complaint.priority == priority)
    if search:
        q = q.filter(or_(
            Complaint.title.ilike(f"%{search}%"),
            Complaint.complaint_number.ilike(f"%{search}%"),
        ))
    return q.order_by(desc(Complaint.created_at)).offset(skip).limit(limit).all()


# ── Public ────────────────────────────────────────────────────────────────────
@router.get("/public", response_model=List[ComplaintListOut])
def public(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return _q(db).order_by(desc(Complaint.created_at)).offset(skip).limit(limit).all()


# ── Stats ─────────────────────────────────────────────────────────────────────
@router.get("/stats")
def stats(user: User = Depends(require_official), db: Session = Depends(get_db)):
    pending = db.query(Complaint).filter(
        Complaint.status.in_([ComplaintStatus.submitted, ComplaintStatus.ai_categorized, ComplaintStatus.routed])
    ).count()
    resolved = db.query(Complaint).filter(Complaint.status == ComplaintStatus.resolved).count()
    avg_rating = db.query(func.avg(Complaint.rating)).filter(Complaint.rating.isnot(None)).scalar()
    citizens = db.query(User).filter(User.role == UserRole.citizen).count()
    return {
        "pending_complaints": pending,
        "resolved_cases": resolved,
        "avg_resolution_days": 4.2,
        "citizen_satisfaction": round(float(avg_rating or 4.8), 1),
        "sla_compliance": 94.0,
        "total_citizens": citizens,
    }


@router.get("/distribution")
def distribution(user: User = Depends(require_official), db: Session = Depends(get_db)):
    rows = db.query(Complaint.ai_category, func.count(Complaint.id)).group_by(Complaint.ai_category).all()
    total = sum(r[1] for r in rows) or 1
    return [{"category": r[0] or "Other", "count": r[1], "percentage": round(r[1]/total*100,1)} for r in rows]


# ── Detail ────────────────────────────────────────────────────────────────────
@router.get("/{cid}", response_model=ComplaintOut)
def get_one(cid: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = _q(db).filter(Complaint.id == cid).first()
    if not c: raise HTTPException(404, "Complaint not found")
    if user.role == UserRole.citizen and c.user_id != user.id:
        raise HTTPException(403, "Access denied")
    return c


# ── Official update ───────────────────────────────────────────────────────────
@router.put("/{cid}/status", response_model=ComplaintOut)
def update_status(
    cid: int, body: OfficialUpdateCreate,
    user: User = Depends(require_official),
    db: Session = Depends(get_db),
):
    c = db.query(Complaint).filter(Complaint.id == cid).first()
    if not c: raise HTTPException(404, "Not found")
    if body.status_changed_to:
        c.status = body.status_changed_to
        if body.status_changed_to == ComplaintStatus.resolved:
            c.resolved_at = datetime.utcnow()
    db.add(UpdateModel(complaint_id=cid, official_id=user.id,
                       message=body.message, status_changed_to=body.status_changed_to))
    db.commit()
    return _q(db).filter(Complaint.id == cid).first()


# ── Rate ──────────────────────────────────────────────────────────────────────
@router.post("/{cid}/rate", response_model=ComplaintOut)
def rate(cid: int, body: ComplaintRating, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(
        Complaint.id == cid, Complaint.user_id == user.id,
        Complaint.status == ComplaintStatus.resolved,
    ).first()
    if not c: raise HTTPException(404, "Resolved complaint not found")
    c.rating = body.rating; c.rating_comment = body.comment
    user.civic_points = (user.civic_points or 0) + 5
    db.commit()
    return _q(db).filter(Complaint.id == cid).first()


# ── Serve media ───────────────────────────────────────────────────────────────
@router.get("/media/{path:path}")
def serve(path: str, user: User = Depends(get_current_user)):
    import os
    if not os.path.exists(path): raise HTTPException(404, "File not found")
    return FileResponse(path)
