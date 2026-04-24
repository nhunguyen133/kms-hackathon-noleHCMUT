-- ThinkFirst Database Schema
-- Based on ARCHITECTURE.md

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS at_risk_flags CASCADE;
DROP TABLE IF EXISTS ai_interactions CASCADE;
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS learning_roadmaps CASCADE;
DROP TABLE IF EXISTS learning_profiles CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3.1 Auth & Users
CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(255) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Courses & Enrollment
CREATE TABLE IF NOT EXISTS courses (
    id              VARCHAR(255) PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    teacher_id      VARCHAR(255) NOT NULL REFERENCES users(id),
    subject         VARCHAR(100),
    is_published    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
    id              VARCHAR(255) PRIMARY KEY,
    course_id       VARCHAR(255) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    topic           VARCHAR(100),
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    "order"         INTEGER NOT NULL DEFAULT 0,
    is_published    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
    id              VARCHAR(255) PRIMARY KEY,
    student_id      VARCHAR(255) NOT NULL REFERENCES users(id),
    course_id       VARCHAR(255) NOT NULL REFERENCES courses(id),
    enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments (course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments (student_id);

-- 3.3 Learning Profile & Roadmap
CREATE TABLE IF NOT EXISTS learning_profiles (
    user_id              VARCHAR(255) PRIMARY KEY REFERENCES users(id),
    learning_style       VARCHAR(50),
    goals                TEXT,
    weak_topics          JSONB DEFAULT '[]',
    weekly_study_goal    INTEGER DEFAULT 5,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    streak_count         INTEGER DEFAULT 0,
    last_active_date     DATE,
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id                VARCHAR(255) PRIMARY KEY,
    user_id           VARCHAR(255) NOT NULL REFERENCES users(id),
    course_id         VARCHAR(255) NOT NULL REFERENCES courses(id),
    recommended_path  JSONB NOT NULL,
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

-- 3.4 Quiz & Adaptive Engine
CREATE TABLE IF NOT EXISTS quizzes (
    id              VARCHAR(255) PRIMARY KEY,
    lesson_id       VARCHAR(255) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id              VARCHAR(255) PRIMARY KEY,
    quiz_id         VARCHAR(255) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    options         JSONB NOT NULL,
    correct_answer  VARCHAR(10) NOT NULL,
    topic           VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_difficulty ON questions (quiz_id, difficulty_level);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions (topic);

CREATE TABLE IF NOT EXISTS quiz_results (
    id              VARCHAR(255) PRIMARY KEY,
    user_id         VARCHAR(255) NOT NULL REFERENCES users(id),
    quiz_id         VARCHAR(255) NOT NULL REFERENCES quizzes(id),
    score           NUMERIC(5,2) NOT NULL,
    difficulty_level VARCHAR(20),
    time_taken      INTEGER,
    answers         JSONB NOT NULL,
    taken_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results (user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_user ON quiz_results (quiz_id, user_id, taken_at DESC);

-- 3.5 Study Sessions
CREATE TABLE IF NOT EXISTS study_sessions (
    id              VARCHAR(255) PRIMARY KEY,
    user_id         VARCHAR(255) NOT NULL REFERENCES users(id),
    lesson_id       VARCHAR(255) NOT NULL REFERENCES lessons(id),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    duration        INTEGER,
    is_completed    BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date ON study_sessions (user_id, started_at DESC);

-- 3.6 AI Chat Log
CREATE TABLE IF NOT EXISTS ai_interactions (
    id              VARCHAR(255) PRIMARY KEY,
    user_id         VARCHAR(255) NOT NULL REFERENCES users(id),
    session_id      VARCHAR(255) NOT NULL,
    lesson_id       VARCHAR(255) REFERENCES lessons(id),
    role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    message_index   INTEGER NOT NULL,
    user_message    TEXT,
    ai_response     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session ON ai_interactions (session_id, message_index);

-- 3.7 Early Warning System
CREATE TABLE IF NOT EXISTS at_risk_flags (
    id              VARCHAR(255) PRIMARY KEY,
    student_id      VARCHAR(255) NOT NULL REFERENCES users(id),
    course_id       VARCHAR(255) REFERENCES courses(id),
    indicator_type  VARCHAR(50) NOT NULL CHECK (indicator_type IN (
                        'low_score_consecutive',
                        'long_inactivity',
                        'stagnant_progress'
                    )),
    detail          TEXT,
    triggered_at    TIMESTAMPTZ DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ,
    UNIQUE (student_id, course_id, indicator_type, resolved_at)
);
CREATE INDEX IF NOT EXISTS idx_at_risk_active ON at_risk_flags (student_id) WHERE resolved_at IS NULL;
