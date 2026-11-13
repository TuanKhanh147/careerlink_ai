from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Hỗ trợ cả SQLite (mặc định) và PostgreSQL
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)

# SQLite cần check_same_thread=False (chỉ cho SQLite)
_connect_args = {}
if "sqlite" in _db_url:
    _connect_args = {"check_same_thread": False}

engine = create_async_engine(
    _db_url,
    echo=False,
    connect_args=_connect_args
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()


async def get_db():
    """Dependency: lấy database session cho mỗi request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Tạo tất cả bảng nếu chưa tồn tại (chạy khi khởi động server)."""
    # Import tất cả models để SQLAlchemy nhận diện
    from app.models import user, profile, job, application, interview  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[✅] Database đã được khởi tạo thành công!")
