import express from 'express'
import {
  submitAttempt,
  getAttemptResult,
  getWrongAnswers,
} from '../services/answerService.js'
import {
  createAttempt,
  getAttemptQuestions,
  getExamById,
} from '../services/examService.js'

const router = express.Router()

/**
 * POST /api/attempts
 * 시도 생성
 */
router.post('/', async (req, res) => {
  try {
    const { exam_id } = req.body

    if (!exam_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'exam_id는 필수입니다.',
      })
    }

    // 시험 존재 확인
    await getExamById(exam_id)

    // 시도 생성
    const attempt = await createAttempt(exam_id)

    res.status(201).json(attempt)
  } catch (error) {
    console.error('Error creating attempt:', error)
    res.status(400).json({
      error: 'Bad Request',
      message: error.message || '시도 생성에 실패했습니다.',
    })
  }
})

/**
 * GET /api/attempts/:id/questions
 * 시도별 문항 목록 가져오기 (셔플 적용)
 */
router.get('/:id/questions', async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id)

    if (isNaN(attemptId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '유효하지 않은 attempt ID입니다.',
      })
    }

    const questions = await getAttemptQuestions(attemptId)

    res.json(questions)
  } catch (error) {
    console.error('Error getting attempt questions:', error)
    res.status(404).json({
      error: 'Not Found',
      message: error.message || '문항을 가져올 수 없습니다.',
    })
  }
})

/**
 * POST /api/attempts/:id/submit
 * 시도 제출
 */
router.post('/:id/submit', async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id)

    if (isNaN(attemptId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '유효하지 않은 attempt ID입니다.',
      })
    }

    const result = await submitAttempt(attemptId)

    res.json(result)
  } catch (error) {
    console.error('Error submitting attempt:', error)
    res.status(400).json({
      error: 'Bad Request',
      message: error.message || '제출에 실패했습니다.',
    })
  }
})

/**
 * GET /api/attempts/:id/result
 * 시도 결과 가져오기
 */
router.get('/:id/result', async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id)

    if (isNaN(attemptId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '유효하지 않은 attempt ID입니다.',
      })
    }

    const result = await getAttemptResult(attemptId)

    res.json(result)
  } catch (error) {
    console.error('Error getting attempt result:', error)
    res.status(404).json({
      error: 'Not Found',
      message: error.message || '결과를 가져올 수 없습니다.',
    })
  }
})

/**
 * GET /api/attempts/:id/wrong
 * 오답만 가져오기
 */
router.get('/:id/wrong', async (req, res) => {
  try {
    const attemptId = parseInt(req.params.id)

    if (isNaN(attemptId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '유효하지 않은 attempt ID입니다.',
      })
    }

    const wrongAnswers = await getWrongAnswers(attemptId)

    res.json(wrongAnswers)
  } catch (error) {
    console.error('Error getting wrong answers:', error)
    res.status(404).json({
      error: 'Not Found',
      message: error.message || '오답을 가져올 수 없습니다.',
    })
  }
})

export default router
