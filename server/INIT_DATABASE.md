# 데이터베이스 스키마 초기화 가이드

## Render.com 데이터베이스 스키마 생성

### 1. .env 파일 설정

`server/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Render.com PostgreSQL 데이터베이스 연결 정보
DATABASE_URL=postgresql://user:password@host:port/database

# 또는 개별 설정 사용
# DB_USER=your_user
# DB_HOST=your_host
# DB_NAME=carecbt
# DB_PASSWORD=your_password
# DB_PORT=5432

# 환경 설정
NODE_ENV=production
```

**Render.com에서 DATABASE_URL 가져오기:**
1. Render.com 대시보드에서 PostgreSQL 데이터베이스 선택
2. "Connections" 섹션에서 **External Database URL** 복사
3. `.env` 파일의 `DATABASE_URL`에 붙여넣기

### 2. 데이터베이스 연결 테스트

```bash
cd server
npm run test-connection
```

성공하면 다음 메시지가 표시됩니다:
```
✅ Database connection test successful
📅 Database time: 2024-01-01T00:00:00.000Z
```

### 3. 데이터베이스 스키마 생성

```bash
cd server
npm run init-db
```

이 명령어는 다음을 수행합니다:
1. 데이터베이스 연결 테스트
2. 테이블 생성 (exams, questions, exam_questions, attempts, answers, imports)
3. 인덱스 생성
4. 초기 데이터 시드 (무료 시험 생성)

### 4. 생성되는 테이블

#### exams (시험 테이블)
- `id`: 시험 ID
- `exam_type`: 시험 유형 (요양, 간호 등)
- `exam_code`: 시험 코드
- `title`: 시험 제목
- `is_free`: 무료 시험 여부
- `question_count`: 문항 수
- `created_at`: 생성일시

#### questions (문항 테이블)
- `id`: 문항 ID
- `question_id`: 문항 고유 ID
- `version`: 문항 버전
- `stem`: 문제 지문
- `opt1` ~ `opt5`: 보기 1~5
- `answer`: 정답 (1~5)
- `explanation`: 해설
- `tags`: 태그
- `media_url`: 미디어 URL
- `created_at`: 생성일시

#### exam_questions (시험-문항 매핑 테이블)
- `id`: 매핑 ID
- `exam_id`: 시험 ID
- `question_id`: 문항 ID
- `order_no`: 문항 순서

#### attempts (시도 테이블)
- `id`: 시도 ID
- `exam_id`: 시험 ID
- `shuffle_seed`: 셔플 시드
- `started_at`: 시작일시
- `submitted_at`: 제출일시
- `score`: 점수
- `total`: 총 문항 수
- `client_meta`: 클라이언트 메타데이터 (JSON)
- `created_at`: 생성일시

#### answers (답안 테이블)
- `id`: 답안 ID
- `attempt_id`: 시도 ID
- `question_id`: 문항 ID
- `chosen_option`: 선택한 보기 (1~5)
- `is_correct`: 정답 여부
- `updated_at`: 수정일시

#### imports (업로드 로그 테이블)
- `id`: 로그 ID
- `filename`: 파일명
- `rows_ok`: 성공한 행 수
- `rows_fail`: 실패한 행 수
- `created_by`: 생성자
- `created_at`: 생성일시

### 5. 문제 해결

#### 데이터베이스 연결 실패
- `.env` 파일의 `DATABASE_URL`이 올바른지 확인
- Render.com에서 데이터베이스가 실행 중인지 확인
- 방화벽 설정 확인 (Render.com은 자동으로 처리)

#### 테이블이 이미 존재하는 경우
- `CREATE TABLE IF NOT EXISTS` 구문을 사용하므로 안전하게 재실행 가능
- 기존 데이터는 유지됩니다

#### 초기 데이터가 이미 존재하는 경우
- 무료 시험 데이터는 중복 생성되지 않습니다
- 이미 존재하면 메시지만 표시됩니다

### 6. 다음 단계

스키마 생성 후:
1. CSV 파일을 통해 문항 데이터 추가 (관리자 업로드 기능 사용)
2. 또는 직접 SQL로 문항 데이터 삽입
3. 백엔드 서버 시작 및 테스트

### 7. 스키마 확인

데이터베이스에 연결하여 테이블이 생성되었는지 확인:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- exams 테이블 확인
SELECT * FROM exams;

-- questions 테이블 확인
SELECT COUNT(*) FROM questions;
```

### 8. 주의사항

- **프로덕션 환경**: 데이터베이스 초기화는 신중하게 수행하세요
- **데이터 백업**: 중요한 데이터가 있다면 백업 후 실행
- **환경 변수**: `.env` 파일은 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)

