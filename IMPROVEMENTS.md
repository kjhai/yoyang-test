# 프런트엔드 코드 개선 사항

## 🔴 중요 (High Priority)

### 1. console.log 제거 및 로깅 시스템 개선
**문제점:**
- 프로덕션 코드에 많은 `console.log`가 남아있음 (46개 발견)
- 디버깅용 로그가 사용자 콘솔에 노출됨

**개선 방안:**
```javascript
// utils/logger.js 생성
const isDevelopment = import.meta.env.DEV

export const logger = {
  log: (...args) => isDevelopment && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => isDevelopment && console.warn(...args),
}
```

**영향을 받는 파일:**
- `ui/src/pages/PaymentPage.jsx` (11개)
- `ui/src/pages/ExamPage.jsx` (4개)
- `ui/src/pages/WrongAnswersPage.jsx` (4개)
- 기타 여러 파일

### 2. ExamStore submitExam 함수 시그니처 불일치
**문제점:**
- `examStore.js`의 `submitExam`은 `(score)` 하나의 인자만 받음
- `ResultPage.jsx`에서는 `submitExam(score, correct, wrong)` 세 개의 인자를 전달할 수 있음

**개선 방안:**
```javascript
// stores/examStore.js
submitExam: (score, correct, wrong) => 
  set({ 
    isSubmitted: true, 
    score, 
    correct, 
    wrong 
  }),
```

### 3. useEffect 의존성 배열 문제
**문제점:**
- `ExamPage.jsx`의 여러 useEffect에서 의존성 배열이 누락되거나 불완전함
- 무한 루프 또는 예상치 못한 동작 가능성

**개선 방안:**
```javascript
// ExamPage.jsx
useEffect(() => {
  // ... 로직
}, [currentAttempt, questions, navigate, examNumber]) // 모든 의존성 명시
```

### 4. 로컬 스토리지 키 하드코딩
**문제점:**
- 여러 파일에서 로컬 스토리지 키가 하드코딩됨
- 오타 발생 가능성, 유지보수 어려움

**개선 방안:**
```javascript
// utils/constants.js 생성
export const STORAGE_KEYS = {
  CURRENT_ATTEMPT: 'carecbt_current_attempt',
  QUESTIONS: 'carecbt_questions',
  ANSWERS: 'carecbt_answers',
  PAYMENT_INFO: 'carecbt_payment_info',
  ALL_PAYMENTS: 'carecbt_all_payments',
  // ... 기타
}
```

## 🟡 중요도 중간 (Medium Priority)

### 5. 에러 처리 일관성 부족
**문제점:**
- 각 페이지마다 에러 처리 방식이 다름
- 사용자에게 일관성 없는 에러 메시지 표시

**개선 방안:**
```javascript
// utils/errorHandler.js 생성
export const handleApiError = (error, defaultMessage) => {
  if (error.message) {
    return error.message
  }
  return defaultMessage || '오류가 발생했습니다.'
}
```

### 6. API 호출 실패 시 재시도 로직 부재
**문제점:**
- 네트워크 오류 시 자동 재시도 없음
- 사용자가 수동으로 다시 시도해야 함

**개선 방안:**
```javascript
// utils/api.js에 retry 로직 추가
async function apiRequestWithRetry(endpoint, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiRequest(endpoint, options)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

### 7. 중복 코드 제거
**문제점:**
- 여러 페이지에서 유사한 로직 반복 (로컬 스토리지 복구, 에러 처리 등)

**개선 방안:**
- 커스텀 훅 생성: `useExamData`, `usePaymentData`, `useLocalStorage`
- 공통 컴포넌트 생성: `ErrorBoundary`, `LoadingSpinner`

### 8. 메모이제이션 부족
**문제점:**
- 불필요한 리렌더링 발생 가능
- 성능 최적화 미흡

**개선 방안:**
```javascript
// React.memo, useMemo, useCallback 활용
const MemoizedComponent = React.memo(Component)
const filteredPayments = useMemo(() => {
  return payments.filter(...)
}, [payments, searchTerm])
```

## 🟢 중요도 낮음 (Low Priority)

### 9. 접근성 개선
**개선 사항:**
- 폼 필드에 `aria-describedby` 추가
- 에러 메시지와 입력 필드 연결
- 키보드 네비게이션 개선

### 10. 로딩 상태 UI 개선
**문제점:**
- 로딩 상태가 단순 텍스트로만 표시됨

**개선 방안:**
- 로딩 스피너 컴포넌트 생성
- 스켈레톤 UI 적용

### 11. 입력 검증 강화
**문제점:**
- 전화번호 검증이 완전하지 않음
- 이메일 검증이 없음 (필요 시)

**개선 방안:**
```javascript
// utils/validation.js
export const validatePhone = (phone) => {
  const phoneRegex = /^010-\d{4}-\d{4}$/
  return phoneRegex.test(phone)
}
```

### 12. 타입 안정성 (TypeScript 전환 고려)
**문제점:**
- JavaScript만 사용하여 타입 에러 발생 가능

**개선 방안:**
- 점진적으로 TypeScript 전환
- JSDoc 주석 추가로 타입 힌트 제공

## 📋 즉시 적용 가능한 개선 사항

### 1. PaymentPage.jsx - console.log 제거
```javascript
// 제거할 로그들
console.log('결제 처리 시작')
console.log('결제 정보:', formData)
console.log('Mock 결제 처리 시작...')
// ... 기타
```

### 2. ExamPage.jsx - 의존성 배열 수정
```javascript
useEffect(() => {
  // ...
}, [currentAttempt, questions.length, navigate, examNumber])
```

### 3. examStore.js - submitExam 함수 수정
```javascript
submitExam: (score, correct, wrong) => 
  set({ 
    isSubmitted: true, 
    score, 
    correct, 
    wrong 
  }),
```

### 4. constants.js 파일 생성
```javascript
// utils/constants.js
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
```

## 🧪 테스트 필요 사항

### 1. 로컬 스토리지 복구 테스트
- 새로고침 후 데이터 복구 확인
- 여러 탭에서 동시 접근 테스트

### 2. 결제 플로우 테스트
- 결제 완료 후 판매 현황 반영 확인
- 중복 결제 방지 테스트

### 3. 에러 핸들링 테스트
- API 실패 시 동작 확인
- 네트워크 오류 시 동작 확인

### 4. 모바일 반응형 테스트
- 다양한 화면 크기에서 테스트
- 터치 영역 크기 확인

## 📝 추가 권장 사항

### 1. 환경 변수 관리
```javascript
// .env 파일
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENVIRONMENT=development
```

### 2. 에러 바운더리 추가
```javascript
// components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  // 에러 처리 로직
}
```

### 3. 코드 분할 (Code Splitting)
```javascript
// App.jsx
const AdminSalesPage = lazy(() => import('./pages/AdminSalesPage'))
```

### 4. SEO 최적화
- 메타 태그 추가
- Open Graph 태그 추가

### 5. 성능 모니터링
- Web Vitals 측정
- 에러 추적 도구 연동 (Sentry 등)

