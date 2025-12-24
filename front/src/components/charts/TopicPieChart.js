import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

// 갈등 주제 차트 색상 (웜톤: 레드/오렌지/옐로우/핑크)
const TOPIC_COLORS = [
  { main: '#EF4444', gradient: '#FCA5A5' },
  { main: '#F97316', gradient: '#FDBA74' },
  { main: '#FBBF24', gradient: '#FDE68A' },
  { main: '#FB7185', gradient: '#FECDD3' },
  { main: '#F472B6', gradient: '#F9A8D4' },
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
const buildChartData = (topics) => {
  const normalized = normalizePercentages(topics);
  return normalized.map((item, index) => {
    const colorSet = TOPIC_COLORS[index % TOPIC_COLORS.length];
    return {
      value: item.percentage,
      color: colorSet.main,
      gradientCenterColor: colorSet.gradient,
      focused: index === 0,
    };
  });
};

export default function TopicPieChart({ data, title = '갈등 주제' }) {
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
            showGradient
            sectionAutoFocus
            focusOnPress
            toggleFocusOnPress
            extraRadiusForFocused={6}
            strokeWidth={2}
            strokeColor={COLORS.surface}
          />
        </View>
        <View style={styles.legendContainer}>
          {normalizedData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TOPIC_COLORS[index % TOPIC_COLORS.length].main }]} />
              <Text style={styles.legendText} numberOfLines={1}>{item.topic}</Text>
              <Text style={styles.legendValue}>{item.percentage}%</Text>
            </View>
          ))}
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
  legendValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textPrimary,
  },
});
