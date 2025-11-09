import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ExamPage from './pages/ExamPage'
import ResultPage from './pages/ResultPage'
import WrongAnswersPage from './pages/WrongAnswersPage'
import AdminUploadPage from './pages/AdminUploadPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/result/:attemptId" element={<ResultPage />} />
        <Route path="/wrong/:attemptId" element={<WrongAnswersPage />} />
        <Route path="/admin/upload" element={<AdminUploadPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
