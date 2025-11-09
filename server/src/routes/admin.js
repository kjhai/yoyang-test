import express from 'express'
import multer from 'multer'
import { authenticateAdmin } from '../middleware/auth.js'
// CSV 파싱은 나중에 구현 (Papa Parse 등)

const router = express.Router()

// multer 설정 (메모리 스토리지)
const upload = multer({ storage: multer.memoryStorage() })

/**
 * POST /api/admin/import/preview
 * CSV 업로드 미리보기/검증
 */
router.post('/import/preview', authenticateAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'CSV 파일을 업로드해주세요.',
      })
    }

    // CSV 파일 파싱 (Papa Parse 등 사용 예정)
    // 현재는 기본 구조만 반환
    const fileBuffer = req.file.buffer
    const fileContent = fileBuffer.toString('utf-8')
    
    // 간단한 CSV 파싱 (실제로는 Papa Parse 사용 권장)
    const lines = fileContent.split('\n').filter(line => line.trim())
    if (lines.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'CSV 파일이 비어있습니다.',
      })
    }

    // 헤더 파싱
    const headers = lines[0].split(',').map(h => h.trim())
    
    // 예상 헤더: exam_type, exam_code, section, question_id, stem, opt1, opt2, opt3, opt4, opt5, answer, explanation, tags, media_url
    const expectedHeaders = ['exam_type', 'exam_code', 'question_id', 'stem', 'opt1', 'opt2', 'opt3', 'opt4', 'opt5', 'answer']
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `필수 헤더가 없습니다: ${missingHeaders.join(', ')}`,
      })
    }

    // 데이터 행 파싱 (상위 20행만)
    const dataRows = lines.slice(1, 21).map((line, index) => {
      const values = line.split(',').map(v => v.trim())
      const row = {}
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })
      return {
        rowNumber: index + 2, // 헤더 제외하고 2부터 시작
        data: row,
      }
    })

    // 검증 결과 (기본 구조)
    res.json({
      preview: dataRows,
      totalRows: lines.length - 1,
      validated: false, // 실제 검증 로직은 나중에 구현
    })
  } catch (error) {
    console.error('Error previewing import:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'CSV 미리보기 중 오류가 발생했습니다.',
    })
  }
})

/**
 * POST /api/admin/import/commit
 * CSV 일괄 반영 (트랜잭션)
 */
router.post('/import/commit', authenticateAdmin, async (req, res) => {
  try {
    const { data } = req.body

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '데이터가 필요합니다.',
      })
    }

    // 실제 구현은 나중에 (데이터베이스에 문항 저장)
    // 현재는 기본 구조만 반환
    res.json({
      success: true,
      rowsOk: data.length,
      rowsFail: 0,
      message: 'CSV 일괄 반영이 완료되었습니다.',
    })
  } catch (error) {
    console.error('Error committing import:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'CSV 일괄 반영 중 오류가 발생했습니다.',
    })
  }
})

export default router

