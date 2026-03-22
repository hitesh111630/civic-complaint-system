from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, ComplaintStatus, ComplaintPriority, Department


# ── Auth ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.citizen
    department: Optional[Department] = None

    @field_validator("password")
    @classmethod
    def pw_min_len(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    department: Optional[Department] = None
    civic_points: int
    created_at: datetime
    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ── Media / Update ────────────────────────────────────────────────────────────
class MediaOut(BaseModel):
    id: int
    file_path: str
    file_type: str
    file_name: str
    created_at: datetime
    model_config = {"from_attributes": True}


class UpdateOut(BaseModel):
    id: int
    message: str
    status_changed_to: Optional[ComplaintStatus] = None
    created_at: datetime
    official: UserOut
    model_config = {"from_attributes": True}


# ── Complaints ────────────────────────────────────────────────────────────────
class ComplaintOut(BaseModel):
    id: int
    complaint_number: str
    title: str
    description: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    department: Optional[Department] = None
    status: ComplaintStatus
    priority: ComplaintPriority
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None
    rating: Optional[int] = None
    rating_comment: Optional[str] = None
    tags: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    user: UserOut
    media: List[MediaOut] = []
    updates: List[UpdateOut] = []
    model_config = {"from_attributes": True}


class ComplaintListOut(BaseModel):
    id: int
    complaint_number: str
    title: str
    location: str
    department: Optional[Department] = None
    status: ComplaintStatus
    priority: ComplaintPriority
    ai_category: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    media: List[MediaOut] = []
    model_config = {"from_attributes": True}


class OfficialUpdateCreate(BaseModel):
    message: str
    status_changed_to: Optional[ComplaintStatus] = None


class ComplaintRating(BaseModel):
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be 1-5")
        return v
