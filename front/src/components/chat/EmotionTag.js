import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../constants/theme';

// 감정 타입과 색상 매핑
const EMOTION_STYLES = {
  frustrated: {
    bg: '#FFF3E0',
    bgDark: 'rgba(245, 166, 35, 0.2)',
    color: '#E65100',
    label: '답답함',
  },
  anxious: {
    bg: '#E3F2FD',
    bgDark: 'rgba(91, 141, 239, 0.2)',
    color: '#1565C0',
    label: '불안',
  },
  sad: {
    bg: '#F3E5F5',
    bgDark: 'rgba(155, 89, 182, 0.2)',
    color: '#7B1FA2',
    label: '슬픔',
  },
  happy: {
    bg: '#E8F5E9',
    bgDark: 'rgba(46, 204, 113, 0.2)',
    color: '#2E7D32',
    label: '행복',
  },
  angry: {
    bg: '#FFEBEE',
    bgDark: 'rgba(231, 76, 60, 0.2)',
    color: '#C62828',
    label: '화남',
  },
  peaceful: {
    bg: '#E0F2F1',
    bgDark: 'rgba(26, 188, 156, 0.2)',
    color: '#00796B',
    label: '평안함',
  },
  worried: {
    bg: '#FFF8E1',
    bgDark: 'rgba(243, 156, 18, 0.2)',
    color: '#F57F17',
    label: '걱정',
  },
  understood: {
    bg: COLORS.primaryBg,
    bgDark: `${COLORS.primary}30`,
    color: COLORS.primary,
    label: '이해받음',
  },
  connected: {
    bg: '#E8F5E9',
    bgDark: 'rgba(46, 204, 113, 0.2)',
    color: '#2E7D32',
    label: '연결감',
  },
  lonely: {
    bg: '#ECEFF1',
    bgDark: 'rgba(96, 125, 139, 0.2)',
    color: '#455A64',
    label: '외로움',
  },
  // 욕구 태그
  order: {
    bg: '#E3F2FD',
    bgDark: 'rgba(91, 141, 239, 0.2)',
    color: '#1565C0',
    label: '질서의 욕구',
  },
  responsibility: {
    bg: '#F3E5F5',
    bgDark: 'rgba(155, 89, 182, 0.2)',
    color: '#7B1FA2',
    label: '책임 분담',
  },
};

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
