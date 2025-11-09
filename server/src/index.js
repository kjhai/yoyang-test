import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRoutes from './routes/index.js'
import { initDatabase, testConnection } from './utils/dbInit.js'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 미들웨어
// CORS 설정: 프로덕션에서는 특정 도메인만 허용
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL
    : '*', // 개발 환경 또는 FRONTEND_URL이 없으면 모든 도메인 허용
  credentials: true,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'CareCBT API Server',
    version: '1.0.0',
    status: 'running'
  })
})

// 헬스 체크 엔드포인트
app.get('/healthz', async (req, res) => {
  try {
    const dbConnected = await testConnection()
    res.json({ 
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected'
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      database: 'error',
      message: error.message
    })
  }
})

// API 라우트
app.use('/api', apiRoutes)

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  })
})

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 서버 시작
const startServer = async () => {
  try {
    console.log('🚀 Starting server...')
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔌 Port: ${PORT}`)
    
    // 환경 변수 확인
    console.log('🔍 Checking environment variables...')
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const hasDbName = !!process.env.DB_NAME
    const hasDbUser = !!process.env.DB_USER
    const hasDbHost = !!process.env.DB_HOST
    
    console.log(`   DATABASE_URL: ${hasDatabaseUrl ? '✅ set' : '❌ not set'}`)
    console.log(`   DB_NAME: ${hasDbName ? '✅ set' : '❌ not set'}`)
    console.log(`   DB_USER: ${hasDbUser ? '✅ set' : '❌ not set'}`)
    console.log(`   DB_HOST: ${hasDbHost ? '✅ set' : '❌ not set'}`)
    
    // DATABASE_URL 또는 개별 DB 설정 확인
    if (!hasDatabaseUrl && !hasDbName) {
      console.error('')
      console.error('❌ DATABASE_URL or DB_NAME is not set!')
      console.error('')
      console.error('Please set DATABASE_URL environment variable in Render.com dashboard:')
      console.error('   1. Go to your service → Environment → Add Environment Variable')
      console.error('   2. Name: DATABASE_URL')
      console.error('   3. Value: (Get from your PostgreSQL database → Connections → Internal Database URL)')
      console.error('')
      console.error('Example:')
      console.error('   DATABASE_URL=postgresql://user:password@dpg-xxxxx-a.singapore-postgres.render.com/carecbt')
      console.error('')
      process.exit(1)
    }
    
    // 데이터베이스 연결 테스트
    console.log('')
    console.log('🔌 Testing database connection...')
    try {
      const dbConnected = await testConnection()
      
      if (!dbConnected) {
        console.error('')
        console.error('❌ Database connection test failed.')
        console.error('')
        console.error('Please check:')
        console.error('  1. DATABASE_URL is set correctly in Render.com environment variables')
        console.error('  2. Use Internal Database URL (not External) for Render.com services')
        console.error('  3. Database is running and accessible')
        console.error('  4. SSL is enabled for Render.com databases')
        console.error('')
        process.exit(1)
      }
    } catch (error) {
      console.error('')
      console.error('❌ Database connection error:', error.message)
      if (error.code) {
        console.error('   Error code:', error.code)
      }
      if (error.stack) {
        console.error('   Stack:', error.stack)
      }
      console.error('')
      console.error('Troubleshooting:')
      console.error('  1. Check DATABASE_URL format (postgresql://user:password@host:port/database)')
      console.error('  2. Verify database is running and accessible')
      console.error('  3. For Render.com, use Internal Database URL')
      console.error('  4. Check SSL requirements (Render.com requires SSL)')
      console.error('')
      process.exit(1)
    }
    
    // 데이터베이스 초기화 (스키마 생성 및 시드 데이터)
    console.log('')
    console.log('🔧 Initializing database...')
    try {
      await initDatabase()
      console.log('✅ Database initialization completed successfully')
    } catch (error) {
      console.error('')
      console.error('⚠️  Database initialization error:', error.message)
      if (error.code) {
        console.error('   Error code:', error.code)
      }
      
      // 테이블이 이미 존재하는 경우는 경고만 출력하고 계속 진행
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log('ℹ️  Tables may already exist, continuing server startup...')
      } else {
        console.error('')
        console.error('❌ Database initialization failed. Server cannot start.')
        console.error('   Stack:', error.stack)
        process.exit(1)
      }
    }
    
    // 서버 시작
    console.log('')
    console.log('🌐 Starting HTTP server...')
    app.listen(PORT, '0.0.0.0', () => {
      console.log('')
      console.log('═══════════════════════════════════════════════════')
      console.log('✅ Server started successfully!')
      console.log('═══════════════════════════════════════════════════')
      console.log(`🚀 Server is running on port ${PORT}`)
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`)
      console.log(`🌐 Health check: http://0.0.0.0:${PORT}/healthz`)
      console.log(`📡 API endpoint: http://0.0.0.0:${PORT}/api`)
      console.log('═══════════════════════════════════════════════════')
      console.log('')
    })
    
    // 프로세스 에러 핸들러
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
    })
    
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error)
      process.exit(1)
    })
    
  } catch (error) {
    console.error('')
    console.error('❌ Failed to start server:')
    console.error('   Message:', error.message)
    if (error.code) {
      console.error('   Code:', error.code)
    }
    if (error.stack) {
      console.error('   Stack:', error.stack)
    }
    console.error('')
    process.exit(1)
  }
}

startServer()

export default app

