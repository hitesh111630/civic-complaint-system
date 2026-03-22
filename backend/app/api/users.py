from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserOut
from app.utils.auth import get_current_user, require_official

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/officials", response_model=List[UserOut])
def officials(user: User = Depends(require_official), db: Session = Depends(get_db)):
    return db.query(User).filter(User.role.in_([UserRole.official, UserRole.admin])).all()


@router.get("/leaderboard", response_model=List[UserOut])
def leaderboard(limit: int = 10, db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == UserRole.citizen).order_by(User.civic_points.desc()).limit(limit).all()
