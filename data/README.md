# Data 폴더

이 폴더는 초기 시드 데이터 및 CSV 파일을 저장하는 곳입니다.

## 파일 구조

- `free_exam_questions.csv`: 무료 체험 20문항 CSV 파일
- `seed/`: 초기 시드 데이터 (백엔드 마이그레이션용)

## CSV 파일 형식

PRD에 명시된 CSV 헤더 형식:
```
exam_type, exam_code, section, question_id, stem, opt1, opt2, opt3, opt4, opt5, answer, explanation, tags, media_url
```

### 필수 필드
- `stem`: 문제 지문
- `opt1` ~ `opt4`: 보기 1~4 (최소 4개 필수)
- `opt5`: 보기 5 (선택)
- `answer`: 정답 (1~5)

### 선택 필드
- `exam_type`: 시험 유형 (예: 요양, 간호)
- `exam_code`: 시험 코드
- `section`: 섹션
- `question_id`: 문항 고유 ID
- `explanation`: 해설
- `tags`: 태그
- `media_url`: 미디어 URL

