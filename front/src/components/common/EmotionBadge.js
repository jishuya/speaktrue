import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../constants/theme';
import { getEmotionStyle } from '../../constants/emotions';

/**
 * 감정을 아이콘과 함께 표시하는 배지 컴포넌트
 *
 * @param {string} emotion - 감정 이름 (예: '화남', '슬픔', '기쁨')
 * @param {string} size - 배지 크기 ('sm' | 'md' | 'lg')
 * @param {boolean} showLabel - 감정 이름 표시 여부
 * @param {boolean} showIcon - 아이콘 표시 여부
 * @param {object} style - 추가 스타일
 */
export default function EmotionBadge({
  emotion,
  size = 'md',
  showLabel = true,
  showIcon = true,
  style,
}) {
  const emotionStyle = getEmotionStyle(emotion);
  const { icon, color } = emotionStyle;

  const sizeConfig = {
    sm: { iconSize: 14, fontSize: FONT_SIZE.xs, padding: SPACING.xs, gap: 4 },
    md: { iconSize: 18, fontSize: FONT_SIZE.sm, padding: SPACING.sm, gap: 6 },
    lg: { iconSize: 24, fontSize: FONT_SIZE.md, padding: SPACING.md, gap: 8 },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${color}15`,
          paddingHorizontal: config.padding,
          paddingVertical: config.padding / 2,
          gap: config.gap,
        },
        style,
      ]}
    >
      {showIcon && (
        <Icon name={icon} size={config.iconSize} color={color} />
      )}
      {showLabel && (
        <Text style={[styles.label, { color, fontSize: config.fontSize }]}>
          {emotion}
        </Text>
      )}
    </View>
  );
}

/**
 * 여러 감정을 나열하는 컴포넌트
 *
 * @param {string[]} emotions - 감정 이름 배열
 * @param {string} size - 배지 크기
 * @param {number} maxDisplay - 최대 표시 개수 (초과 시 +N 표시)
 * @param {object} style - 컨테이너 스타일
 */
export function EmotionBadgeList({
  emotions = [],
  size = 'sm',
  maxDisplay = 5,
  style,
}) {
  const displayEmotions = emotions.slice(0, maxDisplay);
  const remainingCount = emotions.length - maxDisplay;

  return (
    <View style={[styles.listContainer, style]}>
      {displayEmotions.map((emotion, index) => (
        <EmotionBadge
          key={`${emotion}-${index}`}
          emotion={emotion}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <View style={styles.moreContainer}>
          <Text style={styles.moreText}>+{remainingCount}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * 아이콘만 표시하는 감정 컴포넌트
 *
 * @param {string} emotion - 감정 이름
 * @param {number} size - 아이콘 크기
 * @param {object} style - 추가 스타일
 */
export function EmotionIcon({ emotion, size = 24, style }) {
  const { icon, color } = getEmotionStyle(emotion);

  return (
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }, style]}>
      <Icon name={icon} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  label: {
    fontWeight: FONT_WEIGHT.medium,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  moreContainer: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  iconContainer: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
});
