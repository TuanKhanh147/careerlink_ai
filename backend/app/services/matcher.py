"""
Matching Engine - CareerLink AI
Tính điểm độ phù hợp giữa hồ sơ sinh viên và tin tuyển dụng.
Thuật toán: Kỹ năng (50%) + Ngành học (25%) + Sở thích/Lĩnh vực (25%)
"""
from typing import Optional


def calculate_match_score(profile, job) -> float:
    """
    Trả về điểm phù hợp từ 0.0 đến 1.0 (đơn giản, dùng cho apply endpoint).
    """
    if not profile or not job:
        return 0.5

    student_skills = set(s.lower().strip() for s in (profile.skills or []))
    job_skills = [s.lower().strip() for s in (job.required_skills or [])]

    if job_skills:
        matched = sum(1 for s in job_skills if any(s in sk or sk in s for sk in student_skills))
        skill_score = matched / len(job_skills)
    else:
        skill_score = 0.6

    student_major = (profile.major or "").lower()
    pref_majors = [m.lower() for m in (job.preferred_majors or [])]
    major_score = 1.0 if any(student_major in m or m in student_major for m in pref_majors) else 0.5

    student_ctx = " ".join([
        *(profile.interests or []),
        profile.career_goal or "",
        profile.resume_summary or ""
    ]).lower()
    job_ctx = f"{job.title} {job.description or ''}".lower()

    keywords = ["ai", "machine learning", "data", "python", "web", "mobile", "cloud",
                "backend", "frontend", "flutter", "react", "java", "nodejs", "sql", "git"]
    hits = sum(1 for kw in keywords if kw in student_ctx and kw in job_ctx)
    interest_score = min(1.0, 0.4 + hits * 0.1)

    return round(skill_score * 0.50 + major_score * 0.25 + interest_score * 0.25, 4)

