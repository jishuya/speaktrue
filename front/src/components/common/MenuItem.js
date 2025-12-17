import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../constants/theme';

export default function MenuItem({
  icon,
  iconBgColor,
  iconColor,
  title,
  subtitle,
  value,
  showArrow = true,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  onPress,
  danger = false,
  style,
}) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={showSwitch ? 1 : 0.7}
      disabled={showSwitch}
    >
      <View style={styles.leftSection}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconBgColor || COLORS.primaryBg }]}>
            <Icon
              name={icon}
              size={22}
              color={danger ? COLORS.error : (iconColor || COLORS.primary)}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, danger && styles.dangerText]}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.rightSection}>
        {value && <Text style={styles.value}>{value}</Text>}
        {showSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: COLORS.borderLight, true: `${COLORS.primary}50` }}
            thumbColor={switchValue ? COLORS.primary : COLORS.textMuted}
          />
        )}
        {showArrow && !showSwitch && (
          <Icon name="chevron-right" size={24} color={COLORS.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// 메뉴 그룹 (섹션 타이틀 + 메뉴 아이템들)
export function MenuGroup({ title, children, style }) {
  return (
    <View style={[styles.groupContainer, style]}>
      {title && <Text style={styles.groupTitle}>{title}</Text>}
      <View style={styles.groupContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerText: {
    color: COLORS.error,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },

  // Menu Group
  groupContainer: {
    marginBottom: SPACING.lg,
  },
  groupTitle: {
    fontSize: 11,  // 최소 라벨 크기
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  groupContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
});
