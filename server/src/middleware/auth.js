// 관리자 인증 미들웨어 (간단한 토큰 기반 인증)

export const adminAuth = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '') || 
                req.headers['x-admin-token']

  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: '관리자 토큰이 필요합니다.' 
    })
  }

  // 간단한 토큰 검증 (실제 환경에서는 JWT 등을 사용)
  const adminToken = process.env.ADMIN_TOKEN || 'admin-token'
  
  if (token !== adminToken) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: '유효하지 않은 관리자 토큰입니다.' 
    })
  }

  next()
}

