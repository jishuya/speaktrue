const express = require('express');
const router = express.Router();
const claudeService = require('../services/claude');

// POST /api/nvc/convert
router.post('/convert', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    const result = await claudeService.convertToNvc(message);
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
