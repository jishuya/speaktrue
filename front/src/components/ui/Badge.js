import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS } from '../../constants/theme';

const VARIANTS = {
  default: { bg: COLORS.borderLight, text: COLORS.textSecondary },
  primary: { bg: COLORS.primaryBg, text: COLORS.primary },
  success: { bg: '#E8F5E9', text: '#2E7D32' },
  warning: { bg: '#FFF8E1', text: '#F57F17' },
  error: { bg: '#FFEBEE', text: '#C62828' },
  info: { bg: '#E3F2FD', text: '#1565C0' },
};

const SIZES = {
  sm: { paddingH: SPACING.sm, paddingV: 2, fontSize: FONT_SIZE.xs },
  md: { paddingH: SPACING.md, paddingV: 4, fontSize: FONT_SIZE.sm },
  lg: { paddingH: SPACING.md, paddingV: 6, fontSize: FONT_SIZE.md },
};

// Badge
export default function Badge({
  label,
  variant = 'default',
  size = 'md',
  dot = false,
  style,
}) {
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
        },
        style,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: v.text }]} />}
      <Text style={[styles.label, { color: v.text, fontSize: s.fontSize }]}>
        {label}
      </Text>
    </View>
  );
}

// Tag (닫기 버튼 포함)
export function Tag({ label, variant = 'primary', onRemove, style }) {
  const v = VARIANTS[variant];

  return (
    <View style={[styles.tag, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.tagLabel, { color: v.text }]}>{label}</Text>
      {onRemove && (
        <Text style={[styles.tagRemove, { color: v.text }]} onPress={onRemove}>
          ×
        </Text>
      )}
    </View>
  );
}

// 숫자 배지 (알림 등)
export function NumberBadge({ count, max = 99, style }) {
  const displayCount = count > max ? `${max}+` : count;

  if (!count || count <= 0) return null;

  return (
    <View style={[styles.numberBadge, style]}>
      <Text style={styles.numberBadgeText}>{displayCount}</Text>
    </View>
  );
}

// 상태 표시 점
export function StatusDot({ status = 'default', size = 8, style }) {
  const colors = {
    default: COLORS.textMuted,
    online: COLORS.success,
    offline: COLORS.textMuted,
    busy: COLORS.error,
    away: COLORS.warning,
  };

  return (
    <View
      style={[
        styles.statusDot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors[status] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  label: {
    fontFamily: FONT_FAMILY.base,
    fontWeight: FONT_WEIGHT.semiBold,
  },

  // Tag
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  tagLabel: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  tagRemove: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },

  // Number Badge
  numberBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  numberBadgeText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 11,  // 최소 라벨 크기
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },

  // Status Dot
  statusDot: {},
});
