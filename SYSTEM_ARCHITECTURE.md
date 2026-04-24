# ThinkFirst - System Architecture Document

## 1. Overview
ThinkFirst là một nền tảng học tập thông minh (Adaptive Learning Platform) được thiết kế để hỗ trợ sinh viên thông qua các phương pháp sư phạm tiên tiến như **Socratic Method** và **Adaptive Testing**. Hệ thống tích hợp Trí tuệ nhân tạo (AI) để cá nhân hóa lộ trình học tập và cảnh báo sớm các nguy cơ học tập.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Cloud)
- **Logger**: Winston & Morgan
- **Job Scheduling**: Node-cron (Dành cho hệ thống cảnh báo sớm)

### AI Integration
- **Provider**: SambaNova Cloud
- **Model**: Meta-Llama-3.3-70B-Instruct
- **Protocol**: OpenAI-compatible API

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Environment Management**: Dotenv

---

## 3. System Components & Modules

### 3.1. Socratic AI Chat Module
- **Chức năng**: Cung cấp trợ giảng AI (ThinkFirst AI) tương tác với sinh viên.
- **Cơ chế**: Sử dụng kỹ thuật Prompt Engineering để áp dụng phương pháp Socratic (không đưa ra đáp án trực tiếp, chỉ gợi mở bằng câu hỏi).
- **Luồng dữ liệu**: 
    1. Nhận tin nhắn từ sinh viên.
    2. Truy xuất lịch sử tương tác từ DB.
    3. Gửi Context (Môn học, trình độ, lịch sử) cho SambaNova API.
    4. Lưu câu trả lời của AI và phản hồi lại cho sinh viên.

### 3.2. Adaptive Quiz Engine
- **Chức năng**: Hệ thống kiểm tra thích ứng.
- **Cơ chế**: Độ khó của câu hỏi tiếp theo sẽ thay đổi dựa trên kết quả của câu hỏi trước đó (Easy -> Medium -> Hard).
- **Logic**: 
    - Đúng liên tiếp: Tăng độ khó.
    - Sai liên tiếp: Giảm độ khó.
    - Kết thúc khi đủ số câu hỏi hoặc đạt điều kiện dừng (Mastery/Struggling).

### 3.3. Early Warning System (EWS)
- **Chức năng**: Phát hiện và cảnh báo sinh viên có nguy cơ học tập kém.
- **Chỉ số theo dõi**: 
    - Điểm số thấp liên tiếp trong các bài Quiz.
    - Thời gian không hoạt động (Inactivity) kéo dài.
    - Tiến độ học tập bị đình trệ.
- **Triển khai**: Một Cron Job chạy định kỳ hàng ngày để quét dữ liệu và gắn cờ (Flag) cảnh báo.

### 3.4. Learning Profile & Roadmap
- **Chức năng**: Quản lý hồ sơ học tập và lộ trình gợi ý.
- **Dữ liệu**: Lưu trữ điểm yếu (Weak topics), chuỗi ngày học tập (Streak), và các bài học được đề xuất tiếp theo.

---

## 4. Database Schema (High-Level)

Hệ thống sử dụng PostgreSQL với các bảng chính:
- `users`: Thông tin tài khoản và vai trò (Student/Instructor).
- `courses` & `lessons`: Cấu trúc nội dung học tập.
- `quizzes` & `questions`: Ngân hàng câu hỏi phân loại theo độ khó.
- `quiz_results`: Lưu trữ lịch sử làm bài và điểm số thích ứng.
- `ai_interactions`: Nhật ký chat giữa sinh viên và AI.
- `at_risk_flags`: Danh sách sinh viên cần chú ý từ hệ thống cảnh báo sớm.

---

## 5. Data Flow Diagram

1. **Sinh viên tương tác (Frontend)** -> Gửi yêu cầu qua **REST API (Backend)**.
2. **Backend** thực hiện:
   - Xác thực người dùng (JWT).
   - Truy vấn/Cập nhật dữ liệu từ **Postgres**.
   - (Nếu cần) Gọi **SambaNova AI** để lấy phản hồi thông minh.
3. **Kết quả** được trả về Frontend để hiển thị real-time.
4. **Cron Job** chạy ngầm hàng đêm để cập nhật các chỉ số cảnh báo sớm.

---

## 6. Deployment Workflow

- **Local Development**: Chạy qua `docker-compose up`.
- **Production**: 
    - GitHub Actions tự động kiểm tra (Lint/Test).
    - Build Docker Image và đẩy lên Server.
    - Tự động Deploy khi có code mới trên nhánh `main`.
