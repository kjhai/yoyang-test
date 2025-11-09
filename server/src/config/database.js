import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// 데이터베이스 연결 풀 생성
let poolConfig

if (process.env.DATABASE_URL) {
  // connectionString 사용
  // Render.com의 데이터베이스는 SSL이 필요합니다
  const isRenderDB = process.env.DATABASE_URL.includes('render.com')
  const isProduction = process.env.NODE_ENV === 'production'
  
  // SSL 설정: Render.com이거나 프로덕션 환경이면 SSL 사용
  const useSSL = isRenderDB || isProduction
  
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  }
  
  // 연결 설정 로그 (비밀번호는 숨김)
  console.log('📊 Database config:', {
    connectionString: '***',
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    isRenderDB,
    isProduction,
  })
} else {
  // 개별 설정 사용 (DATABASE_URL이 없을 경우)
  const isProduction = process.env.NODE_ENV === 'production'
  
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'carecbt',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  }
  
  // 연결 설정 로그 (비밀번호는 숨김)
  console.log('📊 Database config:', {
    ...poolConfig,
    password: poolConfig.password ? '***' : undefined,
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

