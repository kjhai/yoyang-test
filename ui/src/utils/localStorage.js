// 로컬 스토리지 헬퍼 함수
const STORAGE_KEYS = {
  CURRENT_ATTEMPT: 'carecbt_current_attempt',
  QUESTIONS: 'carecbt_questions',
  ANSWERS: 'carecbt_answers',
  CURRENT_QUESTION_INDEX: 'carecbt_current_question_index',
}

export const storage = {
  // 현재 시도 저장
  saveCurrentAttempt: (attempt) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ATTEMPT, JSON.stringify(attempt))
    } catch (error) {
      console.error('시도 저장 실패:', error)
    }
  },

  // 현재 시도 가져오기
  getCurrentAttempt: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ATTEMPT)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('시도 로드 실패:', error)
      return null
    }
  },

  // 답안 저장
  saveAnswers: (answers) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers))
    } catch (error) {
      console.error('답안 저장 실패:', error)
    }
  },

  // 답안 가져오기
  getAnswers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANSWERS)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('답안 로드 실패:', error)
      return {}
    }
  },

  // 문항 목록 저장
  saveQuestions: (questions) => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions))
    } catch (error) {
      console.error('문항 저장 실패:', error)
    }
  },

  // 문항 목록 가져오기
  getQuestions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('문항 로드 실패:', error)
      return []
    }
  },

  // 현재 문항 인덱스 저장
  saveCurrentQuestionIndex: (index) => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_QUESTION_INDEX,
        String(index)
      )
    } catch (error) {
      console.error('문항 인덱스 저장 실패:', error)
    }
  },

  // 현재 문항 인덱스 가져오기
  getCurrentQuestionIndex: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_QUESTION_INDEX)
      return data ? parseInt(data, 10) : 0
    } catch (error) {
      console.error('문항 인덱스 로드 실패:', error)
      return 0
    }
  },

  // 모든 시험 관련 데이터 초기화
  clearExamData: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ATTEMPT)
      localStorage.removeItem(STORAGE_KEYS.QUESTIONS)
      localStorage.removeItem(STORAGE_KEYS.ANSWERS)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_QUESTION_INDEX)
    } catch (error) {
      console.error('데이터 초기화 실패:', error)
    }
  },

  // 결제 정보 저장
  savePaymentInfo: (paymentInfo) => {
    try {
      localStorage.setItem('carecbt_payment_info', JSON.stringify(paymentInfo))
      localStorage.setItem('carecbt_paid_user', 'true')
      localStorage.setItem('carecbt_payment_expires_at', paymentInfo.expiresAt)
    } catch (error) {
      console.error('결제 정보 저장 실패:', error)
    }
  },

  // 결제 정보 가져오기
  getPaymentInfo: () => {
    try {
      const paymentInfo = localStorage.getItem('carecbt_payment_info')
      const expiresAt = localStorage.getItem('carecbt_payment_expires_at')
      const isPaidUser = localStorage.getItem('carecbt_paid_user') === 'true'

      if (!paymentInfo || !expiresAt || !isPaidUser) {
        return null
      }

      // 만료일 확인
      const now = new Date()
      const expireDate = new Date(expiresAt)

      if (now > expireDate) {
        // 만료됨 - 저장된 정보 삭제
        storage.clearPaymentInfo()
        return null
      }

      return JSON.parse(paymentInfo)
    } catch (error) {
      console.error('결제 정보 로드 실패:', error)
      return null
    }
  },

  // 결제 여부 확인 (3개월 유효)
  isPaidUser: () => {
    const paymentInfo = storage.getPaymentInfo()
    return paymentInfo !== null
  },

  // 결제 정보 초기화
  clearPaymentInfo: () => {
    try {
      localStorage.removeItem('carecbt_payment_info')
      localStorage.removeItem('carecbt_paid_user')
      localStorage.removeItem('carecbt_payment_expires_at')
    } catch (error) {
      console.error('결제 정보 초기화 실패:', error)
    }
  },
}

