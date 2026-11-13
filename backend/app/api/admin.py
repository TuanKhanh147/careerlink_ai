from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.profile import StudentProfile
from app.models.application import Application
from app.models.interview import RecommendationLog
from app.security import get_current_user

router = APIRouter(prefix="/api/v1/admin", tags=["Admin & Analytics"])


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Chỉ Admin mới truy cập được.")
    return current_user


@router.get("/stats")
async def system_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Thống kê tổng quan hệ thống (admin + recruiter xem được)"""
    if current_user.role not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Không có quyền truy cập.")

    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_students = (await db.execute(select(func.count(StudentProfile.id)))).scalar() or 0
    total_jobs = (await db.execute(select(func.count(Job.id)).where(Job.is_active == True))).scalar() or 0
    total_apps = (await db.execute(select(func.count(Application.id)))).scalar() or 0
    total_recs = (await db.execute(select(func.count(RecommendationLog.id)))).scalar() or 0
    avg_match = (await db.execute(select(func.avg(RecommendationLog.match_score)))).scalar() or 0

    return {
        "tổng_người_dùng": total_users,
        "tổng_sinh_viên_có_hồ_sơ": total_students,
        "tổng_việc_làm_đang_tuyển": total_jobs,
        "tổng_lượt_ứng_tuyển": total_apps,
        "tổng_lượt_gợi_ý_AI": total_recs,
        "điểm_phù_hợp_trung_bình": round(float(avg_match) * 100, 2)
    }


@router.get("/users", dependencies=[Depends(require_admin)])
async def list_all_users(db: AsyncSession = Depends(get_db)):
    """Admin: Xem danh sách tất cả người dùng"""
    result = await db.execute(select(User).order_by(desc(User.created_at)))
    users = result.scalars().all()
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "created_at": u.created_at} for u in users]


@router.get("/applications")
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    - Admin: xem tất cả hồ sơ ứng tuyển
    - Recruiter: chỉ xem hồ sơ ứng tuyển vào job của mình
    - Student: chỉ xem hồ sơ của bản thân
    """
    if current_user.role == "admin":
        result = await db.execute(select(Application).order_by(desc(Application.applied_at)))
    elif current_user.role == "recruiter":
        result = await db.execute(
            select(Application)
            .join(Job, Application.job_id == Job.id)
            .where(Job.posted_by == current_user.id)
            .order_by(desc(Application.applied_at))
        )
    else:
        result = await db.execute(
            select(Application)
            .where(Application.student_id == current_user.id)
            .order_by(desc(Application.applied_at))
        )

    apps = result.scalars().all()
    return [
        {
            "id": a.id,
            "job_id": a.job_id,
            "student_id": a.student_id,
            "status": a.status,
            "match_score": round((a.match_score or 0) * 100, 1),
            "applied_at": a.applied_at
        }
        for a in apps
    ]

