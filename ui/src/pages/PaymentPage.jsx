import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { storage } from '../utils/localStorage'
import '../styles/PaymentPage.css'

function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const attemptId = location.state?.attemptId || null

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  const [errors, setErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)

  // 결제 금액 (10회 모의고사)
  const paymentAmount = 99000
  
  // 문의 이메일 (PRD에 명시된 이용안내/문의 이메일)
  const contactEmail = 'support@carecbt.com'

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
  }

  // 전화번호 포맷팅 (010-XXXX-XXXX)
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    // 하이픈 추가
    if (value.length > 3 && value.length <= 7) {
      value = value.slice(0, 3) + '-' + value.slice(3)
    } else if (value.length > 7) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7)
    }
    
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }))
    
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: '',
      }))
    }
  }

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {}

    // 이름 검증
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = '이름을 입력해주세요 (2자 이상)'
    }

    // 전화번호 검증 (11자리 숫자)
    if (!formData.phone || formData.phone.replace(/\D/g, '').length !== 11) {
      newErrors.phone = '전화번호를 정확히 입력해주세요 (010-XXXX-XXXX)'
    }

    // 이용약관 동의 검증
    if (!agreedToTerms) {
      newErrors.terms = '이용약관에 동의해주세요'
    }

    // 개인정보 처리 방침 동의 검증
    if (!agreedToPrivacy) {
      newErrors.privacy = '개인정보 처리 방침에 동의해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 결제 처리
  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('결제 처리 시작')

    if (!validateForm()) {
      console.log('유효성 검사 실패')
      return
    }

    setIsProcessing(true)

    try {
      console.log('결제 정보:', formData)

      // 결제 API 호출 (추후 구현)
      // const response = await paymentAPI.processPayment({
      //   amount: paymentAmount,
      //   name: formData.name,
      //   phone: formData.phone,
      //   attemptId: attemptId,
      // })

      // Mock 결제 처리 (실제 환경에서는 PG사 API 연동)
      console.log('Mock 결제 처리 시작...')
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log('Mock 결제 처리 완료')

      // 결제 정보 저장 (자동 로그인용)
      const paymentInfo = {
        name: formData.name,
        phone: formData.phone,
        paidAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3개월 후
        paymentAmount: paymentAmount,
      }
      
      console.log('결제 정보 저장 시작:', paymentInfo)
      
      // 로컬 스토리지에 저장 (3개월간 유지)
      try {
        storage.savePaymentInfo(paymentInfo)
        console.log('결제 정보 저장 완료')
        
        // 저장 확인
        const savedInfo = storage.getPaymentInfo()
        if (!savedInfo) {
          throw new Error('결제 정보 저장 확인 실패')
        }
        console.log('저장된 결제 정보 확인:', savedInfo)
      } catch (saveError) {
        console.error('결제 정보 저장 오류:', saveError)
        throw new Error('결제 정보 저장에 실패했습니다: ' + saveError.message)
      }

      // 결제 완료 페이지로 이동
      console.log('결제 완료 페이지로 이동')
      navigate('/payment/success', {
        state: {
          name: formData.name,
          paymentAmount: paymentAmount,
        },
      })
    } catch (error) {
      console.error('결제 오류 상세:', error)
      console.error('오류 스택:', error.stack)
      alert(`결제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}\n\n브라우저 콘솔을 확인해주세요.`)
    } finally {
      setIsProcessing(false)
    }
  }

  // 뒤로 가기
  const handleBack = () => {
    if (attemptId) {
      navigate(`/result/${attemptId}`)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* 결제 금액 및 안내 영역 */}
        <div className="payment-info-section">
          <h1 className="payment-title">10회 모의고사 구매</h1>
          <div className="payment-amount">
            <span className="amount-label">결제 금액</span>
            <span className="amount-value">{paymentAmount.toLocaleString()}원</span>
          </div>
          <div className="payment-notice">
            <p><strong>시험 결과는 3개월 동안 저장됩니다.</strong></p>
            <p>구매 후 언제든지 10회 모의고사(각 80문항)를 이용하실 수 있습니다.</p>
            <p className="notice-sub">문의사항: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
          </div>
        </div>

        {/* 결제 정보 입력 폼 */}
        <form className="payment-form" onSubmit={handleSubmit}>
          <h2 className="form-title">구매자 정보</h2>

          {/* 이름 */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              이름 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="홍길동"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          {/* 전화번호 */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              전화번호 <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={handlePhoneChange}
              maxLength="13"
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
            <p className="input-help">결제 완료 후 영수증과 이용 안내를 전화번호로 보내드립니다.</p>
          </div>

          {/* 이용약관 및 개인정보 처리 방침 동의 */}
          <div className="form-group agreement-section">
            <div className="agreement-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked)
                    if (errors.terms) {
                      setErrors((prev) => ({
                        ...prev,
                        terms: '',
                      }))
                    }
                  }}
                  className="checkbox-input"
                />
                <span>
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="agreement-link">
                    이용약관
                  </a>
                  에 동의합니다 <span className="required">*</span>
                </span>
              </label>
              {errors.terms && (
                <span className="error-message">{errors.terms}</span>
              )}
            </div>

            <div className="agreement-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => {
                    setAgreedToPrivacy(e.target.checked)
                    if (errors.privacy) {
                      setErrors((prev) => ({
                        ...prev,
                        privacy: '',
                      }))
                    }
                  }}
                  className="checkbox-input"
                />
                <span>
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="agreement-link">
                    개인정보 처리 방침
                  </a>
                  에 동의합니다 <span className="required">*</span>
                </span>
              </label>
              {errors.privacy && (
                <span className="error-message">{errors.privacy}</span>
              )}
            </div>

            <div className="privacy-notice">
              <p><strong>개인정보 수집 안내</strong></p>
              <p>본 서비스는 로그인 없이 이용 가능하며, 결제에 필요한 최소한의 정보만 수집합니다.</p>
              <ul>
                <li>수집 항목: 이름, 전화번호</li>
                <li>수집 목적: 결제 처리, 서비스 제공, 영수증 발송</li>
                <li>보유 기간: 결제 완료 후 3개월 (시험 결과 보관 기간)</li>
              </ul>
              <p>쿠키 및 로컬 스토리지 사용: 시험 진행 상태 저장 및 자동 로그인 유지를 위해 사용되며, 브라우저 설정에서 관리할 수 있습니다.</p>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleBack}
              disabled={isProcessing}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isProcessing}
            >
              {isProcessing ? '결제 중...' : `${paymentAmount.toLocaleString()}원 결제하기`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentPage
