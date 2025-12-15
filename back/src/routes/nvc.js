const express = require('express');
const router = express.Router();

// POST /api/nvc/convert
router.post('/convert', (req, res) => {
  const { message } = req.body;
  // TODO: Claude API로 NVC 변환
  res.json({
    original: message,
    converted: 'NVC 변환된 메시지가 여기에 표시됩니다.',
    analysis: {
      observation: '관찰',
      feeling: '감정',
      need: '욕구',
      request: '부탁',
    },
  });
});

module.exports = router;
