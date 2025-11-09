import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/AdminSalesPage.css'

function AdminSalesPage() {
  const navigate = useNavigate()
  const [salesData, setSalesData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // 로그인 확인
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('carecbt_admin_logged_in') === 'true'
    if (!isLoggedIn) {
      navigate('/admin/login')
      return
    }

    // 판매 데이터 로드
    loadSalesData()
  }, [navigate])

  // 판매 데이터 로드
  const loadSalesData = async () => {
    try {
      setIsLoading(true)
      
      // API 호출 (추후 구현)
      // const response = await adminAPI.getSalesData()
      // setSalesData(response.data)

      // Mock 데이터 (로컬 스토리지에서 결제 정보 가져오기)
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // 로컬 스토리지에서 모든 결제 정보 가져오기
      const allPayments = []
      
      // carecbt_payment_info 확인 (현재 저장된 결제 정보)
      const singlePaymentInfo = localStorage.getItem('carecbt_payment_info')
      if (singlePaymentInfo) {
        try {
          const payment = JSON.parse(singlePaymentInfo)
          allPayments.push(payment)
        } catch (e) {
          console.error('결제 정보 파싱 오류:', e)
        }
      }

      // carecbt_all_payments 확인 (모든 결제 정보 배열)
      const allPaymentsStr = localStorage.getItem('carecbt_all_payments')
      if (allPaymentsStr) {
        try {
          const payments = JSON.parse(allPaymentsStr)
          allPayments.push(...payments)
        } catch (e) {
          console.error('결제 목록 파싱 오류:', e)
        }
      }

      // 중복 제거 (같은 전화번호와 결제일 기준)
      const uniquePayments = []
      const seen = new Set()
      allPayments.forEach((payment) => {
        const key = `${payment.phone}_${payment.paidAt}`
        if (!seen.has(key)) {
          seen.add(key)
          uniquePayments.push(payment)
        }
      })

      // 날짜별로 계산
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      let todayCount = 0
      let thisMonthCount = 0
      const totalCount = uniquePayments.length

      uniquePayments.forEach((payment) => {
        if (payment.paidAt) {
          const paidAt = new Date(payment.paidAt)
          if (paidAt >= today) {
            todayCount++
          }
          if (paidAt >= thisMonthStart) {
            thisMonthCount++
          }
        }
      })

      // 결제 목록 정렬 (최신순)
      const sortedPayments = uniquePayments.sort((a, b) => {
        const dateA = a.paidAt ? new Date(a.paidAt) : new Date(0)
        const dateB = b.paidAt ? new Date(b.paidAt) : new Date(0)
        return dateB - dateA
      })

      setSalesData({
        today: todayCount,
        thisMonth: thisMonthCount,
        total: totalCount,
        payments: sortedPayments.map((payment) => ({
          name: payment.name || '알 수 없음',
          phone: payment.phone || '-',
          paymentDate: payment.paidAt ? new Date(payment.paidAt) : null,
          endDate: payment.expiresAt ? new Date(payment.expiresAt) : null,
        })),
      })
    } catch (error) {
      console.error('판매 데이터 로드 오류:', error)
      // 에러 시 빈 데이터 설정
      setSalesData({
        today: 0,
        thisMonth: 0,
        total: 0,
        payments: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('carecbt_admin_token')
    localStorage.removeItem('carecbt_admin_username')
    localStorage.removeItem('carecbt_admin_logged_in')
    navigate('/admin/login')
  }

  // 날짜 포맷팅 (MM/DD)
  const formatDate = (date) => {
    if (!date) return '-'
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}/${day}`
  }

  // 검색 필터링
  const filteredPayments = salesData?.payments
    ? salesData.payments.filter((payment) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        const name = payment.name?.toLowerCase() || ''
        const phone = payment.phone?.toLowerCase() || ''
        return name.includes(term) || phone.includes(term)
      })
    : []

  if (isLoading) {
    return (
      <div className="admin-sales-page">
        <div className="loading">판매 현황을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="admin-sales-page">
      <div className="admin-sales-container">
        {/* 헤더 */}
        <div className="admin-sales-header">
          <h1 className="sales-title">판매·결제 현황</h1>
          <button className="btn-logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        {/* 요약 섹션 */}
        <div className="sales-summary">
          <div className="summary-item">
            <span className="summary-label">오늘 결제</span>
            <span className="summary-value">{salesData?.today || 0}건</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">이번달 결제</span>
            <span className="summary-value">{salesData?.thisMonth || 0}건</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">총 결제</span>
            <span className="summary-value">{salesData?.total || 0}건</span>
          </div>
        </div>

        {/* 구분선 */}
        <div className="divider"></div>

        {/* 검색 영역 */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="이름 또는 전화번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 결제 목록 테이블 */}
        <div className="sales-table-container">
          <table className="sales-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>전화번호</th>
                <th>결제일</th>
                <th>종료일</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.name}</td>
                    <td className="phone-number">{payment.phone}</td>
                    <td className="payment-date">{formatDate(payment.paymentDate)}</td>
                    <td className="end-date">{formatDate(payment.endDate)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    {searchTerm ? '검색 결과가 없습니다.' : '결제 내역이 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 더보기 표시 (데이터가 많을 경우) */}
        {filteredPayments.length > 0 && (
          <div className="more-indicator">...</div>
        )}
      </div>
    </div>
  )
}

export default AdminSalesPage

