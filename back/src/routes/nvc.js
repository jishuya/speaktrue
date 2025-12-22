const express = require('express');
const router = express.Router();
const claudeService = require('../services/claude');
const db = require('../services/db');

// POST /api/nvc/convert
router.post('/convert', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    // 세션 컨텍스트 조회 (sessionId가 있는 경우)
    let sessionContext = null;
    if (sessionId) {
      try {
        const sessionQuery = `
          SELECT
            ss.root_cause,
            ss.trigger_situation,
            ss.summary,
            ss.my_emotions,
            ss.my_needs,
            ss.my_unmet_need,
            ss.partner_emotions,
            ss.partner_needs,
            ss.partner_unmet_need,
            ss.conflict_pattern,
            ss.suggested_approach
          FROM session_summaries ss
          WHERE ss.session_id = $1
        `;
        const result = await db.query(sessionQuery, [sessionId]);
        if (result.rows.length > 0) {
          sessionContext = result.rows[0];
        }
      } catch (dbError) {
        console.error('Session context fetch error:', dbError);
        // DB 오류가 나도 NVC 변환은 계속 진행
      }
    }

    const result = await claudeService.convertToNvc(message, sessionContext);
    console.log('NVC API Response:', JSON.stringify(result, null, 2));

    res.json({
      original: message,
      converted: result.converted,
      analysis: result.analysis,
      tip: result.tip,
    });
  } catch (error) {
    console.error('NVC convert error:', error);
    res.status(500).json({ error: 'NVC 변환 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
