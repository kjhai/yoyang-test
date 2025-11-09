# 데이터베이스 설정 가이드

## 1. PostgreSQL 데이터베이스 생성

### Windows에서 PostgreSQL 데이터베이스 생성

1. **pgAdmin 사용 (GUI):**
   - pgAdmin 4 실행
   - 서버 연결 (왼쪽 트리에서 Servers → PostgreSQL)
   - Databases 우클릭 → Create → Database
   - Database name: `carecbt`
   - Owner: `postgres` (또는 원하는 사용자)
   - Save 클릭

2. **명령줄 사용 (psql):**
   ```bash
   # PostgreSQL에 접속
   psql -U postgres
   
   # 데이터베이스 생성
   CREATE DATABASE carecbt;
   
   # 확인
   \l
   
   # 종료
   \q
   ```

## 2. .env 파일 설정

`server/.env` 파일을 생성하고 다음 중 하나의 방법을 사용하세요:

### 방법 1: DATABASE_URL 사용 (권장)

```env
PORT=3000
NODE_ENV=development

# 데이터베이스 연결 URL
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/carecbt

ADMIN_TOKEN=admin_dev_token_change_this
API_BASE_URL=http://localhost:3000/api
```

**주의사항:**
- `postgres`: PostgreSQL 사용자명 (기본값)
- `your_password`: 실제 PostgreSQL 비밀번호로 변경
- `carecbt`: 데이터베이스 이름

### 방법 2: 개별 설정 사용

```env
PORT=3000
NODE_ENV=development

# 데이터베이스 개별 설정
DB_USER=postgres
DB_HOST=localhost
DB_NAME=carecbt
DB_PASSWORD=your_password
DB_PORT=5432

ADMIN_TOKEN=admin_dev_token_change_this
API_BASE_URL=http://localhost:3000/api
```

## 3. 연결 테스트

### 방법 1: 연결 테스트 스크립트 실행

```bash
cd server
npm run test-connection
```

성공 메시지:
```
✅ Database connection test successful
📅 Database time: 2024-01-01 12:00:00
📊 PostgreSQL version: PostgreSQL 15.0
```

### 방법 2: 서버 실행 시 자동 테스트

```bash
cd server
npm run dev
```

서버 시작 시 자동으로 데이터베이스 연결을 테스트합니다.

## 4. 데이터베이스 초기화

연결이 성공하면 데이터베이스를 초기화하세요:

```bash
cd server
npm run init-db
```

이 명령은 다음을 수행합니다:
1. 데이터베이스 스키마 생성 (테이블 생성)
2. 초기 데이터 시드 (무료 시험 생성)
3. 인덱스 생성

## 5. 문제 해결

### 오류: "client password must be a string"

**원인:** DATABASE_URL의 비밀번호 형식 문제

**해결 방법:**
1. 비밀번호에 특수문자가 있으면 URL 인코딩 필요
2. 또는 개별 설정 사용 (DB_USER, DB_PASSWORD 등)

**예시:**
- 비밀번호가 `mypass@123`인 경우:
  - URL 인코딩: `mypass%40123`
  - 또는 개별 설정 사용

### 오류: "connection refused"

**원인:** PostgreSQL이 실행되지 않음

**해결 방법:**
1. PostgreSQL 서비스가 실행 중인지 확인
2. Windows: 서비스 관리자에서 PostgreSQL 서비스 시작
3. 포트 확인 (기본값: 5432)

### 오류: "database does not exist"

**원인:** 데이터베이스가 생성되지 않음

**해결 방법:**
1. pgAdmin 또는 psql로 데이터베이스 생성
2. .env 파일의 데이터베이스 이름 확인

### 오류: "password authentication failed"

**원인:** 비밀번호가 잘못됨

**해결 방법:**
1. PostgreSQL 비밀번호 확인
2. .env 파일의 비밀번호 확인
3. 비밀번호에 특수문자가 있으면 URL 인코딩

## 6. 비밀번호 URL 인코딩

비밀번호에 특수문자가 있는 경우 URL 인코딩이 필요합니다:

| 문자 | 인코딩 |
|------|--------|
| @ | %40 |
| # | %23 |
| $ | %24 |
| % | %25 |
| & | %26 |
| + | %2B |
| = | %3D |
| ? | %3F |
| / | %2F |

**예시:**
- 비밀번호: `mypass@123#`
- 인코딩: `mypass%40123%23`
- DATABASE_URL: `postgresql://postgres:mypass%40123%23@localhost:5432/carecbt`

## 7. 확인 사항 체크리스트

- [ ] PostgreSQL 설치 완료
- [ ] PostgreSQL 서비스 실행 중
- [ ] `carecbt` 데이터베이스 생성됨
- [ ] `.env` 파일 생성 및 설정
- [ ] DATABASE_URL 또는 DB_* 설정 완료
- [ ] 비밀번호 올바름
- [ ] 연결 테스트 성공
- [ ] 데이터베이스 초기화 완료

## 8. 다음 단계

데이터베이스가 준비되었으면:

1. ✅ 서버 실행: `npm run dev`
2. ✅ API 엔드포인트 구현
3. ✅ CSV 업로드 기능 구현
4. ✅ 문항 데이터 추가

