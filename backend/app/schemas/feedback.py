from pydantic import BaseModel
from typing import List, Optional


# --- Yêu cầu chat với AI ---
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


# --- Phản hồi chat AI ---
class ChatResponse(BaseModel):
    reply: str
    session_id: Optional[str] = None


# --- Yêu cầu phân tích job matching ---
class MatchRequest(BaseModel):
    job_id: int


# --- Kết quả matching ---
class MatchResult(BaseModel):
    job_id: int
    match_score: float
    match_level: str
    matched_skills: List[str]
    missing_skills: List[str]
    reasons: List[str]

