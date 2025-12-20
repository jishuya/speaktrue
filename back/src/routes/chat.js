const express = require('express');
const router = express.Router();
const claudeService = require('../services/claude');
const db = require('../services/db');

// 임시 사용자 ID (나중에 인증 연동 시 교체)
const TEMP_USER_ID = '11111111-1111-1111-1111-111111111111';

// 세션의 대화 히스토리와 요약 조회
async function getSessionContext(sessionId) {
  // 1. 기존 요약 조회
  const summaryResult = await db.query(
    `SELECT summary_content, message_count FROM conversation_summaries WHERE session_id = $1`,
    [sessionId]
  );
  const existingSummary = summaryResult.rows[0];

  // 2. 메시지 조회 (요약이 있으면 요약 이후 메시지만, 없으면 전체)
  const messagesResult = await db.query(
    `SELECT role, content, created_at FROM messages
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );

  const allMessages = messagesResult.rows;
  const recentMessagesToKeep = claudeService.getRecentMessagesToKeep();

  // 3. 요약이 있으면 요약 + 최근 메시지, 없으면 전체 메시지
  if (existingSummary) {
    // 요약에 포함된 메시지 이후의 메시지들만 사용
    const recentMessages = allMessages.slice(-recentMessagesToKeep);
    return {
      summary: existingSummary.summary_content,
      messages: recentMessages,
      totalCount: allMessages.length,
    };
  }

  return {
    summary: null,
    messages: allMessages,
    totalCount: allMessages.length,
  };
}

// 중간 요약 생성 및 저장
async function createOrUpdateConversationSummary(sessionId) {
  // 전체 메시지 조회
  const messagesResult = await db.query(
    `SELECT role, content FROM messages WHERE session_id = $1 ORDER BY created_at ASC`,
    [sessionId]
  );
  const allMessages = messagesResult.rows;

  if (!claudeService.shouldSummarize(allMessages.length)) {
    return null; // 요약 불필요
  }

  const recentMessagesToKeep = claudeService.getRecentMessagesToKeep();
  const messagesToSummarize = allMessages.slice(0, -recentMessagesToKeep);

  // AI로 요약 생성
  const summaryContent = await claudeService.generateConversationSummary(messagesToSummarize);

  // DB에 저장 (UPSERT)
  await db.query(
    `INSERT INTO conversation_summaries (session_id, summary_content, message_count, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (session_id)
     DO UPDATE SET summary_content = $2, message_count = $3, updated_at = NOW()`,
    [sessionId, summaryContent, messagesToSummarize.length]
  );

  console.log(`Conversation summary created/updated for session ${sessionId}, summarized ${messagesToSummarize.length} messages`);
  return summaryContent;
}

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

    // 2. AI 응답 생성 (대화 히스토리 포함)
    let reply;
    if (mode === 'perspective') {
      reply = await claudeService.getPerspectiveResponse(message);
    } else if (sessionId) {
      // 세션이 있으면 대화 컨텍스트를 가져와서 응답 생성
      const context = await getSessionContext(sessionId);
      reply = await claudeService.getEmpathyResponseWithHistory(
        message,
        context.messages,
        context.summary
      );

      // 메시지 수가 임계값을 넘으면 중간 요약 생성 (비동기로 처리)
      if (claudeService.shouldSummarize(context.totalCount + 2)) { // +2는 방금 추가된 user/assistant
        createOrUpdateConversationSummary(sessionId).catch(err => {
          console.error('Background summary creation failed:', err);
        });
      }
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

// PATCH /api/chat/session/:id/end - 세션 종료 및 요약 생성
router.patch('/session/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { isResolved = false } = req.body;

    // 1. 세션 종료 처리
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

    // 2. 세션의 메시지 조회
    const messagesResult = await db.query(
      `SELECT role, content FROM messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    // 3. 메시지가 있으면 최종 요약 생성 (비동기)
    if (messagesResult.rows.length >= 2) {
      generateAndSaveSessionSummary(id, messagesResult.rows).catch(err => {
        console.error('Session summary generation failed:', err);
      });
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

// 세션 최종 요약 생성 및 저장
async function generateAndSaveSessionSummary(sessionId, messages) {
  try {
    const summary = await claudeService.generateSessionSummary(messages);

    // session_summaries 테이블에 저장
    await db.query(
      `INSERT INTO session_summaries (
        session_id, main_reason, summary,
        my_emotions, my_needs,
        partner_emotions, partner_needs,
        hidden_emotion, core_need
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (session_id) DO UPDATE SET
        main_reason = $2, summary = $3,
        my_emotions = $4, my_needs = $5,
        partner_emotions = $6, partner_needs = $7,
        hidden_emotion = $8, core_need = $9`,
      [
        sessionId,
        summary.mainReason,
        summary.summary,
        summary.myEmotions,
        summary.myNeeds,
        summary.partnerEmotions,
        summary.partnerNeeds,
        summary.hiddenEmotion,
        summary.coreNeed,
      ]
    );

    // session_tags 테이블에 주제 태그 저장
    if (summary.topics && summary.topics.length > 0) {
      for (const topic of summary.topics) {
        await db.query(
          `INSERT INTO session_tags (session_id, tag_type, tag_name)
           VALUES ($1, 'topic', $2)
           ON CONFLICT (session_id, tag_type, tag_name) DO NOTHING`,
          [sessionId, topic]
        );
      }
    }

    // 감정 태그 저장
    if (summary.myEmotions && summary.myEmotions.length > 0) {
      for (const emotion of summary.myEmotions.slice(0, 3)) {
        await db.query(
          `INSERT INTO session_tags (session_id, tag_type, tag_name)
           VALUES ($1, 'my_emotion', $2)
           ON CONFLICT (session_id, tag_type, tag_name) DO NOTHING`,
          [sessionId, emotion]
        );
      }
    }

    console.log(`Session summary saved for session ${sessionId}`);
  } catch (error) {
    console.error('Failed to save session summary:', error);
    throw error;
  }
}

module.exports = router;
