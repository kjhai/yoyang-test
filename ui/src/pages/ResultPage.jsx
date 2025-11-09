import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { examAPI } from '../utils/api'
import useExamStore from '../stores/examStore'
import { storage } from '../utils/localStorage'
import '../styles/ResultPage.css'

function ResultPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const { resetExam, setCurrentAttempt } = useExamStore()

  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 결과 데이터 로드
  useEffect(() => {
    const loadResult = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // API에서 결과 가져오기
        const resultData = await examAPI.getResult(attemptId)
        setResult(resultData)
      } catch (err) {
        console.error('결과 로드 오류:', err)
        setError('결과를 불러오는 중 오류가 발생했습니다.')
        
        // 백엔드가 없는 경우 mock 데이터 사용
        // 로컬 스토리지에서 답안 정보를 기반으로 점수 계산
        const savedAnswers = storage.getAnswers()
        const savedQuestions = storage.getQuestions()
        const savedAttempt = storage.getCurrentAttempt()

        if (savedAttempt && savedQuestions.length > 0) {
          let correctCount = 0
          const totalQuestions = savedQuestions.length

          savedQuestions.forEach((question) => {
            const userAnswer = savedAnswers[question.id]
            // answer 필드가 숫자 또는 문자열일 수 있으므로 비교 시 형변환
            if (userAnswer && Number(userAnswer) === Number(question.answer)) {
              correctCount++
            }
          })

          const wrongCount = totalQuestions - correctCount

          setResult({
            score: correctCount,
            total: totalQuestions,
            correct: correctCount,
            wrong: wrongCount,
            attempt_id: attemptId || savedAttempt.id,
          })
        } else {
          // 완전히 mock 데이터 (테스트용)
          setResult({
            score: 15,
            total: 20,
            correct: 15,
            wrong: 5,
            attempt_id: attemptId || 'mock-attempt-1',
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (attemptId) {
      loadResult()
    }
  }, [attemptId])

  // 틀린 문제 풀기
  const handleWrongAnswers = () => {
    navigate(`/wrong/${attemptId || result?.attempt_id}`)
  }

  // 다시 풀기
  const handleRetry = async () => {
    try {
      // 기존 시험 데이터 초기화
      resetExam()
      storage.clearExamData()

      // 새로운 시험 시작
      navigate('/exam')
    } catch (err) {
      console.error('다시 풀기 오류:', err)
      alert('다시 풀기를 시작하는 중 오류가 발생했습니다.')
    }
  }

  // 문제 해설 보기
  const handleViewExplanations = () => {
    navigate(`/explanations/${attemptId || result?.attempt_id}`)
  }

  // 10회 모의고사 구매하기
  const handlePurchase = () => {
    navigate('/payment', {
      state: {
        attemptId: attemptId || result?.attempt_id,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="result-page">
        <div className="loading">결과를 불러오는 중...</div>
      </div>
    )
  }

  if (error && !result) {
    return (
      <div className="result-page">
        <div className="error">{error}</div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="result-page">
        <div className="error">결과를 불러올 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="result-page">
      <div className="result-container">
        {/* 시험 결과 박스 */}
        <div className="result-box">
          <h1 className="result-title">시험 결과</h1>
          <div className="result-score">
            점수 : {result.score} / {result.total}
          </div>
          {result.correct !== undefined && result.wrong !== undefined && (
            <div className="result-details">
              정답: {result.correct}개 / 오답: {result.wrong}개
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="action-buttons">
          <button
            className="action-button"
            onClick={handleWrongAnswers}
            disabled={result.wrong === 0}
          >
            틀린 문제 풀기
          </button>
          <button className="action-button" onClick={handleRetry}>
            다시 풀기
          </button>
          <button className="action-button" onClick={handleViewExplanations}>
            문제 해설 보기
          </button>
        </div>

        {/* 구매 버튼 */}
        <div className="purchase-section">
          <button className="purchase-button" onClick={handlePurchase}>
            10회 모의고사 구매하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultPage
