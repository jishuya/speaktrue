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
  try {
    const { audioData, filename = 'recording.m4a', duration, location } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: '오디오 데이터가 필요합니다.' });
    }

    // 1. 세션 생성
    const sessionId = uuidv4();
    // 임시 사용자 ID (나중에 인증 연동 시 교체)
    const TEMP_USER_ID = '11111111-1111-1111-1111-111111111111';

    await db.query(
      `INSERT INTO sessions (id, user_id, session_type, status, started_at)
       VALUES ($1, $2, 'recording', 'active', NOW())`,
      [sessionId, TEMP_USER_ID]
    );

    // 2. 오디오 파일 저장
    await ensureUploadDir();
    const audioBuffer = Buffer.from(audioData, 'base64');
    const savedFilename = `${sessionId}_${Date.now()}.m4a`;
    const filePath = path.join(UPLOAD_DIR, savedFilename);
    await fs.writeFile(filePath, audioBuffer);

    // 3. recording_details 저장
    const recordingId = uuidv4();
    await db.query(
      `INSERT INTO recording_details (id, session_id, audio_url, duration, location, recorded_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [recordingId, sessionId, `/uploads/recordings/${savedFilename}`, duration || 0, location || null]
    );

    // 4. Clova Speech API로 STT + 화자 분리
    console.log('Clova Speech API 호출 중...');
    const clovaResult = await clovaSpeech.transcribeAudio(audioBuffer, filename);
    console.log('Clova Speech API 응답:', JSON.stringify(clovaResult, null, 2));

    // 5. 결과 파싱 및 DB 저장
    const transcripts = clovaSpeech.parseTranscriptResult(clovaResult);

    for (const transcript of transcripts) {
      await db.query(
        `INSERT INTO recording_transcripts (id, session_id, speaker, content, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), sessionId, transcript.speaker, transcript.content, transcript.startTime, transcript.endTime]
      );
    }

    // 6. 세션 완료 처리
    await db.query(
      `UPDATE sessions SET status = 'completed', ended_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    res.json({
      success: true,
      sessionId,
      recordingId,
      transcripts,
      fullText: clovaSpeech.getFullText(clovaResult),
    });
  } catch (error) {
    console.error('녹음 업로드 오류:', error);
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
  try {
    const { sessionId } = req.params;

    // 1. 세션 존재 확인
    const sessionResult = await db.query(
      `SELECT id, session_type FROM sessions WHERE id = $1`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }

    // 2. 트랜스크립트 조회
    const transcriptsResult = await db.query(
      `SELECT speaker, content, start_time as "startTime", end_time as "endTime"
       FROM recording_transcripts
       WHERE session_id = $1
       ORDER BY start_time ASC`,
      [sessionId]
    );

    if (transcriptsResult.rows.length === 0) {
      return res.status(400).json({ error: '분석할 대화 내용이 없습니다.' });
    }

    const transcripts = transcriptsResult.rows;

    // 3. Claude API로 분석
    const analysis = await claudeService.analyzeRecordingConversation(transcripts);

    // 4. session_summaries 테이블에 저장
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

    // 5. session_tags 테이블에 주제 태그 저장
    if (analysis.topics && analysis.topics.length > 0) {
      for (const topic of analysis.topics) {
        await db.query(
          `INSERT INTO session_tags (session_id, tag_type, tag_name)
           VALUES ($1, 'topic', $2)
           ON CONFLICT (session_id, tag_type, tag_name) DO NOTHING`,
          [sessionId, topic]
        );
      }
    }

    // 6. 감정 태그 저장
    if (analysis.myEmotions && analysis.myEmotions.length > 0) {
      for (const emotion of analysis.myEmotions.slice(0, 3)) {
        await db.query(
          `INSERT INTO session_tags (session_id, tag_type, tag_name)
           VALUES ($1, 'my_emotion', $2)
           ON CONFLICT (session_id, tag_type, tag_name) DO NOTHING`,
          [sessionId, emotion]
        );
      }
    }

    // 7. 세션 상태 업데이트 (분석 완료)
    await db.query(
      `UPDATE sessions SET status = 'analyzed', ended_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    res.json({
      success: true,
      sessionId,
      analysis,
    });
  } catch (error) {
    console.error('녹음 분석 오류:', error);
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
