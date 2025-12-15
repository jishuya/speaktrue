const express = require('express');
const router = express.Router();

// POST /api/chat/message
router.post('/message', (req, res) => {
  const { message, mode } = req.body;
  // TODO: Claude API 연동
  res.json({
    reply: '공감 응답이 여기에 표시됩니다.',
    emotion: 'understanding',
  });
});

// POST /api/chat/session
router.post('/session', (req, res) => {
  // TODO: 새 대화 세션 생성
  res.json({
    sessionId: 'new-session-id',
    createdAt: new Date().toISOString(),
  });
});

// GET /api/chat/session/:id
router.get('/session/:id', (req, res) => {
  const { id } = req.params;
  // TODO: 세션 정보 조회
  res.json({
    sessionId: id,
    messages: [],
  });
});

module.exports = router;
