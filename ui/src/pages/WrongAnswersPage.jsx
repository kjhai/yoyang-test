import { useParams } from 'react-router-dom'

function WrongAnswersPage() {
  const { attemptId } = useParams()

  return (
    <div className="wrong-answers-page">
      <h1>오답 모드</h1>
      <p>시도 ID: {attemptId}</p>
      <p>오답 모드 페이지 구현 예정</p>
    </div>
  )
}

export default WrongAnswersPage

