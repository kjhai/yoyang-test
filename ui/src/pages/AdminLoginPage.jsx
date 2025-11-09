import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/AdminLoginPage.css'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
    if (loginError) {
      setLoginError('')
    }
  }

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {}

    // 아이디 검증
    if (!formData.username || formData.username.trim().length === 0) {
      newErrors.username = '아이디를 입력해주세요'
    }

    // 비밀번호 검증
    if (!formData.password || formData.password.length === 0) {
      newErrors.password = '비밀번호를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 로그인 처리
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setLoginError('')

    try {
      // 관리자 로그인 API 호출 (추후 구현)
      // const response = await adminAPI.login({
      //   username: formData.username,
      //   password: formData.password,
      // })

      // Mock 로그인 처리 (실제 환경에서는 백엔드 API 연동)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 간단한 인증 체크 (실제로는 서버에서 검증)
      // 개발 환경에서는 특정 아이디/비밀번호로 로그인 가능
      const isAdmin = 
        (formData.username === 'admin' && formData.password === 'admin123') ||
        (formData.username === 'carecbt' && formData.password === 'carecbt2024')

      if (!isAdmin) {
        setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.')
        setIsLoading(false)
        return
      }

      // 로그인 성공 - 토큰 저장 (실제로는 서버에서 받은 토큰)
      const adminToken = `admin_token_${Date.now()}`
      localStorage.setItem('carecbt_admin_token', adminToken)
      localStorage.setItem('carecbt_admin_username', formData.username)
      localStorage.setItem('carecbt_admin_logged_in', 'true')

      // 관리자 판매 현황 페이지로 이동
      navigate('/admin/sales')
    } catch (error) {
      console.error('로그인 오류:', error)
      setLoginError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  // 뒤로 가기
  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        {/* 헤더 */}
        <div className="admin-login-header">
          <button 
            className="back-button" 
            onClick={handleBack}
            aria-label="뒤로 가기"
          >
            ←
          </button>
          <h1 className="admin-login-title">관리자 로그인</h1>
          <div className="header-spacer"></div>
        </div>

        {/* 로그인 폼 */}
        <form className="admin-login-form" onSubmit={handleSubmit}>
          {/* 아이디 */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              아이디 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="아이디를 입력하세요"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="username"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호 <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* 로그인 에러 메시지 */}
          {loginError && (
            <div className="login-error">
              {loginError}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="btn-login"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인 하기'}
          </button>
        </form>

        {/* 개발 환경 안내 */}
        <div className="dev-notice">
          <p>개발 환경: admin/admin123 또는 carecbt/carecbt2024</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage

