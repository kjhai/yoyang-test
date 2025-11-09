/**
 * 데이터베이스 초기화 스크립트
 * 
 * 사용법: node scripts/init-db.js
 */

import dotenv from 'dotenv'
import { initDatabase, testConnection } from '../src/utils/dbInit.js'

dotenv.config()

const main = async () => {
  try {
    console.log('🚀 Starting database initialization...')
    console.log('')
    
    // 데이터베이스 연결 테스트
    console.log('1️⃣  Testing database connection...')
    const connected = await testConnection()
    
    if (!connected) {
      console.error('❌ Database connection failed!')
      console.error('Please check your DATABASE_URL in .env file.')
      process.exit(1)
    }
    
    console.log('')
    
    // 데이터베이스 초기화
    console.log('2️⃣  Initializing database schema...')
    await initDatabase()
    
    console.log('')
    console.log('✅ Database initialization completed successfully!')
    console.log('')
    console.log('You can now start the server with: npm run dev')
    
    process.exit(0)
  } catch (error) {
    console.error('')
    console.error('❌ Database initialization failed:')
    console.error(error)
    process.exit(1)
  }
}

main()

