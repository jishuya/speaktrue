import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const VARIANTS = {
  primary: {
    bg: COLORS.primary,
    text: COLORS.surface,
    border: 'transparent',
  },
  secondary: {
    bg: COLORS.primaryBg,
    text: COLORS.primary,
    border: 'transparent',
  },
  outline: {
    bg: 'transparent',
    text: COLORS.primary,
    border: COLORS.primary,
  },
  ghost: {
    bg: 'transparent',
    text: COLORS.textSecondary,
    border: 'transparent',
  },
  danger: {
    bg: COLORS.error,
    text: COLORS.surface,
    border: 'transparent',
  },
  dangerOutline: {
    bg: 'transparent',
    text: COLORS.error,
    border: COLORS.error,
  },
};

const SIZES = {
  sm: { height: 36, paddingH: SPACING.md, fontSize: FONT_SIZE.sm, iconSize: 16 },
  md: { height: 48, paddingH: SPACING.lg, fontSize: FONT_SIZE.base, iconSize: 20 },
  lg: { height: 56, paddingH: SPACING.xl, fontSize: FONT_SIZE.lg, iconSize: 24 },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: v.border !== 'transparent' ? 1 : 0,
          height: s.height,
          paddingHorizontal: s.paddingH,
          opacity: isDisabled ? 0.5 : 1,
        },
        variant === 'primary' && styles.shadow,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialIcons name={icon} size={s.iconSize} color={v.text} style={styles.iconLeft} />
          )}
          <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <MaterialIcons name={icon} size={s.iconSize} color={v.text} style={styles.iconRight} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

// 아이콘 버튼
export function IconButton({
  icon,
  onPress,
  size = 40,
  color = COLORS.textPrimary,
  backgroundColor = 'transparent',
  disabled = false,
  style,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <MaterialIcons name={icon} size={size * 0.5} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  shadow: {
    ...SHADOWS.md,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontFamily: FONT_FAMILY.base,
    fontWeight: FONT_WEIGHT.bold,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },

  // Icon Button
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
