/**
 * 데이터베이스 연결 테스트 스크립트
 * 
 * 사용법: node scripts/test-connection.js
 */

import dotenv from 'dotenv'
import { testConnection } from '../src/utils/dbInit.js'

dotenv.config()

const main = async () => {
  console.log('🔌 Testing database connection...')
  console.log('')
  
  if (!process.env.DATABASE_URL && !process.env.DB_NAME) {
    console.error('❌ DATABASE_URL or DB_NAME is not set in .env file')
    console.error('')
    console.error('Please set one of the following in your .env file:')
    console.error('  DATABASE_URL=postgresql://user:password@host:port/database')
    console.error('  or')
    console.error('  DB_USER=postgres')
    console.error('  DB_HOST=localhost')
    console.error('  DB_NAME=carecbt')
    console.error('  DB_PASSWORD=your_password')
    console.error('  DB_PORT=5432')
    process.exit(1)
  }
  
  console.log('📋 Connection settings:')
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      console.log('   Host:', url.hostname)
      console.log('   Port:', url.port || '5432')
      console.log('   Database:', url.pathname.replace('/', ''))
      console.log('   User:', url.username)
      console.log('   SSL:', process.env.DATABASE_URL.includes('render.com') ? 'required' : 'optional')
    } catch (error) {
      console.log('   Connection String: *** (unable to parse)')
      console.log('   Error:', error.message)
    }
  } else {
    console.log('   Host:', process.env.DB_HOST || 'localhost')
    console.log('   Port:', process.env.DB_PORT || '5432')
    console.log('   Database:', process.env.DB_NAME || 'carecbt')
    console.log('   User:', process.env.DB_USER || 'postgres')
  }
  console.log('')
  
  const connected = await testConnection()
  
  if (connected) {
    console.log('')
    console.log('✅ Database connection successful!')
    console.log('')
    console.log('You can now run: npm run init-db')
    process.exit(0)
  } else {
    console.log('')
    console.error('❌ Database connection failed!')
    console.error('')
    console.error('Please check:')
    console.error('  1. PostgreSQL is running')
    console.error('  2. Database exists')
    console.error('  3. User and password are correct')
    console.error('  4. .env file has correct DATABASE_URL or DB_* settings')
    process.exit(1)
  }
}

main()

