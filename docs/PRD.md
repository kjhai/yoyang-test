# 요양보호사 모의고사 CBT 앱

##1. 프로젝트 개요

개요: 요양보호사 모의고사를 모바일 우선으로 제공하는 웹 앱. MVP는 로그인 없이 무료 1회(20문항) 시험 제공 후 점수 공개 / 틀린 문제 풀기 / 다시 풀기 / 문제 해설 기능을 제공.

핵심 가치: 빠른 체험→전환 유도(정식판: 유료 10회, 각 80문항).

우선순위: 응시 경험 품질(가독성·안정성) > 운영 편의(문항 업로드) > 전환(결제/회원은 차차).

###1.1 프로젝트명

프로젝트명: CareCBT (가칭)

###1.2 프로젝트 목적

학습 목적: 실제 시험과 유사한 환경으로 반복 학습 및 오답 정복률 향상.

사업 목적: 무료 1회 체험을 통해 유료 10회로 전환(추후 결제 도입).

확장성: 간호조무사 모의시험으로 손쉬운 수평 확장.

###1.3 개발 범위

포함(MVP)

무료 20문항 시험(문항 셔플 가능, 보기 셔플 고정 시드 저장)

답안 제출 → 점수 공개

틀린 문제 풀기(오답만 큐), 다시 풀기(새 응시), 문제 해설(문항 하단 토글)

관리자 문항 업로드(얇은 버전): CSV 파일 선택→미리보기→검증→일괄 반영

제외(MVP)

회원/로그인, 결제, 상세 통계/랭킹, 파일(이미지) 업로드, 소셜 공유, 공지/공지관리

##2. 기술 스택

프런트엔드: React + Vite, TypeScript(선택), Zustand/Redux(간단 상태), React Router

백엔드: Node.js + Express

DB: PostgreSQL (초기엔 Render 무료 플랜)

배포: GitHub → Render(프런트/백엔드)

기타: CSV 파서(Papa Parse 등), ESLint/Prettier, Vitest/Jest(선택)

##3. 기본 사항

모바일 우선: 한 화면 1문항, 큰 글자·터치 영역 확실.

접근성: 키보드/스크린리더 기본 준수(라디오 그룹, aria-label).

성능/안정성: 자동 저장(로컬+서버)로 새로고침/탭 닫힘 복구.

데이터 보존: 응시 시점 버전 고정(문항 변경과 무관).

품질 기준(수용 기준)

제출 즉시 점수/정오답 계산 정확.

오답 모드에서 정답으로 변경 시 즉시 큐에서 제거.

새로고침 후에도 진행(현재 문항/선택지) 복원.

CSV 업로드 검증 실패 시 상세 사유 표시 및 실패 행 다운로드.

보안/정책(최소): 개인정보 미수집(로그인 없음), 쿠키/스토리지 정책 고지, 간단 이용안내/문의 이메일 표기.

##4. 화면별 상세 요구사항
###4.1 랜딩 페이지

구성: 서비스 소개 요약, 20문항 무료로 시작 버튼(즉시 응시 시작).

상태: 네트워크 오류 시 재시도, 진입 시 기존 미제출 응시가 있으면 이어하기 안내.

###4.2 시험 페이지(무료 20문항)

UI 요소: 문제 지문, 보기는 라디오 버튼(1~5), 상단 진행바(현재/총), 선택 저장 토스트.

로직:

보기 셔플 시 attempt.shuffle_seed 이용(매 응시 고정).

자동 임시저장(문항 이동 시, 5초마다).

시간 제한(선택사항): MVP는 없음.

에러/엣지: 네트워크 실패 시 로컬 저장 후 재동기화.

###4.3 제출 결과 페이지

표시: 최종 점수, 정답 수/오답 수, 소요 시간(선택).

버튼: 틀린 문제 풀기 / 다시 풀기 / 문제 해설

틀린 문제 풀기: 오답만 순차 노출, 이전 선택 표시, 정답으로 변경 시 즉시 큐 제거, 남은 오답 0개 시 완료 안내.

다시 풀기: 새로운 attempt 생성(셔플 시드 새로), 기존 점수는 기록 유지.

문제 해설: 문항 하단에 해설 토글(전체 펼치기/접기 옵션).

###4.4 오답 모드 화면

진행바: 남은 오답 n/총 오답 m.

카드: “내가 고른 답” 배지, 정답은 정답 변경 시에만 하이라이트 노출(즉시 피드백).

유지: 원 응시의 보기 순서/이미지(셔플 고정).

이탈 복구: 마지막 오답 문항 포인터 저장.

###4.5 관리자 업로드(얇은 버전)

흐름: 파일 선택 → 표 미리보기(상위 20행) → 검증 결과(오류 빨간 표시) → 일괄 반영(트랜잭션)

CSV 헤더(권장 고정):
exam_type, exam_code, section, question_id, stem, opt1, opt2, opt3, opt4, opt5, answer, explanation, tags, media_url

검증 규칙:

필수: stem, opt1~opt4, answer(1~5).

question_id 중복은 “갱신”으로 처리(버전+1).

HTML/스크립트 제거(기본 sanitize).

전량 반영 전 에러 행 다운로드 제공.

##5. 백엔드 개발 명세
###5.1 데이터 모델(간단)

exams: id, exam_type(요양/간호), exam_code, title, is_free(bool), question_count, created_at

questions: id, question_id(외부고유), version, stem, opt1~opt5, answer, explanation, tags, media_url, created_at

exam_questions(매핑): id, exam_id, question_id(ref questions.id), order_no

attempts: id, exam_id, shuffle_seed, started_at, submitted_at, score, total, client_meta

answers: id, attempt_id, question_id, chosen_option, is_correct, updated_at

imports(업로드 로그): id, filename, rows_ok, rows_fail, created_by, created_at

원칙: 응시 시점에 questions 스냅샷을 캐시하거나, attempt에 매핑된 version을 고정(변경 내역과 독립).

###5.2 핵심 상태 기계(Attempt)

draft(시작) → in_progress(문항 응시 중) → submitted(제출) →

review_wrong(오답 모드 시작) → completed_wrong(오답 모두 해결 시)

점수는 submitted 시 확정(오답 모드에서 수정해도 원 점수 불변). “오답 정복률”은 별도 계산.

###5.3 API 명세(초안, REST)

GET /api/exams/free : 무료 시험 메타(20문항)

POST /api/attempts : { exam_id } → attempt 생성(셔플 시드 반환)

GET /api/attempts/:id/questions : 시드 기반 셔플/순서 반영된 문항 목록

POST /api/answers : { attempt_id, question_id, chosen_option } (자동 채점은 서버에서)

POST /api/attempts/:id/submit : 제출 → { score, correct, wrong }

GET /api/attempts/:id/result : 점수/정오답 요약

GET /api/attempts/:id/wrong : 오답만 큐로 반환(이전 선택 포함)

POST /api/answers/:id/correct : 오답 모드에서 답변 변경 → is_correct 즉시 갱신

관리자 업로드

POST /api/admin/import/preview : CSV 업로드 미리보기/검증

POST /api/admin/import/commit : 일괄 반영(트랜잭션)

인증: MVP는 간단 토큰 헤더

###5.4 검증/비즈니스 규칙

제출 이전에는 점수/정답 공개 금지.

제출 후 결과 페이지에서만 3개 버튼 활성화.

오답 모드에서는 보기 셔플 OFF(원 attempt와 동일 순서).

동일 question_id 재업로드 시 version 증가, 기존 exams에 매핑된 문항은 attempt 기준 버전으로 표시.

###5.5 로깅/모니터링

imports(업로드), attempts(시작/제출 시각), API 에러 로그.

지표(MVP): 시작 수, 제출 수, 평균 점수, 평균 소요 시간, 오답 정복률.

###5.6 배포/환경

초기: Render 무료(웹/서버/DB). .env에 DB URL/SECRET.

마이그레이션: schema.sql + seed_free_exam.sql 실행 루틴.

콜드스타트 완화: 헬스체크 엔드포인트(/healthz).