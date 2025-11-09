# CareCBT 백엔드 서버

요양보호사 모의고사 CBT 앱의 백엔드 서버입니다.

## 기술 스택

- **Node.js** + **Express.js**
- **PostgreSQL** (데이터베이스)
- **ES6 Modules** (ESM)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

```bash
cp .env.example .env
```

`.env` 파일을 수정하여 데이터베이스 연결 정보 등을 설정하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 4. 프로덕션 서버 실행

```bash
npm start
```

## API 엔드포인트

### 시험 관련

- `GET /api/exams/free` - 무료 시험 메타 정보
- `POST /api/attempts` - 시도 생성
- `GET /api/attempts/:id/questions` - 시도별 문항 목록
- `POST /api/answers` - 답안 저장
- `POST /api/attempts/:id/submit` - 시험 제출
- `GET /api/attempts/:id/result` - 결과 조회
- `GET /api/attempts/:id/wrong` - 오답 목록
- `POST /api/answers/:id/correct` - 오답 모드에서 답변 수정

### 관리자 관련

- `POST /api/admin/import/preview` - CSV 업로드 미리보기/검증
- `POST /api/admin/import/commit` - CSV 일괄 반영

## 프로젝트 구조

```
server/
├── src/
│   ├── index.js          # 서버 진입점
│   ├── routes/           # API 라우트
│   ├── controllers/      # 컨트롤러
│   ├── models/           # 데이터 모델
│   ├── middleware/       # 미들웨어
│   ├── utils/            # 유틸리티 함수
│   └── config/           # 설정 파일
├── .env.example          # 환경 변수 예제
├── .gitignore
├── package.json
└── README.md
```

## 데이터베이스

PostgreSQL을 사용합니다. 데이터베이스 스키마는 `schema.sql` 파일에 정의되어 있습니다.

## 개발 가이드

1. 새로운 API 엔드포인트를 추가할 때는 `src/routes/` 폴더에 라우트 파일을 생성하세요.
2. 비즈니스 로직은 `src/controllers/` 폴더에 컨트롤러로 구현하세요.
3. 데이터베이스 쿼리는 `src/models/` 폴더에 모델로 구현하세요.

## 라이센스

ISC

