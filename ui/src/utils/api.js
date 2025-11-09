// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * API 요청 헬퍼 함수
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'API 요청 실패')
    }

    return data
  } catch (error) {
    console.error('API 요청 오류:', error)
    throw error
  }
}

// API 함수들
export const examAPI = {
  // 무료 시험 메타 정보 가져오기
  getFreeExam: () => apiRequest('/exams/free'),

  // 시도 생성
  createAttempt: (examId) =>
    apiRequest('/attempts', {
      method: 'POST',
      body: { exam_id: examId },
    }),

  // 시도별 문항 목록 가져오기
  getAttemptQuestions: (attemptId) =>
    apiRequest(`/attempts/${attemptId}/questions`),

  // 답안 저장
  saveAnswer: (attemptId, questionId, chosenOption) =>
    apiRequest('/answers', {
      method: 'POST',
      body: {
        attempt_id: attemptId,
        question_id: questionId,
        chosen_option: chosenOption,
      },
    }),

  // 시험 제출
  submitAttempt: (attemptId) =>
    apiRequest(`/attempts/${attemptId}/submit`, {
      method: 'POST',
    }),

  // 결과 가져오기
  getResult: (attemptId) => apiRequest(`/attempts/${attemptId}/result`),

  // 오답 목록 가져오기
  getWrongAnswers: (attemptId) =>
    apiRequest(`/attempts/${attemptId}/wrong`),

  // 오답 모드에서 답변 수정
  updateAnswer: (answerId, chosenOption) =>
    apiRequest(`/answers/${answerId}/correct`, {
      method: 'POST',
      body: { chosen_option: chosenOption },
    }),

  // 해설 가져오기
  getExplanations: (attemptId) =>
    apiRequest(`/answers/attempt/${attemptId}/explanations`),
}

export const adminAPI = {
  // CSV 업로드 미리보기
  previewImport: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const url = `${API_BASE_URL}/admin/import/preview`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // FormData 사용 시 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'API 요청 실패')
      }
      
      return data
    } catch (error) {
      console.error('API 요청 오류:', error)
      throw error
    }
  },

  // CSV 일괄 반영
  commitImport: (data) =>
    apiRequest('/admin/import/commit', {
      method: 'POST',
      body: data,
    }),
}

