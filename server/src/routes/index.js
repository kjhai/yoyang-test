import express from 'express'
import examsRoutes from './exams.js'
import attemptsRoutes from './attempts.js'
import answersRoutes from './answers.js'
import adminRoutes from './admin.js'

const router = express.Router()

// API 버전 정보
router.get('/', (req, res) => {
  res.json({
    message: 'CareCBT API',
    version: '1.0.0',
    endpoints: {
      exams: '/api/exams',
      attempts: '/api/attempts',
      answers: '/api/answers',
      admin: '/api/admin',
    },
  })
})

// 라우트 연결
router.use('/exams', examsRoutes)
router.use('/attempts', attemptsRoutes)
router.use('/answers', answersRoutes)
router.use('/admin', adminRoutes)

export default router
