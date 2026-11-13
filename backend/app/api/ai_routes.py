from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.profile import StudentProfile
from app.models.interview import RecommendationLog
from app.schemas.feedback import ChatRequest, ChatResponse, MatchResult
from app.security import get_current_user
from app.services.matcher import calculate_match_score
from app.services.ai_service import generate_chat_response

router = APIRouter(prefix="/api/v1/ai", tags=["AI Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Chat với CareerLink AI Assistant.
    Hỗ trợ: hướng nghiệp, phỏng vấn thử, phân tích CV, lộ trình học tập.
    """
    # Lấy hồ sơ sinh viên để cá nhân hóa câu trả lời
    profile = None
    if current_user.role == "student":
        result = await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == current_user.id)
        )
        profile = result.scalar_one_or_none()

    reply = await generate_chat_response(data.message, current_user, profile)
    return {"reply": reply}


@router.get("/recommendations", response_model=List[MatchResult])
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lấy danh sách gợi ý việc làm cá nhân hóa theo hồ sơ sinh viên.
    Sắp xếp theo độ phù hợp giảm dần.
    """
    if current_user.role not in ["student"]:
        raise HTTPException(status_code=403, detail="Chỉ sinh viên mới có gợi ý việc làm.")

    # Lấy hồ sơ
    profile_result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile or not profile.skills:
        raise HTTPException(
            status_code=400,
            detail="Vui lòng cập nhật hồ sơ cá nhân (kỹ năng, ngành học) để nhận gợi ý việc làm!"
        )

    # Lấy tất cả job đang active
    jobs_result = await db.execute(
        select(Job).where(Job.is_active == True).order_by(desc(Job.created_at))
    )
    all_jobs = jobs_result.scalars().all()

    results = []
    for job in all_jobs:
        score, breakdown, matched, missing, reasons = calculate_match_score_detail(profile, job)

        # Lưu log gợi ý
        log = RecommendationLog(
            student_id=profile.id,
            job_id=job.id,
            match_score=score,
            score_breakdown=breakdown,
            reasons=reasons
        )
        db.add(log)

        results.append(MatchResult(
            job_id=job.id,
            match_score=round(score * 100, 1),
            match_level="Cao" if score >= 0.75 else "Trung bình" if score >= 0.50 else "Thấp",
            matched_skills=matched,
            missing_skills=missing,
            reasons=reasons
        ))

    await db.commit()
    results.sort(key=lambda x: x.match_score, reverse=True)
    return results[:10]


def calculate_match_score_detail(profile: StudentProfile, job: Job):
    """Trả về điểm chi tiết: (score, breakdown, matched, missing, reasons)"""
    student_skills = set(s.lower().strip() for s in (profile.skills or []))
    job_skills = [s.lower().strip() for s in (job.required_skills or [])]

    matched_skills = [s for s in job_skills if any(s in sk or sk in s for sk in student_skills)]
    missing_skills = [s for s in job_skills if s not in matched_skills]

    skill_score = (len(matched_skills) / len(job_skills)) if job_skills else 0.6

    # Ngành học
    student_major = (profile.major or "").lower()
    pref_majors = [m.lower() for m in (job.preferred_majors or [])]
    major_score = 1.0 if any(student_major in m or m in student_major for m in pref_majors) else 0.5

    # Sở thích (keyword matching)
    student_ctx = " ".join([
        *(profile.interests or []),
        profile.career_goal or "",
        profile.resume_summary or ""
    ]).lower()
    job_ctx = f"{job.title} {job.description or ''}".lower()

    keywords = ["ai", "machine learning", "data", "python", "web", "mobile", "cloud", "backend", "frontend", "flutter", "react", "java", "nodejs"]
    hits = sum(1 for kw in keywords if kw in student_ctx and kw in job_ctx)
    interest_score = min(1.0, 0.4 + hits * 0.1)

    final_score = skill_score * 0.50 + major_score * 0.25 + interest_score * 0.25
    breakdown = {"skills": round(skill_score, 3), "major": round(major_score, 3), "interest": round(interest_score, 3)}

    reasons = []
    if skill_score >= 0.7:
        reasons.append("Kỹ năng đáp ứng rất tốt yêu cầu")
    elif skill_score >= 0.4:
        reasons.append("Có một số kỹ năng cốt lõi phù hợp")
    if major_score == 1.0:
        reasons.append("Ngành học đúng tiêu chí ưu tiên")
    if interest_score >= 0.6:
        reasons.append("Lĩnh vực quan tâm tương đồng với dự án")

    return final_score, breakdown, matched_skills, missing_skills, reasons

