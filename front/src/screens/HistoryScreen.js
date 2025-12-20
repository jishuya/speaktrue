import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/ui';
import { Header, StatusBadge } from '../components/common';
import { COLORS, STATUS_COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../services/api';

// TODO: 실제 인증 구현 후 제거
const TEMP_USER_ID = '11111111-1111-1111-1111-111111111111';

// 날짜 포맷 함수
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours < 12 ? '오전' : '오후';
    const hour12 = hours % 12 || 12;
    return `오늘, ${period} ${hour12}:${minutes}`;
  } else if (diffDays === 1) {
    return '어제';
  } else {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
};

export default function HistoryScreen({ navigation }) {
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    resolvedCount: 0,
    unresolvedCount: 0,
  });
  const [frequentTopics, setFrequentTopics] = useState([]);
  const [frequentEmotions, setFrequentEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchHistorySummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.getHistorySummary(TEMP_USER_ID);

      setHistoryData(data.sessions.map(session => ({
        ...session,
        date: formatDate(session.date),
      })));
      setStats(data.stats);
      setFrequentTopics(data.frequentTopics);
      setFrequentEmotions(data.frequentEmotions);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 화면 포커스될 때마다 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchHistorySummary();
    }, [])
  );

  // 세션 상세 조회
  const handleSessionPress = async (sessionId) => {
    try {
      setModalLoading(true);
      setModalVisible(true);

      const data = await api.getHistoryDetail(sessionId, TEMP_USER_ID);
      setSelectedSession(data);
    } catch (err) {
      console.error('Failed to fetch session detail:', err);
      Alert.alert('오류', '상세 정보를 불러오지 못했습니다');
      setModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSession(null);
  };

  const handleDelete = (id) => {
    Alert.alert(
      '기록 삭제',
      '이 상담 기록을 삭제하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteHistory(id, TEMP_USER_ID);
              setHistoryData(prev => prev.filter(item => item.id !== id));
              // 통계도 업데이트
              setStats(prev => ({
                ...prev,
                totalSessions: Math.max(0, prev.totalSessions - 1),
              }));
            } catch (err) {
              Alert.alert('오류', '삭제에 실패했습니다');
            }
          },
        },
      ]
    );
  };

  const renderHistoryItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.historyItem}
      onPress={() => handleSessionPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.historyHeader}>
        <View style={styles.dateStatusRow}>
          <Text style={styles.dateText}>{item.date}</Text>
          <StatusBadge status={item.resolved ? 'resolved' : 'unresolved'} />
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
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
    </TouchableOpacity>
  );

  // 상세 모달 렌더링
  const renderDetailModal = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <Pressable style={styles.modalOverlay} onPress={closeModal}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {modalLoading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : selectedSession ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* 헤더 */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalDate}>
                    {formatDate(selectedSession.startedAt)} 상담
                  </Text>
                  <StatusBadge status={selectedSession.isResolved ? 'resolved' : 'unresolved'} />
                </View>
                <TouchableOpacity onPress={closeModal}>
                  <Icon name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* 싸움 주된 이유 */}
              {selectedSession.summary?.mainReason && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="chat" size={16} color={COLORS.primary} />
                    <Text style={styles.modalSectionTitle}>싸움 이유</Text>
                  </View>
                  <Text style={styles.modalSectionText}>
                    {selectedSession.summary.mainReason}
                  </Text>
                </View>
              )}

              {/* 대화 요약 */}
              {selectedSession.summary?.summary && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="summarize" size={16} color={COLORS.primary} />
                    <Text style={styles.modalSectionTitle}>대화 요약</Text>
                  </View>
                  <Text style={styles.modalSectionText}>
                    {selectedSession.summary.summary}
                  </Text>
                </View>
              )}

              {/* 감정 섹션 */}
              <View style={styles.emotionRow}>
                {/* 나의 감정 */}
                <View style={styles.emotionColumn}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="sentiment-satisfied" size={16} color={COLORS.primary} />
                    <Text style={styles.modalSectionTitle}>나의 감정</Text>
                  </View>
                  <View style={styles.emotionTagList}>
                    {selectedSession.summary?.myEmotions?.length > 0 ? (
                      selectedSession.summary.myEmotions.map((emotion, idx) => (
                        <View key={idx} style={styles.emotionTagItem}>
                          <Text style={styles.emotionTagItemText}>{emotion}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyTagText}>없음</Text>
                    )}
                  </View>
                </View>

                {/* 상대방 감정 */}
                <View style={styles.emotionColumn}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="person" size={16} color="#E53E3E" />
                    <Text style={styles.modalSectionTitle}>상대방 감정</Text>
                  </View>
                  <View style={styles.emotionTagList}>
                    {selectedSession.summary?.partnerEmotions?.length > 0 ? (
                      selectedSession.summary.partnerEmotions.map((emotion, idx) => (
                        <View key={idx} style={[styles.emotionTagItem, styles.partnerEmotionTag]}>
                          <Text style={[styles.emotionTagItemText, styles.partnerEmotionText]}>{emotion}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyTagText}>없음</Text>
                    )}
                  </View>
                </View>
              </View>

              {/* AI 인사이트 */}
              {(selectedSession.summary?.hiddenEmotion || selectedSession.summary?.coreNeed) && (
                <View style={styles.insightSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="lightbulb" size={16} color="#F6AD55" />
                    <Text style={styles.modalSectionTitle}>AI 인사이트</Text>
                  </View>
                  {selectedSession.summary.hiddenEmotion && (
                    <View style={styles.insightItem}>
                      <Text style={styles.insightLabel}>숨겨진 감정</Text>
                      <Text style={styles.insightValue}>{selectedSession.summary.hiddenEmotion}</Text>
                    </View>
                  )}
                  {selectedSession.summary.coreNeed && (
                    <View style={styles.insightItem}>
                      <Text style={styles.insightLabel}>핵심 욕구</Text>
                      <Text style={styles.insightValue}>{selectedSession.summary.coreNeed}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 주제 태그 */}
              {selectedSession.tags?.topic?.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="label" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.modalSectionTitle}>주제</Text>
                  </View>
                  <View style={styles.modalTagList}>
                    {selectedSession.tags.topic.map((tag, idx) => (
                      <View key={idx} style={styles.modalTag}>
                        <Text style={styles.modalTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header
        title="상담 기록"
        showBack
        centerTitle
        darkBackground
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>기록을 불러오지 못했습니다</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHistorySummary}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
                <Text style={styles.statValue}>{stats.totalSessions}</Text>
                <Text style={styles.statLabel}>총 상담</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.resolvedCount}</Text>
                <Text style={styles.statLabel}>해결</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.unresolvedCount}</Text>
                <Text style={styles.statLabel}>미해결</Text>
              </View>
            </View>

            <View style={styles.tagSectionRow}>
              <View style={styles.tagSection}>
                <View style={styles.tagSectionHeader}>
                  <Icon name="chat" size={14} color={COLORS.primary} />
                  <Text style={styles.tagSectionLabel}>자주 나온 주제</Text>
                </View>
                <View style={styles.tagList}>
                  {frequentTopics.length > 0 ? frequentTopics.map((tag, index) => (
                    <View key={index} style={styles.summaryTag}>
                      <Text style={styles.summaryTagText}>{tag}</Text>
                    </View>
                  )) : (
                    <Text style={styles.emptyTagText}>아직 없음</Text>
                  )}
                </View>
              </View>

              <View style={styles.tagSectionDivider} />

              <View style={styles.tagSection}>
                <View style={styles.tagSectionHeader}>
                  <Icon name="sentiment-satisfied" size={14} color="#E53E3E" />
                  <Text style={styles.tagSectionLabel}>자주 나온 감정</Text>
                </View>
                <View style={styles.tagList}>
                  {frequentEmotions.length > 0 ? frequentEmotions.map((tag, index) => (
                    <View key={index} style={[styles.summaryTag, styles.emotionTag]}>
                      <Text style={[styles.summaryTagText, styles.emotionTagText]}>{tag}</Text>
                    </View>
                  )) : (
                    <Text style={styles.emptyTagText}>아직 없음</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* History List */}
          <View style={styles.historyList}>
            {historyData.length > 0 ? (
              historyData.map(renderHistoryItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="history" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>아직 상담 기록이 없어요</Text>
              </View>
            )}
          </View>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptyTagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
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
    backgroundColor: `${COLORS.primary}15`,
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
    backgroundColor: STATUS_COLORS.danger.bg,
  },
  emotionTagText: {
    color: STATUS_COLORS.danger.text,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxHeight: '80%',
    ...SHADOWS.lg,
  },
  modalLoading: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalDate: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  modalSectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  modalSectionText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  emotionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  emotionColumn: {
    flex: 1,
  },
  emotionTagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  emotionTagItem: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  emotionTagItemText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
  },
  partnerEmotionTag: {
    backgroundColor: STATUS_COLORS.danger.bg,
  },
  partnerEmotionText: {
    color: STATUS_COLORS.danger.text,
  },
  insightSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  insightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  insightLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  insightValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    color: '#D69E2E',
  },
  modalTagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  modalTag: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  modalTagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
