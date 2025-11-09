import { useParams, useNavigate } from 'react-router-dom'

function ResultPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="result-page">
      <h1>결과 페이지</h1>
      <p>시도 ID: {attemptId}</p>
      <button onClick={() => navigate(`/wrong/${attemptId}`)}>
        틀린 문제 풀기
      </button>
      <button onClick={() => navigate('/exam')}>다시 풀기</button>
    </div>
  )
}

export default ResultPage

