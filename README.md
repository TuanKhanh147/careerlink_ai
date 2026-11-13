# CareerLink AI — Hệ thống AI Hướng nghiệp cho Sinh viên

## 🚀 Truy cập nhanh (GitHub Pages)
**👉 [https://tuankhanh147.github.io/careerlink_ai/](https://tuankhanh147.github.io/careerlink_ai/)**

## 📌 Giới thiệu
Hệ thống AI hỗ trợ sinh viên Việt Nam tiếp cận cơ hội việc làm và thực tập thông minh. Toàn bộ frontend chạy trực tiếp trên **GitHub Pages** — không cần server, không cần đăng nhập phức tạp.

## ✨ Tính năng chính
- 🤖 **AI Chatbot Hướng nghiệp** — Phỏng vấn thử, đánh giá CV, lộ trình học tập
- ✨ **Gợi ý việc làm thông minh** — Phân tích độ phù hợp theo kỹ năng, ngành học
- 📋 **Quản lý hồ sơ ứng tuyển** — Theo dõi trạng thái các vị trí đã nộp
- 🛡️ **Lưu trữ vĩnh viễn** — Dữ liệu tài khoản không bao giờ bị mất (LocalStorage)
- 📥 **Sao lưu & Khôi phục** — Xuất/nhập dữ liệu JSON bất kỳ lúc nào

## 🗂️ Cấu trúc dự án
```
careerlink_ai/
├── index.html          # Trang web chính (GitHub Pages)
├── style.css           # CSS hiện đại (2026 edition)
├── app.js              # Logic ứng dụng frontend hoàn chỉnh
├── backend/            # FastAPI backend (tùy chọn)
│   ├── app/
│   │   ├── main.py     # Server entry point
│   │   ├── config.py   # Cấu hình (hỗ trợ SQLite + PostgreSQL)
│   │   ├── database.py # Async SQLAlchemy
│   │   ├── security.py # JWT Authentication
│   │   ├── models/     # Database models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── api/        # API routers
│   │   └── services/   # AI & Matching services
│   ├── requirements.txt
│   ├── seed_data.py    # Tạo dữ liệu việc làm mẫu
│   └── .env.example
└── README.md
```

## 🌐 Chạy Frontend (GitHub Pages — không cần cài đặt)
Chỉ cần truy cập link GitHub Pages là dùng được ngay!

## 🔧 Chạy Backend (Tùy chọn nâng cao)
```bash
cd backend

# Tạo môi trường ảo
python -m venv venv
venv\Scripts\activate  # Windows

# Cài thư viện
pip install -r requirements.txt

# Sao chép file cấu hình
copy .env.example .env

# Chạy server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# (Tùy chọn) Tạo dữ liệu mẫu
python seed_data.py
```
Backend API docs: http://localhost:8000/docs

## 🛡️ Lưu ý bảo mật
- File `.env` **KHÔNG** được đẩy lên GitHub (đã cấu hình trong `.gitignore`)
- Dữ liệu frontend lưu trong LocalStorage của trình duyệt — chỉ bạn truy cập được

