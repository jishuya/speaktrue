import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Icon } from '../ui';
import StatusBadge from './StatusBadge';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;
const SCROLL_VIEW_MAX_HEIGHT = MODAL_MAX_HEIGHT - 150; // 헤더(~70) + 버튼(~60) + 패딩

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

export function HistoryDetailModal({
  visible,
  onClose,
  session,
  loading = false,
  showResolveButtons = true,
  onResolveToggle,
  showSelectButton = false,
  onSelect,
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View style={styles.modalOverlay}>
        {/* 배경 터치 영역 - 모달 뒤 */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Content - 일반 View로 터치 이벤트 간섭 없음 */}
        <View style={styles.modalContent}>
              {loading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : session ? (
                <>
                  {/* 헤더 - 고정 영역 */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderLeft}>
                      <Text style={styles.modalDate}>
                        {formatDate(session.startedAt)} 상담
                      </Text>
                      <StatusBadge status={session.isResolved ? 'resolved' : 'unresolved'} />
                      {session.summaryOnly && (
                        <View style={styles.summaryOnlyBadge}>
                          <Text style={styles.summaryOnlyText}>요약만</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Icon name="close" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* 스크롤 영역 */}
                  <ScrollView
                    style={styles.modalScrollView}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    bounces={true}
                  >
                    {/* 근본 원인 */}
                    {session.summary?.rootCause ? (
                      <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                          <Icon name="chat" size={16} color={COLORS.primary} />
                          <Text style={styles.modalSectionTitle}>근본 원인</Text>
                        </View>
                        <Text style={styles.modalSectionText}>
                          {session.summary.rootCause}
                        </Text>
                      </View>
                    ) : null}

                    {/* 대화 요약 */}
                    {session.summary?.summary ? (
                      <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                          <Icon name="description" size={16} color={COLORS.primary} />
                          <Text style={styles.modalSectionTitle}>대화 요약</Text>
                        </View>
                        <Text style={styles.modalSectionText}>
                          {session.summary.summary}
                        </Text>
                      </View>
                    ) : null}

                    {/* 감정 섹션 */}
                    <View style={styles.emotionRow}>
                      {/* 나의 감정 */}
                      <View style={styles.emotionColumn}>
                        <View style={styles.modalSectionHeader}>
                          <Icon name="sentiment-satisfied" size={16} color={COLORS.primary} />
                          <Text style={styles.modalSectionTitle}>나의 감정</Text>
                        </View>
                        <View style={styles.emotionTagList}>
                          {session.summary?.myEmotions?.length > 0 ? (
                            session.summary.myEmotions.map((emotion, idx) => (
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
                          {session.summary?.partnerEmotions?.length > 0 ? (
                            session.summary.partnerEmotions.map((emotion, idx) => (
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
                    {(session.summary?.myUnmetNeed || session.summary?.partnerUnmetNeed) ? (
                      <View style={styles.insightSection}>
                        <View style={styles.modalSectionHeader}>
                          <Icon name="lightbulb" size={16} color="#F6AD55" />
                          <Text style={styles.modalSectionTitle}>충족되지 못한 욕구</Text>
                        </View>
                        {session.summary.myUnmetNeed ? (
                          <View style={styles.insightItem}>
                            <Text style={styles.insightLabel}>나</Text>
                            <Text style={styles.insightValue}>{session.summary.myUnmetNeed}</Text>
                          </View>
                        ) : null}
                        {session.summary.partnerUnmetNeed ? (
                          <View style={styles.insightItem}>
                            <Text style={styles.insightLabel}>상대방</Text>
                            <Text style={styles.insightValue}>{session.summary.partnerUnmetNeed}</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    {/* AI 제안 솔루션 */}
                    {session.summary?.suggestedApproach ? (
                      <View style={styles.solutionSection}>
                        <View style={styles.modalSectionHeader}>
                          <Icon name="tips-and-updates" size={16} color="#48BB78" />
                          <Text style={styles.modalSectionTitle}>AI 제안 솔루션</Text>
                        </View>
                        <Text style={styles.modalSectionText}>
                          {session.summary.suggestedApproach}
                        </Text>
                        {session.summary.actionItems?.length > 0 ? (
                          <View style={styles.actionItemsContainer}>
                            {session.summary.actionItems.map((item, idx) => (
                              <View key={idx} style={styles.actionItem}>
                                <Icon name="check-circle" size={14} color="#48BB78" />
                                <Text style={styles.actionItemText}>{item}</Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    {/* 주제 태그 */}
                    {session.tags?.topic?.length > 0 ? (
                      <View style={styles.modalSection}>
                        <View style={styles.modalSectionHeader}>
                          <Icon name="pricetag" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.modalSectionTitle}>주제</Text>
                        </View>
                        <View style={styles.modalTagList}>
                          {session.tags.topic.map((tag, idx) => (
                            <View key={idx} style={styles.modalTag}>
                              <Text style={styles.modalTagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {/* 3개월 지난 세션 안내 */}
                    {session.summaryOnly ? (
                      <View style={styles.summaryOnlyNotice}>
                        <Icon name="info" size={16} color={COLORS.textMuted} />
                        <Text style={styles.summaryOnlyNoticeText}>
                          3개월이 지난 상담은 요약만 확인할 수 있습니다.
                        </Text>
                      </View>
                    ) : null}
                  </ScrollView>

                  {/* 하단 버튼 - 고정 영역 */}
                  {showSelectButton ? (
                    <View style={styles.selectButtonContainer}>
                      <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => onSelect && onSelect(session)}
                      >
                        <Icon name="link" size={18} color={COLORS.surface} />
                        <Text style={styles.selectButtonText}>이 상담과 연결하기</Text>
                      </TouchableOpacity>
                    </View>
                  ) : showResolveButtons && onResolveToggle ? (
                    <View style={styles.resolveButtonContainer}>
                      <TouchableOpacity
                        style={[
                          styles.resolveButton,
                          session.isResolved ? styles.resolveButtonActive : styles.resolveButtonInactive
                        ]}
                        onPress={() => onResolveToggle(session.id, true)}
                        disabled={session.isResolved}
                      >
                        <Icon name="thumb-up" size={18} color={session.isResolved ? COLORS.surface : '#68A37A'} />
                        <Text style={[
                          styles.resolveButtonText,
                          session.isResolved ? styles.resolveButtonTextActive : styles.resolveButtonTextInactive
                        ]}>해결</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.resolveButton,
                          !session.isResolved ? styles.unresolveButtonActive : styles.unresolveButtonInactive
                        ]}
                        onPress={() => onResolveToggle(session.id, false)}
                        disabled={!session.isResolved}
                      >
                        <Icon name="thumb-down" size={18} color={!session.isResolved ? COLORS.surface : '#E8936A'} />
                        <Text style={[
                          styles.resolveButtonText,
                          !session.isResolved ? styles.unresolveButtonTextActive : styles.unresolveButtonTextInactive
                        ]}>미해결</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </>
              ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: MODAL_MAX_HEIGHT,
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
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    flex: 1,
    paddingRight: SPACING.sm,
  },
  modalDate: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  modalScrollView: {
    maxHeight: SCROLL_VIEW_MAX_HEIGHT,
  },
  modalScrollContent: {
    paddingBottom: SPACING.sm,
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
  emptyTagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
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
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  summaryOnlyNoticeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
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
  selectButtonContainer: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  selectButtonText: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },
});
