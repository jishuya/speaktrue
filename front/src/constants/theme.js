// ============================================
// SpeakTrue Design System
// ============================================

// --------------------------------------------
// 1. 색상 팔레트 (고정값)
// --------------------------------------------
const palette = {
  // Primary - 세이지 그린
  green: {
    50: '#F2F7F5',
    100: '#E8F0EB',
    200: '#CDE0D5',
    300: '#8FA996',
    400: '#6A8D73',  // 메인
    500: '#5D7A69',
    600: '#4A6254',
    900: '#2C3E33',
  },
  // Neutral
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Warm (배경용)
  warm: {
    50: '#FDFCFA',
    100: '#FAF9F6',
    200: '#EAE0D5',
  },
  // Semantic
  red: '#DC3545',
  orange: '#F5A623',
  yellow: '#FFC107',
  blue: '#5B8DEF',
  teal: '#1ABC9C',
  purple: '#9B59B6',
  // Special
  white: '#FFFFFF',
  black: '#000000',
  kakao: '#FEE500',
  kakaoText: '#371D1E',
};

// --------------------------------------------
// 2. 시맨틱 테마 (라이트/다크)
// --------------------------------------------
export const lightTheme = {
  // 배경
  bg: {
    primary: palette.warm[100],      // 메인 배경
    secondary: palette.white,         // 카드/서피스
    tertiary: palette.green[50],      // 강조 배경
    inverse: palette.green[900],      // 반전 배경
  },
  // 텍스트
  text: {
    primary: palette.green[900],      // 주요 텍스트
    secondary: palette.gray[600],     // 보조 텍스트
    muted: palette.gray[400],         // 비활성/힌트
    inverse: palette.white,           // 반전 텍스트
    brand: palette.green[400],        // 브랜드 컬러
  },
  // 보더
  border: {
    light: palette.gray[200],
    default: palette.gray[300],
    focus: palette.green[400],
  },
  // 채팅 버블
  bubble: {
    user: palette.green[400],
    userText: palette.white,
    ai: palette.green[50],
    aiText: palette.green[900],
  },
  // 네비게이션
  nav: {
    bg: palette.white,
    active: palette.green[400],
    inactive: palette.gray[400],
  },
  // 오버레이
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme = {
  bg: {
    primary: palette.green[900],
    secondary: palette.gray[800],
    tertiary: palette.gray[700],
    inverse: palette.warm[100],
  },
  text: {
    primary: palette.gray[100],
    secondary: palette.gray[400],
    muted: palette.gray[500],
    inverse: palette.green[900],
    brand: palette.green[300],
  },
  border: {
    light: palette.gray[700],
    default: palette.gray[600],
    focus: palette.green[300],
  },
  bubble: {
    user: palette.green[400],
    userText: palette.white,
    ai: palette.gray[800],
    aiText: palette.gray[100],
  },
  nav: {
    bg: palette.gray[800],
    active: palette.green[300],
    inactive: palette.gray[500],
  },
  overlay: 'rgba(0, 0, 0, 0.7)',
};

// --------------------------------------------
// 3. 공통 토큰 (테마 무관)
// --------------------------------------------

// 색상 - 기존 컴포넌트 호환 + 의미 기반
export const COLORS = {
  // Primary
  primary: palette.green[400],
  primaryLight: palette.green[300],
  primaryDark: palette.green[500],
  primarySoft: palette.green[200],
  primaryBg: palette.green[50],

  // Background & Surface
  backgroundLight: palette.warm[100],
  backgroundDark: palette.green[900],
  surface: palette.white,
  surfaceDark: palette.gray[800],

  // Text
  textPrimary: palette.green[900],
  textSecondary: palette.gray[600],
  textMuted: palette.gray[400],

  // Semantic
  success: '#28A745',
  warning: palette.yellow,
  error: palette.red,
  info: '#17A2B8',

  // Emotion (앱 특화)
  emotion: {
    frustrated: palette.orange,
    anxious: palette.blue,
    sad: palette.purple,
    happy: '#2ECC71',
    angry: '#E74C3C',
    peaceful: palette.teal,
    worried: '#F39C12',
    understood: palette.green[400],
  },

  // Chat
  bubbleUser: palette.green[400],
  bubbleAi: palette.green[50],

  // Border
  border: palette.gray[300],
  borderLight: palette.gray[200],

  // Etc
  kakao: palette.kakao,
  kakaoText: palette.kakaoText,
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// 간격
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 폰트 크기 (최소 12px - 접근성 기준)
export const FONT_SIZE = {
  xs: 12,      // 최소 크기 (라벨, 캡션)
  sm: 13,      // 작은 텍스트
  md: 14,      // 본문 최소
  base: 16,    // 기본 본문
  lg: 18,      // 강조 본문
  xl: 20,      // 소제목
  xxl: 24,     // 제목 (기존 호환)
  xxxl: 28,    // 큰 제목 (기존 호환)
  hero: 32,    // 화면 제목
  display: 36, // 큰 숫자/아이콘
  giant: 40,   // 히어로 텍스트
};

// 폰트 패밀리
export const FONT_FAMILY = {
  base: 'NotoSansKR',
};

// 폰트 두께
export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

// 둥글기
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// 그림자
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
    shadowColor: palette.green[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
};

// Z-Index
export const Z_INDEX = {
  dropdown: 10,
  sticky: 20,
  modal: 50,
  toast: 80,
};

// 애니메이션
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// 레이아웃
export const LAYOUT = {
  screenPaddingH: SPACING.lg,
  screenPaddingV: SPACING.md,
  headerHeight: 56,
  bottomNavHeight: 80,
};

// 화면 기본 패딩 (기존 호환)
export const SCREEN_PADDING = {
  horizontal: SPACING.lg,
  vertical: SPACING.md,
};

// --------------------------------------------
// 기본 내보내기
// --------------------------------------------
export default {
  palette,
  light: lightTheme,
  dark: darkTheme,
  COLORS,
  SPACING,
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOWS,
  Z_INDEX,
  ANIMATION,
  LAYOUT,
};
