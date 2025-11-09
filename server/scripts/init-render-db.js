/**
 * Render.com 데이터베이스 초기화 스크립트
 * 
 * 사용법: 
 * 1. Render.com에서 External Database URL 복사
 * 2. 환경 변수로 설정: DATABASE_URL=postgresql://...
 * 3. node scripts/init-render-db.js
 * 
 * 또는 명령줄에서 직접 실행:
 * DATABASE_URL=postgresql://... node scripts/init-render-db.js
 */

import dotenv from 'dotenv'
import { initDatabase, testConnection } from '../src/utils/dbInit.js'

// .env 파일 로드
dotenv.config()

const main = async () => {
  try {
    console.log('🚀 Starting Render.com database initialization...')
    console.log('')
    
    // DATABASE_URL 확인
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set!')
      console.error('')
      console.error('Please set DATABASE_URL in one of the following ways:')
      console.error('')
      console.error('1. Create server/.env file with:')
      console.error('   DATABASE_URL=postgresql://user:password@host:port/database')
      console.error('')
      console.error('2. Or set as environment variable:')
      console.error('   $env:DATABASE_URL="postgresql://user:password@host:port/database"')
      console.error('   node scripts/init-render-db.js')
      console.error('')
      console.error('3. Or pass directly in command:')
      console.error('   $env:DATABASE_URL="postgresql://..."; node scripts/init-render-db.js')
      console.error('')
      console.error('Get your DATABASE_URL from Render.com:')
      console.error('   - Go to your PostgreSQL database')
      console.error('   - Click on "Connections" tab')
      console.error('   - Copy "External Database URL"')
      process.exit(1)
    }

    // DATABASE_URL에서 정보 추출 (비밀번호는 숨김)
    try {
      const url = new URL(process.env.DATABASE_URL)
      console.log('📋 Database connection info:')
      console.log('   Host:', url.hostname)
      console.log('   Port:', url.port || '5432')
      console.log('   Database:', url.pathname.replace('/', ''))
      console.log('   User:', url.username)
      console.log('   Password: ***')
      console.log('')
    } catch (error) {
      console.log('📋 Using DATABASE_URL (connection string)')
      console.log('')
    }
    
    // 데이터베이스 연결 테스트
    console.log('1️⃣  Testing database connection...')
    const connected = await testConnection()
    
    if (!connected) {
      console.error('')
      console.error('❌ Database connection failed!')
      console.error('')
      console.error('Please check:')
      console.error('  1. DATABASE_URL is correct')
      console.error('  2. Database is accessible from your network')
      console.error('  3. Firewall allows connections')
      console.error('  4. Database is running on Render.com')
      process.exit(1)
    }
    
    console.log('')
    
    // 데이터베이스 초기화
    console.log('2️⃣  Initializing database schema...')
    await initDatabase()
    
    console.log('')
    console.log('✅ Database initialization completed successfully!')
    console.log('')
    console.log('📊 Created tables:')
    console.log('   - exams (시험 테이블)')
    console.log('   - questions (문항 테이블)')
    console.log('   - exam_questions (시험-문항 매핑 테이블)')
    console.log('   - attempts (시도 테이블)')
    console.log('   - answers (답안 테이블)')
    console.log('   - imports (업로드 로그 테이블)')
    console.log('')
    console.log('🌱 Seeded initial data:')
    console.log('   - Free exam (무료 시험)')
    console.log('')
    console.log('✅ You can now:')
    console.log('   1. Start the server: npm run dev')
    console.log('   2. Add questions via CSV upload (admin panel)')
    console.log('   3. Or insert questions directly into the database')
    console.log('')
    
    process.exit(0)
  } catch (error) {
    console.error('')
    console.error('❌ Database initialization failed:')
    console.error('')
    if (error.message) {
      console.error('Error:', error.message)
    }
    if (error.code) {
      console.error('Error code:', error.code)
    }
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error('Stack:', error.stack)
    }
    console.error('')
    process.exit(1)
  }
}

main()

