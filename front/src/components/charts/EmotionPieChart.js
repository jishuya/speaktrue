import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { getEmotionStyle } from '../../constants/emotions';

// 감정 분포 차트 색상 (쿨톤: 시안/스카이/틸/에메랄드/그린)
const EMOTION_COLORS = [
  { main: '#06B6D4', gradient: '#67E8F9' },
  { main: '#22D3EE', gradient: '#A5F3FC' },
  { main: '#2DD4BF', gradient: '#99F6E4' },
  { main: '#34D399', gradient: '#A7F3D0' },
  { main: '#4ADE80', gradient: '#BBF7D0' },
];

// 퍼센트 정규화 함수
const normalizePercentages = (data) => {
  if (!data || data.length === 0) return [];

  const total = data.reduce((sum, item) => sum + (item.percentage || 0), 0);
  if (total === 0) return data;

  return data.map(item => ({
    ...item,
    percentage: Math.round((item.percentage / total) * 100),
  }));
};

// 차트 데이터 생성
const buildChartData = (emotions) => {
  const normalized = normalizePercentages(emotions);
  return normalized.map((item, index) => {
    const colorSet = EMOTION_COLORS[index % EMOTION_COLORS.length];
    return {
      value: item.percentage,
      color: colorSet.main,
      focused: index === 0,
    };
  });
};

export default function EmotionPieChart({ data, title = '감정 분포' }) {
  if (!data || data.length === 0) return null;

  const normalizedData = normalizePercentages(data);
  const chartData = buildChartData(data);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        <View style={styles.chartWrapper}>
          <PieChart
            data={chartData}
            donut
            radius={52}
            innerRadius={28}
            innerCircleColor={COLORS.surface}
            sectionAutoFocus
            focusOnPress
            toggleFocusOnPress
            extraRadiusForFocused={6}
            strokeWidth={2}
            strokeColor={COLORS.surface}
          />
        </View>
        <View style={styles.legendContainer}>
          {normalizedData.map((item, index) => {
            const emotionStyle = getEmotionStyle(item.emotion);
            return (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: EMOTION_COLORS[index % EMOTION_COLORS.length].main }]} />
                <Text style={styles.legendText} numberOfLines={1}>{item.emotion}</Text>
                <Ionicons name={emotionStyle.icon} size={12} color={emotionStyle.color} style={styles.legendIcon} />
                <Text style={styles.legendValue}>{item.percentage}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  legendContainer: {
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  legendIcon: {
    marginRight: 4,
  },
  legendValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textPrimary,
  },
});
