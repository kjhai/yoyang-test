import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { examAPI } from '../utils/api'
import { storage } from '../utils/localStorage'
import '../styles/WrongAnswersPage.css'

function WrongAnswersPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()

  const [wrongQuestions, setWrongQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [previousAnswers, setPreviousAnswers] = useState({})
  const [showFeedback, setShowFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const currentQuestion = wrongQuestions[currentQuestionIndex]
  const totalWrongQuestions = wrongQuestions.length
  const currentUserAnswer = currentQuestion
    ? userAnswers[currentQuestion.id] || previousAnswers[currentQuestion.id] || null
    : null
  const isCorrect = currentQuestion && currentUserAnswer
    ? Number(currentUserAnswer) === Number(currentQuestion.answer)
    : false
  
  // 초기 오답 수 (진행률 계산용)
  const [initialWrongCount, setInitialWrongCount] = useState(0)

  // 오답 목록 로드
  useEffect(() => {
    const loadWrongAnswers = async (actualAttemptId) => {
      try {
        setIsLoading(true)
        setError(null)

        // API에서 오답 목록 가져오기
        const wrongAnswersData = await examAPI.getWrongAnswers(actualAttemptId)
        // API는 직접 배열을 반환
        const wrongQuestionsList = Array.isArray(wrongAnswersData) ? wrongAnswersData : (wrongAnswersData.questions || [])
        setWrongQuestions(wrongQuestionsList)
        setInitialWrongCount(wrongQuestionsList.length)
        
        // 이전 선택한 답안 저장
        const prevAnswers = {}
        wrongQuestionsList.forEach((q) => {
          if (q.chosen_option) {
            prevAnswers[q.question_id] = q.chosen_option
          }
        })
        setPreviousAnswers(prevAnswers)
        setIsLoading(false)
      } catch (err) {
        console.error('오답 로드 오류:', err)
        console.log('로컬 스토리지에서 데이터 로드 시도...')
        
        // 백엔드가 없는 경우 로컬 스토리지에서 계산
        const savedAnswers = storage.getAnswers()
        const savedQuestions = storage.getQuestions()
        const savedAttempt = storage.getCurrentAttempt()

        console.log('저장된 데이터:', {
          answers: Object.keys(savedAnswers).length,
          questions: savedQuestions.length,
          attempt: savedAttempt
        })

        if (savedAttempt && savedQuestions.length > 0) {
          // 오답만 필터링
          const wrong = savedQuestions.filter((question) => {
            const userAnswer = savedAnswers[question.id]
            if (!userAnswer) return false
            const isWrong = Number(userAnswer) !== Number(question.answer)
            return isWrong
          })

          console.log('필터링된 오답:', wrong.length)

          if (wrong.length > 0) {
            setWrongQuestions(wrong)
            setInitialWrongCount(wrong.length)
            setError(null) // 에러 초기화

            // 이전 선택한 답안 저장
            const prevAnswers = {}
            wrong.forEach((q) => {
              if (savedAnswers[q.id]) {
                prevAnswers[q.id] = savedAnswers[q.id]
              }
            })
            setPreviousAnswers(prevAnswers)
          } else {
            // 오답이 없음
            setWrongQuestions([])
            setInitialWrongCount(0)
            setError(null)
          }
        } else {
          // 데이터가 없으면 에러 표시
          console.error('로컬 스토리지에 데이터가 없습니다.')
          setError('오답 데이터를 불러올 수 없습니다. 시험을 먼저 완료해주세요.')
          setWrongQuestions([])
        }
        setIsLoading(false)
      }
    }

    // attemptId가 없으면 로컬 스토리지에서 가져오기
    const savedAttempt = storage.getCurrentAttempt()
    const actualAttemptId = attemptId || savedAttempt?.id
    
    if (actualAttemptId) {
      loadWrongAnswers(actualAttemptId)
    } else {
      // attemptId도 없고 로컬 스토리지에도 없으면
      setIsLoading(false)
      setError('시험 데이터를 찾을 수 없습니다. 시험을 먼저 완료해주세요.')
    }
  }, [attemptId])

  // 보기 선택 핸들러
  const handleOptionSelect = async (optionNumber) => {
    if (!currentQuestion) return

    const selectedAnswer = optionNumber
    const isAnswerCorrect = Number(selectedAnswer) === Number(currentQuestion.answer)

    // 새 선택 저장
    const updatedUserAnswers = {
      ...userAnswers,
      [currentQuestion.id]: selectedAnswer,
    }
    setUserAnswers(updatedUserAnswers)

    if (isAnswerCorrect) {
      // 정답이면 피드백 없이 해당 문제 제거
      setShowFeedback(null)
      
      // 정답으로 변경했으므로 해당 문제 제거
      // question_id 또는 id로 비교
      const currentQuestionId = currentQuestion.question_id || currentQuestion.id
      const updatedWrongQuestions = wrongQuestions.filter(
        (q) => (q.question_id || q.id) !== currentQuestionId
      )
      setWrongQuestions(updatedWrongQuestions)

      // 로컬 스토리지에 업데이트된 답안 저장
      const savedAnswers = storage.getAnswers()
      savedAnswers[currentQuestionId] = selectedAnswer
      storage.saveAnswers(savedAnswers)
      
      // 사용자 답안 상태 업데이트
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionId]: selectedAnswer,
      }))

      // 서버에 답안 변경 저장 시도
      try {
        // answer_id는 백엔드에서 반환된 id 필드
        const answerId = currentQuestion.id || currentQuestion.answer_id
        if (answerId) {
          await examAPI.updateAnswer(answerId, selectedAnswer)
        }
      } catch (err) {
        console.error('답안 업데이트 오류:', err)
      }

      // 문제가 더 있으면 다음 문제로, 없으면 완료
      if (updatedWrongQuestions.length > 0) {
        // 현재 인덱스가 범위를 벗어나지 않도록 조정
        // 문제가 제거되었으므로 인덱스는 그대로 유지 (다음 문제가 현재 인덱스로 이동)
        const newIndex = Math.min(currentQuestionIndex, updatedWrongQuestions.length - 1)
        setCurrentQuestionIndex(newIndex)
      } else {
        // 모든 오답을 해결함
        setTimeout(() => {
          alert('모든 오답을 정답으로 바꾸셨습니다!')
          navigate(`/result/${attemptId}`)
        }, 100)
      }
    } else {
      // 정답이 아니면 피드백 표시
      setShowFeedback('incorrect')
      setTimeout(() => {
        setShowFeedback(null)
      }, 2000)

      // 로컬 스토리지에 업데이트된 답안 저장 (오답이지만 저장)
      const currentQuestionId = currentQuestion.question_id || currentQuestion.id
      const savedAnswers = storage.getAnswers()
      savedAnswers[currentQuestionId] = selectedAnswer
      storage.saveAnswers(savedAnswers)
      
      // 사용자 답안 상태 업데이트
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionId]: selectedAnswer,
      }))
      
      // 서버에 답안 변경 저장 시도
      try {
        const answerId = currentQuestion.id || currentQuestion.answer_id
        if (answerId) {
          await examAPI.updateAnswer(answerId, selectedAnswer)
        }
      } catch (err) {
        console.error('답안 업데이트 오류:', err)
      }
    }
  }

  // 이전 문제로 이동
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowFeedback(null)
    }
  }

  // 다음 문제로 이동
  const handleNext = () => {
    if (currentQuestionIndex < totalWrongQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowFeedback(null)
    }
  }

  // 뒤로 가기
  const handleBack = () => {
    navigate(`/result/${attemptId}`)
  }

  // 홈으로 이동
  const handleGoHome = () => {
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="wrong-answers-page">
        <div className="loading">오답을 불러오는 중...</div>
      </div>
    )
  }

  if (error && wrongQuestions.length === 0 && !isLoading) {
    return (
      <div className="wrong-answers-page">
        <div className="error-container">
          <div className="error">{error}</div>
          <button onClick={handleBack} className="back-button">
            결과 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!isLoading && wrongQuestions.length === 0 && !error) {
    return (
      <div className="wrong-answers-page">
        <div className="no-wrong-answers">
          <h2>오답이 없습니다!</h2>
          <p>모든 문제를 정답으로 맞추셨습니다.</p>
          <button onClick={handleBack} className="back-button">
            결과 페이지로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="wrong-answers-page">
        <div className="error">문제를 불러올 수 없습니다.</div>
        <button onClick={handleBack} className="back-button">
          결과 페이지로 돌아가기
        </button>
      </div>
    )
  }

  const isPreviousAnswer = previousAnswers[currentQuestion.id] === currentUserAnswer

  return (
    <div className="wrong-answers-page">
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
            남은 오답 {totalWrongQuestions} / 총 오답 {initialWrongCount || totalWrongQuestions}
          </div>
          <div
            className="progress-fill"
            style={{
              width: initialWrongCount > 0
                ? `${((initialWrongCount - totalWrongQuestions) / initialWrongCount) * 100}%`
                : '0%',
            }}
          ></div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="exam-content">
        <div className="question-container">
          <h2 className="question-number">
            오답 문제 {currentQuestionIndex + 1}
          </h2>
          <p className="question-stem">{currentQuestion.stem}</p>

          {/* 이전에 선택한 오답 배지 */}
          {isPreviousAnswer && currentUserAnswer && (
            <div className="previous-answer-badge">
              내가 고른 답
            </div>
          )}

          <div className="options-container">
            {[1, 2, 3, 4, 5].map((num) => {
              const optionText = currentQuestion[`opt${num}`]
              if (!optionText) return null

              const isSelected = currentUserAnswer === num
              const isCorrectAnswer = Number(num) === Number(currentQuestion.answer)
              const showAsCorrect = isCorrect && isSelected && isCorrectAnswer

              return (
                <div
                  key={num}
                  className={`option-item ${isSelected ? 'selected' : ''} ${
                    showAsCorrect ? 'correct' : ''
                  }`}
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
                  {isPreviousAnswer && isSelected && (
                    <span className="previous-badge">이전 선택</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* 피드백 메시지 */}
          {showFeedback === 'incorrect' && (
            <div className="feedback-message incorrect">
              정답이 아닙니다
            </div>
          )}
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
          disabled={currentQuestionIndex === totalWrongQuestions - 1}
          aria-label="다음 문제"
        >
          다음
        </button>
        <button
          className="nav-button back-button"
          onClick={handleBack}
          aria-label="결과 페이지로 돌아가기"
        >
          뒤로
        </button>
      </footer>
    </div>
  )
}

export default WrongAnswersPage
