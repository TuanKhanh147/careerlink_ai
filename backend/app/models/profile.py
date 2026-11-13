from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False, default="")
    university = Column(String(200), nullable=True)
    major = Column(String(150), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    skills = Column(JSON, nullable=True, default=list)         # ["Python", "SQL", ...]
    interests = Column(JSON, nullable=True, default=list)      # ["AI", "Data", ...]
    gpa = Column(Float, nullable=True)
    career_goal = Column(String(500), nullable=True)
    resume_summary = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    recommendation_logs = relationship("RecommendationLog", back_populates="student")

