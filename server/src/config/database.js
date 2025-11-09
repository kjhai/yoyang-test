import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// 데이터베이스 연결 풀 생성
let poolConfig

if (process.env.DATABASE_URL) {
  // connectionString 사용
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }
} else {
  // 개별 설정 사용 (DATABASE_URL이 없을 경우)
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'carecbt',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }
}

// 연결 설정 로그 (비밀번호는 숨김)
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Database config:', {
    ...poolConfig,
    password: poolConfig.password ? '***' : undefined,
    connectionString: poolConfig.connectionString ? '***' : undefined,
  })
}

const pool = new Pool(poolConfig)

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ Database connected')
})

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err)
})

export default pool

