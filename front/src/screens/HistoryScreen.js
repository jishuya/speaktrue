import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon, ConfirmModal } from '../components/ui';
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

  // 삭제 확인 모달 상태
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

      // 주제와 감정에서 중복 제거 후 각각 최대 6개씩
      const uniqueTopics = [...new Set(data.frequentTopics || [])];
      const uniqueEmotions = (data.frequentEmotions || []).filter(e => !uniqueTopics.includes(e));

      setFrequentTopics(uniqueTopics.slice(0, 6));
      setFrequentEmotions(uniqueEmotions.slice(0, 6));
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
    setDeleteTargetId(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await api.deleteHistory(deleteTargetId, TEMP_USER_ID);
      setHistoryData(prev => prev.filter(item => item.id !== deleteTargetId));
      setStats(prev => ({
        ...prev,
        totalSessions: Math.max(0, prev.totalSessions - 1),
      }));
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleteModalVisible(false);
      setDeleteTargetId(null);
    }
  };

  // 해결 상태 토글
  const handleResolveToggle = async (sessionId, isResolved) => {
    try {
      await api.updateSessionResolved(sessionId, isResolved);

      // 로컬 상태 업데이트
      setSelectedSession(prev => ({ ...prev, isResolved }));
      setHistoryData(prev => prev.map(item =>
        item.id === sessionId ? { ...item, resolved: isResolved } : item
      ));
      setStats(prev => ({
        ...prev,
        resolvedCount: isResolved ? prev.resolvedCount + 1 : prev.resolvedCount - 1,
        unresolvedCount: isResolved ? prev.unresolvedCount - 1 : prev.unresolvedCount + 1,
      }));
    } catch (err) {
      console.error('Failed to update resolved status:', err);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(historyData.length / ITEMS_PER_PAGE);
  const paginatedData = historyData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
          {item.summaryOnly && (
            <View style={styles.summaryOnlyBadge}>
              <Text style={styles.summaryOnlyText}>요약만</Text>
            </View>
          )}
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
      <Text style={styles.historyContent} numberOfLines={1}>{item.content}</Text>
      <View style={styles.tagRow}>
        {item.tags.slice(0, 4).map((tag, index) => (
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
            <>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              {/* 헤더 */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Text style={styles.modalDate}>
                    {formatDate(selectedSession.startedAt)} 상담
                  </Text>
                  <StatusBadge status={selectedSession.isResolved ? 'resolved' : 'unresolved'} />
                  {selectedSession.summaryOnly && (
                    <View style={styles.summaryOnlyBadge}>
                      <Text style={styles.summaryOnlyText}>요약만</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={closeModal}>
                  <Icon name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* 3개월 지난 세션 안내 */}
              {selectedSession.summaryOnly && (
                <View style={styles.summaryOnlyNotice}>
                  <Icon name="info" size={16} color={COLORS.textMuted} />
                  <Text style={styles.summaryOnlyNoticeText}>
                    3개월이 지난 상담은 요약만 확인할 수 있습니다.
                  </Text>
                </View>
              )}

              {/* 근본 원인 */}
              {selectedSession.summary?.rootCause && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="chat" size={16} color={COLORS.primary} />
                    <Text style={styles.modalSectionTitle}>근본 원인</Text>
                  </View>
                  <Text style={styles.modalSectionText}>
                    {selectedSession.summary.rootCause}
                  </Text>
                </View>
              )}

              {/* 대화 요약 */}
              {selectedSession.summary?.summary && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="description" size={16} color={COLORS.primary} />
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
                    <Icon name="sentiment-satisfied" size={16} color="#9F7AEA" />
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

              {/* 핵심 욕구 */}
              {(selectedSession.summary?.myUnmetNeed || selectedSession.summary?.partnerUnmetNeed) && (
                <View style={styles.insightSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="lightbulb" size={16} color="#F6AD55" />
                    <Text style={styles.modalSectionTitle}>충족되지 못한 욕구</Text>
                  </View>
                  {selectedSession.summary.myUnmetNeed && (
                    <View style={styles.insightItem}>
                      <Text style={styles.insightLabel}>나</Text>
                      <Text style={styles.insightValue}>{selectedSession.summary.myUnmetNeed}</Text>
                    </View>
                  )}
                  {selectedSession.summary.partnerUnmetNeed && (
                    <View style={styles.insightItem}>
                      <Text style={styles.insightLabel}>상대방</Text>
                      <Text style={styles.insightValue}>{selectedSession.summary.partnerUnmetNeed}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* AI 제안 솔루션 */}
              {selectedSession.summary?.suggestedApproach && (
                <View style={styles.solutionSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="tips-and-updates" size={16} color="#48BB78" />
                    <Text style={styles.modalSectionTitle}>AI 제안 솔루션</Text>
                  </View>
                  <Text style={styles.modalSectionText}>
                    {selectedSession.summary.suggestedApproach}
                  </Text>
                  {selectedSession.summary.actionItems?.length > 0 && (
                    <View style={styles.actionItemsContainer}>
                      {selectedSession.summary.actionItems.map((item, idx) => (
                        <View key={idx} style={styles.actionItem}>
                          <Icon name="check-circle" size={14} color="#48BB78" />
                          <Text style={styles.actionItemText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* 주제 태그 */}
              {selectedSession.tags?.topic?.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="pricetag" size={16} color={COLORS.textSecondary} />
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

            {/* 해결/미해결 버튼 */}
            <View style={styles.resolveButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.resolveButton,
                  selectedSession.isResolved ? styles.resolveButtonActive : styles.resolveButtonInactive
                ]}
                onPress={() => handleResolveToggle(selectedSession.id, true)}
                disabled={selectedSession.isResolved}
              >
                <Icon name="thumb-up" size={18} color={selectedSession.isResolved ? COLORS.surface : '#68A37A'} />
                <Text style={[
                  styles.resolveButtonText,
                  selectedSession.isResolved ? styles.resolveButtonTextActive : styles.resolveButtonTextInactive
                ]}>해결</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.resolveButton,
                  !selectedSession.isResolved ? styles.unresolveButtonActive : styles.unresolveButtonInactive
                ]}
                onPress={() => handleResolveToggle(selectedSession.id, false)}
                disabled={!selectedSession.isResolved}
              >
                <Icon name="thumb-down" size={18} color={!selectedSession.isResolved ? COLORS.surface : '#E8936A'} />
                <Text style={[
                  styles.resolveButtonText,
                  !selectedSession.isResolved ? styles.unresolveButtonTextActive : styles.unresolveButtonTextInactive
                ]}>미해결</Text>
              </TouchableOpacity>
            </View>
            </>
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
              paginatedData.map(renderHistoryItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="history" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>아직 상담 기록이 없어요</Text>
              </View>
            )}
          </View>

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <Icon name="chevron-left" size={20} color={currentPage === 1 ? COLORS.textMuted : COLORS.textPrimary} />
              </TouchableOpacity>

              <Text style={styles.pageInfo}>{currentPage} / {totalPages}</Text>

              <TouchableOpacity
                style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <Icon name="chevron-right" size={20} color={currentPage === totalPages ? COLORS.textMuted : COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setDeleteTargetId(null);
        }}
        onConfirm={confirmDelete}
        title="기록 삭제"
        message="이 상담 기록을 삭제하시겠어요?"
        confirmText="삭제"
        cancelText="취소"
        confirmType="danger"
      />
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  pageButtonDisabled: {
    backgroundColor: COLORS.backgroundLight,
    borderColor: COLORS.backgroundLight,
  },
  pageInfo: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    minWidth: 60,
    textAlign: 'center',
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  tagSection: {
    flex: 1,
  },
  tagSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  tagSectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  tagSectionDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.sm,
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
    fontSize: FONT_SIZE.xs,
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
    backgroundColor: '#F3E8FF',
  },
  partnerEmotionText: {
    color: '#9F7AEA',
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
    alignItems: 'flex-start',
    paddingVertical: SPACING.xs,
  },
  insightLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    minWidth: 50,
  },
  insightValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    color: '#D69E2E',
    flex: 1,
    textAlign: 'right',
  },
  solutionSection: {
    backgroundColor: '#F0FFF4',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionItemsContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  actionItemText: {
    fontSize: FONT_SIZE.sm,
    color: '#276749',
    flex: 1,
    lineHeight: 20,
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
  // Summary Only 배지 및 안내
  summaryOnlyBadge: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  summaryOnlyText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
  },
  summaryOnlyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  summaryOnlyNoticeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    flex: 1,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  resolveButtonContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  resolveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  resolveButtonActive: {
    backgroundColor: '#68A37A',
  },
  resolveButtonInactive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#68A37A',
  },
  unresolveButtonActive: {
    backgroundColor: '#E8936A',
  },
  unresolveButtonInactive: {
    backgroundColor: '#FDECE5',
    borderWidth: 1,
    borderColor: '#E8936A',
  },
  resolveButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  resolveButtonTextActive: {
    color: COLORS.surface,
  },
  resolveButtonTextInactive: {
    color: '#68A37A',
  },
  unresolveButtonTextActive: {
    color: COLORS.surface,
  },
  unresolveButtonTextInactive: {
    color: '#E8936A',
  },
});
