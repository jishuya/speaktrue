import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '../components/ui';
import { Header, BottomNav, InsightCard, ProgressBar } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const CONFLICT_DATA = [
  { label: '육아 방식', value: 42, color: COLORS.primary },
  { label: '가사 분담', value: 28, color: `${COLORS.primary}CC` },
  { label: '재정 관리', value: 15, color: `${COLORS.primary}99` },
];

const EMOTION_DATA = [
  { label: '답답함', value: 35, icon: 'sentiment-dissatisfied', color: '#F5A623' },
  { label: '이해받음', value: 25, icon: 'sentiment-satisfied', color: COLORS.primary },
  { label: '걱정', value: 20, icon: 'sentiment-neutral', color: '#F39C12' },
  { label: '편안함', value: 15, icon: 'sentiment-very-satisfied', color: '#5B8DEF' },
];

export default function PatternsScreen({ navigation }) {
  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="패턴 분석"
        showBack
        centerTitle
        darkBackground
        rightIcon="more-horiz"
        onBackPress={() => navigation.goBack()}
        onRightPress={() => {}}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity style={styles.periodButton}>
            <Text style={styles.periodText}>지난 30일</Text>
            <Icon name="expand-more" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGlow} />
          <View style={styles.summaryContent}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryLabel}>총 대화 세션</Text>
                <Text style={styles.summaryValue}>12회</Text>
              </View>
              <View style={styles.summaryIcon}>
                <Icon name="chat-bubble" size={28} color={COLORS.primary} />
              </View>
            </View>
            <View style={styles.summaryFooter}>
              <View style={styles.trendBadge}>
                <Icon name="trending-up" size={14} color={COLORS.primaryDark} />
                <Text style={styles.trendText}> +3</Text>
              </View>
              <Text style={styles.summaryHint}>지난달보다 더 자주 소통했어요 🌱</Text>
            </View>
          </View>
        </View>

        {/* Conflict Topics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>빈번한 갈등 주제</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartCard}>
            {CONFLICT_DATA.map((item, index) => (
              <ProgressBar
                key={index}
                label={item.label}
                value={item.value}
                color={item.color}
                size="md"
              />
            ))}
          </View>
        </View>

        {/* Emotion Distribution Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>주요 감정 분포</Text>
          </View>
          <View style={styles.chartCard}>
            {EMOTION_DATA.map((item, index) => (
              <ProgressBar
                key={index}
                label={item.label}
                value={item.value}
                color={item.color}
                showIcon
                icon={item.icon}
                iconColor={item.color}
                size="md"
              />
            ))}
          </View>
        </View>

        {/* AI Insight */}
        <View style={styles.section}>
          <InsightCard
            title={
              <>
                육아 대화에서 {'\n'}
                <Text style={{ color: COLORS.primary }}>'답답함'</Text>을 자주 느끼셨군요
              </>
            }
            content="다음 대화에서는 상대방의 행동을 비난하기보다, 내가 관찰한 사실과 그때 느낀 감정을 먼저 이야기해보세요. 더 부드러운 소통이 될 거예요."
            buttonText="맞춤형 조언 더보기"
            onButtonPress={() => {}}
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        currentRoute="History"
        onNavigate={handleNavigate}
      />
    </View>
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
    fontSize: FONT_SIZE.md,  // 14px - 터치 가능 텍스트
    color: COLORS.textSecondary,
    marginRight: 4,
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
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
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
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textSecondary,
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
    fontSize: FONT_SIZE.md,  // 14px - 터치 가능 텍스트
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
