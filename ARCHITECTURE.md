# ThinkFirst — Tài liệu Kiến trúc Hệ thống

> Smart LMS Platform · Hackathon Giáo dục HCMUT 2026
> Stack: React 18 + Vite · Express.js/Node.js · PostgreSQL (Neon) · Claude / OpenAI API

---

## 1. Tổng quan hệ thống

ThinkFirst là nền tảng học tập thông minh chống "brainrot" bằng phương pháp Socratic AI — thay vì cho đáp án, AI hỏi ngược lại để học sinh tự tư duy. Hệ thống cá nhân hoá lộ trình học dựa trên dữ liệu hành vi và cung cấp dashboard phân tích sâu cho giảng viên.

### Hai nhóm người dùng

| Nhóm | Nhu cầu cốt lõi |
|---|---|
| **Học sinh / Sinh viên** | Hỗ trợ tư duy chủ động, quiz thích nghi, lộ trình học cá nhân |
| **Giảng viên / Giáo viên** | Dashboard theo dõi lớp, cảnh báo sớm học sinh tụt hậu |

---

## 2. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                                                             │
│   ┌──────────────────────┐   ┌──────────────────────────┐  │
│   │  Student SPA         │   │  Instructor SPA           │  │
│   │  React 18 + Vite     │   │  React 18 + Vite          │  │
│   │  TailwindCSS         │   │  TailwindCSS              │  │
│   │                      │   │                           │  │
│   │  · Chat UI           │   │  · Dashboard              │  │
│   │  · Quiz UI           │   │  · At-risk alerts         │  │
│   │  · Progress view     │   │  · Content manager        │  │
│   │  · Learning path     │   │  · Student detail         │  │
│   └──────────┬───────────┘   └──────────────┬────────────┘  │
└──────────────┼──────────────────────────────┼───────────────┘
               │  HTTPS / REST API            │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                             │
│                    Express.js / Node.js                     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Auth Module │  │ Quiz Engine │  │  Socratic Proxy  │   │
│  │ JWT + bcrypt│  │ Adaptive    │  │  System prompt   │   │
│  └─────────────┘  └─────────────┘  │  Hỏi ngược lại  │   │
│                                    └──────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Learning    │  │  Dashboard  │  │  Early Warning   │   │
│  │ Path Engine │  │  Stats API  │  │  System (cron)   │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└──────────────────────┬──────────────────────┬──────────────┘
                       │                      │
          ┌────────────▼──────────┐  ┌────────▼───────────┐
          │   Neon PostgreSQL     │  │  AI API (External) │
          │   Serverless PG       │  │  Claude / OpenAI   │
          │   Connection pooling  │  │  Socratic prompt   │
          └───────────────────────┘  └────────────────────┘
```

### Luồng dữ liệu chính

```
Học sinh gửi câu hỏi
        │
        ▼
Express nhận request → xác thực JWT
        │
        ▼
Socratic Proxy: bổ sung system prompt
"Không được trả lời thẳng. Hỏi ngược lại."
        │
        ▼
Gọi AI API → nhận phản hồi Socratic
        │
        ▼
Lưu vào ai_interactions (kèm session_id, message_index, role)
        │
        ▼
Trả về client → hiển thị "Thinking Mode" indicator
```

---

## 3. Database Schema (đầy đủ, đã sửa)

> **Lưu ý:** So với schema ban đầu, đã bổ sung 3 bảng thiếu (`users`, `enrollments`, `at_risk_flags`) và cập nhật cột cho 6 bảng còn lại.

### 3.1 Auth & Users

```sql
-- Bảng người dùng (THIẾU trong schema gốc — bổ sung mới)
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,   -- bcrypt cost ≥ 10
    role            VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Ghi nhận đăng nhập sai (rate limiting thủ công — Req 10.4)
CREATE TABLE login_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address      VARCHAR(45) NOT NULL,
    attempted_at    TIMESTAMPTZ DEFAULT NOW(),
    success         BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_login_attempts_ip ON login_attempts (ip_address, attempted_at);
```

### 3.2 Courses & Enrollment

```sql
-- Khóa học
CREATE TABLE courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    teacher_id      UUID NOT NULL REFERENCES users(id),
    subject         VARCHAR(100),                -- tag chủ đề tổng
    is_published    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Bài học (thêm topic, is_published so với schema gốc)
CREATE TABLE lessons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    topic           VARCHAR(100),               -- tag chủ đề cụ thể (link weak_topics)
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    "order"         INTEGER NOT NULL DEFAULT 0,
    is_published    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Đăng ký học (THIẾU trong schema gốc — bổ sung mới)
-- Cần thiết để giáo viên biết học sinh nào thuộc lớp mình
CREATE TABLE enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES users(id),
    course_id       UUID NOT NULL REFERENCES courses(id),
    enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);
CREATE INDEX idx_enrollments_course ON enrollments (course_id);
CREATE INDEX idx_enrollments_student ON enrollments (student_id);
```

### 3.3 Learning Profile & Roadmap

```sql
-- Hồ sơ học tập (bổ sung thêm các cột cần thiết)
CREATE TABLE learning_profiles (
    user_id              UUID PRIMARY KEY REFERENCES users(id),
    learning_style       VARCHAR(50),            -- visual / auditory / kinesthetic
    goals                TEXT,
    weak_topics          JSONB DEFAULT '[]',     -- ["algebra", "recursion", ...]
    weekly_study_goal    INTEGER DEFAULT 5,      -- giờ/tuần từ onboarding (Req 2.1)
    onboarding_completed BOOLEAN DEFAULT FALSE,  -- đã qua onboarding survey chưa
    streak_count         INTEGER DEFAULT 0,      -- số ngày liên tiếp học (Req 8.5)
    last_active_date     DATE,                   -- cho inactivity tracking (Req 6.3)
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Lộ trình học cá nhân (thêm updated_at)
CREATE TABLE learning_roadmaps (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id),
    course_id         UUID NOT NULL REFERENCES courses(id),
    recommended_path  JSONB NOT NULL,
    -- Cấu trúc jsonb: [{ "step": 1, "lesson_id": "...", "status": "completed|current|upcoming" }]
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);
```

### 3.4 Quiz & Adaptive Engine

```sql
-- Quiz gắn với bài học
CREATE TABLE quizzes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Câu hỏi (bổ sung topic + difficulty_level — cốt lõi của adaptive quiz)
CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    options         JSONB NOT NULL,              -- [{"key": "A", "text": "..."}, ...]
    correct_answer  VARCHAR(10) NOT NULL,        -- "A", "B", "C", ...
    topic           VARCHAR(100) NOT NULL,       -- tag chủ đề cho weak topic analysis
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_questions_quiz_difficulty ON questions (quiz_id, difficulty_level);
CREATE INDEX idx_questions_topic ON questions (topic);

-- Kết quả mỗi phiên quiz (bổ sung difficulty_level, time_taken)
CREATE TABLE quiz_results (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    quiz_id         UUID NOT NULL REFERENCES quizzes(id),
    score           NUMERIC(5,2) NOT NULL,       -- 0.00 → 100.00
    difficulty_level VARCHAR(20),               -- mức độ phiên đó kết thúc ở đâu
    time_taken      INTEGER,                    -- tổng giây toàn phiên
    answers         JSONB NOT NULL,
    -- Cấu trúc: [{ "question_id": "...", "answer": "B", "is_correct": true, "time_taken": 12 }]
    taken_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_quiz_results_user ON quiz_results (user_id, taken_at DESC);
CREATE INDEX idx_quiz_results_quiz_user ON quiz_results (quiz_id, user_id, taken_at DESC);
```

### 3.5 Study Sessions

```sql
-- Lịch sử học tập (bổ sung started_at, is_completed)
CREATE TABLE study_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    lesson_id       UUID NOT NULL REFERENCES lessons(id),
    started_at      TIMESTAMPTZ DEFAULT NOW(),   -- bổ sung mới
    completed_at    TIMESTAMPTZ,                 -- NULL nếu bỏ dở
    duration        INTEGER,                    -- giây
    is_completed    BOOLEAN DEFAULT FALSE       -- bổ sung mới (Req 8.4)
);
CREATE INDEX idx_study_sessions_user_date ON study_sessions (user_id, started_at DESC);
```

### 3.6 AI Chat Log

```sql
-- Lịch sử hội thoại AI (bổ sung session_id, role, message_index, lesson_id)
CREATE TABLE ai_interactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    session_id      UUID NOT NULL,              -- nhóm tin trong 1 luồng hội thoại
    lesson_id       UUID REFERENCES lessons(id),-- context bài học (nếu có)
    role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    message_index   INTEGER NOT NULL,           -- đếm thứ tự (để biết đã hỏi ngược đủ 3 lần chưa)
    user_message    TEXT,                       -- NULL nếu role = 'assistant'
    ai_response     TEXT,                       -- NULL nếu role = 'user'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_interactions_session ON ai_interactions (session_id, message_index);
```

### 3.7 Early Warning System

```sql
-- Cờ cảnh báo sớm (THIẾU trong schema gốc — bổ sung mới)
CREATE TABLE at_risk_flags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES users(id),
    course_id       UUID REFERENCES courses(id),
    indicator_type  VARCHAR(50) NOT NULL CHECK (indicator_type IN (
                        'low_score_consecutive',     -- Req 6.2
                        'long_inactivity',           -- Req 6.3
                        'stagnant_progress'          -- Req 6.4
                    )),
    detail          TEXT,                       -- mô tả cụ thể vd "Score 32% in 3 sessions"
    triggered_at    TIMESTAMPTZ DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ,               -- NULL = chưa giải quyết
    UNIQUE (student_id, course_id, indicator_type, resolved_at)
);
CREATE INDEX idx_at_risk_active ON at_risk_flags (student_id) WHERE resolved_at IS NULL;
```

---

## 4. Mô tả các Module Backend (Modular Architecture)

> Mỗi nghiệp vụ là một folder độc lập gồm 3 file: `*.routes.js` → `*.controller.js` → `*.service.js`.
> Controller chỉ nhận request và trả response. Toàn bộ business logic nằm trong service.

---

### 4.1 Module `auth`

**Endpoints:** `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/logout`

```javascript
// modules/auth/auth.routes.js
const router = express.Router();
router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/logout',   authController.logout);
module.exports = router;
```

```javascript
// modules/auth/auth.controller.js
// Chỉ nhận req/res, không có logic
const authService = require('./auth.service');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });
  res.status(201).json(result);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const result = await authService.login({ email, password, ip });
  res.json(result);
};

exports.logout = (_req, res) => res.json({ message: 'Logged out' });
```

```javascript
// modules/auth/auth.service.js
// Toàn bộ logic: bcrypt, JWT, rate limit
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../../db');

exports.register = async ({ name, email, password, role }) => {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
    [name, email, hash, role]
  );
  // Tạo learning_profile rỗng cho student
  if (role === 'student') {
    await db.query('INSERT INTO learning_profiles (user_id) VALUES ($1)', [rows[0].id]);
  }
  return rows[0];
};

exports.login = async ({ email, password, ip }) => {
  // Kiểm tra rate limit: ≥5 lần sai trong 10 phút → block 15 phút (Req 10.4)
  const { rows: attempts } = await db.query(
    `SELECT COUNT(*) FROM login_attempts
     WHERE ip_address = $1 AND success = false
     AND attempted_at > NOW() - INTERVAL '10 minutes'`,
    [ip]
  );
  if (parseInt(attempts[0].count) >= 5) {
    throw { status: 429, message: 'Quá nhiều lần đăng nhập sai. Thử lại sau 15 phút.' };
  }

  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  const valid = user && await bcrypt.compare(password, user.password_hash);

  await db.query(
    'INSERT INTO login_attempts (ip_address, success) VALUES ($1, $2)',
    [ip, !!valid]
  );

  if (!valid) throw { status: 401, message: 'Email hoặc mật khẩu không đúng.' };

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return { token, user: { id: user.id, name: user.name, role: user.role } };
};
```

---

### 4.2 Module `chat` (Socratic AI Proxy)

**Endpoints:** `POST /api/chat` · `GET /api/chat/history/:sessionId`

```javascript
// modules/chat/chat.routes.js
router.post('/',                    authenticate, chatController.send);
router.get('/history/:sessionId',   authenticate, chatController.history);
module.exports = router;
```

```javascript
// modules/chat/chat.controller.js
exports.send = async (req, res) => {
  const { message, sessionId, lessonId } = req.body;
  const reply = await chatService.send({ userId: req.user.id, message, sessionId, lessonId });
  res.json(reply);
};

exports.history = async (req, res) => {
  const messages = await chatService.getHistory(req.params.sessionId, req.user.id);
  res.json(messages);
};
```

```javascript
// modules/chat/chat.service.js
const SOCRATIC_SYSTEM_PROMPT = `
Bạn là ThinkFirst AI tutor. NGUYÊN TẮC BẮT BUỘC:
1. KHÔNG BAO GIỜ trả lời thẳng câu hỏi bài tập ở lần phản hồi đầu tiên.
2. Luôn hỏi ngược lại để kích thích tư duy: "Em đã thử cách nào rồi?"
3. Sau khi học sinh trả lời ≥3 câu hỏi gợi mở mà vẫn chưa đúng → cho gợi ý một phần.
4. Chỉ tiết lộ đáp án khi học sinh ĐÃ trả lời ≥3 câu hỏi VÀ chủ động xin đáp án.
5. Khi học sinh hiểu sai → xác định điểm sai cụ thể, hỏi câu nhắm đúng vào đó.
`;

exports.send = async ({ userId, message, sessionId, lessonId }) => {
  // Đếm số lượt hỏi ngược đã có trong session này (Req 3.3)
  const { rows: history } = await db.query(
    `SELECT role, ai_response, user_message, message_index
     FROM ai_interactions
     WHERE session_id = $1 ORDER BY message_index ASC`,
    [sessionId]
  );
  const nextIndex = history.length;
  const canRevealAnswer = nextIndex >= 6; // ≥3 cặp user+assistant = 6 bản ghi

  // Xây dựng messages array gửi lên AI
  const messages = history.map(r => ({
    role: r.role,
    content: r.role === 'user' ? r.user_message : r.ai_response,
  }));
  messages.push({ role: 'user', content: message });

  // Gọi AI API
  const aiResponse = await callAI({ systemPrompt: SOCRATIC_SYSTEM_PROMPT, messages, canRevealAnswer });

  // Lưu cả 2 lượt (user + assistant) vào DB
  await db.query(
    `INSERT INTO ai_interactions (user_id, session_id, lesson_id, role, user_message, message_index)
     VALUES ($1,$2,$3,'user',$4,$5)`,
    [userId, sessionId, lessonId, message, nextIndex]
  );
  await db.query(
    `INSERT INTO ai_interactions (user_id, session_id, lesson_id, role, ai_response, message_index)
     VALUES ($1,$2,$3,'assistant',$4,$5)`,
    [userId, sessionId, lessonId, aiResponse, nextIndex + 1]
  );

  return { reply: aiResponse, messageIndex: nextIndex, canRevealAnswer };
};
```

---

### 4.3 Module `quiz` (Adaptive Quiz Engine)

**Endpoints:** `GET /api/quiz/:lessonId/start` · `POST /api/quiz/answer` · `GET /api/quiz/:resultId/summary`

```javascript
// modules/quiz/quiz.routes.js
router.get('/:lessonId/start',    authenticate, quizController.start);
router.post('/answer',            authenticate, quizController.answer);
router.get('/:resultId/summary',  authenticate, quizController.summary);
module.exports = router;
```

```javascript
// modules/quiz/quiz.controller.js
exports.start   = async (req, res) => {
  const session = await quizService.startSession(req.user.id, req.params.lessonId);
  res.json(session);
};
exports.answer  = async (req, res) => {
  const result = await quizService.processAnswer(req.user.id, req.body);
  res.json(result);
};
exports.summary = async (req, res) => {
  const summary = await quizService.getSummary(req.user.id, req.params.resultId);
  res.json(summary);
};
```

```javascript
// modules/quiz/quiz.service.js
const earlyWarningService = require('../early-warning/earlyWarning.service');

const DIFFICULTY_SCALE = ['easy', 'medium', 'hard'];

exports.startSession = async (userId, lessonId) => {
  // Lấy difficulty gần nhất của user, mặc định 'medium'
  const { rows } = await db.query(
    `SELECT difficulty_level FROM quiz_results
     WHERE user_id = $1 ORDER BY taken_at DESC LIMIT 1`, [userId]
  );
  const startDifficulty = rows[0]?.difficulty_level ?? 'medium';
  const firstQuestion = await getNextQuestion(userId, lessonId, startDifficulty);
  return { question: firstQuestion, difficulty: startDifficulty, questionNumber: 1 };
};

exports.processAnswer = async (userId, { questionId, answer, lessonId, sessionState }) => {
  const { rows: [q] } = await db.query('SELECT * FROM questions WHERE id = $1', [questionId]);
  const isCorrect = q.correct_answer === answer;

  // Thuật toán adaptive: tăng/giảm độ khó (Req 4.2, 4.3)
  const currentIdx   = DIFFICULTY_SCALE.indexOf(sessionState.currentDifficulty);
  const nextDifficulty = isCorrect
    ? DIFFICULTY_SCALE[Math.min(currentIdx + 1, 2)]
    : DIFFICULTY_SCALE[Math.max(currentIdx - 1, 0)];

  // Cập nhật session state
  const updatedState = {
    ...sessionState,
    answers: [...sessionState.answers, { questionId, answer, isCorrect, difficulty: q.difficulty_level }],
    currentDifficulty: nextDifficulty,
    consecutiveCorrect:   isCorrect ? sessionState.consecutiveCorrect + 1 : 0,
    consecutiveIncorrect: !isCorrect ? sessionState.consecutiveIncorrect + 1 : 0,
  };

  // Kiểm tra điều kiện kết thúc (Req 4.4)
  const shouldEnd =
    updatedState.answers.length >= 20 ||
    updatedState.consecutiveCorrect >= 3 && nextDifficulty === 'hard' ||
    updatedState.consecutiveIncorrect >= 3 && nextDifficulty === 'easy';

  if (shouldEnd) return finishSession(userId, lessonId, updatedState);

  const nextQuestion = await getNextQuestion(userId, lessonId, nextDifficulty, updatedState.answers.map(a => a.questionId));
  return { nextQuestion, isCorrect, updatedState, done: false };
};

async function finishSession(userId, lessonId, state) {
  // Tính weak_topics: topic có tỷ lệ sai > 50% (Req 4.5)
  const topicMap = {};
  for (const a of state.answers) {
    const { rows: [q] } = await db.query('SELECT topic FROM questions WHERE id = $1', [a.questionId]);
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
    topicMap[q.topic].total++;
    if (a.isCorrect) topicMap[q.topic].correct++;
  }
  const weakTopics = Object.entries(topicMap)
    .filter(([, v]) => (v.correct / v.total) < 0.5)
    .map(([topic]) => topic);

  const score = (state.answers.filter(a => a.isCorrect).length / state.answers.length) * 100;

  // Lưu quiz_results
  const { rows: [result] } = await db.query(
    `INSERT INTO quiz_results (user_id, quiz_id, score, difficulty_level, answers)
     VALUES ($1, (SELECT quiz_id FROM questions WHERE id = $2 LIMIT 1), $3, $4, $5)
     RETURNING id`,
    [userId, state.answers[0].questionId, score, state.currentDifficulty, JSON.stringify(state.answers)]
  );

  // Cập nhật weak_topics trong learning_profile
  await db.query(
    `UPDATE learning_profiles SET weak_topics = $1, updated_at = NOW() WHERE user_id = $2`,
    [JSON.stringify(weakTopics), userId]
  );

  // Gọi Early Warning sau mỗi quiz (Req 6.1)
  await earlyWarningService.evaluate(userId, lessonId);

  return { done: true, score, weakTopics, resultId: result.id };
}

async function getNextQuestion(userId, lessonId, difficulty, excludeIds = []) {
  const { rows } = await db.query(
    `SELECT q.* FROM questions q
     JOIN quizzes qz ON qz.id = q.quiz_id
     WHERE qz.lesson_id = $1
       AND q.difficulty_level = $2
       AND q.id != ALL($3::uuid[])
       AND q.id NOT IN (
         SELECT jsonb_array_elements(answers)->>'questionId'
         FROM quiz_results
         WHERE user_id = $4 AND taken_at > NOW() - INTERVAL '24 hours'
       )
     ORDER BY RANDOM() LIMIT 1`,
    [lessonId, difficulty, excludeIds, userId]
  );
  return rows[0] ?? null;
}
```

---

### 4.4 Module `learning-path`

**Endpoints:** `GET /api/learning-path/:courseId` · `POST /api/learning-path/:courseId/recalculate`

```javascript
// modules/learning-path/learningPath.service.js
exports.recalculate = async (userId, courseId) => {
  const { rows: [profile] } = await db.query(
    'SELECT * FROM learning_profiles WHERE user_id = $1', [userId]
  );
  const { rows: lessons } = await db.query(
    'SELECT * FROM lessons WHERE course_id = $1 AND is_published = true ORDER BY "order"', [courseId]
  );
  const { rows: completed } = await db.query(
    'SELECT lesson_id FROM study_sessions WHERE user_id = $1 AND is_completed = true', [userId]
  );
  const completedIds = new Set(completed.map(r => r.lesson_id));

  // Ưu tiên lesson có topic trùng weak_topics, bỏ qua đã hoàn thành
  const weakTopics = profile.weak_topics ?? [];
  const path = lessons
    .filter(l => !completedIds.has(l.id))
    .sort((a, b) => {
      const aWeak = weakTopics.includes(a.topic) ? -1 : 0;
      const bWeak = weakTopics.includes(b.topic) ? -1 : 0;
      return aWeak - bWeak;
    })
    .map((l, i) => ({ step: i + 1, lesson_id: l.id, title: l.title, status: i === 0 ? 'current' : 'upcoming' }));

  await db.query(
    `INSERT INTO learning_roadmaps (user_id, course_id, recommended_path, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, course_id) DO UPDATE
     SET recommended_path = $3, updated_at = NOW()`,
    [userId, courseId, JSON.stringify(path)]
  );
  return path;
};
```

---

### 4.5 Module `early-warning` (không có routes — gọi nội bộ)

```javascript
// modules/early-warning/earlyWarning.service.js
// Được gọi từ: quiz.service.js (sau mỗi quiz) + earlyWarning.cron.js (mỗi 24h)

exports.evaluate = async (userId, courseId) => {
  const { rows: [profile] } = await db.query(
    'SELECT * FROM learning_profiles WHERE user_id = $1', [userId]
  );

  // Trigger 1 — Điểm thấp liên tiếp (Req 6.2): score < 40% trong 3 quiz liên tiếp
  const { rows: last3 } = await db.query(
    `SELECT score FROM quiz_results WHERE user_id = $1
     ORDER BY taken_at DESC LIMIT 3`, [userId]
  );
  if (last3.length === 3 && last3.every(r => parseFloat(r.score) < 40)) {
    await upsertFlag(userId, courseId, 'low_score_consecutive', 'Score < 40% trong 3 phiên liên tiếp');
  }

  // Trigger 2 — Không hoạt động 7 ngày (Req 6.3)
  const daysSince = profile.last_active_date
    ? Math.floor((Date.now() - new Date(profile.last_active_date)) / 86400000)
    : 999;
  if (daysSince >= 7) {
    await upsertFlag(userId, courseId, 'long_inactivity', `Không hoạt động ${daysSince} ngày`);
  }

  // Trigger 3 — Tiến độ đình trệ (Req 6.4)
  const { rows: [newSteps] } = await db.query(
    `SELECT COUNT(*) FROM study_sessions
     WHERE user_id = $1 AND is_completed = true
     AND completed_at > NOW() - INTERVAL '7 days'`, [userId]
  );
  if (parseInt(newSteps.count) === 0) {
    await upsertFlag(userId, courseId, 'stagnant_progress', 'Không hoàn thành bước mới trong 7 ngày');
  }

  // Resolve — Hồi phục (Req 6.5)
  const { rows: last2 } = await db.query(
    `SELECT score FROM quiz_results WHERE user_id = $1
     ORDER BY taken_at DESC LIMIT 2`, [userId]
  );
  const { rows: [logins] } = await db.query(
    `SELECT COUNT(DISTINCT DATE(attempted_at)) FROM login_attempts
     WHERE ip_address IN (SELECT ip_address FROM login_attempts WHERE success = true AND attempted_at > NOW() - INTERVAL '7 days')
     AND attempted_at > NOW() - INTERVAL '7 days'`
  );
  if (last2.length === 2 && last2.every(r => parseFloat(r.score) > 60) && parseInt(logins.count) >= 3) {
    await db.query(
      `UPDATE at_risk_flags SET resolved_at = NOW()
       WHERE student_id = $1 AND course_id = $2 AND resolved_at IS NULL`,
      [userId, courseId]
    );
  }
};

async function upsertFlag(studentId, courseId, indicatorType, detail) {
  await db.query(
    `INSERT INTO at_risk_flags (student_id, course_id, indicator_type, detail)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_id, course_id, indicator_type, resolved_at) DO NOTHING`,
    [studentId, courseId, indicatorType, detail]
  );
}
```

```javascript
// modules/early-warning/earlyWarning.cron.js
// Chạy mỗi 24h để kiểm tra inactivity cho tất cả học sinh
const cron = require('node-cron');
const earlyWarningService = require('./earlyWarning.service');

cron.schedule('0 2 * * *', async () => {
  const { rows: students } = await db.query(
    `SELECT DISTINCT e.student_id, e.course_id FROM enrollments e`
  );
  for (const { student_id, course_id } of students) {
    await earlyWarningService.evaluate(student_id, course_id);
  }
});
```

---

### 4.6 Module `dashboard` (Instructor only)

**Endpoints:** `GET /api/dashboard/overview` · `/students` · `/students/:id` · `/at-risk`

```javascript
// modules/dashboard/dashboard.routes.js
const { requireRole } = require('../../middleware/requireRole');
router.use(authenticate, requireRole('instructor'));
router.get('/overview',        dashboardController.overview);
router.get('/students',        dashboardController.students);
router.get('/students/:id',    dashboardController.studentDetail);
router.get('/at-risk',         dashboardController.atRisk);
module.exports = router;
```

```javascript
// modules/dashboard/dashboard.service.js
exports.getOverview = async (instructorId) => {
  const { rows: [stats] } = await db.query(
    `SELECT
       COUNT(DISTINCT e.student_id)                              AS total_students,
       ROUND(AVG(qr.score), 1)                                   AS avg_score,
       ROUND(AVG(
         (SELECT COUNT(*) FROM study_sessions ss
          WHERE ss.user_id = e.student_id AND ss.is_completed = true)::numeric /
         NULLIF((SELECT COUNT(*) FROM lessons l
                 JOIN courses c2 ON c2.id = l.course_id
                 WHERE c2.teacher_id = $1), 0) * 100
       ), 1)                                                     AS avg_completion_pct
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id AND c.teacher_id = $1
     LEFT JOIN quiz_results qr ON qr.user_id = e.student_id
       AND qr.taken_at > NOW() - INTERVAL '7 days'`,
    [instructorId]
  );
  return stats;
};

exports.getStudents = async (instructorId, { sortBy = 'last_active_date', order = 'desc' }) => {
  const { rows } = await db.query(
    `SELECT u.id, u.name,
       lp.last_active_date,
       lp.streak_count,
       (SELECT score FROM quiz_results WHERE user_id = u.id ORDER BY taken_at DESC LIMIT 1) AS latest_score,
       ROUND(
         (SELECT COUNT(*) FROM study_sessions WHERE user_id = u.id AND is_completed = true)::numeric /
         NULLIF((SELECT COUNT(*) FROM lessons l JOIN courses c ON c.id = l.course_id WHERE c.teacher_id = $1), 0) * 100
       , 1) AS completion_pct,
       EXISTS(SELECT 1 FROM at_risk_flags WHERE student_id = u.id AND resolved_at IS NULL) AS is_at_risk
     FROM enrollments e
     JOIN users u ON u.id = e.student_id
     JOIN courses c ON c.id = e.course_id AND c.teacher_id = $1
     LEFT JOIN learning_profiles lp ON lp.user_id = u.id
     ORDER BY ${sortBy} ${order === 'asc' ? 'ASC' : 'DESC'}`,
    [instructorId]
  );
  return rows;
};

exports.getAtRisk = async (instructorId) => {
  const { rows } = await db.query(
    `SELECT u.name, u.id, f.indicator_type, f.detail, f.triggered_at
     FROM at_risk_flags f
     JOIN users u ON u.id = f.student_id
     JOIN enrollments e ON e.student_id = f.student_id
     JOIN courses c ON c.id = e.course_id AND c.teacher_id = $1
     WHERE f.resolved_at IS NULL
     ORDER BY f.triggered_at DESC`,
    [instructorId]
  );
  return rows;
};
```

---

## 5. API Endpoints đầy đủ

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/profile                     -- learning_profile của user hiện tại
PUT    /api/profile                     -- cập nhật onboarding survey

GET    /api/courses                     -- danh sách khóa học
GET    /api/courses/:id/lessons         -- bài học theo khóa
POST   /api/courses                     -- instructor: tạo khóa học
POST   /api/courses/:id/lessons         -- instructor: tạo bài học
POST   /api/courses/:id/enroll          -- student: đăng ký khóa

GET    /api/learning-path/:courseId     -- lộ trình cá nhân
POST   /api/learning-path/:courseId/recalculate  -- trigger tính lại

POST   /api/chat                        -- Socratic AI chat
GET    /api/chat/history/:sessionId     -- lịch sử 1 session

GET    /api/quiz/:lessonId/start        -- bắt đầu quiz thích nghi
POST   /api/quiz/:quizId/answer         -- nộp câu trả lời, nhận câu tiếp
GET    /api/quiz/:quizId/result         -- tổng kết phiên quiz

POST   /api/study-session/start         -- bắt đầu phiên học bài
POST   /api/study-session/:id/complete  -- kết thúc phiên học

GET    /api/progress                    -- student: dashboard cá nhân

GET    /api/dashboard/overview          -- instructor only
GET    /api/dashboard/students          -- instructor only
GET    /api/dashboard/students/:id      -- instructor only
GET    /api/dashboard/at-risk           -- instructor only

POST   /api/questions                   -- instructor: tạo câu hỏi
PUT    /api/questions/:id               -- instructor: sửa câu hỏi
DELETE /api/questions/:id               -- instructor: xoá (nếu không đang dùng)
```

---

## 6. Cấu trúc thư mục dự án (Modular)

> Nguyên tắc: mỗi nghiệp vụ là một folder riêng. Người nào làm feature gì thì chỉ động vào folder đó — không giẫm lên nhau khi làm song song.

```
thinkfirst/
├── client/                                   # React 18 + Vite — #1 và #2 làm ở đây
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Chat.jsx                      # #1: Socratic AI chat
│   │   │   ├── Quiz.jsx                      # #1: Adaptive quiz
│   │   │   ├── StudentProgress.jsx           # #1: Dashboard cá nhân
│   │   │   ├── LearningPath.jsx              # #1: Lộ trình học
│   │   │   └── InstructorDashboard.jsx       # #2: Dashboard giáo viên
│   │   ├── components/
│   │   │   ├── ThinkingModeIndicator.jsx     # Req 3.7 — hiển thị khi đang Socratic mode
│   │   │   ├── StreakCounter.jsx             # Req 8.5 — chuỗi ngày học liên tiếp
│   │   │   ├── AtRiskBadge.jsx              # Badge "Cần hỗ trợ" trên danh sách
│   │   │   ├── AdaptiveQuizCard.jsx         # Card câu hỏi + progress bar
│   │   │   ├── ProgressChart.jsx            # Biểu đồ điểm theo topic
│   │   │   └── RoadmapTimeline.jsx          # Hiển thị lộ trình học dạng steps
│   │   ├── hooks/
│   │   │   ├── useAuth.js                   # login state, JWT storage
│   │   │   ├── useChat.js                   # session_id, message list
│   │   │   └── useQuiz.js                   # session state, adaptive logic
│   │   └── api/
│   │       └── client.js                    # axios instance + Authorization header
│   └── vite.config.js
│
└── server/                                   # Express.js — #3 và #4 làm ở đây
    ├── src/
    │   │
    │   ├── modules/                          # ← MỖI FOLDER = 1 NGHIỆP VỤ ĐỘC LẬP
    │   │   │
    │   │   ├── auth/                         # #3 làm
    │   │   │   ├── auth.routes.js            # POST /register /login /logout
    │   │   │   ├── auth.controller.js        # nhận req → gọi service → trả res
    │   │   │   └── auth.service.js           # bcrypt, JWT, rate limit logic
    │   │   │
    │   │   ├── chat/                         # #3 làm
    │   │   │   ├── chat.routes.js            # POST /chat  GET /chat/history/:sessionId
    │   │   │   ├── chat.controller.js
    │   │   │   └── chat.service.js           # Socratic proxy, đếm message_index, gọi AI API
    │   │   │
    │   │   ├── quiz/                         # #3 làm
    │   │   │   ├── quiz.routes.js            # GET /start  POST /answer  GET /summary
    │   │   │   ├── quiz.controller.js
    │   │   │   └── quiz.service.js           # adaptive algorithm, weak_topics, gọi earlyWarning
    │   │   │
    │   │   ├── learning-path/                # #4 làm
    │   │   │   ├── learningPath.routes.js    # GET /:courseId  POST /:courseId/recalculate
    │   │   │   ├── learningPath.controller.js
    │   │   │   └── learningPath.service.js   # sắp xếp lộ trình từ weak_topics
    │   │   │
    │   │   ├── progress/                     # #4 làm
    │   │   │   ├── progress.routes.js        # GET /progress  POST /study-session/*
    │   │   │   ├── progress.controller.js
    │   │   │   └── progress.service.js       # streak, completion%, study time
    │   │   │
    │   │   ├── dashboard/                    # #4 làm
    │   │   │   ├── dashboard.routes.js       # GET /overview /students /students/:id /at-risk
    │   │   │   ├── dashboard.controller.js
    │   │   │   └── dashboard.service.js      # aggregate queries cho instructor
    │   │   │
    │   │   └── early-warning/               # #4 làm — không có routes, gọi nội bộ
    │   │       ├── earlyWarning.service.js   # evaluate(), upsertFlag(), resolve logic
    │   │       └── earlyWarning.cron.js      # node-cron chạy 02:00 mỗi ngày
    │   │
    │   ├── middleware/
    │   │   ├── authenticate.js              # JWT verify → gắn req.user
    │   │   ├── requireRole.js               # requireRole('instructor')
    │   │   └── errorHandler.js              # global error handler
    │   │
    │   ├── db/
    │   │   ├── index.js                     # Neon Pool — export db.query()
    │   │   └── migrations/
    │   │       └── 001_init.sql             # Full schema từ mục 3
    │   │
    │   └── app.js                           # Gắn tất cả modules vào Express
    │
    └── package.json
```

### Cách gắn modules vào `app.js`

```javascript
// server/src/app.js
const express = require('express');
const cors    = require('cors');
const app     = express();

const { authenticate } = require('./middleware/authenticate');
const { requireRole }  = require('./middleware/requireRole');
const { errorHandler } = require('./middleware/errorHandler');

// Middlewares chung
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Gắn từng module — mỗi dòng tương ứng 1 folder trong modules/
app.use('/api/auth',          require('./modules/auth/auth.routes'));
app.use('/api/chat',          authenticate, require('./modules/chat/chat.routes'));
app.use('/api/quiz',          authenticate, require('./modules/quiz/quiz.routes'));
app.use('/api/learning-path', authenticate, require('./modules/learning-path/learningPath.routes'));
app.use('/api/progress',      authenticate, require('./modules/progress/progress.routes'));
app.use('/api/dashboard',     authenticate, requireRole('instructor'), require('./modules/dashboard/dashboard.routes'));

// Khởi động cron sau khi app ready
require('./modules/early-warning/earlyWarning.cron');

// Global error handler — phải đặt cuối cùng
app.use(errorHandler);

module.exports = app;
```

### Quy tắc viết trong từng module

```javascript
// ✅ ĐÚNG — controller chỉ điều phối, không có logic
exports.answer = async (req, res, next) => {
  try {
    const result = await quizService.processAnswer(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err); // chuyển xuống errorHandler
  }
};

// ❌ SAI — không để SQL hay business logic trong controller
exports.answer = async (req, res) => {
  const { rows } = await db.query('SELECT * FROM questions WHERE id = $1', [req.body.questionId]);
  // ... đây là việc của service, không phải controller
};
```

---

## 7. Hướng dẫn xây dựng trong 5 tiếng

### Phân công 4 người

| Người | Vai trò | Việc làm (theo thứ tự) |
|---|---|---|
| **#1 — React Student** | Frontend · Student flow | Login/Register UI → Chat UI (Socratic) → Quiz UI (adaptive) |
| **#2 — React Instructor** | Frontend · Teacher flow | Student Dashboard cá nhân → Instructor Dashboard + At-risk panel |
| **#3 — Express + AI** | Backend · AI logic | Auth API + JWT → `/api/chat` Socratic proxy → Quiz API adaptive |
| **#4 — Express + DB** | Backend · Data | Neon setup + migrations → `/api/progress` → `/api/dashboard` stats → Seed data |

### Timeline chi tiết

```
09:00–09:30  Kickoff
  #1+#2 → Khởi tạo React + Vite, cài TailwindCSS, tạo routing cơ bản
  #3+#4 → Khởi tạo Express, connect Neon, chạy migration 001_init.sql

09:30–11:00  Sprint 1 — Core skeleton
  #1 → Login + Register page (form + call API)
  #2 → Layout chính, placeholder pages
  #3 → POST /auth/register, POST /auth/login, JWT middleware
  #4 → Seed data: 1 giáo viên, 5 học sinh, 1 course, 10 lessons, 30 questions

11:00–12:30  Sprint 2 — AI + Quiz
  #1 → Chat UI: gửi tin → hiển thị hỏi ngược, ThinkingMode indicator
  #2 → Quiz UI: hiển thị câu hỏi, chọn đáp án, tiến trình, tổng kết
  #3 → POST /api/chat (Socratic proxy), GET+POST /api/quiz (adaptive engine)
  #4 → GET /api/progress, GET /api/learning-path, Early Warning cron

12:30–13:15  Làm slides + Dashboard
  #1 → Student dashboard: streak, % hoàn thành, điểm TB
  #2 → Instructor dashboard: bảng học sinh, at-risk section (mockup OK)
  #3 → GET /api/dashboard/* endpoints
  #4 → Soạn slides: vấn đề → giải pháp → kiến trúc → demo flow → roadmap

13:15–13:45  Test + quay video backup
  Cả nhóm → chạy thử full flow, sửa lỗi hiển thị, quay video 3–4 phút

13:45–14:00  Nộp bài
  Upload slides, GitHub repo link, video/demo link, README
```

### Setup nhanh (copy-paste)

```bash
# Khởi tạo project
npm create vite@latest client -- --template react
cd client && npm install tailwindcss @tailwindcss/vite axios

mkdir server && cd server && npm init -y
npm install express pg jsonwebtoken bcryptjs cors dotenv
npm install -D nodemon

# .env (server)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=thinkfirst_secret_2026
OPENAI_API_KEY=sk-...   # hoặc ANTHROPIC_API_KEY

# Chạy migration
psql $DATABASE_URL < src/db/migrations/001_init.sql
```

---

## 8. Tiêu chí chấm điểm — Cách thể hiện

| Tiêu chí | Điểm | Cách demo |
|---|---|---|
| **Giải quyết brainrot** | 25 | Demo: hỏi AI "kết quả bài 3 là gì?" → AI hỏi ngược lại |
| **Tính năng AI** | 25 | Demo: Socratic prompt, đếm message_index, hint sau 3 câu |
| **Kiến trúc hệ thống** | 20 | Slide kiến trúc từ mục 2, sơ đồ ERD từ mục 3 |
| **Demo / Prototype** | 20 | Full flow: login → chat → quiz → dashboard |
| **Thuyết trình** | 10 | Giải thích được tại sao dùng Neon, tại sao Socratic proxy |

### Câu hỏi ban giám khảo hay hỏi

**"Tại sao dùng Neon thay vì local PostgreSQL?"**
> Neon là serverless PostgreSQL — không cần quản lý server, có connection pooling tự động, free tier đủ cho hackathon. Deploy lên Render/Railway thì Express connect thẳng qua connection string, không cần cấu hình thêm.

**"AI của bạn có thực sự không cho đáp án không?"**
> Có. Mọi request đến AI đều bị Express intercept và bổ sung system prompt bắt buộc. Học sinh không thể bypass vì giao tiếp trực tiếp với Express, không với AI API. Message_index được đếm server-side.

**"Early Warning chạy như thế nào?"**
> Chạy 2 lần: (1) sau mỗi quiz_results được INSERT, (2) cron job mỗi 24h. Kết quả lưu vào at_risk_flags với indicator_type và resolved_at để hỗ trợ nhiều flag đồng thời và lịch sử resolve.

---

*ThinkFirst — Giải phóng tư duy, không phụ thuộc AI*
*Hackathon Giáo dục HCMUT 2026*
