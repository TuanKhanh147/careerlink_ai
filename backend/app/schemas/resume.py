from pydantic import BaseModel
from typing import List, Optional


# --- Hồ sơ sinh viên ---
class StudentProfileCreate(BaseModel):
    full_name: str
    university: Optional[str] = ""
    major: Optional[str] = ""
    graduation_year: Optional[int] = None
    skills: List[str] = []
    interests: List[str] = []
    gpa: Optional[float] = None
    career_goal: Optional[str] = ""
    resume_summary: Optional[str] = ""


class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    university: Optional[str]
    major: Optional[str]
    graduation_year: Optional[int]
    skills: Optional[List[str]]
    interests: Optional[List[str]]
    gpa: Optional[float]
    career_goal: Optional[str]
    resume_summary: Optional[str]

    class Config:
        from_attributes = True

