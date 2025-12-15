const express = require('express');
const router = express.Router();

// GET /api/history
router.get('/', (req, res) => {
  // TODO: 사용자의 대화 기록 조회
  res.json({
    conversations: [],
    total: 0,
  });
});

// GET /api/history/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: 특정 대화 상세 조회
  res.json({
    id,
    messages: [],
    summary: '',
    createdAt: new Date().toISOString(),
  });
});

// GET /api/history/stats
router.get('/stats/summary', (req, res) => {
  // TODO: 통계 데이터 조회
  res.json({
    totalConversations: 0,
    resolvedCount: 0,
    topEmotions: [],
    weeklyTrend: [],
  });
});

// DELETE /api/history/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: 대화 기록 삭제
  res.json({ deleted: id });
});

module.exports = router;
