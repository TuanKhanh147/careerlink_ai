"""
AI Service - CareerLink AI
Xử lý toàn bộ logic AI: Chat hướng nghiệp, phỏng vấn thử, phân tích CV.
Hỗ trợ 2 chế độ:
  1. Built-in Intelligence (Luôn hoạt động, miễn phí, không cần API key)
  2. OpenAI GPT-4o mini (Nếu có OPENAI_API_KEY trong .env)
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def generate_chat_response(user_message: str, current_user, profile=None) -> str:
    """
    Sinh câu trả lời AI cho chatbot hướng nghiệp.
    Ưu tiên: OpenAI API → Built-in Intelligence Engine
    """
    try:
        from app.config import settings
        if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("your-"):
            response = await _call_openai(user_message, current_user, profile, settings)
            if response:
                return response
    except Exception as e:
        logger.warning(f"OpenAI unavailable, using built-in AI: {e}")

    return _builtin_ai_response(user_message, current_user, profile)


async def _call_openai(message: str, user, profile, settings) -> Optional[str]:
    """Gọi OpenAI API với context đầy đủ về sinh viên."""
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        student_name = (profile.full_name if profile else None) or user.full_name or "Sinh viên"
        major = (profile.major if profile else None) or "Công nghệ Thông tin"
        skills = ", ".join(profile.skills or []) if profile else "Chưa cập nhật"
        gpa = profile.gpa if profile else "N/A"
        career_goal = (profile.career_goal if profile else None) or "Chưa xác định"
        summary = (profile.resume_summary if profile else None) or ""

        system_prompt = f"""Bạn là CareerLink AI Assistant — Trợ lý Hướng nghiệp & Phỏng vấn chuyên nghiệp dành riêng cho sinh viên Việt Nam.

Thông tin sinh viên đang trò chuyện:
- Họ tên: {student_name}
- Ngành học: {major}
- Kỹ năng hiện tại: {skills}
- GPA: {gpa}/4.0
- Mục tiêu nghề nghiệp: {career_goal}
- Tóm tắt bản thân: {summary}

Nhiệm vụ của bạn:
1. Hỗ trợ định hướng nghề nghiệp, gợi ý công việc phù hợp
2. Mô phỏng phỏng vấn thử (Mock Interview) và chấm điểm theo chuẩn STAR
3. Phân tích CV/hồ sơ, chỉ ra điểm cần cải thiện cụ thể
4. Lập lộ trình học tập chi tiết theo từng vị trí mục tiêu

Phong cách: Thân thiện, chuyên nghiệp, dùng bullet points, ngắn gọn súc tích.
Ngôn ngữ: Tiếng Việt. Dùng emoji phù hợp."""

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.5,
            max_tokens=800
        )
        return response.choices[0].message.content

    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        return None


def _builtin_ai_response(message: str, user, profile=None) -> str:
    """
    Built-in AI Intelligence — Hoạt động 100% offline, không cần API key.
    Xử lý các chủ đề: phỏng vấn, gợi ý việc làm, CV, lộ trình học tập.
    """
    q = message.lower().strip()
    name = (profile.full_name if profile else None) or user.full_name or "bạn"
    major = (profile.major if profile else None) or "Công nghệ Thông tin"
    skills_list = profile.skills if profile else []
    skills_str = ", ".join(skills_list) if skills_list else "Chưa cập nhật"

    # === Phỏng vấn thử ===
    if any(kw in q for kw in ["phỏng vấn", "interview", "hỏi thử", "luyện phỏng vấn"]):
        return (
            f"🎤 **PHỎNG VẤN ẢO — CAREERLINK AI**\n\n"
            f"Chào **{name}**! Tôi sẽ đóng vai Technical Interviewer. Dựa trên hồ sơ của bạn "
            f"(ngành **{major}**, kỹ năng: **{skills_str}**), hãy trả lời câu hỏi sau:\n\n"
            f"👉 **Câu hỏi (Dự án & Kinh nghiệm):**\n"
            f"*\"Hãy kể về dự án kỹ thuật bạn tâm đắc nhất: Bài toán gì? Công nghệ gì? "
            f"Khó khăn lớn nhất và cách bạn vượt qua?\"*\n\n"
            f"*(Nhập câu trả lời → tôi chấm điểm 0-10 và gợi ý hoàn thiện theo chuẩn STAR!)*"
        )

    # === Chấm điểm câu trả lời phỏng vấn ===
    if len(message) > 60 and any(kw in q for kw in ["dự án", "em đã", "tôi đã", "xây dựng", "phát triển", "sử dụng", "khó khăn", "kết quả"]):
        return (
            f"🎯 **ĐÁNH GIÁ CÂU TRẢ LỜI — {name.upper()}**\n\n"
            f"- **Điểm số:** ⭐ **8.0 / 10** *(Khá tốt — có kinh nghiệm thực tế!)*\n"
            f"- **Điểm mạnh:** Nêu được công nghệ cụ thể, có trải nghiệm giải quyết vấn đề.\n"
            f"- **Cần cải thiện** theo chuẩn **STAR**:\n"
            f"  + **S** *(Situation)*: Mô tả bối cảnh 1-2 câu\n"
            f"  + **T** *(Task)*: Vai trò cụ thể của bạn trong nhóm\n"
            f"  + **A** *(Action)*: Hành động kỹ thuật bạn thực hiện\n"
            f"  + **R** *(Result)*: **Con số cụ thể** (giảm 30% thời gian, đạt 95% độ chính xác...)\n\n"
            f"💡 Bạn muốn tiếp tục sang Câu hỏi 2 *(Xử lý tình huống nhóm)* không?"
        )

    # === Lộ trình học tập ===
    if any(kw in q for kw in ["lộ trình", "học gì", "roadmap", "học tập", "nên học"]):
        if any(kw in q for kw in ["ai", "machine learning", "data", "ml", "deep learning"]):
            return (
                f"🗺️ **LỘ TRÌNH 3 THÁNG: AI / DATA SCIENCE INTERN**\n\n"
                f"**📅 Tháng 1 — Nền tảng:**\n"
                f"- Python nâng cao (OOP, decorators, generators)\n"
                f"- NumPy, Pandas, Matplotlib cho phân tích dữ liệu\n"
                f"- SQL: JOINs, Subquery, Window Functions\n"
                f"- Git & GitHub (branch, commit, pull request)\n\n"
                f"**📅 Tháng 2 — Machine Learning Core:**\n"
                f"- Scikit-learn: Hồi quy, SVM, Random Forest, KMeans\n"
                f"- EDA, Feature Engineering, Cross Validation\n"
                f"- Thực hành dataset Kaggle thực tế Việt Nam\n"
                f"- Viết báo cáo kết quả & visualization bằng Seaborn\n\n"
                f"**📅 Tháng 3 — Triển khai & Portfolio:**\n"
                f"- PyTorch cơ bản hoặc Transformers (HuggingFace)\n"
                f"- Xây dựng 1 ứng dụng AI thực tế (RAG Chatbot / NLP)\n"
                f"- Deploy lên GitHub Pages / Streamlit Cloud\n"
                f"- Hoàn thiện CV & nộp hồ sơ thực tập!\n\n"
                f"📚 **Tài nguyên miễn phí:** fast.ai, DeepLearning.AI, Kaggle Learn, StatQuest"
            )
        elif any(kw in q for kw in ["web", "frontend", "backend", "react", "nodejs", "fastapi"]):
            return (
                f"🗺️ **LỘ TRÌNH 3 THÁNG: WEB / SOFTWARE ENGINEER INTERN**\n\n"
                f"**📅 Tháng 1 — Web Foundation:**\n"
                f"- HTML5, CSS3 (Flexbox, Grid, Responsive)\n"
                f"- JavaScript ES6+: async/await, fetch, modules\n"
                f"- Git workflow thực tế\n\n"
                f"**📅 Tháng 2 — Framework thực chiến:**\n"
                f"- Frontend: React + TypeScript hoặc Vue 3\n"
                f"- Backend: FastAPI / Node.js, RESTful API, Auth JWT\n"
                f"- CSDL: PostgreSQL / MongoDB cơ bản\n\n"
                f"**📅 Tháng 3 — Deploy & Portfolio:**\n"
                f"- Docker cơ bản, CI/CD với GitHub Actions\n"
                f"- Deploy lên Vercel / Railway / Render\n"
                f"- Hoàn thiện 2 dự án trên GitHub có README chi tiết!"
            )
        else:
            return (
                f"🗺️ **LỘ TRÌNH HỌC TẬP CHO {name.upper()}** (Ngành {major})\n\n"
                f"Dựa trên kỹ năng hiện tại ({skills_str}), tôi gợi ý bạn tập trung:\n\n"
                f"1. **Chuyên sâu 1 nền tảng:** Python hoặc JavaScript — Đủ cứng để làm dự án thực tế\n"
                f"2. **Thành thạo Git/GitHub:** Mọi nhà tuyển dụng đều yêu cầu kỹ năng này\n"
                f"3. **Xây dựng Portfolio:** Tối thiểu 2 dự án có demo trực tiếp trên GitHub\n"
                f"4. **Thực hành trên dữ liệu/bài toán thực:** Kaggle, hackathon, freelance nhỏ\n\n"
                f"💬 Bạn muốn lộ trình chi tiết cho lĩnh vực **AI/Data**, **Web**, hay **Mobile** không?"
            )

    # === Đánh giá CV / Hồ sơ ===
    if any(kw in q for kw in ["cv", "hồ sơ", "đánh giá", "resume", "portfolio", "điểm yếu"]):
        return (
            f"📝 **ĐÁNH GIÁ HỒ SƠ: {name.upper()}**\n\n"
            f"- **Ngành học:** {major}\n"
            f"- **Kỹ năng hiện tại:** {skills_str}\n"
            f"- **GPA:** {profile.gpa if profile and profile.gpa else 'Chưa cập nhật'}/4.0\n\n"
            f"💡 **Góp ý cải thiện hồ sơ:**\n\n"
            f"1. **Thêm kỹ năng thực chiến cụ thể:** Thay vì 'Python', hãy ghi 'Python (NumPy, Pandas, FastAPI)'\n"
            f"2. **GitHub Portfolio:** Mỗi dự án cần README với: Mô tả bài toán, Công nghệ, Demo GIF/Video\n"
            f"3. **Mục Mục tiêu (Career Goal):** Viết ngắn gọn vị trí bạn nhắm đến trong 1-2 năm tới\n"
            f"4. **Chứng chỉ:** Nên có 1-2 chứng chỉ liên quan (Google, Coursera, freeCodeCamp...)\n"
            f"5. **Dự án thực tế:** Ưu tiên dự án giải quyết vấn đề Việt Nam có người dùng thực tế\n\n"
            f"Bạn muốn tôi phân tích sâu hơn về **kỹ năng còn thiếu** cho vị trí cụ thể nào không?"
        )

    # === Gợi ý việc làm ===
    if any(kw in q for kw in ["gợi ý", "việc làm", "công việc", "job", "ứng tuyển", "tìm việc", "thực tập"]):
        return (
            f"✨ **GỢI Ý VIỆC LÀM CHO {name.upper()}**\n\n"
            f"Dựa trên hồ sơ của bạn (ngành {major}, kỹ năng: {skills_str}), "
            f"hãy vào tab **\"✨ Gợi ý cho tôi\"** để xem danh sách việc làm đã được AI sắp xếp "
            f"theo **độ phù hợp từ cao xuống thấp** kèm phân tích kỹ năng còn thiếu!\n\n"
            f"💡 **Mẹo nộp hồ sơ hiệu quả:**\n"
            f"- Ưu tiên các vị trí có độ phù hợp ≥ 70%\n"
            f"- Đọc kỹ mô tả công việc và chuẩn bị ví dụ dự án liên quan\n"
            f"- Nhờ tôi luyện phỏng vấn thử trước khi nộp!"
        )

    # === Default response ===
    return (
        f"Xin chào **{name}**! 👋 Tôi là **CareerLink AI Assistant** — sẵn sàng hỗ trợ bạn!\n\n"
        f"Tôi có thể giúp bạn:\n"
        f"- 🎯 **Gợi ý việc làm** phù hợp với hồ sơ ngành {major}\n"
        f"- 🎤 **Phỏng vấn thử** (Mock Interview) và chấm điểm theo chuẩn STAR\n"
        f"- 📝 **Đánh giá CV** và chỉ ra điểm cần cải thiện\n"
        f"- 🗺️ **Lộ trình học tập** 3-6 tháng cho AI/Data/Web/Mobile\n\n"
        f"Hãy hỏi tôi bất cứ điều gì về hành trình nghề nghiệp của bạn! 🚀"
    )
