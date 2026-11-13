from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    required_skills = Column(JSON, nullable=True, default=list)   # ["Python", "SQL"]
    preferred_majors = Column(JSON, nullable=True, default=list)  # ["Khoa học Dữ liệu"]
    job_type = Column(String(50), nullable=True)                  # Thực tập / Toàn thời gian
    location = Column(String(150), nullable=True)
    salary = Column(String(100), nullable=True)
    posted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    recruiter = relationship("User", back_populates="posted_jobs", foreign_keys=[posted_by])
    applications = relationship("Application", back_populates="job")
    recommendation_logs = relationship("RecommendationLog", back_populates="job")

