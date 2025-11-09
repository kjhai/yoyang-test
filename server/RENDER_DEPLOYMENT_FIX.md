# Render.com 배포 오류 해결 가이드

## 문제: "Cannot read properties of undefined (reading 'searchParams')"

이 오류는 데이터베이스 연결 설정에서 발생하는 문제입니다.

## 해결 방법

### 1. Render.com 환경 변수 설정

Render.com 대시보드에서 다음 환경 변수를 설정하세요:

1. **서비스 페이지로 이동**
   - 백엔드 서비스 선택
   - "Environment" 탭 클릭

2. **환경 변수 추가**
   - `DATABASE_URL`: PostgreSQL 데이터베이스의 **Internal Database URL** 사용
     - 주의: **External Database URL**이 아닌 **Internal Database URL**을 사용해야 합니다
     - Internal Database URL은 Render.com 서비스 간 통신에 최적화되어 있습니다
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (또는 Render.com이 자동으로 설정)

3. **DATABASE_URL 가져오기**
   - Render.com 대시보드 → PostgreSQL 데이터베이스 선택
   - "Connections" 탭 클릭
   - **Internal Database URL** 복사
   - 예시: `postgresql://user:password@dpg-xxxxx-a/carecbt`

### 2. 환경 변수 확인

환경 변수가 올바르게 설정되었는지 확인:

```
DATABASE_URL=postgresql://user:password@dpg-xxxxx-a/carecbt
NODE_ENV=production
PORT=10000
```

### 3. 수정된 코드

다음 수정사항이 적용되었습니다:

1. **에러 처리 개선**: URL 파싱 시 에러 처리 추가
2. **SSL 설정 개선**: Render.com 데이터베이스 자동 감지 및 SSL 설정
3. **로깅 개선**: 프로덕션 환경에서도 로그 출력
4. **에러 메시지 개선**: 더 명확한 에러 메시지 제공

### 4. 재배포

코드를 수정한 후:

1. GitHub에 푸시
   ```bash
   git add .
   git commit -m "Fix database connection for Render.com"
   git push
   ```

2. Render.com에서 자동 재배포 대기
   - 또는 "Manual Deploy" → "Deploy latest commit" 클릭

### 5. 배포 확인

배포가 완료되면:

1. **로그 확인**
   - 서비스 페이지 → "Logs" 탭
   - 다음 메시지 확인:
     ```
     ✅ Database connection test successful
     ✅ Database schema initialized successfully
     🚀 Server is running on port 10000
     ```

2. **헬스 체크**
   - 브라우저에서 `https://your-service.onrender.com/healthz` 접속
   - 다음 응답 확인:
     ```json
     {
       "status": "ok",
       "database": "connected"
     }
     ```

## 문제 해결

### DATABASE_URL이 설정되지 않음

**증상:**
```
❌ DATABASE_URL or DB_NAME is not set!
```

**해결:**
- Render.com 환경 변수에 `DATABASE_URL` 추가
- Internal Database URL 사용

### SSL 연결 오류

**증상:**
```
SSL connection required
```

**해결:**
- 코드에서 자동으로 SSL 설정이 적용됩니다
- Render.com 데이터베이스는 자동으로 감지되어 SSL이 활성화됩니다

### 데이터베이스 연결 실패

**증상:**
```
❌ Database connection failed
```

**해결:**
1. Internal Database URL 사용 (External이 아님)
2. 데이터베이스가 실행 중인지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 테이블이 이미 존재함

**증상:**
```
relation "exams" already exists
```

**해결:**
- 이는 정상입니다
- `CREATE TABLE IF NOT EXISTS` 구문을 사용하므로 안전합니다
- 서버는 계속 실행됩니다

## 추가 참고사항

### Internal vs External Database URL

- **Internal Database URL**: Render.com 서비스 간 통신용 (더 빠르고 안정적)
- **External Database URL**: 외부에서 접근할 때 사용 (로컬 개발용)

Render.com에서 배포할 때는 **Internal Database URL**을 사용해야 합니다.

### 환경 변수 설정 위치

1. **서비스별 환경 변수**: 각 서비스의 "Environment" 탭에서 설정
2. **데이터베이스 연결**: PostgreSQL 데이터베이스의 "Connections" 탭에서 URL 복사

### 로그 확인

배포 중 문제가 발생하면:

1. "Logs" 탭에서 로그 확인
2. 에러 메시지 확인
3. 환경 변수 설정 확인
4. 데이터베이스 상태 확인

## 성공적인 배포 확인

배포가 성공하면 다음 로그를 볼 수 있습니다:

```
📊 Database config: { connectionString: '***', ssl: { rejectUnauthorized: false }, isRenderDB: true, isProduction: true }
🔌 Testing database connection...
✅ Database connection test successful
📅 Database time: 2024-11-09T14:30:00.000Z
🔧 Initializing database...
✅ Database schema initialized successfully
🌱 Seeding initial data...
✅ Initial exam data seeded
✅ Database initialization completed
🚀 Server is running on port 10000
📝 Environment: production
🗄️  Database: configured
```

## 다음 단계

배포가 성공한 후:

1. **API 테스트**: `/healthz` 엔드포인트 테스트
2. **프런트엔드 연결**: 프런트엔드의 `VITE_API_BASE_URL` 설정
3. **기능 테스트**: 전체 기능 테스트

## 도움말

추가 도움이 필요하면:
- Render.com 문서: https://render.com/docs
- 문제 해결 가이드: https://render.com/docs/troubleshooting-deploys

