import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { storage } from '../utils/localStorage'
import '../styles/PaymentSuccessPage.css'

function PaymentSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { name, paymentAmount } = location.state || {}

  useEffect(() => {
    // 결제 정보 확인
    const paymentInfo = storage.getPaymentInfo()
    if (!paymentInfo) {
      // 결제 정보가 없으면 메인 페이지로 이동
      navigate('/')
    }
  }, [navigate])

  // 모의고사 시작하기
  const handleStartExam = () => {
    // 유료 시험 선택 페이지로 이동
    navigate('/exam/paid/select')
  }

  // 메인으로 가기
  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="payment-success-page">
      <div className="success-container">
        {/* 축하 메시지 */}
        <div className="success-icon">🎉</div>
        <h1 className="success-title">결제가 완료되었습니다!</h1>
        
        {name && (
          <p className="success-greeting">{name}님, 감사합니다.</p>
        )}

        <div className="success-message">
          <p className="message-main">
            <strong>축하합니다! 3개월 동안 모든 모의고사를 이용할 수 있습니다.</strong>
          </p>
          <p className="message-sub">
            총 10회의 모의고사(각 80문항)를 자유롭게 이용하실 수 있습니다.
          </p>
          <p className="message-sub">
            시험 결과는 3개월 동안 저장되며, 언제든지 다시 확인할 수 있습니다.
          </p>
        </div>

        {/* 결제 정보 */}
        {paymentAmount && (
          <div className="payment-summary">
            <div className="summary-item">
              <span className="summary-label">결제 금액</span>
              <span className="summary-value">{paymentAmount.toLocaleString()}원</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">이용 기간</span>
              <span className="summary-value">3개월</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">모의고사 횟수</span>
              <span className="summary-value">10회</span>
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="success-notice">
          <p>💡 자동 로그인이 설정되었습니다.</p>
          <p>3개월 동안 로그인 없이 서비스를 이용하실 수 있습니다.</p>
        </div>

        {/* 버튼 영역 */}
        <div className="success-actions">
          <button
            className="btn-start-exam"
            onClick={handleStartExam}
          >
            모의고사 1회 시작하기
          </button>
          <button
            className="btn-go-home"
            onClick={handleGoHome}
          >
            메인으로 가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage

