import pool from '../config/database.js'
import { getAttemptById } from './examService.js'

/**
 * 답안 저장 (자동 채점 포함)
 */
export const saveAnswer = async (attemptId, questionId, chosenOption) => {
  // 문항의 정답 가져오기
  const questionResult = await pool.query(
    'SELECT answer FROM questions WHERE id = $1',
    [questionId]
  )

  if (questionResult.rows.length === 0) {
    throw new Error('문항을 찾을 수 없습니다.')
  }

  const correctAnswer = questionResult.rows[0].answer
  const isCorrect = chosenOption === correctAnswer

  // 기존 답안 확인
  const existingAnswer = await pool.query(
    'SELECT id FROM answers WHERE attempt_id = $1 AND question_id = $2',
    [attemptId, questionId]
  )

  if (existingAnswer.rows.length > 0) {
    // 업데이트
    const result = await pool.query(
      `UPDATE answers 
       SET chosen_option = $1, is_correct = $2, updated_at = CURRENT_TIMESTAMP
       WHERE attempt_id = $3 AND question_id = $4
       RETURNING *`,
      [chosenOption, isCorrect, attemptId, questionId]
    )
    return result.rows[0]
  } else {
    // 새로 생성
    const result = await pool.query(
      `INSERT INTO answers (attempt_id, question_id, chosen_option, is_correct)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [attemptId, questionId, chosenOption, isCorrect]
    )
    return result.rows[0]
  }
}

/**
 * 시도 제출
 */
export const submitAttempt = async (attemptId) => {
  // 모든 답안 가져오기
  const answersResult = await pool.query(
    `SELECT a.*, q.answer as correct_answer
     FROM answers a
     INNER JOIN questions q ON a.question_id = q.id
     WHERE a.attempt_id = $1`,
    [attemptId]
  )

  const answers = answersResult.rows
  const total = answers.length
  const correct = answers.filter((a) => a.is_correct).length
  const score = total > 0 ? Math.round((correct / total) * 100) : 0
  const wrong = total - correct

  // 시도 상태 업데이트
  await pool.query(
    `UPDATE attempts 
     SET submitted_at = CURRENT_TIMESTAMP, score = $1, total = $2
     WHERE id = $3`,
    [score, total, attemptId]
  )

  return {
    score,
    correct,
    wrong,
    total,
  }
}

/**
 * 시도 결과 가져오기
 */
export const getAttemptResult = async (attemptId) => {
  // 시도 정보 가져오기
  const attempt = await getAttemptById(attemptId)

  if (!attempt.submitted_at) {
    throw new Error('시험이 아직 제출되지 않았습니다.')
  }

  // 답안 통계
  const answersResult = await pool.query(
    `SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN is_correct = true THEN 1 END) as correct,
      COUNT(CASE WHEN is_correct = false THEN 1 END) as wrong
     FROM answers
     WHERE attempt_id = $1`,
    [attemptId]
  )

  const stats = answersResult.rows[0]

  return {
    score: attempt.score,
    correct: parseInt(stats.correct),
    wrong: parseInt(stats.wrong),
    total: parseInt(stats.total),
    submittedAt: attempt.submitted_at,
  }
}

/**
 * 오답만 가져오기 (이전 선택 포함)
 */
export const getWrongAnswers = async (attemptId) => {
  // 시도 정보 확인
  const attempt = await getAttemptById(attemptId)

  if (!attempt.submitted_at) {
    throw new Error('시험이 아직 제출되지 않았습니다.')
  }

  // 오답만 가져오기
  const result = await pool.query(
    `SELECT 
      a.id as answer_id,
      a.attempt_id,
      a.question_id,
      a.chosen_option,
      a.is_correct,
      q.question_id as question_identifier,
      q.stem,
      q.opt1,
      q.opt2,
      q.opt3,
      q.opt4,
      q.opt5,
      q.answer,
      q.explanation
     FROM answers a
     INNER JOIN questions q ON a.question_id = q.id
     WHERE a.attempt_id = $1 AND a.is_correct = false
     ORDER BY a.id`,
    [attemptId]
  )

  return result.rows.map((row) => ({
    id: row.answer_id,
    question_id: row.question_id,
    question_identifier: row.question_identifier,
    stem: row.stem,
    opt1: row.opt1,
    opt2: row.opt2,
    opt3: row.opt3,
    opt4: row.opt4,
    opt5: row.opt5,
    answer: row.answer,
    explanation: row.explanation,
    chosen_option: row.chosen_option, // 내가 고른 답
    is_correct: row.is_correct,
  }))
}

/**
 * 오답 모드에서 답변 수정
 */
export const updateAnswerInWrongMode = async (answerId, newChosenOption) => {
  // 기존 답안 가져오기
  const answerResult = await pool.query(
    `SELECT a.*, q.answer as correct_answer
     FROM answers a
     INNER JOIN questions q ON a.question_id = q.id
     WHERE a.id = $1`,
    [answerId]
  )

  if (answerResult.rows.length === 0) {
    throw new Error('답안을 찾을 수 없습니다.')
  }

  const answer = answerResult.rows[0]
  const isCorrect = newChosenOption === answer.correct_answer

  // 답안 업데이트
  const result = await pool.query(
    `UPDATE answers 
     SET chosen_option = $1, is_correct = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [newChosenOption, isCorrect, answerId]
  )

  return {
    ...result.rows[0],
    is_correct: isCorrect,
  }
}

/**
 * 시도별 모든 답안 가져오기 (해설용)
 */
export const getAllAnswersForExplanation = async (attemptId) => {
  const result = await pool.query(
    `SELECT 
      a.id as answer_id,
      a.attempt_id,
      a.question_id,
      a.chosen_option,
      a.is_correct,
      q.question_id as question_identifier,
      q.stem,
      q.opt1,
      q.opt2,
      q.opt3,
      q.opt4,
      q.opt5,
      q.answer,
      q.explanation
     FROM answers a
     INNER JOIN questions q ON a.question_id = q.id
     WHERE a.attempt_id = $1
     ORDER BY a.id`,
    [attemptId]
  )

  return result.rows.map((row) => ({
    id: row.answer_id,
    question_id: row.question_id,
    question_identifier: row.question_identifier,
    stem: row.stem,
    opt1: row.opt1,
    opt2: row.opt2,
    opt3: row.opt3,
    opt4: row.opt4,
    opt5: row.opt5,
    answer: row.answer,
    explanation: row.explanation,
    chosen_option: row.chosen_option,
    is_correct: row.is_correct,
  }))
}

