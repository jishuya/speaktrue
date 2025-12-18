const express = require('express');
const router = express.Router();
const claudeService = require('../services/claude');

// POST /api/chat/message
router.post('/message', async (req, res) => {
  try {
    const { message, mode = 'empathy' } = req.body;

    if (!message) {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    let reply;
    if (mode === 'perspective') {
      reply = await claudeService.getPerspectiveResponse(message);
    } else {
      reply = await claudeService.getEmpathyResponse(message);
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: '응답을 생성하는 중 오류가 발생했습니다.' });
  }
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
