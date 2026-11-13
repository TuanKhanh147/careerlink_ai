from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.schemas.job import JobCreate, JobOut
from app.security import get_current_user
from app.services.matcher import calculate_match_score

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])


@router.get("", response_model=List[JobOut])
async def list_jobs(
    search: Optional[str] = Query(None, description="Tìm kiếm theo tiêu đề hoặc công ty"),
    db: AsyncSession = Depends(get_db)
):
    """Lấy danh sách tất cả việc làm đang tuyển"""
    query = select(Job).where(Job.is_active == True).order_by(desc(Job.created_at))
    result = await db.execute(query)
    jobs = result.scalars().all()

    if search:
        kw = search.lower()
        jobs = [j for j in jobs if kw in j.title.lower() or kw in j.company.lower()]

    return jobs


@router.post("", response_model=JobOut, status_code=201)
async def create_job(
    data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Nhà tuyển dụng đăng tin tuyển dụng mới"""
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Chỉ nhà tuyển dụng mới được đăng tin.")

    job = Job(
        title=data.title,
        company=data.company,
        description=data.description,
        required_skills=data.required_skills,
        preferred_majors=data.preferred_majors,
        job_type=data.job_type,
        location=data.location,
        salary=data.salary,
        posted_by=current_user.id,
        is_active=True
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


@router.get("/{job_id}", response_model=JobOut)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    """Xem chi tiết một việc làm"""
    result = await db.execute(select(Job).where(Job.id == job_id, Job.is_active == True))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy việc làm này.")
    return job


@router.delete("/{job_id}", status_code=204)
async def deactivate_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Nhà tuyển dụng ẩn/xóa tin tuyển dụng của mình"""
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Không tìm thấy việc làm.")
    if job.posted_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xóa tin này.")
    job.is_active = False
    await db.commit()


@router.post("/{job_id}/apply", status_code=201)
async def apply_job(
    job_id: int,
    cover_letter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Sinh viên nộp hồ sơ ứng tuyển"""
    if current_user.role not in ["student"]:
        raise HTTPException(status_code=403, detail="Chỉ sinh viên mới được nộp hồ sơ.")

    # Kiểm tra đã ứng tuyển chưa
    already = await db.execute(
        select(Application).where(
            Application.student_id == current_user.id,
            Application.job_id == job_id
        )
    )
    if already.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bạn đã nộp hồ sơ cho vị trí này rồi!")

    # Tính điểm matching
    job_result = await db.execute(select(Job).where(Job.id == job_id))
    job = job_result.scalar_one_or_none()
    if not job or not job.is_active:
        raise HTTPException(status_code=404, detail="Việc làm không tồn tại hoặc đã đóng.")

    from app.models.profile import StudentProfile
    profile_result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    score = calculate_match_score(profile, job) if profile else 0.0

    application = Application(
        student_id=current_user.id,
        job_id=job_id,
        status="pending",
        match_score=score,
        cover_letter=cover_letter
    )
    db.add(application)
    await db.commit()
    return {"message": f"Nộp hồ sơ thành công vào vị trí '{job.title}'!", "match_score": score}

