from app.config import settings
from typing import Optional


def get_openai_client():
    if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("your-"):
        from openai import AsyncOpenAI
        return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return None


async def generate_interview_questions(resume_data: dict, target_role: str):
    """Tạo 5 câu hỏi phỏng vấn phù hợp CV & vị trí"""
    client = get_openai_client()
    if not client:
        return [
            {"question": "Hãy giới thiệu về bản thân và kinh nghiệm liên quan đến vị trí " + target_role, "type": "behavioral"},
            {"question": "Bạn đã từng thực hiện dự án thực tế nào sử dụng công nghệ chính của vị trí này chưa?", "type": "technical"},
            {"question": "Điểm mạnh và điểm bạn muốn hoàn thiện nhất trong chuyên môn là gì?", "type": "behavioral"},
            {"question": "Khi gặp một lỗi (bug) phức tạp mà chưa tìm ra nguyên nhân, bạn sẽ xử lý thế nào?", "type": "technical"},
            {"question": "Nếu trong nhóm có ý kiến bất đồng về giải pháp kỹ thuật, bạn sẽ làm gì để thống nhất?", "type": "situational"}
        ]

    prompt = f"""Bạn là nhà tuyển dụng kinh nghiệm. Dựa vào thông tin CV sau:
{resume_data}

Và vị trí ứng tuyển: {target_role}

Tạo chính xác 5 câu hỏi phỏng vấn:
- 2 câu giới thiệu bản thân & kinh nghiệm
- 2 câu kiến thức chuyên môn
- 1 câu xử lý tình huống

Yêu cầu: Trả về DUY NHẤT JSON, không giải thích thêm:
[
  {{"question": "Nội dung câu hỏi", "type": "behavioral"}},
  {{"question": "Nội dung câu hỏi", "type": "technical"}}
]
"""

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4
    )
    return response.choices[0].message.content


async def evaluate_answer(question: str, answer: str, role: str):
    """Đánh giá chi tiết câu trả lời"""
    client = get_openai_client()
    if not client:
        return {
            "score": 8.0,
            "strengths": ["Trả lời tự tin", "Có liên hệ kinh nghiệm cá nhân"],
            "improvements": ["Nên bổ sung số liệu minh chứng cụ thể theo chuẩn STAR"],
            "sample_answer": f"Với câu hỏi '{question}', bạn có thể nêu rõ: Bối cảnh (Situation), Nhiệm vụ (Task), Hành động (Action) và Kết quả cụ thể đạt được (Result)."
        }

    eval_prompt = f"""Bạn là chuyên gia phỏng vấn. Đánh giá:

Vị trí: {role}
Câu hỏi: {question}
Câu trả lời: {answer}

Đánh giá theo cấu trúc JSON:
{{
  "score": điểm_từ_0_đến_10,
  "strengths": ["điểm tốt 1", "điểm tốt 2"],
  "improvements": ["cần cải thiện 1", "cần cải thiện 2"],
  "sample_answer": "Câu trả lời gợi ý hoàn chỉnh"
}}
"""

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "user", "content": eval_prompt}],
        temperature=0.3
    )
    return response.choices[0].message.content
