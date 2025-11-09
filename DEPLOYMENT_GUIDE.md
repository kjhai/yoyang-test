# Render.com 배포 가이드

이 가이드는 CareCBT 프로젝트를 Render.com에 배포하는 방법을 설명합니다.

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 생성

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인 또는 회원가입

2. **새 PostgreSQL 데이터베이스 생성**
   - "New +" 버튼 클릭
   - "PostgreSQL" 선택
   - 데이터베이스 설정:
     - **Name**: `carecbt-db` (또는 원하는 이름)
     - **Database**: `carecbt` (기본값)
     - **User**: 자동 생성
     - **Region**: `Singapore` (또는 가까운 지역)
     - **PostgreSQL Version**: 최신 버전
     - **Plan**: Free (또는 필요시 유료 플랜)
   - "Create Database" 클릭

3. **데이터베이스 정보 확인**
   - 데이터베이스가 생성되면 "Connections" 섹션에서 연결 정보 확인
   - **Internal Database URL** 복사 (백엔드 서버에서 사용)
   - **External Database URL** 복사 (로컬 개발에서 사용)
   - 예시: `postgres://user:password@dpg-xxxxx-a.singapore-postgres.render.com/carecbt`

### 2단계: 백엔드 서버 배포

1. **GitHub 저장소 준비**
   - 프로젝트를 GitHub에 푸시 (아직 안 했다면)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/yoyang-test.git
   git push -u origin main
   ```

2. **Render.com에서 새 Web Service 생성**
   - "New +" 버튼 클릭
   - "Web Service" 선택
   - GitHub 저장소 연결
   - 저장소 선택 및 연결

3. **백엔드 서비스 설정**
   - **Name**: `carecbt-api` (또는 원하는 이름)
   - **Region**: 데이터베이스와 같은 지역 (예: Singapore)
   - **Branch**: `main` (또는 배포할 브랜치)
   - **Root Directory**: `server` (백엔드 폴더)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (또는 필요시 유료 플랜)

4. **환경 변수 설정**
   - "Environment" 섹션에서 다음 환경 변수 추가:
   
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<Internal Database URL from step 1>
   ```
   
   주의: `DATABASE_URL`은 데이터베이스의 **Internal Database URL**을 사용해야 합니다.
   (내부 통신이므로 더 빠르고 안정적입니다)

5. **서비스 생성 및 배포**
   - "Create Web Service" 클릭
   - 자동으로 빌드 및 배포 시작
   - 배포 완료까지 몇 분 소요

6. **배포 확인**
   - 배포가 완료되면 "Logs" 탭에서 로그 확인
   - 브라우저에서 `https://your-api-name.onrender.com/healthz` 접속
   - 다음 응답 확인:
   ```json
   {
     "status": "ok",
     "database": "connected"
   }
   ```

### 3단계: 데이터베이스 초기화

1. **로컬에서 데이터베이스 초기화 (옵션 1)**
   - 로컬 환경에서 `.env` 파일 설정:
   ```
   DATABASE_URL=<External Database URL from step 1>
   ```
   - 데이터베이스 초기화 실행:
   ```bash
   cd server
   npm run init-db
   ```

2. **Render.com 서버에서 데이터베이스 초기화 (옵션 2)**
   - 서버가 시작될 때 자동으로 초기화됨 (`server/src/index.js`의 `startServer` 함수에서)
   - 또는 Render.com의 "Shell" 탭에서 직접 실행:
   ```bash
   cd server
   npm run init-db
   ```

3. **문항 데이터 추가**
   - CSV 파일을 통해 문항 데이터 추가 (관리자 업로드 기능 사용)
   - 또는 직접 SQL로 데이터 삽입

### 4단계: 프런트엔드 배포

1. **프런트엔드 환경 변수 설정**
   - `ui/.env` 파일 생성 (로컬 개발용):
   ```
   VITE_API_BASE_URL=https://your-api-name.onrender.com/api
   ```
   - 주의: `.env` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)

2. **Render.com에서 새 Static Site 생성**
   - "New +" 버튼 클릭
   - "Static Site" 선택
   - GitHub 저장소 연결 (같은 저장소)

3. **프런트엔드 서비스 설정**
   - **Name**: `carecbt-web` (또는 원하는 이름)
   - **Branch**: `main`
   - **Root Directory**: `ui` (프런트엔드 폴더)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **환경 변수 설정**
   - "Environment" 섹션에서 환경 변수 추가:
   ```
   VITE_API_BASE_URL=https://your-api-name.onrender.com/api
   ```
   - 주의: Render.com의 Static Site는 빌드 시에만 환경 변수를 사용합니다.
   - 환경 변수는 `VITE_` 접두사가 있어야 Vite에서 접근 가능합니다.

5. **서비스 생성 및 배포**
   - "Create Static Site" 클릭
   - 자동으로 빌드 및 배포 시작
   - 배포 완료까지 몇 분 소요

6. **배포 확인**
   - 배포가 완료되면 제공된 URL로 접속
   - 예: `https://carecbt-web.onrender.com`
   - 앱이 정상적으로 동작하는지 확인

### 5단계: CORS 설정 확인

백엔드 서버의 CORS 설정이 프런트엔드 도메인을 허용하는지 확인:

1. `server/src/index.js`에서 CORS 설정 확인:
   ```javascript
   app.use(cors()) // 모든 도메인 허용 (개발용)
   ```

2. 프로덕션 환경에서는 특정 도메인만 허용하도록 설정 권장:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'https://carecbt-web.onrender.com',
     credentials: true
   }))
   ```

### 6단계: 테스트

1. **프런트엔드 테스트**
   - 웹사이트 접속
   - 무료 시험 시작
   - 문제 풀이
   - 답안 제출
   - 결과 확인

2. **백엔드 API 테스트**
   - API 엔드포인트 직접 테스트:
   - `https://your-api-name.onrender.com/api/exams/free`
   - `https://your-api-name.onrender.com/healthz`

3. **데이터베이스 연결 테스트**
   - 백엔드 로그에서 데이터베이스 연결 확인
   - 헬스 체크 엔드포인트에서 데이터베이스 상태 확인

## 문제 해결

### 데이터베이스 연결 실패
- **문제**: "Database connection failed"
- **해결**:
  - `DATABASE_URL`이 올바른지 확인 (Internal Database URL 사용)
  - 데이터베이스가 실행 중인지 확인
  - 방화벽 설정 확인

### CORS 오류
- **문제**: "CORS policy blocked"
- **해결**:
  - 백엔드 CORS 설정 확인
  - 프런트엔드 URL이 올바른지 확인

### 빌드 실패
- **문제**: "Build failed"
- **해결**:
  - 로그 확인
  - `package.json`의 빌드 스크립트 확인
  - 환경 변수 설정 확인

### 환경 변수 문제
- **문제**: 환경 변수가 적용되지 않음
- **해결**:
  - Static Site의 경우 빌드 시에만 환경 변수 사용
  - 환경 변수 변경 후 재배포 필요
  - `VITE_` 접두사 확인

## 주의사항

1. **무료 플랜 제한**
   - Render.com의 무료 플랜은 15분 동안 요청이 없으면 서비스가 sleep 상태가 됩니다.
   - 첫 요청 시 약 30초 정도의 콜드 스타트 시간이 소요됩니다.
   - 프로덕션 환경에서는 유료 플랜 사용 권장

2. **데이터베이스 백업**
   - 정기적으로 데이터베이스 백업 설정
   - 중요한 데이터는 별도로 백업

3. **환경 변수 보안**
   - 민감한 정보는 환경 변수로 관리
   - `.env` 파일은 Git에 커밋하지 않기
   - Render.com의 환경 변수는 암호화되어 저장됨

4. **로깅**
   - Render.com의 로그 기능을 활용하여 문제 추적
   - 프로덕션 환경에서는 로깅 레벨 조정

## 다음 단계

1. **도메인 연결** (선택사항)
   - Render.com에서 커스텀 도메인 설정
   - DNS 설정

2. **모니터링 설정**
   - 서비스 상태 모니터링
   - 알림 설정

3. **성능 최적화**
   - 데이터베이스 인덱스 최적화
   - 캐싱 전략 구현
   - CDN 사용

4. **보안 강화**
   - HTTPS 강제
   - 보안 헤더 설정
   - 인증 강화

## 참고 자료

- [Render.com 공식 문서](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Node.js on Render](https://render.com/docs/node)
- [Static Sites on Render](https://render.com/docs/static-sites)

