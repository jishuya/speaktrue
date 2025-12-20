const express = require('express');
const router = express.Router();
const claudeService = require('../services/claude');
const db = require('../services/db');

// 임시 사용자 ID (나중에 인증 연동 시 교체)
const TEMP_USER_ID = '11111111-1111-1111-1111-111111111111';

// POST /api/chat/session - 새 세션 생성
router.post('/session', async (req, res) => {
  try {
    const result = await db.query(
      `INSERT INTO sessions (user_id, status)
       VALUES ($1, 'active')
       RETURNING id, user_id, status, started_at`,
      [TEMP_USER_ID]
    );

    const session = result.rows[0];
    res.json({
      sessionId: session.id,
      userId: session.user_id,
      status: session.status,
      startedAt: session.started_at,
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: '세션 생성 중 오류가 발생했습니다.' });
  }
});

// POST /api/chat/message - 메시지 전송 및 저장
router.post('/message', async (req, res) => {
  try {
    const { message, mode = 'empathy', sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    // 1. 사용자 메시지 저장 (세션 ID가 있을 때만)
    if (sessionId) {
      await db.query(
        `INSERT INTO messages (session_id, role, content)
         VALUES ($1, 'user', $2)`,
        [sessionId, message]
      );
    }

    // 2. AI 응답 생성
    let reply;
    if (mode === 'perspective') {
      reply = await claudeService.getPerspectiveResponse(message);
    } else {
      reply = await claudeService.getEmpathyResponse(message);
    }

    // 3. AI 응답 저장 (세션 ID가 있을 때만)
    if (sessionId) {
      await db.query(
        `INSERT INTO messages (session_id, role, content)
         VALUES ($1, 'assistant', $2)`,
        [sessionId, reply]
      );
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
    const { message, image, mode = 'empathy', sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    if (!image || !image.data) {
      return res.status(400).json({ error: '이미지가 필요합니다.' });
    }

    // 1. 사용자 메시지 저장 (세션 ID가 있을 때만)
    if (sessionId) {
      await db.query(
        `INSERT INTO messages (session_id, role, content)
         VALUES ($1, 'user', $2)`,
        [sessionId, message]
      );
    }

    // 2. AI 응답 생성
    let reply;
    if (mode === 'perspective') {
      reply = await claudeService.getPerspectiveResponseWithImage(message, image);
    } else {
      reply = await claudeService.getEmpathyResponseWithImage(message, image);
    }

    // 3. AI 응답 저장 (세션 ID가 있을 때만)
    if (sessionId) {
      await db.query(
        `INSERT INTO messages (session_id, role, content)
         VALUES ($1, 'assistant', $2)`,
        [sessionId, reply]
      );
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
    const { conversationHistory, sessionId } = req.body;

    if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return res.status(400).json({ error: '대화 내용이 필요합니다.' });
    }

    const reply = await claudeService.getPerspectiveResponseWithHistory(conversationHistory);

    // 세션 ID가 있으면 관점 전환 결과도 저장
    if (sessionId) {
      await db.query(
        `INSERT INTO messages (session_id, role, content)
         VALUES ($1, 'assistant', $2)`,
        [sessionId, JSON.stringify(reply)]
      );
    }

    res.json({ reply });
  } catch (error) {
    console.error('Perspective error:', error);
    res.status(500).json({ error: '관점 분석 중 오류가 발생했습니다.' });
  }
});

// GET /api/chat/session/:id - 세션 정보 조회
router.get('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 세션 정보 조회
    const sessionResult = await db.query(
      `SELECT id, user_id, status, is_resolved, started_at, ended_at
       FROM sessions WHERE id = $1`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }

    // 메시지 조회
    const messagesResult = await db.query(
      `SELECT id, role, content, image_url, created_at
       FROM messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      session: sessionResult.rows[0],
      messages: messagesResult.rows,
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    res.status(500).json({ error: '세션 조회 중 오류가 발생했습니다.' });
  }
});

// PATCH /api/chat/session/:id/end - 세션 종료
router.patch('/session/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { isResolved = false } = req.body;

    const result = await db.query(
      `UPDATE sessions
       SET status = 'ended', is_resolved = $2, ended_at = NOW()
       WHERE id = $1
       RETURNING id, status, is_resolved, ended_at`,
      [id, isResolved]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }

    res.json({
      message: '세션이 종료되었습니다.',
      session: result.rows[0],
    });
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ error: '세션 종료 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
