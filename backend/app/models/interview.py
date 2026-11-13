from sqlalchemy import Column, Integer, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    match_score = Column(Float, nullable=False)
    score_breakdown = Column(JSON, nullable=True)   # {"skills": 0.8, "major": 1.0, "interest": 0.6}
    reasons = Column(JSON, nullable=True)           # ["Kỹ năng phù hợp cao", ...]
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("StudentProfile", back_populates="recommendation_logs")
    job = relationship("Job", back_populates="recommendation_logs")

