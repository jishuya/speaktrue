-- =============================================
-- SpeakTrue Database Schema (PostgreSQL)
-- MVP 버전 - 총 7개 테이블 + 3개 뷰
-- =============================================

-- 기존 테이블 삭제 (개발용)
DROP VIEW IF EXISTS user_session_stats CASCADE;
DROP VIEW IF EXISTS emotion_stats CASCADE;
DROP VIEW IF EXISTS topic_stats CASCADE;

DROP TABLE IF EXISTS conversation_summaries CASCADE;
DROP TABLE IF EXISTS nvc_conversions CASCADE;
DROP TABLE IF EXISTS session_tags CASCADE;
DROP TABLE IF EXISTS session_summaries CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- 1. 사용자 (Users)
-- =============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE,
    name            VARCHAR(100) NOT NULL,
    gender          VARCHAR(10) NOT NULL DEFAULT 'wife',
    type        	VARCHAR(10) NOT NULL DEFAULT 'female',
    partner_name    VARCHAR(100),
    profile_image   TEXT,

    -- OAuth
    oauth_provider  VARCHAR(20),  -- 'kakao', 'naver', 'google'
    oauth_id        VARCHAR(255),

    -- 설정
    notifications_enabled BOOLEAN DEFAULT true,

    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- =============================================
-- 2. 상담 세션 (Sessions) : "한 번의 상담 = 1세션" 단위를 관리, 대화를 "10월 15일 상담" 이런식으로 그룹핑
-- =============================================
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    status          VARCHAR(20) DEFAULT 'active',  -- 'active', 'ended'
    is_resolved     BOOLEAN DEFAULT false,
    summary_only    BOOLEAN DEFAULT false,  -- true면 메시지 삭제됨, 요약만 보기 가능

    started_at      TIMESTAMP DEFAULT NOW(),
    ended_at        TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id, started_at DESC);

-- =============================================
-- 3. 채팅 메시지 (Messages)
-- =============================================
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

    role            VARCHAR(20) NOT NULL,  -- 'user', 'assistant'
    content         TEXT NOT NULL,
    image_url       TEXT,

    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id, created_at);

-- =============================================
-- 4. 세션 요약 (Session Summaries)
-- 세션 종료 시 AI가 자동 생성
-- =============================================
CREATE TABLE session_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,

    -- 근본 원인
    root_cause      TEXT,                -- 이 싸움의 근본 원인 (한 문장)
    trigger_situation TEXT,              -- 트리거 상황 (가사, 시댁, 돈, 육아 등)

    -- 대화 내용을 요약한 텍스트
    summary         TEXT,

    -- 나의 관점
    my_emotions     TEXT[],
    my_needs        TEXT[],
    my_unmet_need   TEXT,                -- 내가 충족받지 못한 핵심 욕구

    -- 상대방 관점 (입장전환에서 추정)
    partner_emotions TEXT[],
    partner_needs    TEXT[],
    partner_unmet_need TEXT,             -- 상대방의 충족되지 못한 욕구

    -- 갈등 패턴 및 솔루션
    conflict_pattern TEXT,               -- 갈등 패턴 (회피형, 폭발형, 냉전형 등)
    suggested_approach TEXT,             -- AI 제안 접근법
    action_items    TEXT[],              -- 실천 항목

    created_at      TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- 5. 세션 태그 (Session Tags)
-- 주제/감정 통합 테이블
-- =============================================
CREATE TABLE session_tags (
    id              SERIAL PRIMARY KEY,
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

    tag_type        VARCHAR(20) NOT NULL,  -- 'topic', 'my_emotion', 'partner_emotion'
    tag_name        VARCHAR(50) NOT NULL,

    UNIQUE(session_id, tag_type, tag_name)
);

CREATE INDEX idx_session_tags ON session_tags(session_id);
CREATE INDEX idx_session_tags_stats ON session_tags(tag_type, tag_name);

-- =============================================
-- 6. NVC 변환 기록 (NVC Conversions)
-- =============================================
CREATE TABLE nvc_conversions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id      UUID REFERENCES sessions(id) ON DELETE SET NULL,

    original_text   TEXT NOT NULL,
    converted_text  TEXT NOT NULL,

    -- NVC 4요소
    observation     TEXT,
    feeling         TEXT,
    need            TEXT,
    request         TEXT,

    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nvc_user ON nvc_conversions(user_id, created_at DESC);

-- =============================================
-- 7. 대화 요약 캐시 (Conversation Summaries)
-- 긴 대화(20개 이상) 중간 요약 저장 - Claude API 호출 시 토큰 절약용
-- =============================================
CREATE TABLE conversation_summaries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,

    summary_content     TEXT NOT NULL,     -- 요약 내용
    message_count       INTEGER NOT NULL,  -- 요약에 포함된 메시지 수

    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conv_summary_session ON conversation_summaries(session_id);

-- =============================================
-- 뷰 (Views) - 통계/조회용
-- =============================================

-- 1. 주제별 통계
CREATE VIEW topic_stats AS
SELECT
    st.tag_name AS topic,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 1) AS percentage
FROM session_tags st
JOIN sessions s ON st.session_id = s.id
WHERE st.tag_type = 'topic'
  AND s.status = 'ended'
GROUP BY st.tag_name
ORDER BY count DESC;

-- 2. 감정별 통계 (나/상대방 구분)
CREATE VIEW emotion_stats AS
SELECT
    CASE
        WHEN st.tag_type = 'my_emotion' THEN 'my'
        WHEN st.tag_type = 'partner_emotion' THEN 'partner'
    END AS whose,
    st.tag_name AS emotion,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(PARTITION BY st.tag_type), 0), 1) AS percentage
FROM session_tags st
JOIN sessions s ON st.session_id = s.id
WHERE st.tag_type IN ('my_emotion', 'partner_emotion')
  AND s.status = 'ended'
GROUP BY st.tag_type, st.tag_name
ORDER BY st.tag_type, count DESC;

-- 3. 사용자별 세션 통계
CREATE VIEW user_session_stats AS
SELECT
    user_id,
    COUNT(*) AS total_sessions,
    COUNT(*) FILTER (WHERE is_resolved = true) AS resolved_count,
    COUNT(*) FILTER (WHERE is_resolved = false) AS unresolved_count,
    MAX(started_at) AS last_session_at
FROM sessions
WHERE status = 'ended'
GROUP BY user_id;
