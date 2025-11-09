import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ExamPage from './pages/ExamPage'
import ResultPage from './pages/ResultPage'
import WrongAnswersPage from './pages/WrongAnswersPage'
import ExplanationsPage from './pages/ExplanationsPage'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaidExamSelectionPage from './pages/PaidExamSelectionPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminSalesPage from './pages/AdminSalesPage'
import AdminUploadPage from './pages/AdminUploadPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/exam/paid/select" element={<PaidExamSelectionPage />} />
        <Route path="/exam/paid" element={<ExamPage />} />
        <Route path="/result/:attemptId" element={<ResultPage />} />
        <Route path="/wrong/:attemptId" element={<WrongAnswersPage />} />
        <Route path="/explanations/:attemptId" element={<ExplanationsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/sales" element={<AdminSalesPage />} />
        <Route path="/admin/upload" element={<AdminUploadPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
