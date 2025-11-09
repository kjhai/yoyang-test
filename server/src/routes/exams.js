import express from 'express'
import { getFreeExam } from '../services/examService.js'

const router = express.Router()

/**
 * GET /api/exams/free
 * 무료 시험 메타 정보 가져오기
 */
router.get('/free', async (req, res) => {
  try {
    const exam = await getFreeExam()
    res.json(exam)
  } catch (error) {
    console.error('Error getting free exam:', error)
    res.status(404).json({
      error: 'Not Found',
      message: error.message || '무료 시험을 찾을 수 없습니다.',
    })
  }
})

export default router

