// TrueSpeak 테마 - 커플 소통 앱 디자인 시스템
export const COLORS = {
  // Primary - 세이지 그린 (차분하고 신뢰감 있는 녹색)
  primary: '#6A8D73',
  primaryLight: '#8FA996',
  primaryDark: '#5D7A69',
  primarySoft: '#CDE0D5',
  primaryBg: '#F2F7F5',

  // Secondary - 따뜻한 베이지/샌드
  secondary: '#EAE0D5',
  secondaryBg: '#E8F0EB',

  // Accent - 따뜻한 강조색
  accentWarm: '#D9A066',
  accentOrange: '#F5A623',

  // Background - 배경색
  backgroundLight: '#FAF9F6',
  backgroundDark: '#1A211D',

  // Surface - 표면색
  surface: '#FFFFFF',
  surfaceDark: '#252E28',

  // Text - 텍스트 색상
  textPrimary: '#2C3E33',
  textSecondary: '#687D70',
  textSoft: '#788580',
  textMuted: '#9CAEA6',

  // Semantic Colors - 의미 기반 색상
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',

  // Emotion Colors - 감정 색상
  emotion: {
    frustrated: '#F5A623',      // 답답함 - 오렌지
    anxious: '#5B8DEF',         // 불안함 - 파랑
    sad: '#9B59B6',             // 슬픔 - 보라
    happy: '#2ECC71',           // 기쁨 - 초록
    angry: '#E74C3C',           // 화남 - 빨강
    peaceful: '#1ABC9C',        // 평온함 - 청록
    worried: '#F39C12',         // 걱정 - 호박색
    understood: '#6A8D73',      // 이해받음 - 프라이머리
  },

  // Chat Bubble Colors - 채팅 말풍선 색상
  bubbleAi: '#EBF2EE',
  bubbleAiDark: '#2F3B36',
  bubbleUser: '#6A8D73',

  // Border & Divider - 테두리 및 구분선
  border: '#DEE2E6',
  borderLight: '#E8EBE8',
  divider: '#E6EBE8',

  // Status - 상태 색상
  online: '#28A745',
  offline: '#6C757D',

  // Kakao - 카카오 로그인
  kakao: '#FEE500',
  kakaoText: '#371D1E',

  // Transparent - 투명 오버레이
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHT = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#6A8D73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  soft: {
    shadowColor: '#6A8D73',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 8,
  },
  nav: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
};

// 화면 기본 패딩
export const SCREEN_PADDING = {
  horizontal: SPACING.lg,
  vertical: SPACING.md,
};

export default {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOWS,
  SCREEN_PADDING,
};
