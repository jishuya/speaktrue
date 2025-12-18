import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Icon } from '../components/ui';
import { Header } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const INITIAL_HISTORY_DATA = [
  {
    id: '1',
    date: '오늘, 오후 2:30',
    content: '"싱크대에 설거지가 쌓여 있는 걸 보면 마음이 답답해요. 공용 공간이 정돈되어 있으면 좋겠거든요..."',
    tags: ['집안일', '답답함'],
    resolved: false,
  },
  {
    id: '2',
    date: '어제',
    content: '"여행 계획을 같이 세울 때 정말 연결된 느낌이었어요. 함께하는 모험과 즐거움이 충족되었거든요..."',
    tags: ['데이트', '행복'],
    resolved: true,
  },
  {
    id: '3',
    date: '10월 10일',
    content: '"예산 검토 때문에 불안해요. 우리 미래 저축에 대한 안정과 명확성이 중요하거든요..."',
    tags: ['재정', '불안'],
    resolved: true,
  },
];

export default function HistoryScreen({ navigation }) {
  const [historyData, setHistoryData] = useState(INITIAL_HISTORY_DATA);

  const handleDelete = (id) => {
    Alert.alert(
      '기록 삭제',
      '이 상담 기록을 삭제하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setHistoryData(prev => prev.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const renderHistoryItem = (item) => (
    <View key={item.id} style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <View style={styles.dateStatusRow}>
          <Text style={styles.dateText}>{item.date}</Text>
          <View style={[styles.statusBadge, item.resolved ? styles.resolvedBadge : styles.unresolvedBadge]}>
            <Text style={[styles.statusText, item.resolved ? styles.resolvedText : styles.unresolvedText]}>
              {item.resolved ? '해결' : '미해결'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="close" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={styles.historyContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.tagRow}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="상담 기록"
        showBack
        centerTitle
        darkBackground
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>총 상담</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>9</Text>
              <Text style={styles.statLabel}>해결</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>미해결</Text>
            </View>
          </View>

          <View style={styles.tagSectionRow}>
            <View style={styles.tagSection}>
              <View style={styles.tagSectionHeader}>
                <Icon name="label" size={14} color={COLORS.primary} />
                <Text style={styles.tagSectionLabel}>자주 나온 주제</Text>
              </View>
              <View style={styles.tagList}>
                {['집안일', '재정', '소통'].map((tag, index) => (
                  <View key={index} style={styles.summaryTag}>
                    <Text style={styles.summaryTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.tagSectionDivider} />

            <View style={styles.tagSection}>
              <View style={styles.tagSectionHeader}>
                <Icon name="favorite" size={14} color="#E53E3E" />
                <Text style={styles.tagSectionLabel}>자주 나온 감정</Text>
              </View>
              <View style={styles.tagList}>
                {['답답함', '불안', '서운함'].map((tag, index) => (
                  <View key={index} style={[styles.summaryTag, styles.emotionTag]}>
                    <Text style={[styles.summaryTagText, styles.emotionTagText]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* History List */}
        <View style={styles.historyList}>
          {historyData.map(renderHistoryItem)}
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingTop: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: `${COLORS.primary}30`,
  },
  tagSectionRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  tagSection: {
    flex: 1,
  },
  tagSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  tagSectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  tagSectionDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.md,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  summaryTag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  summaryTagText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
  },
  emotionTag: {
    backgroundColor: '#FFF5F5',
  },
  emotionTagText: {
    color: '#E53E3E',
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
  dateStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  resolvedBadge: {
    backgroundColor: '#E8F5E9',
  },
  unresolvedBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  resolvedText: {
    color: '#2E7D32',
  },
  unresolvedText: {
    color: '#E65100',
  },
  historyContent: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  tagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
});
