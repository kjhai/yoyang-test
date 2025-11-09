import { useNavigate } from 'react-router-dom'
import '../styles/LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  const handleStartExam = () => {
    navigate('/exam')
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>CareCBT</h1>
        <p className="subtitle">요양보호사 모의고사</p>
        <p className="description">
          실제 시험과 유사한 환경으로 반복 학습 및 오답 정복률을 향상시키세요.
        </p>
        <button className="start-button" onClick={handleStartExam}>
          20문항 무료로 시작하기
        </button>
      </div>
    </div>
  )
}

export default LandingPage

