import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, EMOTION_STYLES, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../constants/theme';

export default function EmotionTag({
  type,
  label,
  onPress,
  selected = false,
  size = 'md', // 'sm' | 'md'
  style,
}) {
  const emotionStyle = EMOTION_STYLES[type] || {
    bg: COLORS.primaryBg,
    color: COLORS.primary,
    label: label || type,
  };

  const displayLabel = label || emotionStyle.label;

  const Tag = onPress ? TouchableOpacity : View;

  return (
    <Tag
      style={[
        styles.container,
        { backgroundColor: emotionStyle.bg },
        selected && styles.selected,
        size === 'sm' && styles.smallContainer,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.dot, { backgroundColor: emotionStyle.color }]} />
      <Text
        style={[
          styles.label,
          { color: emotionStyle.color },
          size === 'sm' && styles.smallLabel,
        ]}
      >
        {displayLabel}
      </Text>
    </Tag>
  );
}

// 태그 목록 (가로 스크롤 또는 flex wrap)
export function EmotionTagList({ emotions, onTagPress, selectedTags = [], wrap = false, style }) {
  return (
    <View style={[wrap ? styles.tagListWrap : styles.tagListRow, style]}>
      {emotions.map((emotion, index) => (
        <EmotionTag
          key={index}
          type={emotion.type}
          label={emotion.label}
          onPress={onTagPress ? () => onTagPress(emotion) : undefined}
          selected={selectedTags.includes(emotion.type)}
          style={styles.tagItem}
        />
      ))}
    </View>
  );
}

// 해시태그 스타일 (기록 화면용)
export function HashTag({ label, color = COLORS.primary, bgColor = COLORS.primaryBg, onPress }) {
  const Tag = onPress ? TouchableOpacity : View;

  return (
    <Tag
      style={[styles.hashTag, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.hashTagText, { color }]}>#{label}</Text>
    </Tag>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  smallContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  selected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    fontWeight: FONT_WEIGHT.semiBold,
  },
  smallLabel: {
    fontSize: FONT_SIZE.xs,
  },

  // Tag List
  tagListRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tagListWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tagItem: {
    marginBottom: 0,
  },

  // Hash Tag
  hashTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  hashTagText: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    fontWeight: FONT_WEIGHT.bold,
  },
});
