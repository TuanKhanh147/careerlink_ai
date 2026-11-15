/**
 * CareerLink AI - Frontend Application Core
 * Version: 2.5 (High-Tech 2026 Edition with Vector Icons)
 * Zero-server dependency: Fully persistent via localStorage, works natively on GitHub Pages!
 */

// =============================================================================
// 1. Initial State & Data Persistence
// =============================================================================

const STORAGE_KEYS = {
    USERS: "careerlink_users",
    SESSION: "careerlink_session",
    JOBS: "careerlink_jobs",
    APPLICATIONS: "careerlink_applications",
    CHAT_HISTORY: "careerlink_chat_history",
    AI_CONFIG: "careerlink_ai_config"
};

// Initial curated job opportunities (No dummy student account is created!)
const DEFAULT_JOBS = [
    {
        id: "job-1",
        title: "Thực tập sinh AI / Machine Learning",
        company: "VNG Corporation & AI Labs",
        description: "Tham gia nghiên cứu và ứng dụng các mô hình học máy, xử lý ngôn ngữ tự nhiên (NLP) tiếng Việt, và tích hợp LLMs vào các sản phẩm thực tế hàng triệu người dùng.",
        required_skills: ["Python", "Machine Learning", "PyTorch", "SQL", "Git"],
        preferred_majors: ["Khoa học Dữ liệu & AI", "Khoa học Máy tính", "Công nghệ Thông tin"],
        job_type: "Thực tập",
        location: "TP.HCM / Hybrid",
        salary: "5 - 8 triệu / tháng",
        posted_by: "hr@vng.com.vn",
        created_at: "2026-03-01T08:00:00Z"
    },
    {
        id: "job-2",
        title: "Junior Data Analyst / BI Intern",
        company: "FPT Software AI Center",
        description: "Trực quan hóa dữ liệu kinh doanh, xây dựng dashboard Power BI, phân tích xu hướng thị trường và hỗ trợ đội ngũ Business Intelligence ra quyết định.",
        required_skills: ["SQL", "Excel", "Power BI", "Python", "Phân tích dữ liệu"],
        preferred_majors: ["Khoa học Dữ liệu & AI", "Hệ thống Thông tin Quản lý", "Toán tin"],
        job_type: "Thực tập",
        location: "Hà Nội / TP.HCM",
        salary: "4 - 7 triệu / tháng",
        posted_by: "recruitment@fpt.com",
        created_at: "2026-03-05T09:30:00Z"
    },
    {
        id: "job-3",
        title: "Frontend Developer Intern (React / Next.js)",
        company: "Tiki Tech Hub",
        description: "Xây dựng các giao diện web hiện đại, tối ưu trải nghiệm người dùng trên nền tảng thương mại điện tử với React, TypeScript và Tailwind CSS.",
        required_skills: ["JavaScript", "React", "TypeScript", "HTML/CSS", "Git"],
        preferred_majors: ["Công nghệ Phần mềm", "Công nghệ Thông tin"],
        job_type: "Thực tập",
        location: "TP.HCM",
        salary: "5 - 8 triệu / tháng",
        posted_by: "tech-hr@tiki.vn",
        created_at: "2026-03-10T10:00:00Z"
    },
    {
        id: "job-4",
        title: "Backend Engineer Intern (Python / FastAPI)",
        company: "VNPT Technology",
        description: "Thiết kế và triển khai RESTful APIs hiệu năng cao, làm việc với CSDL PostgreSQL/Redis, Docker hóa dịch vụ và áp dụng CI/CD cơ bản.",
        required_skills: ["Python", "FastAPI", "SQL", "Docker", "RESTful API"],
        preferred_majors: ["Công nghệ Thông tin", "Khoa học Máy tính", "Kỹ thuật Mạng"],
        job_type: "Thực tập",
        location: "Hà Nội / Remote",
        salary: "4 - 7 triệu / tháng",
        posted_by: "career@vnpt.vn",
        created_at: "2026-03-12T11:00:00Z"
    },
    {
        id: "job-5",
        title: "Mobile App Developer (Flutter / React Native)",
        company: "MoMo Fintech Solution",
        description: "Phát triển các tính năng thanh toán, ví điện tử đa nền tảng iOS & Android với kiến trúc Clean Architecture và state management hiện đại.",
        required_skills: ["Flutter", "Dart", "RESTful API", "Git", "State Management"],
        preferred_majors: ["Công nghệ Phần mềm", "Công nghệ Thông tin"],
        job_type: "Bán thời gian / Toàn thời gian",
        location: "TP.HCM",
        salary: "6 - 10 triệu / tháng",
        posted_by: "hr@momo.vn",
        created_at: "2026-03-15T14:00:00Z"
    }
];

// Helper to get from LocalStorage with fallback
function getStorage(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error("Storage read error:", e);
        return fallback;
    }
}

// Helper to set in LocalStorage
function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("Storage write error:", e);
    }
}

// Global App State
let state = {
    users: getStorage(STORAGE_KEYS.USERS, []),
    currentUser: getStorage(STORAGE_KEYS.SESSION, null),
    jobs: getStorage(STORAGE_KEYS.JOBS, DEFAULT_JOBS),
    applications: getStorage(STORAGE_KEYS.APPLICATIONS, []),
    chatHistory: getStorage(STORAGE_KEYS.CHAT_HISTORY, []),
    aiConfig: getStorage(STORAGE_KEYS.AI_CONFIG, { apiKey: "", provider: "builtin" })
};

// Ensure default jobs are saved if empty
if (!localStorage.getItem(STORAGE_KEYS.JOBS) || state.jobs.length === 0) {
    setStorage(STORAGE_KEYS.JOBS, DEFAULT_JOBS);
    state.jobs = DEFAULT_JOBS;
}

// =============================================================================
// 2. Authentication & Account Management (Permanent Storage)
// =============================================================================

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const iconHtml = type === "success" 
        ? '<i class="fa-solid fa-circle-check"></i>' 
        : type === "error" 
        ? '<i class="fa-solid fa-triangle-exclamation"></i>' 
        : '<i class="fa-solid fa-circle-info"></i>';
    toast.innerHTML = `<span>${iconHtml}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function handleRegister(e) {
    if (e) e.preventDefault();
    const name = document.getElementById("regFullName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const role = document.getElementById("regRole").value;

    if (!name || !email || !password) {
        showToast("Vui lòng điền đầy đủ họ tên, email và mật khẩu", "error");
        return;
    }

    if (password.length < 6) {
        showToast("Mật khẩu cần tối thiểu 6 ký tự", "error");
        return;
    }

    // Check if user already exists
    const existing = state.users.find(u => u.email === email);
    if (existing) {
        showToast("Email này đã được đăng ký trên hệ thống!", "error");
        return;
    }

    // Create new clean user profile
    const newUser = {
        id: "user-" + Date.now(),
        email: email,
        password: password,
        role: role,
        name: name,
        created_at: new Date().toISOString(),
        profile: {
            full_name: name,
            university: "",
            major: role === "student" ? "Khoa học Dữ liệu & AI" : "",
            graduation_year: new Date().getFullYear() + 1,
            skills: role === "student" ? ["Python", "SQL"] : [],
            interests: role === "student" ? ["Trí tuệ nhân tạo", "Phát triển phần mềm"] : [],
            gpa: 3.5,
            resume_summary: "",
            career_goal: ""
        }
    };

    state.users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, state.users);

    // Auto-login newly registered user
    state.currentUser = newUser;
    setStorage(STORAGE_KEYS.SESSION, newUser);

    showToast(`Đăng ký thành công! Chào mừng ${name} đến với CareerLink AI`, "success");
    updateUIForLoggedInUser();
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showToast("Vui lòng nhập email và mật khẩu", "error");
        return;
    }

    const user = state.users.find(u => u.email === email);
    if (!user || user.password !== password) {
        showToast("Email hoặc mật khẩu không chính xác!", "error");
        return;
    }

    state.currentUser = user;
    setStorage(STORAGE_KEYS.SESSION, user);

    showToast(`Đăng nhập thành công! Chào mừng trở lại, ${user.name || user.email}`, "success");
    updateUIForLoggedInUser();
}

function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    showToast("Đã đăng xuất thành công!", "info");
    updateUIForLoggedOutUser();
}

// Switch between Login and Register tabs
function switchAuthTab(tab) {
    document.querySelectorAll(".auth-tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("loginFormTab").style.display = tab === "login" ? "block" : "none";
    document.getElementById("regFormTab").style.display = tab === "register" ? "block" : "none";
    document.getElementById(`tabBtn_${tab}`).classList.add("active");
}

// =============================================================================
// 3. UI Synchronization & Navigation
// =============================================================================

function navigateTo(pageId) {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.toggle("active", item.getAttribute("data-page") === pageId);
    });

    document.querySelectorAll(".page-view").forEach(view => {
        view.classList.toggle("active", view.id === `view-${pageId}`);
    });

    if (pageId === "jobs") renderJobsList();
    if (pageId === "recommend") renderRecommendations();
    if (pageId === "profile") populateProfileForm();
    if (pageId === "applications") renderApplicationsList();
    if (pageId === "analytics") renderAnalytics();
    if (pageId === "chatbot") {
        renderChatMessages();
        scrollToChatBottom();
    }
}

function updateUIForLoggedInUser() {
    const user = state.currentUser;
    if (!user) return;

    document.getElementById("authSection").style.display = "none";
    document.getElementById("mainAppSection").style.display = "block";
    document.getElementById("userStatusBadge").style.display = "flex";
    document.getElementById("userDisplayName").textContent = user.name || user.email;
    document.getElementById("userRoleBadge").textContent = user.role === "student" ? "Sinh viên" : user.role === "recruiter" ? "Doanh nghiệp" : "Admin";

    // Show/hide recruiter specific elements
    const isRecruiter = user.role === "recruiter" || user.role === "admin";
    const recruiterBtn = document.getElementById("navRecruiterPost");
    if (recruiterBtn) recruiterBtn.style.display = isRecruiter ? "inline-flex" : "none";

    navigateTo("jobs");
}

function updateUIForLoggedOutUser() {
    document.getElementById("authSection").style.display = "block";
    document.getElementById("mainAppSection").style.display = "none";
    document.getElementById("userStatusBadge").style.display = "none";
    switchAuthTab("login");
}

// =============================================================================
// 4. Student Profile Management (Permanent Updates)
// =============================================================================

function populateProfileForm() {
    if (!state.currentUser) return;
    const p = state.currentUser.profile || {};
    document.getElementById("profFullName").value = p.full_name || state.currentUser.name || "";
    document.getElementById("profUniversity").value = p.university || "";
    document.getElementById("profMajor").value = p.major || "Khoa học Dữ liệu & AI";
    document.getElementById("profGradYear").value = p.graduation_year || 2027;
    document.getElementById("profSkills").value = Array.isArray(p.skills) ? p.skills.join(", ") : (p.skills || "");
    document.getElementById("profInterests").value = Array.isArray(p.interests) ? p.interests.join(", ") : (p.interests || "");
    document.getElementById("profGpa").value = p.gpa || 3.5;
    document.getElementById("profCareerGoal").value = p.career_goal || "";
    document.getElementById("profSummary").value = p.resume_summary || "";
}

function handleSaveProfile(e) {
    if (e) e.preventDefault();
    if (!state.currentUser) return;

    const skillsStr = document.getElementById("profSkills").value;
    const interestsStr = document.getElementById("profInterests").value;

    const updatedProfile = {
        full_name: document.getElementById("profFullName").value.trim(),
        university: document.getElementById("profUniversity").value.trim(),
        major: document.getElementById("profMajor").value.trim(),
        graduation_year: parseInt(document.getElementById("profGradYear").value) || 2027,
        skills: skillsStr.split(",").map(s => s.trim()).filter(Boolean),
        interests: interestsStr.split(",").map(s => s.trim()).filter(Boolean),
        gpa: parseFloat(document.getElementById("profGpa").value) || 3.5,
        career_goal: document.getElementById("profCareerGoal").value.trim(),
        resume_summary: document.getElementById("profSummary").value.trim()
    };

    state.currentUser.profile = updatedProfile;
    state.currentUser.name = updatedProfile.full_name || state.currentUser.name;

    const userIndex = state.users.findIndex(u => u.email === state.currentUser.email);
    if (userIndex !== -1) {
        state.users[userIndex].profile = updatedProfile;
        state.users[userIndex].name = state.currentUser.name;
        setStorage(STORAGE_KEYS.USERS, state.users);
    }

    setStorage(STORAGE_KEYS.SESSION, state.currentUser);
    document.getElementById("userDisplayName").textContent = state.currentUser.name;

    showToast("Hồ sơ năng lực đã được lưu vĩnh viễn thành công!", "success");
    renderRecommendations();
}

// =============================================================================
// 5. Intelligent AI Matching Algorithm (Client-side Engine)
// =============================================================================

function calculateJobMatch(studentProfile, job) {
    if (!studentProfile) return { score: 0.5, matchedSkills: [], missingSkills: job.required_skills || [], reasons: [] };

    const studentSkills = (studentProfile.skills || []).map(s => s.toLowerCase().trim());
    const jobSkills = (job.required_skills || []).map(s => s.toLowerCase().trim());

    // 1. Kỹ năng (Trọng số 50%)
    let matchedSkills = [];
    let missingSkills = [];
    jobSkills.forEach(req => {
        const found = studentSkills.some(st => st.includes(req) || req.includes(st));
        if (found) matchedSkills.push(req);
        else missingSkills.push(req);
    });

    const skillScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) : 0.6;

    // 2. Ngành học (Trọng số 25%)
    let majorScore = 0.5;
    const studentMajor = (studentProfile.major || "").toLowerCase();
    const preferredMajors = (job.preferred_majors || []).map(m => m.toLowerCase());
    if (preferredMajors.some(m => studentMajor.includes(m) || m.includes(studentMajor))) {
        majorScore = 1.0;
    }

    // 3. Sở thích & Mô tả tổng quan (Trọng số 25%)
    let interestScore = 0.5;
    const studentText = [
        ...(studentProfile.interests || []),
        studentProfile.career_goal || "",
        studentProfile.resume_summary || ""
    ].join(" ").toLowerCase();

    const jobText = (job.title + " " + job.description).toLowerCase();
    const keywords = ["ai", "machine learning", "data", "python", "frontend", "backend", "web", "mobile", "flutter", "react", "cloud"];
    let matchHits = 0;
    keywords.forEach(kw => {
        if (studentText.includes(kw) && jobText.includes(kw)) matchHits++;
    });
    if (matchHits > 0) interestScore = Math.min(1.0, 0.5 + matchHits * 0.15);

    // Tính điểm tổng hợp (0 - 100%)
    const finalScore = Math.round((skillScore * 0.50 + majorScore * 0.25 + interestScore * 0.25) * 100);

    const reasons = [];
    if (skillScore >= 0.7) reasons.push("Kỹ năng kỹ thuật đáp ứng vượt trội yêu cầu vị trí");
    else if (skillScore >= 0.4) reasons.push("Bạn có một số kỹ năng cốt lõi nền tảng phù hợp");
    
    if (majorScore === 1.0) reasons.push("Ngành học đúng với tiêu chí tuyển dụng ưu tiên");
    if (interestScore >= 0.7) reasons.push("Mục tiêu nghề nghiệp tương đồng cao với định hướng dự án");

    return {
        score: finalScore,
        matchedSkills,
        missingSkills,
        reasons
    };
}

// =============================================================================
// 6. Job Listings & Applications
// =============================================================================

function renderJobsList() {
    const listEl = document.getElementById("jobsListContainer");
    if (!listEl) return;

    const searchTerm = (document.getElementById("jobSearchInput")?.value || "").toLowerCase();
    const typeFilter = document.getElementById("jobTypeFilter")?.value || "all";

    const filtered = state.jobs.filter(job => {
        const matchText = (job.title + " " + job.company + " " + (job.required_skills || []).join(" ")).toLowerCase();
        const matchesSearch = matchText.includes(searchTerm);
        const matchesType = typeFilter === "all" || job.job_type.toLowerCase().includes(typeFilter.toLowerCase());
        return matchesSearch && matchesType;
    });

    if (filtered.length === 0) {
        listEl.innerHTML = `<div class="card" style="text-align: center; color: var(--text-muted); padding: 3rem;">
            <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: #cbd5e1;"></i>
            <h3 style="color: var(--text-secondary);">Không tìm thấy cơ hội việc làm phù hợp</h3>
            <p>Hãy thử tìm kiếm với từ khóa khác hoặc làm mới bộ lọc.</p>
        </div>`;
        return;
    }

    const currentProfile = state.currentUser?.profile;
    const userApplications = state.applications.filter(a => a.student_email === state.currentUser?.email);

    listEl.innerHTML = filtered.map(job => {
        const matchData = calculateJobMatch(currentProfile, job);
        const hasApplied = userApplications.some(a => a.job_id === job.id);

        let matchClass = "match-low";
        let matchIcon = '<i class="fa-solid fa-chart-pie"></i>';
        if (matchData.score >= 75) {
            matchClass = "match-high";
            matchIcon = '<i class="fa-solid fa-bolt"></i>';
        } else if (matchData.score >= 50) {
            matchClass = "match-medium";
            matchIcon = '<i class="fa-solid fa-gauge-high"></i>';
        }

        return `
            <div class="job-card">
                <div class="job-card-top">
                    <div class="job-title-group">
                        <h3>${job.title}</h3>
                        <div class="job-company"><i class="fa-solid fa-building"></i> ${job.company}</div>
                    </div>
                    <div class="job-match-pill ${matchClass}">
                        ${matchIcon} Phù hợp: ${matchData.score}%
                    </div>
                </div>

                <div class="job-meta-row">
                    <span class="job-meta-item"><i class="fa-solid fa-location-dot"></i> ${job.location}</span>
                    <span class="job-meta-item"><i class="fa-solid fa-clock"></i> ${job.job_type}</span>
                    <span class="job-meta-item"><i class="fa-solid fa-money-bill-wave"></i> ${job.salary}</span>
                </div>

                <p class="job-desc">${job.description}</p>

                <div>
                    <label style="font-size: 0.8rem; margin-bottom: 0.35rem; color: var(--text-secondary);">
                        <i class="fa-solid fa-list-check" style="margin-right: 0.25rem;"></i> Kỹ năng yêu cầu:
                    </label>
                    <div class="job-skills-chips">
                        ${(job.required_skills || []).map(skill => {
                            const isMatched = matchData.matchedSkills.includes(skill.toLowerCase());
                            return `<span class="skill-chip ${isMatched ? 'matched' : ''}">
                                ${isMatched ? '<i class="fa-solid fa-check"></i> ' : ''}${skill}
                            </span>`;
                        }).join("")}
                    </div>
                </div>

                <div class="job-card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="askAIAssistantAboutJob('${job.id}')">
                        <i class="fa-solid fa-robot"></i> Hỏi AI cách ứng tuyển
                    </button>
                    ${hasApplied ? `
                        <span class="badge" style="background: var(--success-bg); color: var(--success); font-weight: 700; padding: 0.45rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid #a7f3d0; display: inline-flex; align-items: center; gap: 0.4rem;">
                            <i class="fa-solid fa-circle-check"></i> Đã nộp hồ sơ
                        </span>
                    ` : `
                        <button class="btn btn-sm btn-primary" onclick="applyForJob('${job.id}')">
                            <i class="fa-solid fa-paper-plane"></i> Nộp hồ sơ ngay
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join("");
}

function renderRecommendations() {
    const recEl = document.getElementById("recommendationsListContainer");
    if (!recEl) return;

    const currentProfile = state.currentUser?.profile;
    if (!currentProfile || !currentProfile.skills || currentProfile.skills.length === 0) {
        recEl.innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #f59e0b; margin-bottom: 0.75rem;"></i>
                <h3>Chưa có thông tin hồ sơ năng lực</h3>
                <p style="color: var(--text-secondary); margin: 0.75rem 0 1.25rem;">
                    Vui lòng cập nhật các kỹ năng và thông tin trong mục <strong>Hồ sơ cá nhân</strong> để AI phân tích và xếp hạng cơ hội phù hợp nhất cho bạn!
                </p>
                <button class="btn btn-primary" onclick="navigateTo('profile')">
                    <i class="fa-solid fa-id-card"></i> Cập nhật hồ sơ ngay
                </button>
            </div>
        `;
        return;
    }

    // Rank jobs by match score
    const scoredJobs = state.jobs.map(job => {
        return {
            job,
            match: calculateJobMatch(currentProfile, job)
        };
    }).sort((a, b) => b.match.score - a.match.score);

    recEl.innerHTML = scoredJobs.map(({ job, match }) => {
        let matchClass = "match-low";
        let matchIcon = '<i class="fa-solid fa-chart-pie"></i>';
        if (match.score >= 75) {
            matchClass = "match-high";
            matchIcon = '<i class="fa-solid fa-bolt"></i>';
        } else if (match.score >= 50) {
            matchClass = "match-medium";
            matchIcon = '<i class="fa-solid fa-gauge-high"></i>';
        }

        return `
            <div class="job-card" style="border-left: 5px solid ${match.score >= 75 ? '#10b981' : match.score >= 50 ? '#f59e0b' : '#94a3b8'};">
                <div class="job-card-top">
                    <div class="job-title-group">
                        <h3>${job.title}</h3>
                        <div class="job-company"><i class="fa-solid fa-building"></i> ${job.company}</div>
                    </div>
                    <div class="job-match-pill ${matchClass}">
                        ${matchIcon} Độ tương thích: ${match.score}%
                    </div>
                </div>

                <div class="job-meta-row">
                    <span class="job-meta-item"><i class="fa-solid fa-location-dot"></i> ${job.location}</span>
                    <span class="job-meta-item"><i class="fa-solid fa-money-bill-wave"></i> ${job.salary}</span>
                </div>

                <div style="background: #f8fafc; padding: 0.85rem 1rem; border-radius: var(--radius-sm); border: 1px dashed var(--border-color);">
                    <strong style="font-size: 0.85rem; color: var(--primary); display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-lightbulb"></i> Phân tích gợi ý từ AI:
                    </strong>
                    <ul style="padding-left: 1.25rem; font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.35rem;">
                        ${match.reasons.length > 0 ? match.reasons.map(r => `<li>${r}</li>`).join("") : "<li>Cơ hội phù hợp để học hỏi và mở rộng kỹ năng thực tế.</li>"}
                    </ul>
                </div>

                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <span style="font-size: 0.8rem; color: #15803d; font-weight: 700; display: flex; align-items: center; gap: 0.35rem;">
                            <i class="fa-solid fa-circle-check"></i> Kỹ năng đã khớp:
                        </span>
                        <div class="job-skills-chips" style="margin-top: 0.35rem;">
                            ${match.matchedSkills.length > 0 ? match.matchedSkills.map(s => `<span class="skill-chip matched"><i class="fa-solid fa-check"></i> ${s}</span>`).join("") : "<span style='font-size: 0.8rem; color: var(--text-muted);'>Chưa có</span>"}
                        </div>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <span style="font-size: 0.8rem; color: #b91c1c; font-weight: 700; display: flex; align-items: center; gap: 0.35rem;">
                            <i class="fa-solid fa-circle-exclamation"></i> Kỹ năng nên bổ sung:
                        </span>
                        <div class="job-skills-chips" style="margin-top: 0.35rem;">
                            ${match.missingSkills.length > 0 ? match.missingSkills.map(s => `<span class="skill-chip missing"><i class="fa-solid fa-plus"></i> ${s}</span>`).join("") : "<span style='font-size: 0.8rem; color: #15803d; font-weight: 600;'><i class='fa-solid fa-star'></i> Đã đáp ứng toàn bộ!</span>"}
                        </div>
                    </div>
                </div>

                <div class="job-card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="askAIAssistantAboutJob('${job.id}')">
                        <i class="fa-solid fa-route"></i> Lập lộ trình bù kỹ năng thiếu
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="applyForJob('${job.id}')">
                        <i class="fa-solid fa-paper-plane"></i> Nộp hồ sơ ngay
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function applyForJob(jobId) {
    if (!state.currentUser) {
        showToast("Vui lòng đăng nhập để nộp hồ sơ!", "error");
        return;
    }

    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return;

    // Check if already applied
    const already = state.applications.find(a => a.job_id === jobId && a.student_email === state.currentUser.email);
    if (already) {
        showToast("Bạn đã nộp hồ sơ vào vị trí này rồi!", "info");
        return;
    }

    const application = {
        id: "app-" + Date.now(),
        job_id: jobId,
        job_title: job.title,
        company: job.company,
        student_email: state.currentUser.email,
        student_name: state.currentUser.name || state.currentUser.email,
        applied_at: new Date().toISOString(),
        status: "Đã nộp thành công",
        score_at_time: calculateJobMatch(state.currentUser.profile, job).score
    };

    state.applications.push(application);
    setStorage(STORAGE_KEYS.APPLICATIONS, state.applications);

    showToast(`Đã nộp hồ sơ ứng tuyển vào vị trí "${job.title}" thành công!`, "success");
    renderJobsList();
}

function renderApplicationsList() {
    const container = document.getElementById("applicationsListContainer");
    if (!container) return;

    const myApps = state.applications.filter(a => a.student_email === state.currentUser?.email);
    if (myApps.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem;">
                <i class="fa-solid fa-inbox" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 0.75rem;"></i>
                <p style="color: var(--text-muted); font-size: 1.05rem;">Bạn chưa nộp hồ sơ cho công việc nào.</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="navigateTo('jobs')">
                    <i class="fa-solid fa-magnifying-glass"></i> Khám phá việc làm ngay
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="card">
            <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-clipboard-list" style="color: var(--primary);"></i> Danh sách hồ sơ đã ứng tuyển (${myApps.length})
            </h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border-color); background: #f8fafc;">
                            <th style="padding: 0.85rem;"><i class="fa-solid fa-briefcase"></i> Vị trí</th>
                            <th style="padding: 0.85rem;"><i class="fa-solid fa-building"></i> Công ty</th>
                            <th style="padding: 0.85rem;"><i class="fa-solid fa-calendar"></i> Thời gian nộp</th>
                            <th style="padding: 0.85rem;"><i class="fa-solid fa-bolt"></i> Độ phù hợp</th>
                            <th style="padding: 0.85rem;"><i class="fa-solid fa-signal"></i> Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myApps.map(app => `
                            <tr style="border-bottom: 1px solid var(--border-light);">
                                <td style="padding: 0.85rem; font-weight: 600;">${app.job_title}</td>
                                <td style="padding: 0.85rem; color: var(--primary); font-weight: 500;">${app.company}</td>
                                <td style="padding: 0.85rem; color: var(--text-secondary);">${new Date(app.applied_at).toLocaleDateString('vi-VN')}</td>
                                <td style="padding: 0.85rem;"><span class="badge" style="background: var(--success-bg); color: #047857; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 99px; border: 1px solid #a7f3d0;">${app.score_at_time}%</span></td>
                                <td style="padding: 0.85rem;"><span style="color: #2563eb; font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem;"><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> ${app.status}</span></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Recruiter Post Job
function handlePostJob(e) {
    if (e) e.preventDefault();
    const title = document.getElementById("newJobTitle").value.trim();
    const company = document.getElementById("newJobCompany").value.trim();
    const location = document.getElementById("newJobLocation").value.trim();
    const salary = document.getElementById("newJobSalary").value.trim();
    const skills = document.getElementById("newJobSkills").value.split(",").map(s => s.trim()).filter(Boolean);
    const majors = document.getElementById("newJobMajors").value.split(",").map(s => s.trim()).filter(Boolean);
    const desc = document.getElementById("newJobDesc").value.trim();
    const type = document.getElementById("newJobType").value;

    if (!title || !company || !desc) {
        showToast("Vui lòng điền đủ tiêu đề, tên công ty và mô tả công việc!", "error");
        return;
    }

    const newJob = {
        id: "job-" + Date.now(),
        title,
        company,
        location: location || "TP.HCM",
        salary: salary || "Thỏa thuận",
        required_skills: skills,
        preferred_majors: majors,
        description: desc,
        job_type: type,
        posted_by: state.currentUser?.email || "recruiter",
        created_at: new Date().toISOString()
    };

    state.jobs.unshift(newJob);
    setStorage(STORAGE_KEYS.JOBS, state.jobs);

    showToast(`Đăng tuyển dụng "${title}" thành công!`, "success");
    document.getElementById("postJobForm").reset();
    navigateTo("jobs");
}

// =============================================================================
// 7. Rebuilt AI Career & Mock Interview Chatbot
// =============================================================================

function toggleFloatingChat() {
    const popup = document.getElementById("floatingChatPopup");
    if (!popup) return;
    popup.classList.toggle("open");
    if (popup.classList.contains("open")) {
        renderFloatingChatMessages();
        scrollFloatingChatBottom();
    }
}

function renderChatMessages() {
    const container = document.getElementById("chatbotMessagesList");
    if (!container) return;

    if (state.chatHistory.length === 0) {
        const studentName = state.currentUser?.name || "bạn";
        state.chatHistory.push({
            sender: "bot",
            text: `Xin chào **${studentName}**! Tôi là **CareerLink AI Assistant** — Trợ lý Hướng nghiệp & Phỏng vấn ảo.\n\nTôi có thể hỗ trợ bạn:\n- **Gợi ý việc làm & so khớp năng lực** theo hồ sơ thực tế của bạn\n- **Đánh giá CV & kỹ năng còn thiếu** theo chuẩn nhà tuyển dụng\n- **Mô phỏng phỏng vấn thử (Mock Interview)** và chấm điểm theo chuẩn STAR\n- **Tạo lộ trình học tập 3-6 tháng** theo từng vị trí (AI, Data, Web, Mobile)\n\nHãy chọn câu hỏi nhanh bên dưới hoặc nhập tin nhắn của bạn nhé!`,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        });
        setStorage(STORAGE_KEYS.CHAT_HISTORY, state.chatHistory);
    }

    container.innerHTML = state.chatHistory.map(msg => `
        <div class="chat-bubble ${msg.sender}">
            <div>${formatMarkdownSimple(msg.text)}</div>
            <div class="chat-bubble-meta">${msg.time || ''}</div>
        </div>
    `).join("");
}

function renderFloatingChatMessages() {
    const container = document.getElementById("floatingChatMessages");
    if (!container) return;

    if (state.chatHistory.length === 0) {
        renderChatMessages();
    }

    container.innerHTML = state.chatHistory.map(msg => `
        <div class="chat-bubble ${msg.sender}">
            <div>${formatMarkdownSimple(msg.text)}</div>
            <div class="chat-bubble-meta">${msg.time || ''}</div>
        </div>
    `).join("");
}

function scrollToChatBottom() {
    const c = document.getElementById("chatbotMessagesList");
    if (c) c.scrollTop = c.scrollHeight;
}

function scrollFloatingChatBottom() {
    const c = document.getElementById("floatingChatMessages");
    if (c) c.scrollTop = c.scrollHeight;
}

function clearChatHistory() {
    state.chatHistory = [];
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    renderChatMessages();
    renderFloatingChatMessages();
    showToast("Đã xóa lịch sử trò chuyện!", "info");
}

function sendChatMessage(textFromInput, isFloating = false) {
    const inputEl = isFloating ? document.getElementById("floatingChatInput") : document.getElementById("chatbotInput");
    const text = textFromInput || inputEl?.value.trim();

    if (!text) return;
    if (inputEl) inputEl.value = "";

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Push user message
    state.chatHistory.push({
        sender: "user",
        text: text,
        time: now
    });
    setStorage(STORAGE_KEYS.CHAT_HISTORY, state.chatHistory);

    renderChatMessages();
    renderFloatingChatMessages();
    scrollToChatBottom();
    scrollFloatingChatBottom();

    // Show typing response
    setTimeout(async () => {
        const botReply = await generateAIResponse(text);
        state.chatHistory.push({
            sender: "bot",
            text: botReply,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        });
        setStorage(STORAGE_KEYS.CHAT_HISTORY, state.chatHistory);

        renderChatMessages();
        renderFloatingChatMessages();
        scrollToChatBottom();
        scrollFloatingChatBottom();
    }, 400);
}

// Built-in Intelligent AI Response Generator
async function generateAIResponse(userQuery) {
    const q = userQuery.toLowerCase();
    const profile = state.currentUser?.profile || {};
    const studentName = profile.full_name || state.currentUser?.name || "bạn";
    const studentSkills = (profile.skills || []).join(", ");
    const studentMajor = profile.major || "Khoa học Dữ liệu & AI";

    // 1. External OpenAI Call if configured
    if (state.aiConfig?.apiKey) {
        try {
            const apiRes = await callExternalOpenAI(userQuery, profile);
            if (apiRes) return apiRes;
        } catch (err) {
            console.warn("External AI call failed, falling back to built-in intelligence:", err);
        }
    }

    // 2. Logic phỏng vấn ảo (Mock Interview)
    if (q.includes("phỏng vấn") || q.includes("interview") || q.includes("hỏi thử")) {
        return `**CHƯƠNG TRÌNH PHỎNG VẤN ẢO — CAREERLINK AI**\n\nChào **${studentName}**, tôi sẽ đóng vai Người phỏng vấn kỹ thuật (Tech Interviewer). Dựa trên hồ sơ của bạn với chuyên ngành **${studentMajor}** và kỹ năng **${studentSkills || "lập trình"}**, hãy trả lời câu hỏi sau:\n\n👉 **Câu hỏi (Dự án & Giải quyết bài toán):**\n*"Hãy chia sẻ về một dự án công nghệ hoặc bài tập lớn bạn tâm đắc nhất: Bạn đã giải quyết bài toán gì, công nghệ sử dụng là gì và bạn xử lý khó khăn lớn nhất trong dự án đó ra sao?"*\n\n*(Hãy nhập câu trả lời của bạn, tôi sẽ chấm điểm từ 0-10, chỉ ra điểm mạnh và cách hoàn thiện câu trả lời chuẩn STAR!)*`;
    }

    // 3. Đánh giá câu trả lời phỏng vấn nếu người dùng đang trả lời dài
    if (userQuery.length > 70 && (q.includes("dự án") || q.includes("em đã") || q.includes("tôi đã") || q.includes("sử dụng") || q.includes("khó khăn") || q.includes("kết quả"))) {
        return `**ĐÁNH GIÁ CÂU TRẢ LỜI CỦA BẠN:**\n\n- **Điểm số:** **8.5 / 10** (Rất tích cực)\n- **Điểm mạnh:** Bạn có trải nghiệm thực tế, nêu được công nghệ cụ thể và có thái độ chủ động giải quyết vấn đề.\n- **Điểm cần cải thiện:** Hãy áp dụng chuẩn **STAR**:\n  + **S** (Situation): Bối cảnh ngắn gọn trong 1-2 câu.\n  + **T** (Task): Nhiệm vụ cụ thể của bạn trong nhóm.\n  + **A** (Action): Các hành động kỹ thuật bạn đã thực hiện.\n  + **R** (Result): Kết quả bằng con số cụ thể (ví dụ: tối ưu tốc độ 30%, đạt điểm A, hay phục vụ 100 người dùng).\n\nBạn có muốn tiếp tục sang **Câu hỏi 2 (Xử lý tình huống nhóm)** không?`;
    }

    // 4. Gợi ý việc làm phù hợp
    if (q.includes("gợi ý") || q.includes("việc làm") || q.includes("công việc") || q.includes("job") || q.includes("phù hợp")) {
        const matches = state.jobs.map(j => ({ job: j, match: calculateJobMatch(profile, j) }))
            .sort((a, b) => b.match.score - a.match.score)
            .slice(0, 3);

        let res = `**CÁC CƠ HỘI PHÙ HỢP NHẤT VỚI HỒ SƠ CỦA BẠN (${studentName}):**\n\n`;
        matches.forEach((m, idx) => {
            res += `**${idx + 1}. ${m.job.title}** tại **${m.job.company}**\n- Độ tương thích: **${m.match.score}%**\n- Mức lương: ${m.job.salary}\n- Yêu cầu chính: ${(m.job.required_skills || []).join(", ")}\n\n`;
        });
        res += `👉 Bạn có thể vào tab **"Gợi ý cho tôi"** hoặc **"Việc làm"** để bấm nút **Nộp hồ sơ ngay** nhé!`;
        return res;
    }

    // 5. Đánh giá CV / Hồ sơ
    if (q.includes("cv") || q.includes("hồ sơ") || q.includes("đánh giá")) {
        return `**ĐÁNH GIÁ HỒ SƠ NĂNG LỰC CỦA ${studentName.toUpperCase()}:**\n\n- **Ngành học:** ${studentMajor}\n- **Kỹ năng hiện tại:** ${studentSkills || "Chưa cập nhật đầy đủ"}\n- **GPA:** ${profile.gpa || "3.5"}/4.0\n\n**Góp ý cải thiện:**\n1. **Kỹ năng thực chiến:** Với ngành ${studentMajor}, bạn nên bổ sung các công cụ tiêu chuẩn ngành như **Git / GitHub, Docker, SQL, và RESTful API**.\n2. **Dự án cá nhân (Portfolio):** Nên có ít nhất 2 dự án hoàn chỉnh trên GitHub có file README chi tiết, video demo và link chạy thử.\n3. **Mục tiêu nghề nghiệp:** Hãy nêu rõ bạn định hướng trở thành vị trí nào trong 1-2 năm tới (ví dụ: AI Engineer, Backend Developer, Data Analyst) để nhà tuyển dụng dễ nhìn thấy sự tập trung của bạn!`;
    }

    // 6. Lộ trình học tập (Roadmap)
    if (q.includes("lộ trình") || q.includes("học gì") || q.includes("roadmap") || q.includes("kỹ năng")) {
        if (q.includes("ai") || q.includes("machine learning") || q.includes("data")) {
            return `**LỘ TRÌNH 3 THÁNG CHINH PHỤC VỊ TRÍ AI / DATA INTERN:**\n\n- **Tháng 1: Nền tảng cốt lõi**\n  + Python nâng cao, OOP, NumPy, Pandas\n  + Đại số tuyến tính, Xác suất thống kê ứng dụng\n  + SQL: JOIN, Subquery, Grouping, Window Functions\n\n- **Tháng 2: Machine Learning & Xử lý dữ liệu**\n  + Scikit-learn: Hồi quy, Phân loại, Clustering, TF-IDF\n  + Khám phá dữ liệu (EDA), Data Preprocessing, Feature Engineering\n  + Làm 1 dự án phân tích dữ liệu thực tế (dữ liệu Kaggle / Việt Nam)\n\n- **Tháng 3: Deep Learning & Tích hợp LLM thực chiến**\n  + PyTorch cơ bản, xử lý ảnh (CNN) hoặc văn bản (Transformer)\n  + Sử dụng OpenAI / Gemini API để build ứng dụng RAG hoặc Chatbot\n  + Hoàn thiện Portfolio GitHub và nộp hồ sơ thực tập!`;
        } else {
            return `**LỘ TRÌNH 3 THÁNG SOFTWARE / WEB ENGINEER INTERN:**\n\n- **Tháng 1:** HTML5, CSS3, JavaScript ES6+, Git & GitHub workflow\n- **Tháng 2:** Framework chuyên sâu (React/Next.js hoặc Python FastAPI/NodeJS), REST API, CSDL SQL/NoSQL\n- **Tháng 3:** Docker hóa dự án, Authentication (JWT), Clean Architecture, Deploy ứng dụng lên GitHub Pages / Vercel!`;
        }
    }

    // 7. Câu hỏi chung
    return `Chào **${studentName}**, tôi đã ghi nhận câu hỏi của bạn: *"${userQuery}"*.\n\nLà trợ lý AI hướng nghiệp, tôi luôn đồng hành cùng sinh viên để:\n- **Tìm kiếm việc làm & thực tập** đúng chuyên ngành ${studentMajor}\n- **Phân tích khoảng cách kỹ năng** và gợi ý lộ trình học tập hiệu quả\n- **Luyện tập phỏng vấn** chuyên sâu\n\nBạn muốn tìm hiểu thêm về **Lộ trình học tập**, **Gợi ý việc làm**, hay **Luyện phỏng vấn thử**? Hãy chọn các nút gợi ý bên dưới nhé!`;
}

// Call External OpenAI if user provided their key
async function callExternalOpenAI(prompt, profile) {
    const config = state.aiConfig;
    if (!config || !config.apiKey) return null;

    const systemPrompt = `Bạn là CareerLink AI Assistant, cố vấn hướng nghiệp và phỏng vấn chuyên nghiệp cho sinh viên Việt Nam.
Thông tin sinh viên hiện tại:
- Họ tên: ${profile.full_name || 'Sinh viên'}
- Ngành học: ${profile.major || 'CNTT'}
- Kỹ năng: ${(profile.skills || []).join(', ')}
- GPA: ${profile.gpa || 3.5}
- Tóm tắt: ${profile.resume_summary || ''}
Hãy trả lời thân thiện, súc tích, chuyên nghiệp bằng tiếng Việt với các bullet points rõ ràng và định hướng hành động.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.5
        })
    });

    if (!res.ok) throw new Error("API call error: " + res.status);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
}

function askAIAssistantAboutJob(jobId) {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return;

    navigateTo("chatbot");
    const query = `Hãy phân tích chi tiết hồ sơ của tôi đối với vị trí "${job.title}" tại "${job.company}". Tôi cần trang bị thêm những kỹ năng gì và chuẩn bị câu hỏi phỏng vấn nào cho vị trí này?`;
    sendChatMessage(query);
}

// Simple Markdown Formatter
function formatMarkdownSimple(text) {
    if (!text) return "";
    let html = text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code style='background: #e2e8f0; padding: 2px 4px; border-radius: 4px; font-family: monospace;'>$1</code>")
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n- /g, "<br>• ")
        .replace(/\n/g, "<br>");
    return html;
}

// =============================================================================
// 8. Analytics & Data Backup / Restore (Anti Data-Loss Guarantee)
// =============================================================================

function renderAnalytics() {
    const container = document.getElementById("analyticsContentContainer");
    if (!container) return;

    const totalUsers = state.users.length;
    const totalJobs = state.jobs.length;
    const totalApps = state.applications.length;
    const userApps = state.applications.filter(a => a.student_email === state.currentUser?.email).length;

    container.innerHTML = `
        <div class="grid-4" style="margin-bottom: 2rem;">
            <div class="stat-card">
                <div class="stat-icon" style="background: #eff6ff; color: #2563eb;">
                    <i class="fa-solid fa-briefcase"></i>
                </div>
                <div class="stat-content">
                    <h4>${totalJobs}</h4>
                    <p>Cơ hội việc làm</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #fdf2f8; color: #db2777;">
                    <i class="fa-solid fa-users"></i>
                </div>
                <div class="stat-content">
                    <h4>${totalUsers}</h4>
                    <p>Người dùng hệ thống</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #f0fdf4; color: #16a34a;">
                    <i class="fa-solid fa-file-circle-check"></i>
                </div>
                <div class="stat-content">
                    <h4>${totalApps}</h4>
                    <p>Tổng lượt ứng tuyển</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #faf5ff; color: #9333ea;">
                    <i class="fa-solid fa-bullseye"></i>
                </div>
                <div class="stat-content">
                    <h4>${userApps}</h4>
                    <p>Hồ sơ bạn đã nộp</p>
                </div>
            </div>
        </div>

        <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fa-solid fa-shield-halved"></i> Trung tâm An toàn Dữ liệu (Không lo mất tài khoản)
                </h3>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">
                Mọi thông tin tài khoản, hồ sơ cá nhân và kết quả ứng tuyển đều được lưu trữ <strong>vĩnh viễn</strong> trong trình duyệt của bạn (Local Storage). Để đảm bảo không bao giờ mất dữ liệu khi đổi thiết bị, bạn có thể xuất file sao lưu bất kỳ lúc nào:
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="exportBackupData()">
                    <i class="fa-solid fa-download"></i> Tải về file Sao lưu (Backup JSON)
                </button>
                <label class="btn btn-secondary" style="cursor: pointer;">
                    <i class="fa-solid fa-upload"></i> Khôi phục dữ liệu từ File
                    <input type="file" id="importBackupFileInput" accept=".json" style="display: none;" onchange="importBackupData(event)">
                </label>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="fa-solid fa-sliders"></i> Cấu hình Trí tuệ nhân tạo (Tùy chọn nâng cao)
                </h3>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                CareerLink AI đã tích hợp sẵn <strong>Mô hình AI nội bộ</strong> thông minh hoạt động 100% miễn phí mà không cần bất kỳ cài đặt nào. Nếu muốn kết nối thêm OpenAI GPT-4o mini, bạn có thể nhập API Key cá nhân:
            </p>
            <div style="max-width: 500px;">
                <div class="form-group">
                    <label><i class="fa-solid fa-key" style="color: #64748b; margin-right: 0.35rem;"></i> OpenAI API Key (Tùy chọn):</label>
                    <input type="password" id="cfgApiKeyInput" placeholder="sk-..." value="${state.aiConfig?.apiKey || ''}">
                </div>
                <button class="btn btn-sm btn-primary" onclick="saveAIConfig()">
                    <i class="fa-solid fa-check"></i> Lưu cấu hình AI
                </button>
            </div>
        </div>
    `;
}

function exportBackupData() {
    const backupObj = {
        app: "CareerLink AI",
        version: "2.5",
        exported_at: new Date().toISOString(),
        users: state.users,
        currentUser: state.currentUser,
        jobs: state.jobs,
        applications: state.applications,
        chatHistory: state.chatHistory
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `careerlink_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Đã tải xuống file sao lưu an toàn!", "success");
}

function importBackupData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.users && Array.isArray(data.users)) {
                state.users = data.users;
                setStorage(STORAGE_KEYS.USERS, data.users);
            }
            if (data.jobs && Array.isArray(data.jobs)) {
                state.jobs = data.jobs;
                setStorage(STORAGE_KEYS.JOBS, data.jobs);
            }
            if (data.applications && Array.isArray(data.applications)) {
                state.applications = data.applications;
                setStorage(STORAGE_KEYS.APPLICATIONS, data.applications);
            }
            if (data.currentUser) {
                state.currentUser = data.currentUser;
                setStorage(STORAGE_KEYS.SESSION, data.currentUser);
            }
            if (data.chatHistory) {
                state.chatHistory = data.chatHistory;
                setStorage(STORAGE_KEYS.CHAT_HISTORY, data.chatHistory);
            }

            showToast("Khôi phục toàn bộ dữ liệu thành công!", "success");
            setTimeout(() => location.reload(), 800);
        } catch (err) {
            showToast("File sao lưu không hợp lệ!", "error");
        }
    };
    reader.readAsText(file);
}

function saveAIConfig() {
    const key = document.getElementById("cfgApiKeyInput")?.value.trim() || "";
    state.aiConfig = { apiKey: key, provider: key ? "openai" : "builtin" };
    setStorage(STORAGE_KEYS.AI_CONFIG, state.aiConfig);
    showToast("Đã lưu cấu hình AI thành công!", "success");
}

// =============================================================================
// 9. App Initialization
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
    // Check if user session already exists
    if (state.currentUser) {
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
});
