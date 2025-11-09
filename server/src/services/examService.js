import pool from '../config/database.js'

/**
 * 무료 시험 정보 가져오기
 */
export const getFreeExam = async () => {
  const result = await pool.query(
    'SELECT * FROM exams WHERE is_free = true LIMIT 1'
  )
  if (result.rows.length === 0) {
    throw new Error('무료 시험을 찾을 수 없습니다.')
  }
  return result.rows[0]
}

/**
 * 시험 ID로 시험 정보 가져오기
 */
export const getExamById = async (examId) => {
  const result = await pool.query('SELECT * FROM exams WHERE id = $1', [examId])
  if (result.rows.length === 0) {
    throw new Error('시험을 찾을 수 없습니다.')
  }
  return result.rows[0]
}

/**
 * 시도(Attempt) 생성
 */
export const createAttempt = async (examId) => {
  // 셔플 시드 생성 (1~999999 사이의 랜덤 정수)
  const shuffleSeed = Math.floor(Math.random() * 999999) + 1

  const result = await pool.query(
    `INSERT INTO attempts (exam_id, shuffle_seed, started_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     RETURNING *`,
    [examId, shuffleSeed]
  )

  return result.rows[0]
}

/**
 * 시도 정보 가져오기
 */
export const getAttemptById = async (attemptId) => {
  const result = await pool.query(
    'SELECT * FROM attempts WHERE id = $1',
    [attemptId]
  )
  if (result.rows.length === 0) {
    throw new Error('시도를 찾을 수 없습니다.')
  }
  return result.rows[0]
}

/**
 * 시도별 문항 목록 가져오기 (셔플 적용)
 */
export const getAttemptQuestions = async (attemptId) => {
  // 시도 정보 가져오기
  const attempt = await getAttemptById(attemptId)

  // 시험에 속한 문항들 가져오기
  const result = await pool.query(
    `SELECT 
      q.id,
      q.question_id,
      q.stem,
      q.opt1,
      q.opt2,
      q.opt3,
      q.opt4,
      q.opt5,
      q.answer,
      q.explanation,
      eq.order_no
    FROM exam_questions eq
    INNER JOIN questions q ON eq.question_id = q.id
    WHERE eq.exam_id = $1
    ORDER BY eq.order_no`,
    [attempt.exam_id]
  )

  // 셔플 시드 기반으로 문항 순서 섞기
  const questions = result.rows
  const shuffledQuestions = shuffleArray(questions, attempt.shuffle_seed)

  // 보기 옵션도 셔플 (각 문항별로)
  return shuffledQuestions.map((q) => {
    const options = [
      { num: 1, text: q.opt1 },
      { num: 2, text: q.opt2 },
      q.opt3 ? { num: 3, text: q.opt3 } : null,
      q.opt4 ? { num: 4, text: q.opt4 } : null,
      q.opt5 ? { num: 5, text: q.opt5 } : null,
    ].filter(Boolean)

    // 보기 셔플 (셔플 시드 + 문항 ID로 시드 생성)
    const optionSeed = attempt.shuffle_seed + q.id
    const shuffledOptions = shuffleArray([...options], optionSeed)

    // 정답 번호 찾기 (셔플 후)
    const correctOptionIndex = shuffledOptions.findIndex(
      (opt) => opt.num === q.answer
    )
    const newAnswer = correctOptionIndex + 1

    // 셔플된 보기를 opt1~opt5로 변환
    const question = {
      id: q.id,
      question_id: q.question_id,
      stem: q.stem,
      opt1: shuffledOptions[0].text,
      opt2: shuffledOptions[1].text,
      opt3: shuffledOptions[2]?.text || null,
      opt4: shuffledOptions[3]?.text || null,
      opt5: shuffledOptions[4]?.text || null,
      answer: newAnswer, // 셔플 후 정답 번호
      explanation: q.explanation,
    }

    return question
  })
}

/**
 * 배열 셔플 함수 (시드 기반)
 */
function shuffleArray(array, seed) {
  const shuffled = [...array]
  // 간단한 시드 기반 셔플 알고리즘
  let random = seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    random = (random * 9301 + 49297) % 233280
    const j = Math.floor((random / 233280) * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

