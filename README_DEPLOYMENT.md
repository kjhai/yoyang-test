# Render.com 배포 빠른 가이드

## 📋 배포 순서 (요약)

1. **PostgreSQL 데이터베이스 생성**
2. **백엔드 서버 배포**
3. **데이터베이스 초기화**
4. **프런트엔드 배포**
5. **테스트**

## 🚀 빠른 시작

### 1. 데이터베이스 생성

1. Render.com 대시보드 → "New +" → "PostgreSQL"
2. 설정:
   - Name: `carecbt-db`
   - Database: `carecbt`
   - Region: `Singapore` (또는 가까운 지역)
   - Plan: `Free`
3. "Create Database" 클릭
4. **Internal Database URL** 복사 (백엔드에서 사용)

### 2. 백엔드 배포

1. GitHub에 코드 푸시 (아직 안 했다면)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. Render.com 대시보드 → "New +" → "Web Service"
3. GitHub 저장소 연결
4. 설정:
   - Name: `carecbt-api`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`
5. 환경 변수 추가:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<Internal Database URL from step 1>
   ```
6. "Create Web Service" 클릭
7. 배포 완료 대기 (약 5-10분)

### 3. 데이터베이스 초기화

서버가 시작되면 자동으로 데이터베이스가 초기화됩니다.
또는 Render.com의 "Shell" 탭에서 수동 실행:
```bash
cd server
npm run init-db
```

### 4. 프런트엔드 배포

1. Render.com 대시보드 → "New +" → "Static Site"
2. GitHub 저장소 연결
3. 설정:
   - Name: `carecbt-web`
   - Root Directory: `ui`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. 환경 변수 추가:
   ```
   VITE_API_BASE_URL=https://carecbt-api.onrender.com/api
   ```
   (백엔드 서비스 이름에 맞게 수정)
5. "Create Static Site" 클릭
6. 배포 완료 대기 (약 3-5분)

### 5. 테스트

1. 프런트엔드 URL 접속: `https://carecbt-web.onrender.com`
2. 무료 시험 시작 테스트
3. 백엔드 헬스 체크: `https://carecbt-api.onrender.com/healthz`

## ⚙️ 환경 변수 요약

### 백엔드
- `NODE_ENV=production`
- `PORT=10000`
- `DATABASE_URL=<Internal Database URL>`
- `FRONTEND_URL=https://carecbt-web.onrender.com` (선택사항, CORS용)

### 프런트엔드
- `VITE_API_BASE_URL=https://carecbt-api.onrender.com/api`

## 🔍 문제 해결

### 데이터베이스 연결 실패
- `DATABASE_URL`이 **Internal Database URL**인지 확인
- 데이터베이스가 실행 중인지 확인

### CORS 오류
- 백엔드에 `FRONTEND_URL` 환경 변수 설정
- 또는 CORS 설정에서 모든 도메인 허용 (`*`)

### 빌드 실패
- 로그 확인
- `package.json`의 스크립트 확인
- 환경 변수 확인

## 📚 상세 가이드

더 자세한 내용은 `DEPLOYMENT_GUIDE.md` 파일을 참조하세요.

## ✅ 체크리스트

배포 전 확인사항은 `DEPLOYMENT_CHECKLIST.md` 파일을 참조하세요.

