/**
 * 관리자 인증 미들웨어 (간단한 토큰 기반)
 * MVP에서는 간단한 토큰 헤더 검증
 */
export const authenticateAdmin = (req, res, next) => {
  // Authorization 헤더에서 토큰 추출
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1] // "Bearer TOKEN" 형식

  // 간단한 토큰 검증 (실제 환경에서는 JWT 등 사용)
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: '인증 토큰이 필요합니다.',
    })
  }

  // 토큰 검증 (간단한 예시 - 실제로는 데이터베이스나 JWT 검증)
  // MVP에서는 localStorage에 저장된 토큰과 비교
  // 실제 환경에서는 JWT 서명 검증 등 사용
  if (token.startsWith('admin_token_')) {
    req.adminToken = token
    next()
  } else {
    return res.status(403).json({
      error: 'Forbidden',
      message: '유효하지 않은 토큰입니다.',
    })
  }
}
