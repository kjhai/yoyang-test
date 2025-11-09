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
    // 데이터베이스 연결 테스트
    console.log('🔌 Testing database connection...')
    const dbConnected = await testConnection()
    
    if (!dbConnected) {
      console.error('❌ Database connection failed. Please check your DATABASE_URL in .env file.')
      process.exit(1)
    }
    
    // 데이터베이스 초기화 (스키마 생성 및 시드 데이터)
    console.log('🔧 Initializing database...')
    try {
      await initDatabase()
    } catch (error) {
      console.warn('⚠️  Database initialization warning:', error.message)
      console.log('ℹ️  Continuing server startup...')
    }
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app

