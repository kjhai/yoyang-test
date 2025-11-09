import express from 'express'

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
      admin: '/api/admin'
    }
  })
})

export default router

