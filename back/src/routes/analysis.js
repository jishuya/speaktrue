const express = require('express');
const router = express.Router();
const db = require('../services/db');
const claudeService = require('../services/claude');

// 기간별 날짜 계산
function getDateRange(period) {
  const now = new Date();
  let startDate;

  switch (period) {
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '90days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      startDate = new Date('2000-01-01'); // 전체 기간
      break;
    case '30days':
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  return { startDate, endDate: now };
}

// GET /api/analysis/patterns - 패턴 분석 통합 API
router.get('/patterns', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const period = req.query.period || '30days';

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const { startDate, endDate } = getDateRange(period);

    // 이전 기간 계산 (비교용)
    const periodDays = period === '7days' ? 7 : period === '90days' ? 90 : 30;
    const prevStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const prevEndDate = startDate;

    // 1. 현재 기간 세션 수
    const currentSessionsQuery = `
      SELECT COUNT(*) as count
      FROM sessions
      WHERE user_id = $1
        AND status = 'ended'
        AND started_at >= $2
        AND started_at < $3
    `;

    // 2. 이전 기간 세션 수 (비교용)
    const prevSessionsQuery = `
      SELECT COUNT(*) as count
      FROM sessions
      WHERE user_id = $1
        AND status = 'ended'
        AND started_at >= $2
        AND started_at < $3
    `;

    // 3. 갈등 주제 통계 (기간 필터 적용)
    const topicsQuery = `
      SELECT
        st.tag_name as topic,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 1) as percentage
      FROM session_tags st
      JOIN sessions s ON st.session_id = s.id
      WHERE s.user_id = $1
        AND st.tag_type = 'topic'
        AND s.status = 'ended'
        AND s.started_at >= $2
        AND s.started_at < $3
      GROUP BY st.tag_name
      ORDER BY count DESC
      LIMIT 5
    `;

    // 4. 감정 분포 통계 (기간 필터 적용)
    const emotionsQuery = `
      SELECT
        st.tag_name as emotion,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 1) as percentage
      FROM session_tags st
      JOIN sessions s ON st.session_id = s.id
      WHERE s.user_id = $1
        AND st.tag_type = 'my_emotion'
        AND s.status = 'ended'
        AND s.started_at >= $2
        AND s.started_at < $3
      GROUP BY st.tag_name
      ORDER BY count DESC
      LIMIT 5
    `;

    // 5. 해결된 세션 비율
    const resolvedQuery = `
      SELECT
        COUNT(*) FILTER (WHERE is_resolved = true) as resolved_count,
        COUNT(*) as total_count
      FROM sessions
      WHERE user_id = $1
        AND status = 'ended'
        AND started_at >= $2
        AND started_at < $3
    `;

    // 병렬 실행
    const [
      currentSessionsResult,
      prevSessionsResult,
      topicsResult,
      emotionsResult,
      resolvedResult,
    ] = await Promise.all([
      db.query(currentSessionsQuery, [userId, startDate, endDate]),
      db.query(prevSessionsQuery, [userId, prevStartDate, prevEndDate]),
      db.query(topicsQuery, [userId, startDate, endDate]),
      db.query(emotionsQuery, [userId, startDate, endDate]),
      db.query(resolvedQuery, [userId, startDate, endDate]),
    ]);

    const currentSessions = parseInt(currentSessionsResult.rows[0]?.count) || 0;
    const prevSessions = parseInt(prevSessionsResult.rows[0]?.count) || 0;
    const trend = currentSessions - prevSessions;

    const resolved = resolvedResult.rows[0] || { resolved_count: 0, total_count: 0 };
    const resolvedCount = parseInt(resolved.resolved_count) || 0;
    const totalCount = parseInt(resolved.total_count) || 0;

    // 주제 색상 (primary 기준으로 투명도 조절)
    const topicColors = ['#5B8DEF', '#5B8DEFCC', '#5B8DEF99', '#5B8DEF66', '#5B8DEF33'];

    const conflictTopics = topicsResult.rows.map((row, index) => ({
      topic: row.topic,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage) || 0,
      color: topicColors[index] || topicColors[0],
    }));

    // 감정 데이터 (아이콘/색상은 프론트엔드에서 매핑)
    const emotions = emotionsResult.rows.map((row) => ({
      emotion: row.emotion,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage) || 0,
    }));

    // 인사이트 메시지 생성
    let insight = null;
    if (conflictTopics.length > 0 && emotions.length > 0) {
      const mainTopic = conflictTopics[0].topic;
      const mainEmotion = emotions[0].emotion;

      insight = {
        mainTopic,
        mainEmotion,
        message: `${mainTopic} 대화에서 '${mainEmotion}'을 자주 느끼셨군요`,
        advice: '다음 대화에서는 상대방의 행동을 비난하기보다, 내가 관찰한 사실과 그때 느낀 감정을 먼저 이야기해보세요. 더 부드러운 소통이 될 거예요.',
      };
    }

    // 트렌드 메시지 생성
    let trendMessage = '';
    if (trend > 0) {
      trendMessage = '지난달보다 더 자주 소통했어요';
    } else if (trend < 0) {
      trendMessage = '지난달보다 대화가 줄었어요';
    } else {
      trendMessage = '지난달과 비슷한 소통량이에요';
    }

    res.json({
      period,
      summary: {
        totalSessions: currentSessions,
        previousPeriodSessions: prevSessions,
        trend,
        trendMessage,
        resolvedCount,
        unresolvedCount: totalCount - resolvedCount,
        resolvedRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0,
      },
      conflictTopics,
      emotions,
      insight,
    });
  } catch (error) {
    console.error('Analysis patterns error:', error);
    res.status(500).json({ error: '패턴 분석을 불러오는데 실패했습니다' });
  }
});

// GET /api/analysis/insight - AI 맞춤 인사이트 생성
router.get('/insight', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const period = req.query.period || '30days';

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const { startDate, endDate } = getDateRange(period);

    // 최근 세션 요약들 가져오기
    const summariesQuery = `
      SELECT
        ss.root_cause,
        ss.trigger_situation,
        ss.summary,
        ss.my_emotions,
        ss.my_needs,
        ss.my_unmet_need,
        ss.partner_emotions,
        ss.partner_needs,
        ss.conflict_pattern,
        ss.suggested_approach
      FROM session_summaries ss
      JOIN sessions s ON ss.session_id = s.id
      WHERE s.user_id = $1
        AND s.status = 'ended'
        AND s.started_at >= $2
        AND s.started_at < $3
      ORDER BY s.started_at DESC
      LIMIT 10
    `;

    const summariesResult = await db.query(summariesQuery, [userId, startDate, endDate]);

    if (summariesResult.rows.length === 0) {
      return res.json({
        insight: null,
        message: '아직 분석할 대화가 충분하지 않아요. 더 많은 대화를 나눠보세요.',
      });
    }

    // AI에게 인사이트 생성 요청
    const insight = await claudeService.generatePatternInsight(summariesResult.rows);

    res.json({
      insight,
      sessionCount: summariesResult.rows.length,
    });
  } catch (error) {
    console.error('Analysis insight error:', error);
    res.status(500).json({ error: '인사이트 생성에 실패했습니다' });
  }
});

module.exports = router;
