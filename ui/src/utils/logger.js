// 로깅 유틸리티
const isDevelopment = import.meta.env.DEV

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  error: (...args) => {
    console.error(...args)
    // 프로덕션에서는 에러 추적 서비스로 전송
    // if (!isDevelopment) {
    //   errorTrackingService.logError(...args)
    // }
  },
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
}

