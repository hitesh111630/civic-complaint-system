"""
Run: python seed.py
Creates demo users and complaints.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models import User, Complaint, ComplaintUpdate, UserRole, ComplaintStatus, ComplaintPriority, Department
from app.utils.auth import hash_password
import random

Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed():
    # Clear existing
    db.query(ComplaintUpdate).delete()
    db.query(Complaint).delete()
    db.query(User).delete()
    db.commit()

    # Users
    citizen = User(
        full_name="Rajesh Kumar", email="citizen@demo.com",
        hashed_password=hash_password("password123"),
        role=UserRole.citizen, civic_points=1240,
    )
    official = User(
        full_name="City Official", email="official@demo.com",
        hashed_password=hash_password("password123"),
        role=UserRole.official, department=Department.infrastructure,
    )
    db.add_all([citizen, official])
    db.flush()

    complaints_data = [
        dict(title="Garbage Pileup - Sector 4", description="The waste collection truck hasn't visited our block for 3 days. Garbage is piling up.",
             location="Sector 4, Block B", department=Department.sanitation, status=ComplaintStatus.resolved,
             priority=ComplaintPriority.medium, ai_category="Garbage Collection", ai_confidence=0.91),
        dict(title="Flickering Streetlight", description="Pole ID: SL-902. Light is continuously flickering causing visibility issues at night.",
             location="Central Park West, Block C", department=Department.electricity, status=ComplaintStatus.in_progress,
             priority=ComplaintPriority.high, ai_category="Street Lighting", ai_confidence=0.87),
        dict(title="Water Leakage near market", description="Major pipe burst observed near the main market square. Water is flooding the road.",
             location="Main Market Square", department=Department.water_works, status=ComplaintStatus.submitted,
             priority=ComplaintPriority.critical, ai_category="Water Leakage", ai_confidence=0.95),
        dict(title="Large pothole on MG Road", description="Dangerous pothole near the traffic signal causing accidents.",
             location="MG Road, Junction 5", department=Department.infrastructure, status=ComplaintStatus.routed,
             priority=ComplaintPriority.high, ai_category="Potholes & Roads", ai_confidence=0.89),
        dict(title="Damaged Water Main on 5th Avenue", description="Significant water leakage observed near the main intersection.",
             location="1422 5th Avenue, Metro City District 4", department=Department.water_works, status=ComplaintStatus.in_progress,
             priority=ComplaintPriority.critical, ai_category="Water Leakage", ai_confidence=0.97),
    ]

    for i, cd in enumerate(complaints_data):
        c = Complaint(
            complaint_number=f"CD-{8840+i}-X",
            user_id=citizen.id,
            tags=[cd["ai_category"]],
            **cd,
        )
        db.add(c)
        db.flush()

        if cd["status"] in (ComplaintStatus.in_progress, ComplaintStatus.resolved):
            db.add(ComplaintUpdate(
                complaint_id=c.id, official_id=official.id,
                message="Team has been dispatched to the location. We will keep you updated.",
                status_changed_to=ComplaintStatus.in_progress,
            ))

        if cd["status"] == ComplaintStatus.resolved:
            db.add(ComplaintUpdate(
                complaint_id=c.id, official_id=official.id,
                message="Issue has been fully resolved. Thank you for your report.",
                status_changed_to=ComplaintStatus.resolved,
            ))
            c.rating = random.randint(4, 5)

    db.commit()
    print("✓ Seed complete!")
    print("  citizen@demo.com  / password123")
    print("  official@demo.com / password123")

if __name__ == "__main__":
    seed()
    db.close()
