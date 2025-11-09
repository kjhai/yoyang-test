# 환경 변수 설정 가이드

## .env 파일 설정

서버 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요.

### 기본 설정

```env
# 서버 포트
PORT=3000

# 환경 (development / production)
NODE_ENV=development

# 데이터베이스 연결 URL
DATABASE_URL=postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명

# 관리자 인증 토큰
ADMIN_TOKEN=your-secure-admin-token-here

# API 기본 URL
API_BASE_URL=http://localhost:3000/api
```

## 데이터베이스 연결 설정

### 1. 로컬 PostgreSQL 개발 환경

로컬에 PostgreSQL이 설치되어 있는 경우:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/carecbt
```

**설정 방법:**
- `postgres`: 기본 사용자명 (변경 가능)
- `your_password`: PostgreSQL 비밀번호
- `localhost:5432`: 기본 호스트 및 포트
- `carecbt`: 데이터베이스 이름

**PostgreSQL 설치 및 데이터베이스 생성:**

1. PostgreSQL 설치 (https://www.postgresql.org/download/)
2. PostgreSQL 접속:
   ```bash
   psql -U postgres
   ```
3. 데이터베이스 생성:
   ```sql
   CREATE DATABASE carecbt;
   ```
4. 사용자 생성 (선택사항):
   ```sql
   CREATE USER carecbt_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE carecbt TO carecbt_user;
   ```

### 2. Render 무료 플랜 (PRD 권장)

Render에서 PostgreSQL 데이터베이스를 생성한 경우:

```env
DATABASE_URL=postgresql://user:password@dpg-xxxxx-a.singapore-postgres.render.com/carecbt_xxxx
```

**Render에서 가져오는 방법:**
1. Render 대시보드에서 PostgreSQL 데이터베이스 생성
2. "Connect" 또는 "Internal Database URL" 복사
3. `.env` 파일에 `DATABASE_URL`로 설정

**예시:**
```env
DATABASE_URL=postgresql://carecbt_user:abc123xyz@dpg-abc123def456-a.singapore-postgres.render.com/carecbt_db
```

### 3. 다른 클라우드 서비스

#### Neon (무료 PostgreSQL)
```env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/carecbt?sslmode=require
```

#### Supabase
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

#### Railway
```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

## 환경 변수 설명

### PORT
- 서버가 실행될 포트 번호
- 기본값: 3000
- 프런트엔드와 통신하기 위해 3000번 포트 사용 권장

### NODE_ENV
- 실행 환경 설정
- `development`: 개발 환경 (에러 스택 표시)
- `production`: 프로덕션 환경 (에러 스택 숨김)

### DATABASE_URL
- PostgreSQL 데이터베이스 연결 문자열
- 형식: `postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명`
- 필수 항목

### ADMIN_TOKEN
- 관리자 API 인증을 위한 토큰
- 보안을 위해 강력한 랜덤 문자열 사용 권장
- 예시: `admin_abc123xyz789_secret_token`

### API_BASE_URL
- API 기본 URL
- 프런트엔드와의 통신을 위한 기본 URL
- 기본값: `http://localhost:3000/api`

## 보안 주의사항

1. **.env 파일을 Git에 커밋하지 마세요**
   - `.gitignore`에 이미 포함되어 있습니다
   - 실제 비밀번호와 토큰은 공유하지 마세요

2. **강력한 비밀번호 사용**
   - 데이터베이스 비밀번호는 복잡하게 설정하세요
   - 관리자 토큰도 예측하기 어렵게 생성하세요

3. **프로덕션 환경**
   - 프로덕션에서는 환경 변수를 서버 환경에서 직접 설정하세요
   - Render, Vercel 등의 플랫폼에서는 대시보드에서 환경 변수 설정

## 테스트

환경 변수가 제대로 설정되었는지 확인:

```bash
cd server
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '설정 안됨')"
```

서버 실행 시 데이터베이스 연결 상태를 확인할 수 있습니다.

