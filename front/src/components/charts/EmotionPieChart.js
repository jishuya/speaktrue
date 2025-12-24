import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { getEmotionStyle } from '../../constants/emotions';

// 🧡 나의 감정 색상 (Warm Tone)
const MY_EMOTION_COLORS = {
  joy: '#FFB4A2',      // 주황 (기쁨)
  love: '#FFACC7',     // 코랄 (사랑)
  calm: '#FFD6A5',     // 피치 (평온)
  sad: '#E5C1A8',      // 베이지브라운 (슬픔)
  angry: '#FF8A8A',    // 레드 (분노)
};

// 💙 상대방 감정 색상 (Cool Tone)
const PARTNER_EMOTION_COLORS = {
  joy: '#A2D2FF',      // 민트 (기쁨)
  love: '#CDB4DB',     // 퍼플 (사랑)
  calm: '#B5EAD7',     // 청록 (평온)
  sad: '#A0C4E8',      // 블루그레이 (슬픔)
  angry: '#B8C0FF',    // 블루 (분노)
};

// 감정명 → 색상 키 매핑
const EMOTION_KEY_MAP = {
  '기쁨': 'joy',
  '행복': 'joy',
  '사랑': 'love',
  '애정': 'love',
  '평온': 'calm',
  '차분': 'calm',
  '슬픔': 'sad',
  '우울': 'sad',
  '분노': 'angry',
  '화남': 'angry',
};

// 폴백 색상 배열 (매핑 안 되는 감정용)
const FALLBACK_MY_COLORS = ['#FF8C42', '#FF6B6B', '#FFAB76', '#D4A373', '#E63946'];
const FALLBACK_PARTNER_COLORS = ['#4ECDC4', '#7C3AED', '#06D6A0', '#457B9D', '#3B82F6'];

// 감정명으로 색상 가져오기
const getEmotionColor = (emotionName, isPartner, fallbackIndex) => {
  const key = EMOTION_KEY_MAP[emotionName];
  const colorMap = isPartner ? PARTNER_EMOTION_COLORS : MY_EMOTION_COLORS;
  const fallbackColors = isPartner ? FALLBACK_PARTNER_COLORS : FALLBACK_MY_COLORS;

  if (key && colorMap[key]) {
    return colorMap[key];
  }
  return fallbackColors[fallbackIndex % fallbackColors.length];
};

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
const buildChartData = (emotions, isPartner = false) => {
  const normalized = normalizePercentages(emotions);
  return normalized.map((item, index) => {
    const color = getEmotionColor(item.emotion, isPartner, index);
    return {
      value: item.percentage,
      color: color,
      focused: index === 0,
    };
  });
};

export default function EmotionPieChart({ data, title = '감정 분포', isPartner = false }) {
  const hasData = data && data.length > 0;
  const normalizedData = hasData ? normalizePercentages(data) : [];
  const chartData = hasData ? buildChartData(data, isPartner) : [{ value: 100, color: COLORS.borderLight }];

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
            sectionAutoFocus={hasData}
            focusOnPress={hasData}
            toggleFocusOnPress={hasData}
            extraRadiusForFocused={hasData ? 6 : 0}
            strokeWidth={2}
            strokeColor={COLORS.surface}
            isAnimated
            animationDuration={600}
          />
        </View>
        <View style={styles.legendContainer}>
          {hasData ? (
            normalizedData.map((item, index) => {
              const emotionStyle = getEmotionStyle(item.emotion);
              const legendColor = getEmotionColor(item.emotion, isPartner, index);
              return (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: legendColor }]} />
                  <Text style={styles.legendText} numberOfLines={1}>{item.emotion}</Text>
                  <Ionicons name={emotionStyle.icon} size={12} color={emotionStyle.color} style={styles.legendIcon} />
                  <Text style={styles.legendValue}>{item.percentage}%</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>데이터 없음</Text>
          )}
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
  emptyText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    paddingVertical: SPACING.xs,
  },
});
