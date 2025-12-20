const express = require('express');
const router = express.Router();
const db = require('../services/db');

// 3개월(90일) 기준
const ARCHIVE_DAYS = 90;

// 3개월 지난 세션 정리 (메시지 삭제, 요약만 유지)
async function archiveOldSessions() {
  try {
    // 1. 3개월 지난 세션 중 아직 정리 안된 것들 조회
    const oldSessionsResult = await db.query(
      `SELECT s.id FROM sessions s
       WHERE s.status = 'ended'
         AND s.summary_only = false
         AND s.ended_at < NOW() - INTERVAL '${ARCHIVE_DAYS} days'
         AND EXISTS (SELECT 1 FROM session_summaries ss WHERE ss.session_id = s.id)`
    );

    if (oldSessionsResult.rows.length === 0) {
      return { archived: 0 };
    }

    const sessionIds = oldSessionsResult.rows.map(r => r.id);

    // 2. 해당 세션들의 메시지 삭제
    await db.query(
      `DELETE FROM messages WHERE session_id = ANY($1)`,
      [sessionIds]
    );

    // 3. conversation_summaries도 삭제 (session_summaries는 유지)
    await db.query(
      `DELETE FROM conversation_summaries WHERE session_id = ANY($1)`,
      [sessionIds]
    );

    // 4. 세션을 summary_only로 마킹
    await db.query(
      `UPDATE sessions SET summary_only = true WHERE id = ANY($1)`,
      [sessionIds]
    );

    console.log(`Archived ${sessionIds.length} old sessions`);
    return { archived: sessionIds.length, sessionIds };
  } catch (error) {
    console.error('Archive old sessions error:', error);
    throw error;
  }
}

// GET /api/history/summary - 통합 API (세션 목록 + 통계)
router.get('/summary', async (req, res) => {
  try {
    // TODO: 실제 인증 구현 후 req.user.id 사용
    const userId = req.query.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    // 백그라운드로 오래된 세션 정리 실행
    archiveOldSessions().catch(err => {
      console.error('Background archive failed:', err);
    });

    // 1. 세션 목록 조회 (태그 포함, summary_only 플래그 추가)
    const sessionsQuery = `
      SELECT
        s.id,
        s.started_at,
        s.is_resolved,
        s.summary_only,
        ss.main_reason as content,
        COALESCE(
          (SELECT json_agg(st.tag_name)
           FROM session_tags st
           WHERE st.session_id = s.id
             AND st.tag_type IN ('topic', 'my_emotion')
          ), '[]'
        ) as tags
      FROM sessions s
      LEFT JOIN session_summaries ss ON s.id = ss.session_id
      WHERE s.user_id = $1
        AND s.status = 'ended'
      ORDER BY s.started_at DESC
      LIMIT 50
    `;

    // 2. 통계 조회 (user_session_stats 뷰 사용)
    const statsQuery = `
      SELECT
        total_sessions,
        resolved_count,
        unresolved_count
      FROM user_session_stats
      WHERE user_id = $1
    `;

    // 3. 자주 나온 주제 (상위 5개)
    const topicsQuery = `
      SELECT st.tag_name
      FROM session_tags st
      JOIN sessions s ON st.session_id = s.id
      WHERE s.user_id = $1
        AND st.tag_type = 'topic'
      GROUP BY st.tag_name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `;

    // 4. 자주 나온 감정 (상위 5개)
    const emotionsQuery = `
      SELECT st.tag_name
      FROM session_tags st
      JOIN sessions s ON st.session_id = s.id
      WHERE s.user_id = $1
        AND st.tag_type = 'my_emotion'
      GROUP BY st.tag_name
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `;

    // 병렬 실행
    const [sessionsResult, statsResult, topicsResult, emotionsResult] = await Promise.all([
      db.query(sessionsQuery, [userId]),
      db.query(statsQuery, [userId]),
      db.query(topicsQuery, [userId]),
      db.query(emotionsQuery, [userId]),
    ]);

    const stats = statsResult.rows[0] || {
      total_sessions: 0,
      resolved_count: 0,
      unresolved_count: 0,
    };

    res.json({
      sessions: sessionsResult.rows.map(row => ({
        id: row.id,
        date: row.started_at,
        content: row.content || '',
        tags: row.tags || [],
        resolved: row.is_resolved,
        summaryOnly: row.summary_only || false, // 3개월 지난 세션은 요약만 가능
      })),
      stats: {
        totalSessions: parseInt(stats.total_sessions) || 0,
        resolvedCount: parseInt(stats.resolved_count) || 0,
        unresolvedCount: parseInt(stats.unresolved_count) || 0,
      },
      frequentTopics: topicsResult.rows.map(r => r.tag_name),
      frequentEmotions: emotionsResult.rows.map(r => r.tag_name),
    });
  } catch (error) {
    console.error('History summary error:', error);
    res.status(500).json({ error: '기록을 불러오는데 실패했습니다' });
  }
});

// GET /api/history - 세션 목록만 조회
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const query = `
      SELECT
        s.id,
        s.started_at,
        s.is_resolved,
        s.summary_only,
        ss.main_reason as content,
        COALESCE(
          (SELECT json_agg(st.tag_name)
           FROM session_tags st
           WHERE st.session_id = s.id
             AND st.tag_type IN ('topic', 'my_emotion')
          ), '[]'
        ) as tags
      FROM sessions s
      LEFT JOIN session_summaries ss ON s.id = ss.session_id
      WHERE s.user_id = $1
        AND s.status = 'ended'
      ORDER BY s.started_at DESC
      LIMIT 50
    `;

    const result = await db.query(query, [userId]);

    res.json({
      sessions: result.rows.map(row => ({
        id: row.id,
        date: row.started_at,
        content: row.content || '',
        tags: row.tags || [],
        resolved: row.is_resolved,
        summaryOnly: row.summary_only || false,
      })),
      total: result.rows.length,
    });
  } catch (error) {
    console.error('History list error:', error);
    res.status(500).json({ error: '기록을 불러오는데 실패했습니다' });
  }
});

// GET /api/history/:id - 특정 세션 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.user?.id;

    // 세션 정보 조회 (summary_only 포함)
    const sessionQuery = `
      SELECT
        s.id,
        s.started_at,
        s.ended_at,
        s.is_resolved,
        s.summary_only,
        ss.main_reason,
        ss.summary,
        ss.my_emotions,
        ss.my_needs,
        ss.partner_emotions,
        ss.partner_needs,
        ss.hidden_emotion,
        ss.core_need
      FROM sessions s
      LEFT JOIN session_summaries ss ON s.id = ss.session_id
      WHERE s.id = $1 AND s.user_id = $2
    `;

    // 태그 조회
    const tagsQuery = `
      SELECT tag_type, tag_name
      FROM session_tags
      WHERE session_id = $1
    `;

    const [sessionResult, tagsResult] = await Promise.all([
      db.query(sessionQuery, [id, userId]),
      db.query(tagsQuery, [id]),
    ]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: '세션을 찾을 수 없습니다' });
    }

    const session = sessionResult.rows[0];
    const tags = tagsResult.rows.reduce((acc, row) => {
      if (!acc[row.tag_type]) acc[row.tag_type] = [];
      acc[row.tag_type].push(row.tag_name);
      return acc;
    }, {});

    // 메시지 조회 (summary_only가 아닐 때만)
    let messages = [];
    if (!session.summary_only) {
      const messagesResult = await db.query(
        `SELECT id, role, content, image_url, created_at
         FROM messages
         WHERE session_id = $1
         ORDER BY created_at ASC`,
        [id]
      );
      messages = messagesResult.rows;
    }

    res.json({
      id: session.id,
      startedAt: session.started_at,
      endedAt: session.ended_at,
      isResolved: session.is_resolved,
      summaryOnly: session.summary_only || false, // 3개월 지난 세션 여부
      summary: {
        mainReason: session.main_reason,
        summary: session.summary,
        myEmotions: session.my_emotions || [],
        myNeeds: session.my_needs || [],
        partnerEmotions: session.partner_emotions || [],
        partnerNeeds: session.partner_needs || [],
        hiddenEmotion: session.hidden_emotion,
        coreNeed: session.core_need,
      },
      messages, // summary_only면 빈 배열
      tags,
    });
  } catch (error) {
    console.error('Session detail error:', error);
    res.status(500).json({ error: '세션을 불러오는데 실패했습니다' });
  }
});

// DELETE /api/history/:id - 세션 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.user?.id;

    const result = await db.query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '세션을 찾을 수 없습니다' });
    }

    res.json({ deleted: id, success: true });
  } catch (error) {
    console.error('Session delete error:', error);
    res.status(500).json({ error: '삭제에 실패했습니다' });
  }
});

module.exports = router;
