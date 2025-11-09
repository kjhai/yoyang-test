import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { examAPI } from '../utils/api'
import { storage } from '../utils/localStorage'
import '../styles/ExplanationsPage.css'

function ExplanationsPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const currentUserAnswer = currentQuestion
    ? userAnswers[currentQuestion.id] || null
    : null
  const isWrongAnswer = currentQuestion && currentUserAnswer
    ? Number(currentUserAnswer) !== Number(currentQuestion.answer)
    : false

  // 문제 목록 및 답안 로드
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // API에서 해설 데이터 가져오기 (문제와 답안 포함)
        const explanationsData = await examAPI.getExplanations(attemptId)
        
        // 해설 데이터를 문제 형식으로 변환
        const questionsData = explanationsData.map((item) => ({
          id: item.question_id,
          question_id: item.question_identifier || item.question_id,
          stem: item.stem,
          opt1: item.opt1,
          opt2: item.opt2,
          opt3: item.opt3 || null,
          opt4: item.opt4 || null,
          opt5: item.opt5 || null,
          answer: item.answer,
          explanation: item.explanation,
        }))
        setQuestions(questionsData)

        // 답안 정보 설정
        const answers = {}
        explanationsData.forEach((item) => {
          const qId = item.question_id
          if (item.chosen_option) {
            answers[qId] = item.chosen_option
          }
        })
        setUserAnswers(answers)
      } catch (err) {
        console.error('문제 로드 오류:', err)
        setError('문제를 불러오는 중 오류가 발생했습니다.')

        // 백엔드가 없는 경우 로컬 스토리지에서 로드
        const savedAnswers = storage.getAnswers()
        const savedQuestions = storage.getQuestions()
        const savedAttempt = storage.getCurrentAttempt()

        if (savedAttempt && savedQuestions.length > 0) {
          setQuestions(savedQuestions)
          setUserAnswers(savedAnswers)
        } else {
          // Mock 데이터
          const mockQuestions = Array.from({ length: 20 }, (_, i) => ({
            id: `q-${i + 1}`,
            question_id: `q-${i + 1}`,
            stem: `${i + 1}번 문제입니다. 다음 중 올바른 답을 선택하세요.`,
            opt1: `${i + 1}번 보기 1번 내용입니다.`,
            opt2: `${i + 1}번 보기 2번 내용입니다.`,
            opt3: `${i + 1}번 보기 3번 내용입니다.`,
            opt4: `${i + 1}번 보기 4번 내용입니다.`,
            opt5: `${i + 1}번 보기 5번 내용입니다.`,
            answer: (i % 5) + 1,
            explanation: `${i + 1}번 문제의 해설입니다. 이 문제는 다음과 같은 이유로 정답이 ${(i % 5) + 1}번입니다.`,
          }))
          setQuestions(mockQuestions)

          const mockAnswers = {}
          mockQuestions.forEach((q, idx) => {
            // 일부는 오답으로 설정
            if (idx % 3 === 0) {
              mockAnswers[q.id] = q.answer === 1 ? 2 : 1
            } else {
              mockAnswers[q.id] = q.answer
            }
          })
          setUserAnswers(mockAnswers)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (attemptId) {
      loadQuestions()
    }
  }, [attemptId])

  // 이전 문제로 이동
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // 다음 문제로 이동
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
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
      <div className="explanations-page">
        <div className="loading">문제를 불러오는 중...</div>
      </div>
    )
  }

  if (error && questions.length === 0) {
    return (
      <div className="explanations-page">
        <div className="error">{error}</div>
        <button onClick={handleBack} className="back-button">
          결과 페이지로 돌아가기
        </button>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="explanations-page">
        <div className="error">문제를 불러올 수 없습니다.</div>
        <button onClick={handleBack} className="back-button">
          결과 페이지로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="explanations-page">
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
          <div
            className="progress-fill"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="exam-content">
        <div className="question-container">
          <h2 className="question-number">
            {currentQuestionIndex + 1}번 문제
          </h2>
          <p className="question-stem">{currentQuestion.stem}</p>

          {/* 오답 배지 */}
          {isWrongAnswer && (
            <div className="wrong-answer-badge">
              오답
            </div>
          )}

          <div className="options-container">
            {[1, 2, 3, 4, 5].map((num) => {
              const optionText = currentQuestion[`opt${num}`]
              if (!optionText) return null

              const isSelected = currentUserAnswer === num
              const isCorrectAnswer = Number(num) === Number(currentQuestion.answer)
              const showAsWrong = isSelected && isWrongAnswer && !isCorrectAnswer

              return (
                <div
                  key={num}
                  className={`option-item ${isSelected ? 'selected' : ''} ${
                    isCorrectAnswer ? 'correct-answer' : ''
                  } ${showAsWrong ? 'wrong-answer' : ''}`}
                  role="presentation"
                >
                  <span className="option-number">{num}</span>
                  <span className="option-text">{optionText}</span>
                  {isSelected && isWrongAnswer && (
                    <span className="wrong-badge">내가 고른 답 (오답)</span>
                  )}
                  {isCorrectAnswer && (
                    <span className="correct-badge">정답</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* 정답 및 해설 영역 */}
          <div className="explanation-section">
            <div className="explanation-header">
              <h3>정답 및 해설</h3>
            </div>
            <div className="correct-answer-display">
              <strong>정답: {currentQuestion.answer}번</strong>
            </div>
            {currentQuestion.explanation && (
              <div className="explanation-text">
                {currentQuestion.explanation}
              </div>
            )}
            {!currentQuestion.explanation && (
              <div className="explanation-text">
                해설이 제공되지 않았습니다.
              </div>
            )}
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

export default ExplanationsPage
