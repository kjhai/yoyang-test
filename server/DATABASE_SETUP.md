# 데이터베이스 설정 가이드

## 1. PostgreSQL 데이터베이스 생성

### Windows (pgAdmin 또는 명령줄)

1. **pgAdmin 사용:**
   - pgAdmin 실행
   - 서버 연결
   - 데이터베이스 우클릭 → Create → Database
   - Name: `carecbt`
   - Owner: `postgres` (또는 원하는 사용자)
   - Create 클릭

2. **명령줄 사용:**
   ```bash
   # PostgreSQL에 접속
   psql -U postgres
   
   # 데이터베이스 생성
   CREATE DATABASE carecbt;
   
   # 사용자 생성 (선택사항)
   CREATE USER carecbt_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE carecbt TO carecbt_user;
   
   # 종료
   \q
   ```

## 2. .env 파일 설정

`server/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 서버 포트
PORT=3000

# 환경
NODE_ENV=development

# 데이터베이스 연결 URL
# 방법 1: connectionString 사용 (권장)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/carecbt

# 방법 2: 개별 설정 사용 (DATABASE_URL이 없을 경우)
# DB_USER=postgres
# DB_HOST=localhost
# DB_NAME=carecbt
# DB_PASSWORD=your_password
# DB_PORT=5432

# 관리자 인증 토큰
ADMIN_TOKEN=admin_dev_token_change_this

# API 기본 URL
API_BASE_URL=http://localhost:3000/api
```

### DATABASE_URL 형식

```
postgresql://[사용자명]:[비밀번호]@[호스트]:[포트]/[데이터베이스명]
```

**예시:**
- 로컬 기본 설정: `postgresql://postgres:mypassword@localhost:5432/carecbt`
- 다른 사용자: `postgresql://carecbt_user:password123@localhost:5432/carecbt`
- 다른 포트: `postgresql://postgres:mypassword@localhost:5433/carecbt`

## 3. 데이터베이스 초기화

### 방법 1: 스크립트 사용 (권장)

```bash
cd server
npm run init-db
```

### 방법 2: 서버 실행 시 자동 초기화

서버를 실행하면 자동으로 데이터베이스 스키마가 생성됩니다:

```bash
cd server
npm run dev
```

## 4. 연결 확인

### 서버 실행 후 확인

서버를 실행하면 다음과 같은 메시지가 표시됩니다:

```
🔌 Testing database connection...
✅ Database connection test successful
📅 Database time: 2024-01-01 12:00:00
📊 PostgreSQL version: PostgreSQL 15.0
🔧 Initializing database schema...
✅ Database schema initialized successfully
🌱 Seeding initial data...
✅ Initial exam data seeded
✅ Database initialization completed
🚀 Server is running on http://localhost:3000
```

### 헬스 체크 엔드포인트

브라우저나 curl로 확인:

```bash
curl http://localhost:3000/healthz
```

응답:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## 5. 문제 해결

### 연결 오류

1. **"connection refused"**
   - PostgreSQL이 실행 중인지 확인
   - 포트가 올바른지 확인 (기본값: 5432)

2. **"password authentication failed"**
   - 비밀번호가 올바른지 확인
   - `.env` 파일의 `DATABASE_URL` 확인

3. **"database does not exist"**
   - 데이터베이스가 생성되었는지 확인
   - 데이터베이스 이름이 올바른지 확인

4. **"permission denied"**
   - 사용자에게 데이터베이스 접근 권한이 있는지 확인
   - `GRANT ALL PRIVILEGES ON DATABASE carecbt TO 사용자명;`

### 스키마 생성 오류

- 이미 테이블이 존재하는 경우: `IF NOT EXISTS`로 인해 오류 없이 건너뜀
- 권한 문제: 사용자에게 테이블 생성 권한이 있는지 확인

## 6. 데이터베이스 확인

### pgAdmin에서 확인

1. pgAdmin 실행
2. `carecbt` 데이터베이스 선택
3. Schemas → public → Tables에서 생성된 테이블 확인:
   - exams
   - questions
   - exam_questions
   - attempts
   - answers
   - imports

### 명령줄에서 확인

```bash
psql -U postgres -d carecbt

# 테이블 목록 확인
\dt

# exams 테이블 확인
SELECT * FROM exams;

# 종료
\q
```

## 7. 다음 단계

데이터베이스가 준비되었으면:

1. ✅ 서버 실행: `npm run dev`
2. ✅ API 엔드포인트 구현
3. ✅ CSV 업로드 기능 구현
4. ✅ 문항 데이터 추가

