-- CareCBT 데이터베이스 스키마

-- 시험 테이블
CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    exam_type VARCHAR(50) NOT NULL, -- '요양' 또는 '간호'
    exam_code VARCHAR(100),
    title VARCHAR(255),
    is_free BOOLEAN DEFAULT false,
    question_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 문항 테이블
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question_id VARCHAR(100) NOT NULL UNIQUE, -- 외부 고유 ID
    version INTEGER DEFAULT 1,
    stem TEXT NOT NULL, -- 문제 지문
    opt1 TEXT NOT NULL,
    opt2 TEXT NOT NULL,
    opt3 TEXT,
    opt4 TEXT,
    opt5 TEXT,
    answer INTEGER NOT NULL CHECK (answer >= 1 AND answer <= 5),
    explanation TEXT,
    tags TEXT,
    media_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시험-문항 매핑 테이블
CREATE TABLE IF NOT EXISTS exam_questions (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    order_no INTEGER NOT NULL,
    UNIQUE(exam_id, question_id)
);

-- 시도 테이블
CREATE TABLE IF NOT EXISTS attempts (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE SET NULL,
    shuffle_seed INTEGER NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    score INTEGER,
    total INTEGER,
    client_meta JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 답안 테이블
CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES attempts(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
    chosen_option INTEGER CHECK (chosen_option >= 1 AND chosen_option <= 5),
    is_correct BOOLEAN,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 업로드 로그 테이블
CREATE TABLE IF NOT EXISTS imports (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    rows_ok INTEGER DEFAULT 0,
    rows_fail INTEGER DEFAULT 0,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_exams_type ON exams(exam_type);
CREATE INDEX IF NOT EXISTS idx_exams_free ON exams(is_free);
CREATE INDEX IF NOT EXISTS idx_questions_question_id ON questions(question_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_submitted ON attempts(submitted_at);
CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);

