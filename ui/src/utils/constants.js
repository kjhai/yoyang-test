// 로컬 스토리지 키 상수
export const STORAGE_KEYS = {
  CURRENT_ATTEMPT: 'carecbt_current_attempt',
  QUESTIONS: 'carecbt_questions',
  ANSWERS: 'carecbt_answers',
  CURRENT_QUESTION_INDEX: 'carecbt_current_question_index',
  PAYMENT_INFO: 'carecbt_payment_info',
  PAYMENT_EXPIRES_AT: 'carecbt_payment_expires_at',
  PAID_USER: 'carecbt_paid_user',
  ALL_PAYMENTS: 'carecbt_all_payments',
  COMPLETED_EXAMS: 'carecbt_completed_exams',
  ADMIN_TOKEN: 'carecbt_admin_token',
  ADMIN_USERNAME: 'carecbt_admin_username',
  ADMIN_LOGGED_IN: 'carecbt_admin_logged_in',
}

// 환경 변수
export const ENV = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
}

// 상수 값
export const CONSTANTS = {
  PAYMENT_AMOUNT: 99000,
  CONTACT_EMAIL: 'support@carecbt.com',
  PAYMENT_DURATION_DAYS: 90,
  FREE_QUESTION_COUNT: 20,
  PAID_QUESTION_COUNT: 80,
  PAID_EXAM_COUNT: 10,
}

