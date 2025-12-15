import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../constants/theme';

export default function ProgressBar({
  label,
  value, // 0-100
  color = COLORS.primary,
  showPercentage = true,
  showIcon = false,
  icon,
  iconColor,
  size = 'md', // 'sm' | 'md'
  style,
}) {
  const barHeight = size === 'sm' ? 8 : 10;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <View style={styles.labelLeft}>
          {showIcon && icon && (
            <Icon
              name={icon}
              size={18}
              color={iconColor || color}
              style={styles.icon}
            />
          )}
          {!showIcon && <View style={[styles.dot, { backgroundColor: color }]} />}
          <Text style={styles.label}>{label}</Text>
        </View>
        {showPercentage && (
          <Text style={styles.percentage}>{value}%</Text>
        )}
      </View>
      <View style={[styles.track, { height: barHeight }]}>
        <View
          style={[
            styles.bar,
            {
              width: `${Math.min(value, 100)}%`,
              backgroundColor: color,
              height: barHeight,
            },
          ]}
        />
      </View>
    </View>
  );
}

// 수직 막대 그래프 (주간 통계용)
export function VerticalBarChart({ data, maxValue, style }) {
  return (
    <View style={[styles.verticalContainer, style]}>
      {data.map((item, index) => {
        const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <View key={index} style={styles.verticalBarWrapper}>
            <View style={styles.verticalBarContainer}>
              <View
                style={[
                  styles.verticalBar,
                  {
                    height: `${heightPercent}%`,
                    backgroundColor: item.isHighlight ? COLORS.primary : COLORS.primarySoft,
                  },
                ]}
              />
            </View>
            <Text style={styles.verticalLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
  },
  percentage: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  track: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  bar: {
    borderRadius: BORDER_RADIUS.full,
  },

  // Vertical Bar Chart
  verticalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: SPACING.md,
  },
  verticalBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  verticalBarContainer: {
    width: 24,
    height: 80,
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  verticalBar: {
    width: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  verticalLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
