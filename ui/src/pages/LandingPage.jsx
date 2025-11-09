import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../utils/localStorage'
import '../styles/LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const [isPaidUser, setIsPaidUser] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState(null)

  useEffect(() => {
    // 결제 정보 확인 (자동 로그인 유지)
    const paymentInfo = storage.getPaymentInfo()
    if (paymentInfo) {
      setIsPaidUser(true)
      setPaymentInfo(paymentInfo)
    }
  }, [])

  const handleStartFreeExam = () => {
    navigate('/exam')
  }

  const handleStartPaidExam = () => {
    navigate('/exam/paid/select')
  }

  const handlePurchase = () => {
    navigate('/payment')
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>CareCBT</h1>
        <p className="subtitle">요양보호사 모의고사</p>
        <p className="description">
          실제 시험과 유사한 환경으로 반복 학습 및 오답 정복률을 향상시키세요.
        </p>
        
        {isPaidUser && paymentInfo && (
          <div className="paid-user-notice">
            <p>✅ {paymentInfo.name}님, 3개월 동안 유료 모의고사를 이용하실 수 있습니다.</p>
            <p className="expires-info">
              이용 기간: {new Date(paymentInfo.expiresAt).toLocaleDateString('ko-KR')}까지
            </p>
          </div>
        )}

        <div className="button-group">
          {!isPaidUser && (
            <button className="start-button" onClick={handleStartFreeExam}>
              20문항 무료로 시작하기
            </button>
          )}
          
          {isPaidUser ? (
            <button className="start-button paid-button" onClick={handleStartPaidExam}>
              유료 모의고사 시작하기 (80문항)
            </button>
          ) : (
            <button className="start-button purchase-button" onClick={handlePurchase}>
              10회 모의고사 구매하기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LandingPage

