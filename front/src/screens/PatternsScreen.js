import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/ui';
import { Header, InsightCard, ProgressBar } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { mapEmotionsWithStyle } from '../constants/emotions';
import api from '../services/api';

// TODO: 실제 인증 구현 후 교체
const TEMP_USER_ID = '11111111-1111-1111-1111-111111111111';

const PERIOD_OPTIONS = [
  { label: '지난 7일', value: '7days' },
  { label: '지난 30일', value: '30days' },
  { label: '지난 90일', value: '90days' },
  { label: '전체 기간', value: 'all' },
];

export default function PatternsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('30days');
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchPatternData = useCallback(async () => {
    try {
      setError(null);
      const result = await api.getPatternAnalysis(TEMP_USER_ID, period);
      // 프론트엔드에서 감정 아이콘/색상 매핑 적용
      if (result.emotions) {
        result.emotions = mapEmotionsWithStyle(result.emotions);
      }
      setData(result);
    } catch (err) {
      console.error('Pattern analysis error:', err);
      setError('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    fetchPatternData();
  }, [fetchPatternData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPatternData();
  }, [fetchPatternData]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setShowPeriodPicker(false);
  };

  const getPeriodLabel = () => {
    return PERIOD_OPTIONS.find(opt => opt.value === period)?.label || '지난 30일';
  };

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header
          title="패턴 분석"
          showBack
          centerTitle
          darkBackground
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>분석 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header
          title="패턴 분석"
          showBack
          centerTitle
          darkBackground
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPatternData}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 데이터 없음 상태
  const hasData = data?.summary?.totalSessions > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header
        title="패턴 분석"
        showBack
        centerTitle
        darkBackground
        rightIcon="refresh"
        onBackPress={() => navigation.goBack()}
        onRightPress={onRefresh}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={styles.periodButton}
            onPress={() => setShowPeriodPicker(!showPeriodPicker)}
          >
            <Text style={styles.periodText}>{getPeriodLabel()}</Text>
            <Icon
              name={showPeriodPicker ? 'expand-less' : 'expand-more'}
              size={16}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Period Picker Dropdown */}
        {showPeriodPicker && (
          <View style={styles.periodPickerContainer}>
            {PERIOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.periodOption,
                  period === option.value && styles.periodOptionActive,
                ]}
                onPress={() => handlePeriodChange(option.value)}
              >
                <Text
                  style={[
                    styles.periodOptionText,
                    period === option.value && styles.periodOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!hasData ? (
          /* 데이터 없음 상태 */
          <View style={styles.emptyContainer}>
            <Icon name="analytics" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>아직 분석할 데이터가 없어요</Text>
            <Text style={styles.emptyText}>
              대화를 나눈 후에 패턴 분석을 확인할 수 있어요
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryGlow} />
              <View style={styles.summaryContent}>
                <View style={styles.summaryHeader}>
                  <View>
                    <Text style={styles.summaryLabel}>총 대화 세션</Text>
                    <Text style={styles.summaryValue}>
                      {data.summary.totalSessions}회
                    </Text>
                  </View>
                  <View style={styles.summaryIcon}>
                    <Icon name="chat-bubble" size={28} color={COLORS.primary} />
                  </View>
                </View>
                <View style={styles.summaryFooter}>
                  {data.summary.trend !== 0 && (
                    <View style={styles.trendBadge}>
                      <Icon
                        name={data.summary.trend > 0 ? 'trending-up' : 'trending-down'}
                        size={14}
                        color={COLORS.primaryDark}
                      />
                      <Text style={styles.trendText}>
                        {data.summary.trend > 0 ? '+' : ''}{data.summary.trend}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.summaryHint}>
                    {data.summary.trendMessage}
                  </Text>
                </View>
              </View>
            </View>

            {/* Resolved Rate */}
            {data.summary.totalSessions > 0 && (
              <View style={styles.resolvedCard}>
                <View style={styles.resolvedHeader}>
                  <Text style={styles.resolvedLabel}>해결된 대화</Text>
                  <Text style={styles.resolvedValue}>
                    {data.summary.resolvedRate}%
                  </Text>
                </View>
                <View style={styles.resolvedBar}>
                  <View
                    style={[
                      styles.resolvedBarFill,
                      { width: `${data.summary.resolvedRate}%` },
                    ]}
                  />
                </View>
                <Text style={styles.resolvedDetail}>
                  {data.summary.resolvedCount}개 해결 / {data.summary.unresolvedCount}개 미해결
                </Text>
              </View>
            )}

            {/* Conflict Topics Section */}
            {data.conflictTopics?.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>빈번한 갈등 주제</Text>
                </View>
                <View style={styles.chartCard}>
                  {data.conflictTopics.map((item, index) => (
                    <ProgressBar
                      key={index}
                      label={item.topic}
                      value={item.percentage}
                      color={item.color}
                      size="md"
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Emotion Distribution Section */}
            {data.emotions?.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>주요 감정 분포</Text>
                </View>
                <View style={styles.chartCard}>
                  {data.emotions.map((item, index) => (
                    <ProgressBar
                      key={index}
                      label={item.emotion}
                      value={item.percentage}
                      color={item.color}
                      showIcon
                      icon={item.icon}
                      iconColor={item.color}
                      size="md"
                    />
                  ))}
                </View>
              </View>
            )}

            {/* AI Insight */}
            {data.insight && (
              <View style={styles.section}>
                <InsightCard
                  title={
                    <>
                      {data.insight.mainTopic} 대화에서 {'\n'}
                      <Text style={{ color: COLORS.primary }}>
                        '{data.insight.mainEmotion}'
                      </Text>
                      을 자주 느끼셨군요
                    </>
                  }
                  content={data.insight.advice}
                  buttonText="맞춤형 조언 더보기"
                  onButtonPress={() => {
                    // TODO: 상세 인사이트 화면으로 이동
                  }}
                />
              </View>
            )}
          </>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.giant,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textPrimary,
  },
  emptyText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  periodSelector: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  periodText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  periodPickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  periodOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  periodOptionActive: {
    backgroundColor: COLORS.primaryBg,
  },
  periodOptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  periodOptionTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  summaryCard: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
    overflow: 'hidden',
    position: 'relative',
  },
  summaryGlow: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: `${COLORS.primary}20`,
  },
  summaryContent: {
    position: 'relative',
    zIndex: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: FONT_SIZE.giant,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
  },
  trendText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primaryDark,
  },
  summaryHint: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  resolvedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  resolvedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resolvedLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  resolvedValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  resolvedBar: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  resolvedBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  resolvedDetail: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
});
