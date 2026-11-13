from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from app.config import settings
from app.database import init_db

app = FastAPI(
    title="CareerLink AI — Backend API",
    description="Hệ thống AI hỗ trợ sinh viên tiếp cận cơ hội việc làm và thực tập",
    version="2.0.0"
)

# CORS — cho phép frontend GitHub Pages và localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo database khi server bắt đầu
@app.on_event("startup")
async def on_startup():
    await init_db()
    print("[🚀] CareerLink AI Backend đang hoạt động!")

# Import và đăng ký tất cả routers
from app.api.auth import router as auth_router
from app.api.students import router as students_router
from app.api.jobs import router as jobs_router
from app.api.ai_routes import router as ai_router
from app.api.admin import router as admin_router
from app.api.companies import router as companies_router

app.include_router(auth_router)
app.include_router(students_router)
app.include_router(jobs_router)
app.include_router(ai_router)
app.include_router(admin_router)
app.include_router(companies_router)


@app.get("/")
async def root():
    return {
        "message": "CareerLink AI API đang hoạt động ✅",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/v1/auth",
            "students": "/api/v1/students",
            "jobs": "/api/v1/jobs",
            "ai": "/api/v1/ai",
            "admin": "/api/v1/admin"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CareerLink AI"}
