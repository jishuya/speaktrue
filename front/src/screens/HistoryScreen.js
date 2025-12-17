import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '../components/ui';
import { Header, BottomNav, HistoryCard } from '../components/common';
import { HashTag } from '../components/chat';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const FILTERS = ['전체', '주제별', '감정별', '미해결'];

const HISTORY_DATA = [
  {
    id: '1',
    date: '오늘, 오후 2:30',
    content: '"싱크대에 설거지가 쌓여 있는 걸 보면 마음이 답답해요. 공용 공간이 정돈되어 있으면 좋겠거든요..."',
    tags: [
      { label: '집안일', color: COLORS.primary, bgColor: COLORS.primaryBg },
      { label: '답답함', color: '#E53E3E', bgColor: '#FFF5F5' },
    ],
    isRecent: true,
  },
  {
    id: '2',
    date: '어제',
    content: '"여행 계획을 같이 세울 때 정말 연결된 느낌이었어요. 함께하는 모험과 즐거움이 충족되었거든요..."',
    tags: [
      { label: '데이트', color: COLORS.primary, bgColor: COLORS.primaryBg },
      { label: '행복', color: '#2E7D32', bgColor: '#E8F5E9' },
      { label: '연결감', color: '#2E7D32', bgColor: '#E8F5E9' },
    ],
    isRecent: false,
  },
  {
    id: '3',
    date: '10월 10일',
    content: '"예산 검토 때문에 불안해요. 우리 미래 저축에 대한 안정과 명확성이 중요하거든요..."',
    tags: [
      { label: '재정', color: COLORS.primary, bgColor: COLORS.primaryBg },
      { label: '불안', color: '#1565C0', bgColor: '#E3F2FD' },
    ],
    isRecent: false,
  },
];

export default function HistoryScreen({ navigation }) {
  const [selectedFilter, setSelectedFilter] = useState('전체');

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem} activeOpacity={0.95}>
      <View style={styles.historyHeader}>
        <View style={styles.dateRow}>
          <View style={[styles.dateDot, item.isRecent && styles.dateDotRecent]} />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
      </View>
      <Text style={styles.historyContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.tagRow}>
        {item.tags.map((tag, index) => (
          <HashTag key={index} label={tag.label} color={tag.color} bgColor={tag.bgColor} />
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        label="기록"
        title="우리의 여정"
        rightIcon="search"
        onRightPress={() => {}}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryGlow} />
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>10월 요약</Text>
              <Text style={styles.summarySubtitle}>
                이번 달은 <Text style={styles.summaryHighlight}>이해</Text>에 집중하셨네요.
              </Text>
            </View>
            <Icon name="spa" size={48} color={`${COLORS.primary}40`} />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>해결된 대화</Text>
              <Text style={styles.statValue}>5</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>핵심 욕구</Text>
              <Text style={styles.statValueText}>연결</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>활동 일수</Text>
              <Text style={styles.statValue}>12</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* History List */}
        <View style={styles.historyList}>
          {HISTORY_DATA.map((item) => renderHistoryItem({ item }))}
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
  summaryCard: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}15`,
    overflow: 'hidden',
    position: 'relative',
  },
  summaryGlow: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: `${COLORS.primary}15`,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  summarySubtitle: {
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryHighlight: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,  // 최소 라벨 크기
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statValueText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: `${COLORS.primary}20`,
    marginHorizontal: SPACING.md,
  },
  filterScroll: {
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.md,
  },
  filterText: {
    fontSize: FONT_SIZE.md,  // 14px - 터치 가능 텍스트
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
  },
  filterTextActive: {
    color: COLORS.surface,
    fontWeight: FONT_WEIGHT.semiBold,
  },
  historyList: {
    gap: SPACING.md,
  },
  historyItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: `${COLORS.primary}70`,
    marginRight: SPACING.sm,
  },
  dateDotRecent: {
    backgroundColor: COLORS.accentOrange,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  historyContent: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
});
