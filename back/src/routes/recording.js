const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../services/db');
const clovaSpeech = require('../services/clovaspeech');
const claudeService = require('../services/claude');
const fs = require('fs').promises;
const path = require('path');

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, '../../uploads/recordings');

// 업로드 디렉토리 생성 (없으면)
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * POST /api/recording/upload
 * 녹음 파일 업로드 및 STT 변환
 *
 * Request body:
 * - audioData: Base64 인코딩된 오디오 파일
 * - filename: 파일명 (optional)
 * - duration: 녹음 길이 (초)
 * - location: 녹음 장소 (optional)
 */
router.post('/upload', async (req, res) => {
  const startTime = Date.now();
  console.log('\n========== [RECORDING UPLOAD] 시작 ==========');

  try {
    const { audioData, filename = 'recording.m4a', duration, location, userId } = req.body;
    console.log('[UPLOAD] 요청 정보:', {
      userId,
      filename,
      duration,
      audioDataLength: audioData?.length || 0
    });

    if (!audioData) {
      console.log('[UPLOAD] 실패: 오디오 데이터 없음');
      return res.status(400).json({ error: '오디오 데이터가 필요합니다.' });
    }

    if (!userId) {
      console.log('[UPLOAD] 실패: userId 없음');
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    // 1. 세션 생성
    const sessionId = uuidv4();
    console.log('[UPLOAD] 1단계: 세션 생성 시작 - sessionId:', sessionId);

    await db.query(
      `INSERT INTO sessions (id, user_id, session_type, status, started_at)
       VALUES ($1, $2, 'recording', 'active', NOW())`,
      [sessionId, userId]
    );
    console.log('[UPLOAD] 1단계 완료: sessions 테이블에 저장됨');

    // 2. 오디오 파일 저장
    console.log('[UPLOAD] 2단계: 오디오 파일 저장 시작');
    await ensureUploadDir();
    const audioBuffer = Buffer.from(audioData, 'base64');
    const savedFilename = `${sessionId}_${Date.now()}.m4a`;
    const filePath = path.join(UPLOAD_DIR, savedFilename);
    await fs.writeFile(filePath, audioBuffer);
    console.log('[UPLOAD] 2단계 완료: 파일 저장됨 -', savedFilename);

    // 3. recording_details 저장
    console.log('[UPLOAD] 3단계: recording_details 저장 시작');
    const recordingId = uuidv4();
    await db.query(
      `INSERT INTO recording_details (id, session_id, audio_url, duration, location, recorded_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [recordingId, sessionId, `/uploads/recordings/${savedFilename}`, duration || 0, location || null]
    );
    console.log('[UPLOAD] 3단계 완료: recording_details 저장됨 - recordingId:', recordingId);

    // 4. Clova Speech API로 STT + 화자 분리
    console.log('[UPLOAD] 4단계: Clova STT 시작');
    const clovaResult = await clovaSpeech.transcribeAudio(audioBuffer, filename);
    console.log('[UPLOAD] 4단계 완료: Clova STT 완료');

    // 5. 결과 파싱 및 DB 저장
    console.log('[UPLOAD] 5단계: 트랜스크립트 저장 시작');
    const transcripts = clovaSpeech.parseTranscriptResult(clovaResult);
    console.log('[UPLOAD] 파싱된 트랜스크립트 수:', transcripts.length);

    for (const transcript of transcripts) {
      await db.query(
        `INSERT INTO recording_transcripts (id, session_id, speaker, content, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), sessionId, transcript.speaker, transcript.content, transcript.startTime, transcript.endTime]
      );
    }
    console.log('[UPLOAD] 5단계 완료: recording_transcripts 저장됨');

    // 6. 세션 완료 처리
    console.log('[UPLOAD] 6단계: 세션 상태 업데이트 (ended)');
    await db.query(
      `UPDATE sessions SET status = 'ended', ended_at = NOW() WHERE id = $1`,
      [sessionId]
    );
    console.log('[UPLOAD] 6단계 완료: 세션 상태 ended로 변경됨');

    const elapsed = Date.now() - startTime;
    console.log(`[UPLOAD] 전체 완료 - sessionId: ${sessionId}, 소요시간: ${elapsed}ms`);
    console.log('========== [RECORDING UPLOAD] 완료 ==========\n');

    res.json({
      success: true,
      sessionId,
      recordingId,
      transcripts,
      fullText: clovaSpeech.getFullText(clovaResult),
    });
  } catch (error) {
    console.error('[UPLOAD] 오류 발생:', error);
    console.error('[UPLOAD] 오류 스택:', error.stack);
    console.log('========== [RECORDING UPLOAD] 실패 ==========\n');
    res.status(500).json({ error: '녹음 처리 중 오류가 발생했습니다.', details: error.message });
  }
});

/**
 * GET /api/recording/:sessionId
 * 녹음 세션 상세 조회
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 세션 정보
    const sessionResult = await db.query(
      `SELECT * FROM sessions WHERE id = $1`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }

    // 녹음 상세 정보
    const recordingResult = await db.query(
      `SELECT * FROM recording_details WHERE session_id = $1`,
      [sessionId]
    );

    // 트랜스크립트
    const transcriptsResult = await db.query(
      `SELECT * FROM recording_transcripts
       WHERE session_id = $1
       ORDER BY start_time ASC`,
      [sessionId]
    );

    res.json({
      session: sessionResult.rows[0],
      recording: recordingResult.rows[0] || null,
      transcripts: transcriptsResult.rows,
    });
  } catch (error) {
    console.error('녹음 조회 오류:', error);
    res.status(500).json({ error: '조회 중 오류가 발생했습니다.' });
  }
});

/**
 * GET /api/recording/list/all
 * 모든 녹음 세션 목록
 */
router.get('/list/all', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, rd.duration, rd.recorded_at
       FROM sessions s
       LEFT JOIN recording_details rd ON s.id = rd.session_id
       WHERE s.session_type = 'recording'
       ORDER BY s.created_at DESC
       LIMIT 50`
    );

    res.json({ recordings: result.rows });
  } catch (error) {
    console.error('녹음 목록 조회 오류:', error);
    res.status(500).json({ error: '목록 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * POST /api/recording/analyze/:sessionId
 * 녹음 대화 AI 분석 (session_summaries, session_tags에 저장)
 */
router.post('/analyze/:sessionId', async (req, res) => {
  const startTime = Date.now();
  const { sessionId } = req.params;
  console.log('\n========== [RECORDING ANALYZE] 시작 ==========');
  console.log('[ANALYZE] sessionId:', sessionId);

  try {
    // 1. 세션 존재 확인
    console.log('[ANALYZE] 1단계: 세션 존재 확인');
    const sessionResult = await db.query(
      `SELECT id, session_type, user_id FROM sessions WHERE id = $1`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      console.log('[ANALYZE] 실패: 세션을 찾을 수 없음');
      return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }
    console.log('[ANALYZE] 1단계 완료: 세션 찾음 -', sessionResult.rows[0]);

    // 2. 트랜스크립트 조회
    console.log('[ANALYZE] 2단계: 트랜스크립트 조회');
    const transcriptsResult = await db.query(
      `SELECT speaker, content, start_time as "startTime", end_time as "endTime"
       FROM recording_transcripts
       WHERE session_id = $1
       ORDER BY start_time ASC`,
      [sessionId]
    );

    if (transcriptsResult.rows.length === 0) {
      console.log('[ANALYZE] 실패: 트랜스크립트 없음');
      return res.status(400).json({ error: '분석할 대화 내용이 없습니다.' });
    }

    const transcripts = transcriptsResult.rows;
    console.log('[ANALYZE] 2단계 완료: 트랜스크립트', transcripts.length, '개 조회됨');

    // 3. Claude API로 분석
    console.log('[ANALYZE] 3단계: Claude API 분석 시작');
    const analysis = await claudeService.analyzeRecordingConversation(transcripts);
    console.log('[ANALYZE] 3단계 완료: Claude 분석 결과 -', {
      rootCause: analysis.rootCause?.substring(0, 50) + '...',
      topicsCount: analysis.topics?.length || 0,
      emotionsCount: analysis.myEmotions?.length || 0
    });

    // 4. session_summaries 테이블에 저장
    console.log('[ANALYZE] 4단계: session_summaries 저장 시작');
    await db.query(
      `INSERT INTO session_summaries (
        session_id, root_cause, trigger_situation, summary,
        my_emotions, my_needs, my_unmet_need,
        partner_emotions, partner_needs, partner_unmet_need,
        conflict_pattern, suggested_approach, action_items
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (session_id) DO UPDATE SET
        root_cause = $2, trigger_situation = $3, summary = $4,
        my_emotions = $5, my_needs = $6, my_unmet_need = $7,
        partner_emotions = $8, partner_needs = $9, partner_unmet_need = $10,
        conflict_pattern = $11, suggested_approach = $12, action_items = $13`,
      [
        sessionId,
        analysis.rootCause,
        analysis.triggerSituation,
        analysis.summary,
        analysis.myEmotions,
        analysis.myNeeds,
        analysis.myUnmetNeed,
        analysis.partnerEmotions,
        analysis.partnerNeeds,
        analysis.partnerUnmetNeed,
        analysis.conflictPattern,
        analysis.suggestedApproach,
        analysis.actionItems,
      ]
    );
    console.log('[ANALYZE] 4단계 완료: session_summaries 저장됨');

    // 5. session_tags 테이블에 주제 태그 저장
    console.log('[ANALYZE] 5단계: session_tags (topic) 저장 시작');
    if (analysis.topics && analysis.topics.length > 0) {
      for (const topic of analysis.topics) {
        await db.query(
          `INSERT INTO session_tags (session_id, tag_type, tag_name)
           VALUES ($1, 'topic', $2)
           ON CONFLICT (session_id, tag_type, tag_name) DO NOTHING`,
          [sessionId, topic]
        );
      }
      console.log('[ANALYZE] 5단계 완료: topic 태그', analysis.topics.length, '개 저장됨');
    } else {
      console.log('[ANALYZE] 5단계 스킵: topic 없음');
    }

    // 6. 감정 태그 저장
    console.log('[ANALYZE] 6단계: session_tags (emotion) 저장 시작');
    if (analysis.myEmotions && analysis.myEmotions.length > 0) {
      for (const emotion of analysis.myEmotions.slice(0, 3)) {
        await db.query(
          `INSERT INTO session_tags (session_id, tag_type, tag_name)
           VALUES ($1, 'my_emotion', $2)
           ON CONFLICT (session_id, tag_type, tag_name) DO NOTHING`,
          [sessionId, emotion]
        );
      }
      console.log('[ANALYZE] 6단계 완료: emotion 태그 저장됨');
    } else {
      console.log('[ANALYZE] 6단계 스킵: emotion 없음');
    }

    // 7. 세션 상태 업데이트 (분석 완료)
    console.log('[ANALYZE] 7단계: 세션 상태 업데이트');
    await db.query(
      `UPDATE sessions SET status = 'ended', ended_at = NOW() WHERE id = $1`,
      [sessionId]
    );
    console.log('[ANALYZE] 7단계 완료: 세션 상태 ended로 변경됨');

    // DB 검증
    console.log('[ANALYZE] 검증: session_summaries 저장 확인');
    const verifyResult = await db.query(
      `SELECT session_id, root_cause FROM session_summaries WHERE session_id = $1`,
      [sessionId]
    );
    console.log('[ANALYZE] 검증 결과:', verifyResult.rows.length > 0 ? '저장됨' : '저장 안됨!');

    const elapsed = Date.now() - startTime;
    console.log(`[ANALYZE] 전체 완료 - sessionId: ${sessionId}, 소요시간: ${elapsed}ms`);
    console.log('========== [RECORDING ANALYZE] 완료 ==========\n');

    res.json({
      success: true,
      sessionId,
      analysis,
    });
  } catch (error) {
    console.error('[ANALYZE] 오류 발생:', error);
    console.error('[ANALYZE] 오류 스택:', error.stack);
    console.log('========== [RECORDING ANALYZE] 실패 ==========\n');
    res.status(500).json({ error: 'AI 분석 중 오류가 발생했습니다.', details: error.message });
  }
});

/**
 * DELETE /api/recording/:sessionId
 * 녹음 세션 삭제
 */
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 파일 경로 조회
    const recordingResult = await db.query(
      `SELECT audio_url FROM recording_details WHERE session_id = $1`,
      [sessionId]
    );

    // 파일 삭제
    if (recordingResult.rows.length > 0) {
      const audioUrl = recordingResult.rows[0].audio_url;
      const filePath = path.join(__dirname, '../..', audioUrl);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('파일 삭제 실패:', err.message);
      }
    }

    // DB 삭제 (cascade로 관련 데이터도 삭제됨)
    await db.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);

    res.json({ success: true });
  } catch (error) {
    console.error('녹음 삭제 오류:', error);
    res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
