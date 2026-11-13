from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# --- Đăng ký ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"   # student / recruiter / admin


# --- Đăng nhập (Form-based OAuth2) ---
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    email: str


# --- Thông tin user trả về (ẩn password) ---
class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

