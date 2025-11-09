# Render.com 데이터베이스 스키마 생성 가이드

## 빠른 시작

### 1. Render.com에서 DATABASE_URL 가져오기

1. Render.com 대시보드 접속
2. PostgreSQL 데이터베이스 선택
3. "Connections" 탭 클릭
4. **External Database URL** 복사
   - 예시: `postgresql://user:password@dpg-xxxxx-a.singapore-postgres.render.com/carecbt`

### 2. .env 파일 생성

`server/.env` 파일을 생성하고 다음 내용을 추가:

```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
```

**주의**: `DATABASE_URL`은 Render.com에서 복사한 **External Database URL**을 사용하세요.

### 3. 데이터베이스 스키마 생성

```bash
cd server
npm run init-render-db
```

또는 환경 변수를 직접 지정:

```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://user:password@host:port/database"
npm run init-render-db

# Linux/Mac
DATABASE_URL="postgresql://user:password@host:port/database" npm run init-render-db
```

### 4. 결과 확인

성공하면 다음과 같은 메시지가 표시됩니다:

```
✅ Database initialization completed successfully!

📊 Created tables:
   - exams (시험 테이블)
   - questions (문항 테이블)
   - exam_questions (시험-문항 매핑 테이블)
   - attempts (시도 테이블)
   - answers (답안 테이블)
   - imports (업로드 로그 테이블)

🌱 Seeded initial data:
   - Free exam (무료 시험)
```

## 생성되는 테이블

### exams (시험 테이블)
- 시험 정보 저장
- 초기 데이터: 무료 시험 1개 자동 생성

### questions (문항 테이블)
- 문항 정보 저장
- 문제 지문, 보기, 정답, 해설 등

### exam_questions (시험-문항 매핑 테이블)
- 시험과 문항의 매핑 관계
- 문항 순서 관리

### attempts (시도 테이블)
- 시험 시도 기록
- 셔플 시드, 점수, 제출 시간 등

### answers (답안 테이블)
- 답안 저장
- 자동 채점 결과

### imports (업로드 로그 테이블)
- CSV 업로드 로그
- 성공/실패 행 수 기록

## 문제 해결

### DATABASE_URL이 설정되지 않음

**에러 메시지:**
```
❌ DATABASE_URL is not set!
```

**해결 방법:**
1. `server/.env` 파일 생성
2. `DATABASE_URL` 환경 변수 설정
3. Render.com에서 External Database URL 복사

### 데이터베이스 연결 실패

**에러 메시지:**
```
❌ Database connection failed!
```

**해결 방법:**
1. DATABASE_URL이 올바른지 확인
2. Render.com에서 데이터베이스가 실행 중인지 확인
3. External Database URL을 사용했는지 확인 (Internal은 로컬에서 접근 불가)
4. 방화벽 설정 확인 (Render.com은 자동으로 처리)

### 테이블이 이미 존재함

**에러 메시지:**
```
relation "exams" already exists
```

**해결 방법:**
- 이 에러는 무시해도 됩니다
- `CREATE TABLE IF NOT EXISTS` 구문을 사용하므로 안전하게 재실행 가능
- 기존 데이터는 유지됩니다

### SSL 연결 오류

**에러 메시지:**
```
SSL connection required
```

**해결 방법:**
- Render.com의 External Database URL은 SSL을 사용합니다
- 코드에서 자동으로 SSL 설정이 적용됩니다
- 문제가 지속되면 `database.js`의 SSL 설정 확인

## 다음 단계

스키마 생성 후:

1. **문항 데이터 추가**
   - CSV 파일을 통해 관리자 업로드 기능 사용
   - 또는 직접 SQL로 문항 데이터 삽입

2. **백엔드 서버 시작**
   ```bash
   npm run dev
   ```

3. **테스트**
   - API 엔드포인트 테스트
   - 무료 시험 시작 테스트

## 참고사항

- **Internal Database URL**: Render.com 서버 내부에서만 사용 가능
- **External Database URL**: 외부에서 접근 가능 (로컬 개발용)
- **보안**: External Database URL은 외부에 노출되지 않도록 주의
- **백업**: 중요한 데이터는 정기적으로 백업

## 스키마 확인

데이터베이스에 연결하여 테이블이 생성되었는지 확인:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- exams 테이블 확인
SELECT * FROM exams;

-- 테이블 구조 확인
\d exams
\d questions
\d attempts
\d answers
```

## 추가 도움말

더 자세한 내용은 `INIT_DATABASE.md` 파일을 참조하세요.

