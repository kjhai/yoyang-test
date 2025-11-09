import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import { examAPI } from '../utils/api'
import { storage } from '../utils/localStorage'
import '../styles/ExamPage.css'

function ExamPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const examNumber = location.state?.examNumber || null
  const {
    currentAttempt,
    questions,
    answers,
    currentQuestionIndex,
    setCurrentAttempt,
    setQuestions,
    setAnswer,
    setCurrentQuestionIndex,
  } = useExamStore()

  const [showToast, setShowToast] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id] || null
    : null

  // 로컬 스토리지에서 복구 (attempt, questions, answers)
  useEffect(() => {
    const savedAttempt = storage.getCurrentAttempt()
    const savedQuestions = storage.getQuestions()
    const savedAnswers = storage.getAnswers()

    if (savedAttempt && !currentAttempt) {
      setCurrentAttempt(savedAttempt)
    }
    if (savedQuestions.length > 0 && questions.length === 0) {
      setQuestions(savedQuestions)
    }
    if (Object.keys(savedAnswers).length > 0) {
      Object.entries(savedAnswers).forEach(([questionId, answer]) => {
        setAnswer(questionId, answer)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // questions가 로드된 후 인덱스 복구
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex === 0) {
      const savedIndex = storage.getCurrentQuestionIndex()
      if (savedIndex > 0 && savedIndex < questions.length) {
        setCurrentQuestionIndex(savedIndex)
      }
    }
  }, [questions.length, currentQuestionIndex, setCurrentQuestionIndex])

  // 시험 초기화 (attempt 생성 및 문항 로드)
  useEffect(() => {
    const initializeExam = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 유료 시험 여부 확인 (URL 경로만으로 판단)
        // /exam 경로는 항상 무료 (20문항)
        // /exam/paid 경로만 유료 (80문항)
        const isPaidExam = window.location.pathname.includes('/paid')
        const questionCount = isPaidExam ? 80 : 20 // 유료는 80문항, 무료는 20문항

        // 유료 시험 접근 시 결제 여부 확인
        if (isPaidExam) {
          if (!storage.isPaidUser()) {
            setError('유료 모의고사를 이용하시려면 먼저 구매해주세요.')
            setIsLoading(false)
            return
          }
          // examNumber가 없으면 선택 페이지로 리다이렉트
          if (!examNumber) {
            navigate('/exam/paid/select')
            return
          }
        }

        // 무료 시험 정보 가져오기 (유료도 같은 API 사용, 백엔드에서 구분)
        const exam = await examAPI.getFreeExam()

        // attempt 생성
        const attempt = await examAPI.createAttempt(exam.id)
        setCurrentAttempt(attempt)
        storage.saveCurrentAttempt(attempt)

        // 문항 목록 가져오기
        const questionList = await examAPI.getAttemptQuestions(attempt.id)
        setQuestions(questionList)
        storage.saveQuestions(questionList)
      } catch (err) {
        logger.error('시험 초기화 오류:', err)
        setError('시험을 불러오는 중 오류가 발생했습니다.')
        // 백엔드가 없는 경우 mock 데이터 사용
        // URL 경로만으로 판단 (무료는 /exam, 유료는 /exam/paid)
        const isPaidExam = window.location.pathname.includes('/paid')
        const questionCount = isPaidExam ? 80 : 20
        const mockAttempt = { id: `mock-attempt-${isPaidExam ? 'paid' : 'free'}-1`, exam_id: 1 }
        const mockQuestions = Array.from({ length: questionCount }, (_, i) => ({
          id: `q-${i + 1}`,
          question_id: `q-${i + 1}`,
          stem: `${i + 1}번 문제입니다. 다음 중 올바른 답을 선택하세요.`,
          opt1: `${i + 1}번 보기 1번 내용입니다.`,
          opt2: `${i + 1}번 보기 2번 내용입니다.`,
          opt3: `${i + 1}번 보기 3번 내용입니다.`,
          opt4: `${i + 1}번 보기 4번 내용입니다.`,
          opt5: `${i + 1}번 보기 5번 내용입니다.`,
          answer: (i % 5) + 1,
        }))
        setCurrentAttempt(mockAttempt)
        setQuestions(mockQuestions)
        storage.saveCurrentAttempt(mockAttempt)
        storage.saveQuestions(mockQuestions)
      } finally {
        setIsLoading(false)
      }
    }

    if (!currentAttempt || questions.length === 0) {
      initializeExam()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examNumber])

  // 자동 저장 (5초마다) - 문항 이동 시에도 저장
  useEffect(() => {
    if (!currentQuestion || !currentAttempt) return

    // 답안이 있을 때만 서버에 저장
    if (currentAnswer) {
      const saveTimer = setInterval(async () => {
        try {
          await examAPI.saveAnswer(
            currentAttempt.id,
            currentQuestion.id,
            currentAnswer
          )
          logger.log('자동 저장 완료')
        } catch (err) {
          logger.error('자동 저장 오류:', err)
          // 네트워크 오류 시 로컬 저장소는 이미 저장되어 있음
        }
      }, 5000)

      return () => clearInterval(saveTimer)
    }
  }, [currentQuestion, currentAnswer, currentAttempt])

  // 문항 변경 시 로컬 스토리지에 현재 인덱스 저장
  useEffect(() => {
    storage.saveCurrentQuestionIndex(currentQuestionIndex)
  }, [currentQuestionIndex])

  // answers 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      storage.saveAnswers(answers)
    }
  }, [answers])

  // 보기 선택 핸들러
  const handleOptionSelect = async (optionNumber) => {
    if (!currentQuestion || !currentAttempt) return

    setAnswer(currentQuestion.id, optionNumber)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)

    // 서버에 저장 시도 (로컬 스토리지는 answers useEffect에서 자동 저장됨)
    try {
      await examAPI.saveAnswer(
        currentAttempt.id,
        currentQuestion.id,
        optionNumber
      )
    } catch (err) {
      logger.error('답안 저장 오류:', err)
      // 네트워크 오류 시 로컬 저장소에만 저장 (answers useEffect에서 처리됨)
    }
  }

  // 이전 문제로 이동
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(newIndex)
      storage.saveCurrentQuestionIndex(newIndex)
    }
  }

  // 다음 문제로 이동
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const newIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(newIndex)
      storage.saveCurrentQuestionIndex(newIndex)
    }
  }

  // 답안 제출
  const handleSubmit = async () => {
    if (!currentAttempt) return

    // 확인 다이얼로그
    const confirmed = window.confirm(
      '답안을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.'
    )
    if (!confirmed) return

    try {
      // 서버에 제출 시도
      await examAPI.submitAttempt(currentAttempt.id)
      
      // 유료 시험인 경우 완료된 모의고사 번호 저장
      if (examNumber && storage.isPaidUser()) {
        const completed = JSON.parse(localStorage.getItem('carecbt_completed_exams') || '[]')
        if (!completed.includes(examNumber)) {
          completed.push(examNumber)
          localStorage.setItem('carecbt_completed_exams', JSON.stringify(completed))
        }
      }
      
      navigate(`/result/${currentAttempt.id}`)
    } catch (err) {
      logger.error('제출 오류:', err)
      // 백엔드가 없는 경우에도 결과 페이지로 이동 (ResultPage에서 mock 데이터 사용)
      // 로컬 스토리지에 제출 상태 저장
      const submitData = {
        submitted: true,
        submittedAt: new Date().toISOString(),
      }
      localStorage.setItem(
        `exam_submitted_${currentAttempt.id}`,
        JSON.stringify(submitData)
      )
      
      // 유료 시험인 경우 완료된 모의고사 번호 저장
      if (examNumber && storage.isPaidUser()) {
        const completed = JSON.parse(localStorage.getItem('carecbt_completed_exams') || '[]')
        if (!completed.includes(examNumber)) {
          completed.push(examNumber)
          localStorage.setItem('carecbt_completed_exams', JSON.stringify(completed))
        }
      }
      
      navigate(`/result/${currentAttempt.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="exam-page">
        <div className="loading">시험을 불러오는 중...</div>
      </div>
    )
  }

  if (error && questions.length === 0) {
    return (
      <div className="exam-page">
        <div className="error">{error}</div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="exam-page">
        <div className="error">문제를 불러올 수 없습니다.</div>
      </div>
    )
  }

  // 홈으로 이동
  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="exam-page">
      {/* 헤더 영역 (헤더 + 진행바) - 고정 */}
      <div className="exam-header-wrapper">
        <header className="exam-header">
          <div 
            className="logo-placeholder" 
            onClick={handleGoHome}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleGoHome()
              }
            }}
            aria-label="홈으로 이동"
          >
            로고
          </div>
          <h1 
            className="site-title"
            onClick={handleGoHome}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleGoHome()
              }
            }}
            aria-label="홈으로 이동"
          >
            CareCBT
          </h1>
        </header>

        {/* 진행바 */}
        <div className="progress-bar">
          <div className="progress-info">
            {currentQuestionIndex + 1} / {totalQuestions}
          </div>
          <div className="progress-fill" style={{
            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`
          }}></div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="exam-content">
        <div className="question-container">
          <h2 className="question-number">
            {currentQuestionIndex + 1}번 문제
          </h2>
          <p className="question-stem">{currentQuestion.stem}</p>

          <div className="options-container">
            {[1, 2, 3, 4, 5].map((num) => {
              const optionText = currentQuestion[`opt${num}`]
              if (!optionText) return null

              const isSelected = currentAnswer === num

              return (
                <div
                  key={num}
                  className={`option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(num)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleOptionSelect(num)
                    }
                  }}
                  aria-label={`${num}번 보기`}
                >
                  <span className="option-number">{num}</span>
                  <span className="option-text">{optionText}</span>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* 푸터 네비게이션 */}
      <footer className="exam-footer">
        <button
          className="nav-button prev-button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          aria-label="이전 문제"
        >
          이전
        </button>
        <button
          className="nav-button next-button"
          onClick={handleNext}
          disabled={currentQuestionIndex === totalQuestions - 1}
          aria-label="다음 문제"
        >
          다음
        </button>
        <button
          className="nav-button submit-button"
          onClick={handleSubmit}
          aria-label="답안 제출"
        >
          답안 제출
        </button>
      </footer>

      {/* 선택 저장 토스트 */}
      {showToast && (
        <div className="toast" role="status" aria-live="polite">
          선택이 저장되었습니다
        </div>
      )}
    </div>
  )
}

export default ExamPage
