-- 무료 시험 초기 데이터 (20문항)

-- 1. 무료 시험 생성
INSERT INTO exams (exam_type, exam_code, title, is_free, question_count)
VALUES ('요양', 'FREE_001', '요양보호사 무료 모의고사', true, 20)
ON CONFLICT DO NOTHING;

-- 2. 무료 시험 ID 가져오기 (나중에 사용)
-- SELECT id FROM exams WHERE is_free = true LIMIT 1;

-- 참고: 실제 문항 데이터는 CSV 업로드를 통해 추가되거나
-- 관리자 업로드 기능을 통해 추가됩니다.

-- 초기 테스트용 문항 (선택사항)
-- 아래는 예시이며, 실제로는 CSV 파일로 업로드하는 것을 권장합니다.

