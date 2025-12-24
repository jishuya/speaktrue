import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

// 기본 색상 (테라코타/머스타드 계열 - 세이지 그린과 어울리는 따뜻한 톤)
const BASE_COLOR = '#C4886B';

// 순위별 투명도 (1위: 100%, 2위: 70%, 3위: 40%)
const OPACITY_BY_RANK = [1, 0.7, 0.4];

// 순위별 다른 아이콘 (갈등 관련)
const ICONS_BY_RANK = [
  'flash',              // 1위: 번개 (가장 자주 발생)
  'cloud',              // 2위: 구름
  'water-outline',      // 3위: 물방울
];

// 색상에 투명도 적용
const applyOpacity = (hexColor, opacity) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// 퍼센트 정규화 함수
const normalizePercentages = (data) => {
  if (!data || data.length === 0) return [];

  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);
  if (total === 0) return data;

  return data.map(item => ({
    ...item,
    percentage: Math.round((item.count / total) * 100),
  }));
};

// 애니메이션 프로그레스바 컴포넌트
function AnimatedProgressBar({ percentage, color, delay = 0 }) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 600,
      delay,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.progressBar,
        {
          width,
          backgroundColor: color,
        }
      ]}
    />
  );
}

export default function ConflictPatternChart({ data, title = '우리의 갈등 패턴' }) {
  if (!data || data.length === 0) return null;

  // 상위 3개만 선택하고 퍼센트 정규화
  const top3Data = normalizePercentages(data.slice(0, 3));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        {top3Data.map((item, index) => {
          const opacity = OPACITY_BY_RANK[index];
          const color = applyOpacity(BASE_COLOR, opacity);
          const icon = ICONS_BY_RANK[index];

          return (
            <View key={index} style={styles.patternItem}>
              <View style={[styles.iconContainer, { backgroundColor: applyOpacity(BASE_COLOR, 0.15) }]}>
                <Ionicons name={icon} size={14} color={color} />
              </View>
              <View style={styles.patternContent}>
                <View style={styles.patternHeader}>
                  <Text style={styles.patternName}>{item.pattern}</Text>
                  <Text style={styles.patternCount}>{item.count}회</Text>
                  <Text style={styles.patternPercentage}>{item.percentage}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <AnimatedProgressBar
                    percentage={item.percentage}
                    color={color}
                    delay={index * 100}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
    gap: SPACING.sm,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patternContent: {
    flex: 1,
    gap: 4,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patternName: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
  },
  patternCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginRight: SPACING.xs,
  },
  patternPercentage: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    minWidth: 36,
    textAlign: 'right',
  },
  iconContainer: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
});
