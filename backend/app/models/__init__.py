import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class UserRole(str, enum.Enum):
    citizen = "citizen"
    official = "official"
    admin = "admin"


class ComplaintStatus(str, enum.Enum):
    submitted = "submitted"
    ai_categorized = "ai_categorized"
    routed = "routed"
    in_progress = "in_progress"
    resolved = "resolved"
    rejected = "rejected"


class ComplaintPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Department(str, enum.Enum):
    health = "Health"
    electricity = "Electricity"
    sanitation = "Sanitation"
    water_works = "Water Works"
    infrastructure = "Infrastructure"
    public_works = "Public Works"
    transport = "Transport"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.citizen)
    department = Column(Enum(Department), nullable=True)
    civic_points = Column(Integer, default=50)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    complaints = relationship("Complaint", back_populates="user", foreign_keys="Complaint.user_id")
    updates = relationship("ComplaintUpdate", back_populates="official")


class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(20), unique=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    department = Column(Enum(Department), nullable=True)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.submitted)
    priority = Column(Enum(ComplaintPriority), default=ComplaintPriority.medium)
    ai_category = Column(String(100), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    rating = Column(Integer, nullable=True)
    rating_comment = Column(Text, nullable=True)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="complaints", foreign_keys=[user_id])
    assignee = relationship("User", foreign_keys=[assigned_to])
    media = relationship("ComplaintMedia", back_populates="complaint", cascade="all, delete-orphan")
    updates = relationship("ComplaintUpdate", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintUpdate.created_at")


class ComplaintMedia(Base):
    __tablename__ = "complaint_media"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(20), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    complaint = relationship("Complaint", back_populates="media")


class ComplaintUpdate(Base):
    __tablename__ = "complaint_updates"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    official_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    status_changed_to = Column(Enum(ComplaintStatus), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    complaint = relationship("Complaint", back_populates="updates")
    official = relationship("User", back_populates="updates")
