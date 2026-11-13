"""
Seed Data - CareerLink AI
Tạo dữ liệu việc làm mẫu để hệ thống có nội dung ngay từ đầu.
KHÔNG tạo tài khoản mẫu — người dùng tự đăng ký!
"""
import asyncio
from app.database import init_db, AsyncSessionLocal
from app.models.job import Job


SAMPLE_JOBS = [
    {
        "title": "Thực tập sinh AI / Machine Learning",
        "company": "VNG Corporation & AI Labs",
        "description": "Tham gia phát triển mô hình gợi ý, xử lý ngôn ngữ tự nhiên tiếng Việt, tích hợp LLMs vào sản phẩm thực tế hàng triệu người dùng.",
        "required_skills": ["Python", "Machine Learning", "PyTorch", "SQL", "Git"],
        "preferred_majors": ["Khoa học Dữ liệu & AI", "Khoa học Máy tính", "Công nghệ Thông tin"],
        "job_type": "Thực tập",
        "location": "TP.HCM / Hybrid",
        "salary": "5 - 8 triệu / tháng"
    },
    {
        "title": "Junior Data Analyst / BI Intern",
        "company": "FPT Software AI Center",
        "description": "Trực quan hóa dữ liệu kinh doanh, xây dựng dashboard Power BI, phân tích xu hướng thị trường hỗ trợ ra quyết định chiến lược.",
        "required_skills": ["SQL", "Excel", "Power BI", "Python", "Phân tích dữ liệu"],
        "preferred_majors": ["Khoa học Dữ liệu & AI", "Hệ thống Thông tin Quản lý", "Toán tin"],
        "job_type": "Thực tập",
        "location": "Hà Nội / TP.HCM",
        "salary": "4 - 7 triệu / tháng"
    },
    {
        "title": "Frontend Developer Intern (React / Next.js)",
        "company": "Tiki Tech Hub",
        "description": "Xây dựng giao diện web hiện đại, tối ưu UX/UI cho nền tảng thương mại điện tử với hàng chục triệu giao dịch mỗi ngày.",
        "required_skills": ["JavaScript", "React", "TypeScript", "HTML/CSS", "Git"],
        "preferred_majors": ["Công nghệ Phần mềm", "Công nghệ Thông tin"],
        "job_type": "Thực tập",
        "location": "TP.HCM",
        "salary": "5 - 8 triệu / tháng"
    },
    {
        "title": "Backend Engineer Intern (Python / FastAPI)",
        "company": "VNPT Technology",
        "description": "Thiết kế RESTful APIs hiệu năng cao, làm việc với CSDL PostgreSQL/Redis, Docker hóa dịch vụ và tham gia CI/CD pipeline.",
        "required_skills": ["Python", "FastAPI", "SQL", "Docker", "RESTful API"],
        "preferred_majors": ["Công nghệ Thông tin", "Khoa học Máy tính", "Kỹ thuật Mạng"],
        "job_type": "Thực tập",
        "location": "Hà Nội / Remote",
        "salary": "4 - 7 triệu / tháng"
    },
    {
        "title": "Mobile App Developer (Flutter)",
        "company": "MoMo Fintech Solution",
        "description": "Phát triển tính năng thanh toán, ví điện tử trên nền tảng iOS & Android phục vụ hơn 30 triệu người dùng.",
        "required_skills": ["Flutter", "Dart", "RESTful API", "Git", "State Management"],
        "preferred_majors": ["Công nghệ Phần mềm", "Công nghệ Thông tin"],
        "job_type": "Toàn thời gian",
        "location": "TP.HCM",
        "salary": "8 - 15 triệu / tháng"
    }
]


async def seed():
    await init_db()
    async with AsyncSessionLocal() as db:
        # Chỉ thêm nếu chưa có job nào
        from sqlalchemy import select, func
        count = (await db.execute(select(func.count(Job.id)))).scalar()
        if count and count > 0:
            print(f"[ℹ️] Đã có {count} việc làm trong database, bỏ qua seeding.")
            return

        for job_data in SAMPLE_JOBS:
            db.add(Job(**job_data, is_active=True))
        await db.commit()
        print(f"[✅] Đã tạo {len(SAMPLE_JOBS)} tin tuyển dụng mẫu!")


if __name__ == "__main__":
    asyncio.run(seed())

