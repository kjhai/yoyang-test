# 배포 오류 해결 가이드

## "Exited with status 1" 오류 해결 방법

이 문서는 Render.com 배포 시 발생하는 "Exited with status 1" 오류를 해결하는 방법을 설명합니다.

## 일반적인 원인

1. **DATABASE_URL 환경 변수 미설정**
2. **데이터베이스 연결 실패**
3. **의존성 설치 실패**
4. **코드 구문 오류**
5. **메모리 부족 (무료 플랜)**

## 해결 단계

### 1. Render.com 로그 확인

Render.com 대시보드에서 서비스의 "Logs" 탭을 확인하세요.

**확인할 내용:**
- 환경 변수 설정 상태
- 데이터베이스 연결 오류 메시지
- 의존성 설치 오류
- 코드 실행 오류

### 2. 환경 변수 확인

Render.com 대시보드에서 다음 환경 변수가 설정되어 있는지 확인하세요:

**필수 환경 변수:**
- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 URL
- `NODE_ENV`: `production`
- `PORT`: `10000` (또는 Render.com이 자동 설정)

**DATABASE_URL 설정 방법:**
1. Render.com 대시보드 → PostgreSQL 데이터베이스 선택
2. "Connections" 탭 클릭
3. **Internal Database URL** 복사 (External이 아님!)
4. 서비스 → Environment → Add Environment Variable
5. Name: `DATABASE_URL`, Value: (복사한 Internal Database URL)

**예시:**
```
DATABASE_URL=postgresql://user:password@dpg-xxxxx-a.singapore-postgres.render.com/carecbt
```

### 3. 데이터베이스 연결 문제 해결

**문제: DATABASE_URL이 설정되지 않음**

**증상:**
```
❌ DATABASE_URL or DB_NAME is not set!
```

**해결:**
- Render.com 환경 변수에 `DATABASE_URL` 추가
- Internal Database URL 사용 확인

**문제: 데이터베이스 연결 실패**

**증상:**
```
❌ Database connection test failed
```

**해결 방법:**
1. **Internal Database URL 사용 확인**
   - External Database URL이 아닌 Internal Database URL을 사용해야 합니다
   - Render.com 서비스 간 통신에 최적화되어 있습니다

2. **데이터베이스 상태 확인**
   - 데이터베이스가 실행 중인지 확인
   - 데이터베이스가 일시 중지되지 않았는지 확인 (무료 플랜)

3. **SSL 설정 확인**
   - Render.com 데이터베이스는 SSL이 필요합니다
   - 코드에서 자동으로 SSL이 활성화됩니다

4. **데이터베이스 이름 확인**
   - DATABASE_URL에 올바른 데이터베이스 이름이 포함되어 있는지 확인

### 4. 의존성 설치 문제 해결

**문제: npm install 실패**

**해결 방법:**
1. `package.json`의 의존성 확인
2. Node.js 버전 확인 (Render.com은 자동으로 감지)
3. `package-lock.json`이 있는지 확인
4. 빌드 로그에서 구체적인 오류 메시지 확인

### 5. 코드 오류 해결

**문제: 런타임 오류**

**해결 방법:**
1. 로그에서 스택 트레이스 확인
2. 로컬에서 동일한 환경 변수로 테스트
3. 코드 구문 오류 확인
4. 모듈 import 오류 확인

### 6. 메모리 부족 문제 해결

**문제: 무료 플랜 메모리 제한**

**해결 방법:**
1. 불필요한 의존성 제거
2. `--production` 플래그 사용 (이미 적용됨)
3. 메모리 사용량 최적화
4. 필요시 유료 플랜으로 업그레이드

## 로그 분석

### 성공적인 배포 로그

```
🚀 Starting server...
📝 Environment: production
🔌 Port: 10000
🔍 Checking environment variables...
   DATABASE_URL: ✅ set
   DB_NAME: ❌ not set
   DB_USER: ❌ not set
   DB_HOST: ❌ not set

📊 Database config:
   Connection string: postgresql://user:****@dpg-xxxxx-a.singapore-postgres.render.com/carecbt
   SSL: enabled
   Provider: Render.com
   Environment: production

🔌 Testing database connection...
   Attempting to connect to database...
✅ Database connection test successful
📅 Database time: 2024-11-09T14:30:00.000Z
📦 Database version: PostgreSQL 15.4

🔧 Initializing database...
🔧 Initializing database schema...
✅ Database schema initialized successfully

🌱 Seeding initial data...
✅ Initial exam data seeded
✅ Database initialization completed successfully

🌐 Starting HTTP server...

═══════════════════════════════════════════════════
✅ Server started successfully!
═══════════════════════════════════════════════════
🚀 Server is running on port 10000
📝 Environment: production
🗄️  Database: configured
🌐 Health check: http://0.0.0.0:10000/healthz
📡 API endpoint: http://0.0.0.0:10000/api
═══════════════════════════════════════════════════
```

### 일반적인 오류 로그

**DATABASE_URL 미설정:**
```
❌ DATABASE_URL or DB_NAME is not set!
Please set DATABASE_URL environment variable in Render.com dashboard
```

**데이터베이스 연결 실패:**
```
❌ Database connection test failed
   Error message: connection refused
   Error code: ECONNREFUSED
```

**SSL 오류:**
```
❌ Database connection test failed
   Error message: SSL connection required
   💡 Tip: Render.com databases require SSL
```

## 빠른 문제 해결 체크리스트

- [ ] DATABASE_URL 환경 변수가 설정되어 있는가?
- [ ] Internal Database URL을 사용하고 있는가? (External이 아님)
- [ ] 데이터베이스가 실행 중인가?
- [ ] 환경 변수 이름이 정확한가? (대소문자 구분)
- [ ] 서비스와 데이터베이스가 같은 리전에 있는가?
- [ ] 로그에서 구체적인 오류 메시지를 확인했는가?

## 추가 도움말

### Render.com 문서
- [Render.com 문서](https://render.com/docs)
- [문제 해결 가이드](https://render.com/docs/troubleshooting-deploys)
- [환경 변수 설정](https://render.com/docs/environment-variables)
- [데이터베이스 연결](https://render.com/docs/databases)

### 로컬 테스트

배포 전 로컬에서 테스트:

```bash
cd server
npm install
DATABASE_URL=your_database_url NODE_ENV=production PORT=10000 npm start
```

### 헬스 체크

배포 후 헬스 체크 엔드포인트 확인:

```bash
curl https://your-service.onrender.com/healthz
```

예상 응답:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 문제가 계속되면

1. **로그 전체 내용 복사**
2. **환경 변수 설정 스크린샷**
3. **데이터베이스 연결 정보 확인** (비밀번호 제외)
4. **GitHub 이슈 생성** 또는 **지원팀에 문의**

## 변경 사항

### 2024-11-09
- 상세한 로그 메시지 추가
- 환경 변수 검증 개선
- 데이터베이스 연결 에러 처리 개선
- 배포 문제 해결 가이드 작성

