import pool from '../config/database.js'

/**
 * 데이터베이스 스키마 초기화
 */
export const initSchema = async () => {
  try {
    // 시험 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        exam_type VARCHAR(50) NOT NULL,
        exam_code VARCHAR(100),
        title VARCHAR(255),
        is_free BOOLEAN DEFAULT false,
        question_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 문항 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_id VARCHAR(100) NOT NULL UNIQUE,
        version INTEGER DEFAULT 1,
        stem TEXT NOT NULL,
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
      )
    `)

    // 시험-문항 매핑 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_questions (
        id SERIAL PRIMARY KEY,
        exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        order_no INTEGER NOT NULL,
        UNIQUE(exam_id, question_id)
      )
    `)

    // 시도 테이블
    await pool.query(`
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
      )
    `)

    // 답안 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        attempt_id INTEGER REFERENCES attempts(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
        chosen_option INTEGER CHECK (chosen_option >= 1 AND chosen_option <= 5),
        is_correct BOOLEAN,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 업로드 로그 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS imports (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        rows_ok INTEGER DEFAULT 0,
        rows_fail INTEGER DEFAULT 0,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 인덱스 생성
    await pool.query('CREATE INDEX IF NOT EXISTS idx_exams_type ON exams(exam_type)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_exams_free ON exams(is_free)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_questions_question_id ON questions(question_id)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON attempts(exam_id)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_attempts_submitted ON attempts(submitted_at)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON answers(attempt_id)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id)')
    
    console.log('✅ Database schema initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Error initializing database schema:', error)
    throw error
  }
}

/**
 * 초기 데이터 시드 (무료 시험 생성)
 */
export const seedInitialData = async () => {
  try {
    // 무료 시험이 이미 존재하는지 확인
    const checkResult = await pool.query(
      'SELECT id FROM exams WHERE is_free = true LIMIT 1'
    )
    
    if (checkResult.rows.length === 0) {
      // 무료 시험 생성
      await pool.query(
        `INSERT INTO exams (exam_type, exam_code, title, is_free, question_count)
         VALUES ($1, $2, $3, $4, $5)`,
        ['요양', 'FREE_001', '요양보호사 무료 모의고사', true, 20]
      )
      console.log('✅ Initial exam data seeded')
    } else {
      console.log('ℹ️  Free exam already exists')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error seeding initial data:', error)
    throw error
  }
}

/**
 * 데이터베이스 연결 테스트
 */
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Database connection test successful')
    console.log('📅 Database time:', result.rows[0].now)
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message)
    if (error.code) {
      console.error('   Error code:', error.code)
    }
    if (error.message.includes('SSL')) {
      console.error('   💡 Tip: Render.com databases require SSL. Check your DATABASE_URL.')
    }
    return false
  }
}

/**
 * 데이터베이스 초기화 (스키마 + 시드)
 */
export const initDatabase = async () => {
  try {
    console.log('🔧 Initializing database schema...')
    await initSchema()
    console.log('')
    console.log('🌱 Seeding initial data...')
    await seedInitialData()
    console.log('✅ Database initialization completed')
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    if (error.code) {
      console.error('   Error code:', error.code)
    }
    throw error
  }
}

