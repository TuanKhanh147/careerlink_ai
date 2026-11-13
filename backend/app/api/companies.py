from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List

from app.database import get_db
from app.models.job import Job
from app.models.user import User
from app.security import get_current_user
from app.schemas.job import JobCreate, JobOut

router = APIRouter(prefix="/api/v1/companies", tags=["Companies"])


@router.get("", response_model=List[dict])
async def list_companies(db: AsyncSession = Depends(get_db)):
    """Lấy danh sách các công ty đang tuyển dụng"""
    result = await db.execute(
        select(Job.company).where(Job.is_active == True).distinct()
    )
    companies = result.scalars().all()
    return [{"name": c} for c in companies if c]


@router.get("/{company_name}/jobs", response_model=List[JobOut])
async def get_company_jobs(company_name: str, db: AsyncSession = Depends(get_db)):
    """Lấy tất cả việc làm của một công ty cụ thể"""
    result = await db.execute(
        select(Job)
        .where(Job.company == company_name, Job.is_active == True)
        .order_by(desc(Job.created_at))
    )
    jobs = result.scalars().all()
    if not jobs:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy việc làm nào từ công ty '{company_name}'.")
    return jobs

