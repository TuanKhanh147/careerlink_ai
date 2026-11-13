from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# --- Tạo / Cập nhật Job ---
class JobCreate(BaseModel):
    title: str
    company: str
    description: str
    required_skills: List[str] = []
    preferred_majors: List[str] = []
    job_type: str = "Thực tập"
    location: str = "TP.HCM"
    salary: str = "Thỏa thuận"


# --- Job response ---
class JobOut(BaseModel):
    id: int
    title: str
    company: str
    description: Optional[str]
    required_skills: Optional[List[str]]
    preferred_majors: Optional[List[str]]
    job_type: Optional[str]
    location: Optional[str]
    salary: Optional[str]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

