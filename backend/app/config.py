from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # === CSDL (mặc định dùng SQLite — không cần cài PostgreSQL) ===
    DATABASE_URL: str = "sqlite+aiosqlite:///./careerlink_ai.db"

    # === Bảo mật JWT ===
    SECRET_KEY: str = "careerlink-ai-secret-key-2026-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440   # 24 giờ — không bị logout mỗi lần vào web

    # === OpenAI (tùy chọn — không cần thiết để chạy được) ===
    OPENAI_API_KEY: str = "your-openai-api-key-here"
    OPENAI_MODEL: str = "gpt-4o-mini"

    # === Server ===
    BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
