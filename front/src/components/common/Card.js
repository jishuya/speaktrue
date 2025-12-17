import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function Card({
  children,
  variant = 'default', // 'default' | 'elevated' | 'outlined' | 'gradient'
  onPress,
  style,
}) {
  const cardStyles = [styles.base, styles[variant], style];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.95}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

// 팁 카드 (홈 화면)
export function TipCard({ title, content, style }) {
  return (
    <View style={[styles.tipCard, style]}>
      <View style={styles.tipContent}>
        <Text style={styles.tipLabel}>{title}</Text>
        <Text style={styles.tipText}>{content}</Text>
      </View>
      <View style={styles.tipIcon}>
        <Icon name="favorite" size={48} color={COLORS.primary} style={{ opacity: 0.2 }} />
      </View>
    </View>
  );
}

// 기능 카드 (홈 화면 그리드)
export function FeatureCard({ icon, title, subtitle, color = COLORS.primaryBg, iconColor = COLORS.primary, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.featureCard, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.featureIcon, { backgroundColor: COLORS.surface }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

// 통계 카드
export function StatCard({ label, value, subValue, icon }) {
  return (
    <View style={styles.statCard}>
      {icon && (
        <View style={styles.statIcon}>
          <Icon name={icon} size={20} color={COLORS.primary} />
        </View>
      )}
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statValueRow}>
          <Text style={styles.statValue}>{value}</Text>
          {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
        </View>
      </View>
    </View>
  );
}

// 히스토리 카드
export function HistoryCard({ date, content, tags = [], onPress }) {
  return (
    <TouchableOpacity style={styles.historyCard} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.historyHeader}>
        <View style={styles.historyDate}>
          <View style={styles.dateDot} />
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
      </View>
      <Text style={styles.historyContent} numberOfLines={2}>
        {content}
      </Text>
      {tags.length > 0 && (
        <View style={styles.tagContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: tag.bgColor }]}>
              <Text style={[styles.tagText, { color: tag.color }]}>#{tag.label}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// 인사이트 카드 (어두운 배경)
export function InsightCard({ title, content, buttonText, onButtonPress }) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <View style={styles.insightBadge}>
          <Icon name="auto-awesome" size={14} color={COLORS.surface} />
        </View>
        <Text style={styles.insightLabel}>AI 인사이트</Text>
      </View>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={styles.insightContent}>{content}</Text>
      {buttonText && (
        <TouchableOpacity style={styles.insightButton} onPress={onButtonPress}>
          <Text style={styles.insightButtonText}>{buttonText}</Text>
          <Icon name="arrow-forward" size={16} color={COLORS.surface} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Base card styles
  base: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  default: {
    backgroundColor: COLORS.surface,
  },
  elevated: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.md,
  },
  outlined: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  gradient: {
    backgroundColor: COLORS.primaryBg,
  },

  // Tip Card
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}15`,
    ...SHADOWS.soft,
  },
  tipContent: {
    flex: 1,
  },
  tipLabel: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션/라벨
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  tipIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Feature Card
  featureCard: {
    flex: 1,
    height: 180,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  featureContent: {
    marginTop: SPACING.md,
  },
  featureTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  featureSubtitle: {
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Stat Card
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statSubValue: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },

  // History Card
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentOrange,
    marginRight: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  historyContent: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    fontWeight: FONT_WEIGHT.bold,
  },

  // Insight Card
  insightCard: {
    backgroundColor: '#2A3D2A',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  insightBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  insightLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  insightTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
    lineHeight: 26,
    marginBottom: SPACING.sm,
  },
  insightContent: {
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: '#E8ECE9',
    lineHeight: 22,
    opacity: 0.9,
  },
  insightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  insightButtonText: {
    fontSize: FONT_SIZE.md,  // 14px - 터치 가능 텍스트
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.surface,
    marginRight: SPACING.sm,
  },
});
