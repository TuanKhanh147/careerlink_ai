"""
Resume Parser Service - CareerLink AI
Trích xuất thông tin từ văn bản CV thuần túy.
"""
import re
from typing import List


KNOWN_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "php", "ruby",
    "react", "vue", "angular", "nextjs", "nodejs", "fastapi", "django", "flask", "spring",
    "flutter", "dart", "swift", "kotlin", "android", "ios",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn",
    "numpy", "pandas", "matplotlib", "data analysis", "nlp", "computer vision",
    "docker", "kubernetes", "git", "github", "ci/cd", "linux", "aws", "gcp", "azure",
    "html", "css", "tailwind", "bootstrap", "rest api", "graphql"
]


def extract_skills_from_text(text: str) -> List[str]:
    """Trích xuất danh sách kỹ năng từ văn bản CV thuần."""
    text_lower = text.lower()
    found = []
    for skill in KNOWN_SKILLS:
        # Tìm theo từ đầy đủ
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Hiển thị đúng viết hoa
            found.append(skill.title() if len(skill) > 2 else skill.upper())
    return list(dict.fromkeys(found))  # dedup, giữ thứ tự


def parse_cv_text(cv_text: str) -> dict:
    """
    Parse văn bản CV đơn giản, trả về dict thông tin cơ bản.
    Dùng regex heuristics — không cần AI API.
    """
    result = {
        "skills": extract_skills_from_text(cv_text),
        "email": None,
        "phone": None,
        "gpa": None,
        "summary": cv_text[:500] if cv_text else ""
    }

    # Trích email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', cv_text)
    if email_match:
        result["email"] = email_match.group()

    # Trích số điện thoại VN
    phone_match = re.search(r'(0[3-9]\d{8}|\+84\d{9})', cv_text)
    if phone_match:
        result["phone"] = phone_match.group()

    # Trích GPA
    gpa_match = re.search(r'(?:gpa|điểm tb|điểm trung bình)[:\s]*([0-4]\.[0-9]{1,2})', cv_text, re.IGNORECASE)
    if gpa_match:
        try:
            result["gpa"] = float(gpa_match.group(1))
        except ValueError:
            pass

    return result

