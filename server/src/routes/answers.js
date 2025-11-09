import express from 'express'
import {
  saveAnswer,
  updateAnswerInWrongMode,
  getAllAnswersForExplanation,
} from '../services/answerService.js'

const router = express.Router()

/**
 * POST /api/answers
 * 답안 저장 (자동 채점 포함)
 */
router.post('/', async (req, res) => {
  try {
    const { attempt_id, question_id, chosen_option } = req.body

    if (!attempt_id || !question_id || !chosen_option) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'attempt_id, question_id, chosen_option은 필수입니다.',
      })
    }

    if (chosen_option < 1 || chosen_option > 5) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'chosen_option은 1~5 사이의 값이어야 합니다.',
      })
    }

    const answer = await saveAnswer(attempt_id, question_id, chosen_option)

    res.status(201).json(answer)
  } catch (error) {
    console.error('Error saving answer:', error)
    res.status(400).json({
      error: 'Bad Request',
      message: error.message || '답안 저장에 실패했습니다.',
    })
  }
})

/**
 * POST /api/answers/:id/correct
 * 오답 모드에서 답변 수정
 */
router.post('/:id/correct', async (req, res) => {
  try {
    const answerId = parseInt(req.params.id)
    const { chosen_option } = req.body

    if (isNaN(answerId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '유효하지 않은 answer ID입니다.',
      })
    }

    if (!chosen_option || chosen_option < 1 || chosen_option > 5) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'chosen_option은 1~5 사이의 값이어야 합니다.',
      })
    }

    const result = await updateAnswerInWrongMode(answerId, chosen_option)

    res.json(result)
  } catch (error) {
    console.error('Error updating answer:', error)
    res.status(400).json({
      error: 'Bad Request',
      message: error.message || '답안 수정에 실패했습니다.',
    })
  }
})

/**
 * GET /api/answers/attempt/:attemptId/explanations
 * 시도별 모든 답안 가져오기 (해설용)
 */
router.get('/attempt/:attemptId/explanations', async (req, res) => {
  try {
    const attemptId = parseInt(req.params.attemptId)

    if (isNaN(attemptId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '유효하지 않은 attempt ID입니다.',
      })
    }

    const answers = await getAllAnswersForExplanation(attemptId)

    res.json(answers)
  } catch (error) {
    console.error('Error getting explanations:', error)
    res.status(404).json({
      error: 'Not Found',
      message: error.message || '해설을 가져올 수 없습니다.',
    })
  }
})

export default router

