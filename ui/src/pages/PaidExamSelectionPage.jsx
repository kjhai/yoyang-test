import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../utils/localStorage'
import '../styles/PaidExamSelectionPage.css'

function PaidExamSelectionPage() {
  const navigate = useNavigate()
  const [isPaidUser, setIsPaidUser] = useState(false)
  const [completedExams, setCompletedExams] = useState([])

  // 결제 정보 확인
  useEffect(() => {
    const paymentInfo = storage.getPaymentInfo()
    if (!paymentInfo) {
      // 결제 정보가 없으면 메인 페이지로 이동
      navigate('/')
    } else {
      setIsPaidUser(true)
    }

    // 완료된 모의고사 목록 가져오기 (로컬 스토리지에서)
    const completed = JSON.parse(localStorage.getItem('carecbt_completed_exams') || '[]')
    setCompletedExams(completed)
  }, [navigate])

  // 모의고사 시작하기
  const handleStartExam = (examNumber) => {
    // 선택한 모의고사 번호를 저장하고 시험 페이지로 이동
    navigate('/exam/paid', {
      state: {
        examNumber: examNumber,
      },
    })
  }

  // 뒤로 가기
  const handleBack = () => {
    navigate('/')
  }

  // 10개의 모의고사 생성
  const exams = Array.from({ length: 10 }, (_, i) => i + 1)

  if (!isPaidUser) {
    return (
      <div className="paid-exam-selection-page">
        <div className="loading">결제 정보를 확인하는 중...</div>
      </div>
    )
  }

  return (
    <div className="paid-exam-selection-page">
      <div className="selection-container">
        {/* 헤더 */}
        <div className="selection-header">
          <button className="back-button-top" onClick={handleBack} aria-label="뒤로 가기">
            ←
          </button>
          <h1 className="selection-title">모의고사 선택</h1>
          <div className="header-spacer"></div>
        </div>

        {/* 안내 메시지 */}
        <div className="selection-info">
          <p>10회의 모의고사 중 하나를 선택하세요.</p>
        </div>

        {/* 모의고사 목록 */}
        <div className="exam-list">
          {exams.map((examNumber) => {
            const isCompleted = completedExams.includes(examNumber)
            
            return (
              <div
                key={examNumber}
                className={`exam-card ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleStartExam(examNumber)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleStartExam(examNumber)
                  }
                }}
                aria-label={`모의고사 ${examNumber}회 ${isCompleted ? '완료' : '시작하기'}`}
              >
                <div className="exam-number">모의고사 {examNumber}회</div>
                <div className="exam-info">
                  {isCompleted && (
                    <span className="completed-badge">완료</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="selection-footer">
          <button className="btn-back" onClick={handleBack}>
            뒤로 가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaidExamSelectionPage

