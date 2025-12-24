import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/ui';
import { Header, InsightCard, ProgressBar } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { mapEmotionsWithStyle } from '../constants/emotions';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

const PERIOD_OPTIONS = [
  { label: '지난 7일', value: '7days' },
  { label: '지난 30일', value: '30days' },
  { label: '지난 90일', value: '90days' },
  // { label: '전체 기간', value: 'all' },
];

export default function PatternsScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('30days');
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // AI 인사이트 관련 상태
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState(null);

  const fetchPatternData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const result = await api.getPatternAnalysis(user.id, period);
      // 프론트엔드에서 감정 아이콘/색상 매핑 적용
      if (result.emotions) {
        result.emotions = mapEmotionsWithStyle(result.emotions);
      }
      setData(result);
    } catch {
      setError('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, user?.id]);

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

  // AI 인사이트 가져오기
  const fetchAiInsight = async () => {
    setInsightLoading(true);
    setInsightError(null);
    setShowInsightModal(true);

    try {
      const result = await api.getPatternInsight(user.id, period);
      if (result.insight) {
        setAiInsight(result.insight);
      } else {
        setInsightError(result.message || '인사이트를 생성할 수 없습니다');
      }
    } catch {
      setInsightError('인사이트 생성에 실패했습니다');
    } finally {
      setInsightLoading(false);
    }
  };

  const closeInsightModal = () => {
    setShowInsightModal(false);
    setAiInsight(null);
    setInsightError(null);
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
                  onButtonPress={fetchAiInsight}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* AI Insight Modal */}
      <Modal
        visible={showInsightModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeInsightModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Icon name="auto-awesome" size={24} color={COLORS.primary} />
                <Text style={styles.modalTitle}>AI 맞춤 인사이트</Text>
              </View>
              <TouchableOpacity onPress={closeInsightModal} style={styles.modalCloseButton}>
                <Icon name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {insightLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.modalLoadingText}>AI가 분석 중이에요...</Text>
                  <Text style={styles.modalLoadingSubtext}>잠시만 기다려주세요</Text>
                </View>
              ) : insightError ? (
                <View style={styles.modalError}>
                  <Icon name="error-outline" size={48} color={COLORS.textTertiary} />
                  <Text style={styles.modalErrorText}>{insightError}</Text>
                  <TouchableOpacity style={styles.modalRetryButton} onPress={fetchAiInsight}>
                    <Text style={styles.modalRetryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                </View>
              ) : aiInsight ? (
                <View style={styles.insightContent}>
                  {/* Title */}
                  {aiInsight.title && (
                    <Text style={styles.insightTitle}>{aiInsight.title}</Text>
                  )}

                  {/* Pattern Analysis */}
                  {aiInsight.patternAnalysis && (
                    <View style={styles.insightSection}>
                      <View style={styles.insightSectionHeader}>
                        <Icon name="analytics" size={18} color={COLORS.primary} />
                        <Text style={styles.insightSectionTitle}>갈등 패턴 분석</Text>
                      </View>
                      <Text style={styles.insightText}>{aiInsight.patternAnalysis}</Text>
                    </View>
                  )}

                  {/* Emotional Trend */}
                  {aiInsight.emotionalTrend && (
                    <View style={styles.insightSection}>
                      <View style={styles.insightSectionHeader}>
                        <Icon name="pulse" size={18} color={COLORS.primary} />
                        <Text style={styles.insightSectionTitle}>감정 추이</Text>
                      </View>
                      <Text style={styles.insightText}>{aiInsight.emotionalTrend}</Text>
                    </View>
                  )}

                  {/* Key Insight */}
                  {aiInsight.keyInsight && (
                    <View style={[styles.insightSection, styles.keyInsightSection]}>
                      <View style={styles.insightSectionHeader}>
                        <Icon name="lightbulb" size={18} color={COLORS.warning} />
                        <Text style={styles.insightSectionTitle}>핵심 인사이트</Text>
                      </View>
                      <Text style={styles.keyInsightText}>{aiInsight.keyInsight}</Text>
                    </View>
                  )}

                  {/* Root Cause Pattern */}
                  {aiInsight.rootCausePattern && (
                    <View style={styles.insightSection}>
                      <View style={styles.insightSectionHeader}>
                        <Icon name="search" size={18} color={COLORS.primary} />
                        <Text style={styles.insightSectionTitle}>반복되는 원인</Text>
                      </View>
                      <Text style={styles.insightText}>{aiInsight.rootCausePattern}</Text>
                    </View>
                  )}

                  {/* Practical Advice */}
                  {aiInsight.practicalAdvice && (
                    <View style={styles.insightSection}>
                      <View style={styles.insightSectionHeader}>
                        <Icon name="check-circle" size={18} color={COLORS.success} />
                        <Text style={styles.insightSectionTitle}>실천 조언</Text>
                      </View>
                      {Array.isArray(aiInsight.practicalAdvice) ? (
                        aiInsight.practicalAdvice.map((advice, index) => (
                          <View key={index} style={styles.adviceItem}>
                            <Text style={styles.adviceNumber}>{index + 1}</Text>
                            <Text style={styles.adviceText}>{advice}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.insightText}>{aiInsight.practicalAdvice}</Text>
                      )}
                    </View>
                  )}

                  {/* Encouragement */}
                  {aiInsight.encouragement && (
                    <View style={styles.encouragementSection}>
                      <Icon name="favorite" size={20} color={COLORS.primary} />
                      <Text style={styles.encouragementText}>{aiInsight.encouragement}</Text>
                    </View>
                  )}
                </View>
              ) : null}
            </ScrollView>

            {/* Modal Footer */}
            {!insightLoading && (
              <TouchableOpacity style={styles.modalCloseFullButton} onPress={closeInsightModal}>
                <Text style={styles.modalCloseFullButtonText}>닫기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '90%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.lg,
    flex: 1,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.giant,
  },
  modalLoadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
  },
  modalLoadingSubtext: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  modalError: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.giant,
  },
  modalErrorText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalRetryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  modalRetryButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  modalCloseFullButton: {
    margin: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalCloseFullButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },

  // Insight Content Styles
  insightContent: {
    paddingBottom: SPACING.md,
  },
  insightTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  insightSection: {
    marginBottom: SPACING.lg,
  },
  insightSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  insightSectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textPrimary,
  },
  insightText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  keyInsightSection: {
    backgroundColor: '#FFF8E1',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  keyInsightText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
    lineHeight: 22,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  adviceNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBg,
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    lineHeight: 24,
  },
  adviceText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  encouragementSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryBg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  encouragementText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
    lineHeight: 20,
  },
});
