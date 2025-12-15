// TrueSpeak Theme - ÄÄ åµ qD \ 0;X‡ (Ñ\ ÏÏ ∏
export const COLORS = {
  // Primary - Sage Green ((ÑX‡ X x êå)
  primary: '#6A8D73',
  primaryLight: '#8FA996',
  primaryDark: '#5D7A69',
  primarySoft: '#CDE0D5',
  primaryBg: '#F2F7F5',

  // Secondary - Warm Beige/Sand
  secondary: '#EAE0D5',
  secondaryBg: '#E8F0EB',

  // Accent - Warm highlights
  accentWarm: '#D9A066',
  accentOrange: '#F5A623',

  // Background
  backgroundLight: '#FAF9F6',
  backgroundDark: '#1A211D',

  // Surface
  surface: '#FFFFFF',
  surfaceDark: '#252E28',

  // Text
  textPrimary: '#2C3E33',
  textSecondary: '#687D70',
  textSoft: '#788580',
  textMuted: '#9CAEA6',

  // Semantic Colors
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',

  // Emotion Colors ( ‹¯©)
  emotion: {
    frustrated: '#F5A623',      // ııh - Orange
    anxious: '#5B8DEF',         // àH - Blue
    sad: '#9B59B6',             // ¨ - Purple
    happy: '#2ECC71',           // âı - Green
    angry: '#E74C3C',           // T® - Red
    peaceful: '#1ABC9C',        // …H - Teal
    worried: '#F39C12',         // q - Amber
    understood: '#6A8D73',      // ttL - Primary
  },

  // Chat Bubble Colors
  bubbleAi: '#EBF2EE',
  bubbleAiDark: '#2F3B36',
  bubbleUser: '#6A8D73',

  // Border & Divider
  border: '#DEE2E6',
  borderLight: '#E8EBE8',
  divider: '#E6EBE8',

  // Status
  online: '#28A745',
  offline: '#6C757D',

  // Kakao (ı  0•©)
  kakao: '#FEE500',
  kakaoText: '#371D1E',

  // Transparent
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

// Ttƒ 0¯ §¿|
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
