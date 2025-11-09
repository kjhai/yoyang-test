# CareCBT - 요양보호사 모의고사 웹 앱

## 프로젝트 개요

요양보호사 모의고사를 모바일 우선으로 제공하는 웹 앱입니다.

## 기술 스택

- **프레임워크**: React 19
- **빌드 도구**: Vite
- **라우팅**: React Router DOM
- **상태 관리**: Zustand
- **언어**: JavaScript (Vanilla JS)

## 시작하기

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
npm run build
```

### 미리보기

```bash
npm run preview
```

## 프로젝트 구조

```
ui/
├── src/
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── LandingPage.jsx
│   │   ├── ExamPage.jsx
│   │   ├── ResultPage.jsx
│   │   ├── WrongAnswersPage.jsx
│   │   └── AdminUploadPage.jsx
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── stores/         # Zustand 스토어
│   │   └── examStore.js
│   ├── utils/          # 유틸리티 함수
│   │   ├── api.js
│   │   └── localStorage.js
│   ├── styles/         # 스타일 파일
│   ├── App.jsx         # 메인 앱 컴포넌트
│   ├── main.jsx        # 진입점
│   └── index.css       # 전역 스타일
├── public/             # 정적 파일
├── vite.config.js      # Vite 설정
└── package.json
```

## 환경 변수

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

`.env.example` 파일을 참고하세요.

## 스크립트

- `npm run dev` - 개발 서버 시작
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드 미리보기
- `npm run lint` - ESLint 실행
- `npm run lint:fix` - ESLint 자동 수정
- `npm run format` - Prettier 포맷팅
- `npm run format:check` - Prettier 포맷팅 검사

## 주요 기능

- 무료 20문항 시험
- 실시간 답안 저장
- 결과 페이지 (점수, 정오답)
- 오답 모드
- 문제 해설
- 관리자 CSV 업로드

## 모바일 우선 설계

이 앱은 모바일 우선으로 설계되었습니다. 모든 컴포넌트는 작은 화면에서 최적화되어 있으며, 터치 영역이 충분히 크게 설계되었습니다.

## 라이센스

MIT
