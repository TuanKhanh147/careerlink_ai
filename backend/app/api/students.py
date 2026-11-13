from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.profile import StudentProfile
from app.schemas.resume import StudentProfileCreate, StudentProfileOut
from app.security import get_current_user

router = APIRouter(prefix="/api/v1/students", tags=["Student Profile"])


@router.post("/profile", response_model=StudentProfileOut)
async def upsert_profile(
    data: StudentProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Tạo mới hoặc cập nhật hồ sơ sinh viên"""
    if current_user.role not in ["student", "admin"]:
        raise HTTPException(status_code=403, detail="Chỉ sinh viên mới được cập nhật hồ sơ.")

    # Tìm hồ sơ hiện tại
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    # Cập nhật thông tin
    profile.full_name = data.full_name
    profile.university = data.university
    profile.major = data.major
    profile.graduation_year = data.graduation_year
    profile.skills = data.skills
    profile.interests = data.interests
    profile.gpa = data.gpa
    profile.career_goal = data.career_goal
    profile.resume_summary = data.resume_summary

    # Cập nhật tên trên user luôn
    current_user.full_name = data.full_name
    db.add(current_user)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/profile", response_model=StudentProfileOut)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lấy hồ sơ của sinh viên đang đăng nhập"""
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Chưa có hồ sơ. Vui lòng tạo hồ sơ trước.")
    return profile

