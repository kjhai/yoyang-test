import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// 데이터베이스 연결 풀 생성
let poolConfig

// DATABASE_URL 확인 및 정규화
const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : null
const hasValidDbUrl = dbUrl && dbUrl.length > 0

if (hasValidDbUrl) {
  // connectionString 사용
  // Render.com의 데이터베이스는 SSL이 필요합니다
  const isRenderDB = dbUrl.includes('render.com') || dbUrl.includes('render-db')
  const isProduction = process.env.NODE_ENV === 'production'
  const isNeon = dbUrl.includes('neon.tech')
  const isSupabase = dbUrl.includes('supabase.co')
  
  // SSL 설정: Render.com, Neon, Supabase, 또는 프로덕션 환경이면 SSL 사용
  const useSSL = isRenderDB || isNeon || isSupabase || isProduction
  
  // 기본적인 형식 경고 (오류가 아닌 경고만)
  if (!dbUrl.match(/^postgres(ql)?:\/\//i)) {
    console.warn('⚠️  DATABASE_URL does not start with postgresql:// or postgres://')
    console.warn('   Continuing anyway - PostgreSQL library will validate the connection string')
  }
  
  poolConfig = {
    connectionString: dbUrl,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    // 연결 타임아웃 설정 (30초)
    connectionTimeoutMillis: 30000,
    // 최대 연결 수
    max: 10,
  }
  
  // 연결 설정 로그 (비밀번호는 숨김)
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
  const displayUrl = maskedUrl.length > 100 ? maskedUrl.substring(0, 100) + '...' : maskedUrl
  console.log('📊 Database config:')
  console.log(`   Connection string: ${displayUrl}`)
  console.log(`   SSL: ${useSSL ? 'enabled' : 'disabled'}`)
  console.log(`   Provider: ${isRenderDB ? 'Render.com' : isNeon ? 'Neon' : isSupabase ? 'Supabase' : 'Other'}`)
  console.log(`   Environment: ${isProduction ? 'production' : 'development'}`)
} else {
  // 개별 설정 사용 (DATABASE_URL이 없을 경우)
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (!dbUrl) {
    console.log('📊 Database config: Using individual DB settings (DATABASE_URL not set)')
  } else {
    console.warn('⚠️  DATABASE_URL is set but empty. Using individual DB settings.')
  }
  
  poolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'carecbt',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 30000,
    max: 10,
  }
  
  // 연결 설정 로그 (비밀번호는 숨김)
  console.log('📊 Database config:')
  console.log(`   Host: ${poolConfig.host}`)
  console.log(`   Port: ${poolConfig.port}`)
  console.log(`   Database: ${poolConfig.database}`)
  console.log(`   User: ${poolConfig.user}`)
  console.log(`   SSL: ${poolConfig.ssl ? 'enabled' : 'disabled'}`)
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

