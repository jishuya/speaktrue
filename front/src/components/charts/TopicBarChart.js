import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

// 갈등 주제 차트 색상 (웜톤: 레드/오렌지/옐로우/핑크)
const TOPIC_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'
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
  return normalized.map((item, index) => ({
    value: item.percentage,
    label: item.topic,
    frontColor: TOPIC_COLORS[index % TOPIC_COLORS.length],
    topLabelComponent: () => (
      <Text style={styles.barLabel}>{item.percentage}%</Text>
    ),
  }));
};

export default function TopicBarChart({ data, title = '갈등 주제' }) {
  if (!data || data.length === 0) return null;

  const chartData = buildChartData(data);
  const rawMax = Math.max(...chartData.map(d => d.value), 10);
  // 최대값 + 라벨 공간만큼만 (15 단위로 딱 떨어지게)
  const maxValue = Math.ceil((rawMax + 5) / 15) * 15;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        <BarChart
          data={chartData}
          barWidth={32}
          spacing={20}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
          xAxisLabelTextStyle={styles.xAxisLabel}
          noOfSections={3}
          maxValue={maxValue}
          isAnimated
          animationDuration={500}
          barBorderRadius={4}
          height={120}
          initialSpacing={12}
          endSpacing={12}
        />
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
    paddingTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  xAxisLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    width: 50,
    textAlign: 'center',
  },
});
