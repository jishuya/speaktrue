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

// POST /api/chat/message-with-image - 이미지와 함께 메시지 전송
router.post('/message-with-image', async (req, res) => {
  try {
    const { message, image, mode = 'empathy' } = req.body;

    if (!message) {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    if (!image || !image.data) {
      return res.status(400).json({ error: '이미지가 필요합니다.' });
    }

    let reply;
    if (mode === 'perspective') {
      reply = await claudeService.getPerspectiveResponseWithImage(message, image);
    } else {
      reply = await claudeService.getEmpathyResponseWithImage(message, image);
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chat with image error:', error);
    res.status(500).json({ error: '응답을 생성하는 중 오류가 발생했습니다.' });
  }
});

// POST /api/chat/perspective - 대화 히스토리 기반 관점 전환 분석
router.post('/perspective', async (req, res) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return res.status(400).json({ error: '대화 내용이 필요합니다.' });
    }

    const reply = await claudeService.getPerspectiveResponseWithHistory(conversationHistory);
    res.json({ reply });
  } catch (error) {
    console.error('Perspective error:', error);
    res.status(500).json({ error: '관점 분석 중 오류가 발생했습니다.' });
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
