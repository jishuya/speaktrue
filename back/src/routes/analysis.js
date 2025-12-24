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

    // 이전 기간 계산 (비교용) - 기간별로 다르게 설정
    let periodDays;
    let periodLabel;
    switch (period) {
      case '7days':
        periodDays = 7;
        periodLabel = '지난주';
        break;
      case '90days':
        periodDays = 90;
        periodLabel = '지난 분기';
        break;
      case 'all':
        periodDays = 365; // 전체 기간은 작년과 비교
        periodLabel = '작년';
        break;
      case '30days':
      default:
        periodDays = 30;
        periodLabel = '지난달';
        break;
    }

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

    // 4. 나의 감정 분포 통계 (기간 필터 적용)
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

    // 5. 상대방 감정 분포 통계 (기간 필터 적용)
    const partnerEmotionsQuery = `
      SELECT
        st.tag_name as emotion,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 1) as percentage
      FROM session_tags st
      JOIN sessions s ON st.session_id = s.id
      WHERE s.user_id = $1
        AND st.tag_type = 'partner_emotion'
        AND s.status = 'ended'
        AND s.started_at >= $2
        AND s.started_at < $3
      GROUP BY st.tag_name
      ORDER BY count DESC
      LIMIT 5
    `;

    // 6. 갈등 패턴 분포 통계 (기간 필터 적용)
    const conflictPatternsQuery = `
      SELECT
        ss.conflict_pattern as pattern,
        COUNT(*) as count
      FROM session_summaries ss
      JOIN sessions s ON ss.session_id = s.id
      WHERE s.user_id = $1
        AND s.status = 'ended'
        AND s.started_at >= $2
        AND s.started_at < $3
        AND ss.conflict_pattern IS NOT NULL
        AND ss.conflict_pattern != ''
      GROUP BY ss.conflict_pattern
      ORDER BY count DESC
      LIMIT 5
    `;

    // 7. 해결된 세션 비율
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
      partnerEmotionsResult,
      conflictPatternsResult,
      resolvedResult,
    ] = await Promise.all([
      db.query(currentSessionsQuery, [userId, startDate, endDate]),
      db.query(prevSessionsQuery, [userId, prevStartDate, prevEndDate]),
      db.query(topicsQuery, [userId, startDate, endDate]),
      db.query(emotionsQuery, [userId, startDate, endDate]),
      db.query(partnerEmotionsQuery, [userId, startDate, endDate]),
      db.query(conflictPatternsQuery, [userId, startDate, endDate]),
      db.query(resolvedQuery, [userId, startDate, endDate]),
    ]);

    const currentSessions = parseInt(currentSessionsResult.rows[0]?.count) || 0;
    const prevSessions = parseInt(prevSessionsResult.rows[0]?.count) || 0;
    const trend = currentSessions - prevSessions;

    const resolved = resolvedResult.rows[0] || { resolved_count: 0, total_count: 0 };
    const resolvedCount = parseInt(resolved.resolved_count) || 0;
    const totalCount = parseInt(resolved.total_count) || 0;

    // 주제 색상 (모던한 파스텔 팔레트)
    const topicColors = ['#6C5CE7', '#00CEC9', '#FDCB6E', '#E17055', '#74B9FF'];

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

    // 상대방 감정 데이터
    const partnerEmotions = partnerEmotionsResult.rows.map((row) => ({
      emotion: row.emotion,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage) || 0,
    }));

    // 갈등 패턴 데이터
    const conflictPatterns = conflictPatternsResult.rows.map((row) => ({
      pattern: row.pattern,
      count: parseInt(row.count),
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

    // 트렌드 메시지 생성 (기간별 라벨 사용)
    let trendMessage = '';
    if (trend > 0) {
      trendMessage = `${periodLabel}보다 더 자주 소통했어요`;
    } else if (trend < 0) {
      trendMessage = `${periodLabel}보다 대화가 줄었어요`;
    } else {
      trendMessage = `${periodLabel}과 비슷한 소통량이에요`;
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
      partnerEmotions,
      conflictPatterns,
      insight,
    });
  } catch (error) {
    console.error('Analysis patterns error:', error);
    res.status(500).json({ error: '패턴 분석을 불러오는데 실패했습니다' });
  }
});

// GET /api/analysis/insight - AI 맞춤 인사이트 생성
// 옵션 3: 통계 기반 + 최근 세션 샘플링 방식
router.get('/insight', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const period = req.query.period || '30days';

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const { startDate, endDate } = getDateRange(period);

    // 1. 전체 통계 정보 가져오기 (가벼운 쿼리들)
    const statsQueries = await Promise.all([
      // 총 세션 수
      db.query(`
        SELECT COUNT(*) as count
        FROM sessions
        WHERE user_id = $1 AND status = 'ended'
          AND started_at >= $2 AND started_at < $3
      `, [userId, startDate, endDate]),

      // 주요 갈등 주제 Top 5
      db.query(`
        SELECT st.tag_name as topic, COUNT(*) as count
        FROM session_tags st
        JOIN sessions s ON st.session_id = s.id
        WHERE s.user_id = $1 AND st.tag_type = 'topic'
          AND s.status = 'ended'
          AND s.started_at >= $2 AND s.started_at < $3
        GROUP BY st.tag_name
        ORDER BY count DESC
        LIMIT 5
      `, [userId, startDate, endDate]),

      // 주요 감정 Top 5
      db.query(`
        SELECT st.tag_name as emotion, COUNT(*) as count
        FROM session_tags st
        JOIN sessions s ON st.session_id = s.id
        WHERE s.user_id = $1 AND st.tag_type = 'my_emotion'
          AND s.status = 'ended'
          AND s.started_at >= $2 AND s.started_at < $3
        GROUP BY st.tag_name
        ORDER BY count DESC
        LIMIT 5
      `, [userId, startDate, endDate]),

      // 갈등 패턴 분포
      db.query(`
        SELECT ss.conflict_pattern as pattern, COUNT(*) as count
        FROM session_summaries ss
        JOIN sessions s ON ss.session_id = s.id
        WHERE s.user_id = $1 AND s.status = 'ended'
          AND s.started_at >= $2 AND s.started_at < $3
          AND ss.conflict_pattern IS NOT NULL
          AND ss.conflict_pattern != ''
        GROUP BY ss.conflict_pattern
        ORDER BY count DESC
        LIMIT 3
      `, [userId, startDate, endDate]),
    ]);

    const totalSessions = parseInt(statsQueries[0].rows[0]?.count) || 0;
    const topTopics = statsQueries[1].rows;
    const topEmotions = statsQueries[2].rows;
    const conflictPatterns = statsQueries[3].rows;

    if (totalSessions === 0) {
      return res.json({
        insight: null,
        message: '아직 분석할 대화가 충분하지 않아요. 더 많은 대화를 나눠보세요.',
      });
    }

    // 2. 최근 5~7개 세션 요약만 상세히 가져오기 (토큰 절약)
    const recentSummariesQuery = `
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
        ss.suggested_approach,
        s.started_at
      FROM session_summaries ss
      JOIN sessions s ON ss.session_id = s.id
      WHERE s.user_id = $1
        AND s.status = 'ended'
        AND s.started_at >= $2
        AND s.started_at < $3
      ORDER BY s.started_at DESC
      LIMIT 7
    `;

    const recentSummaries = await db.query(recentSummariesQuery, [userId, startDate, endDate]);

    // 3. AI에게 통계 + 샘플 데이터 함께 전달
    const insight = await claudeService.generatePatternInsightWithStats({
      period,
      totalSessions,
      topTopics: topTopics.map(t => ({ topic: t.topic, count: parseInt(t.count) })),
      topEmotions: topEmotions.map(e => ({ emotion: e.emotion, count: parseInt(e.count) })),
      conflictPatterns: conflictPatterns.map(p => ({ pattern: p.pattern, count: parseInt(p.count) })),
      recentSummaries: recentSummaries.rows,
    });

    res.json({
      insight,
      stats: {
        totalSessions,
        topicsAnalyzed: topTopics.length,
        emotionsAnalyzed: topEmotions.length,
        recentSessionsUsed: recentSummaries.rows.length,
      },
    });
  } catch (error) {
    console.error('Analysis insight error:', error);
    res.status(500).json({ error: '인사이트 생성에 실패했습니다' });
  }
});

module.exports = router;
