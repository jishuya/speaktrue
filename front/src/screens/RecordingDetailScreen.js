import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Icon, Badge } from '../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

// 감정 태그 데이터
const EMOTION_TAGS = [
  { id: 1, label: '인정의 욕구', icon: 'favorite', color: COLORS.primary, bg: `${COLORS.primary}15` },
  { id: 2, label: '압도감', icon: 'bolt', color: '#F57F17', bg: '#FFF8E1' },
  { id: 3, label: '자율성', icon: 'lock-open', color: '#1565C0', bg: '#E3F2FD' },
  { id: 4, label: '유대감', icon: 'handshake', color: '#00897B', bg: '#E0F2F1' },
];

// 대화 내용 데이터
const CONVERSATION_DATA = [
  {
    id: 1,
    speaker: 'partner',
    name: 'A',
    message: '요즘 계획 짜는 건 나만 하는 것 같아. 너무 지쳐.',
    time: '오후 2:02',
  },
  {
    id: 2,
    speaker: 'me',
    name: '나',
    message: '왜 항상 그런 식으로 말해? 지난 주말엔 내가 다 계획했잖아!',
    time: '오후 2:03',
    nvcSuggestion: '"그 말을 들으니 좀 답답해. 지난 주말에 내가 노력한 부분을 인정받고 싶어서 그런 것 같아."',
  },
  {
    id: 3,
    speaker: 'partner',
    name: 'A',
    message: '맞아, 그건 깜빡했네. 회사 일 때문에 스트레스를 좀 받아서 그런가 봐.',
    time: '오후 2:04',
  },
];

export default function RecordingDetailScreen({ navigation, route }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMore = () => {
    // TODO: 더보기 메뉴 표시
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleDelete = () => {
    // TODO: 삭제 확인 모달 표시
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>기록 상세</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleMore}>
          <Icon name="more-horiz" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date */}
        <Text style={styles.dateText}>2023년 10월 24일 • 14분</Text>

        {/* Audio Player Card */}
        <View style={styles.audioCard}>
          <View style={styles.audioHeader}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
              <Icon
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={28}
                color={COLORS.surface}
              />
            </TouchableOpacity>
            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>대화 녹음</Text>
              <Text style={styles.audioMeta}>주방 • 오후 2:02</Text>
            </View>
            <TouchableOpacity style={styles.volumeButton}>
              <Icon name="volume-up" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Waveform */}
          <View style={styles.waveformContainer}>
            <View style={styles.waveform}>
              {[3, 5, 3, 4, 6, 4, 5, 8, 6, 4, 3, 5, 2, 4, 3, 5, 2, 4].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.waveformBar,
                    {
                      height: height * 4,
                      backgroundColor: index < 10 ? COLORS.primary : COLORS.borderLight,
                      opacity: index < 10 ? 0.3 + (index * 0.07) : 1,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>1:17</Text>
              <Text style={styles.timeText}>-2:23</Text>
            </View>
          </View>
        </View>

        {/* AI Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Icon name="auto-awesome" size={14} color={COLORS.primary} />
            <Text style={styles.insightLabel}>AI 인사이트</Text>
          </View>
          <Text style={styles.insightTitle}>해결 요약</Text>
          <Text style={styles.insightContent}>
            두 분 모두 더 많은 <Text style={styles.highlight}>함께하는 시간</Text>이 필요하다는 점을 확인했습니다. 5분 후 방어적인 태도에서 협력적인 태도로 변화했으며, 일정 조정에 대한 합의에 도달했습니다.
          </Text>
        </View>

        {/* Emotion Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>감정 분석</Text>
          <View style={styles.emotionTags}>
            {EMOTION_TAGS.map((tag) => (
              <View key={tag.id} style={[styles.emotionTag, { backgroundColor: tag.bg }]}>
                <Icon name={tag.icon} size={18} color={tag.color} />
                <Text style={styles.emotionTagText}>{tag.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Conversation Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>대화 내용 및 분석</Text>
            <View style={styles.fullRecordBadge}>
              <Text style={styles.fullRecordText}>전체 기록</Text>
            </View>
          </View>

          <View style={styles.conversation}>
            {CONVERSATION_DATA.map((item) => (
              <View key={item.id}>
                {item.speaker === 'partner' ? (
                  <View style={styles.partnerMessage}>
                    <View style={styles.partnerAvatar}>
                      <Text style={styles.avatarText}>{item.name}</Text>
                    </View>
                    <View style={styles.messageContent}>
                      <View style={styles.partnerBubble}>
                        <Text style={styles.messageText}>{item.message}</Text>
                      </View>
                      <Text style={styles.messageTime}>{item.time}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.myMessageContainer}>
                    <View style={styles.myMessage}>
                      <View style={styles.myMessageContent}>
                        <View style={styles.myBubble}>
                          <Text style={styles.myMessageText}>{item.message}</Text>
                        </View>
                      </View>
                      <View style={styles.myAvatar}>
                        <Text style={styles.myAvatarText}>{item.name}</Text>
                      </View>
                    </View>

                    {/* NVC Suggestion */}
                    {item.nvcSuggestion && (
                      <View style={styles.nvcContainer}>
                        <View style={styles.nvcCard}>
                          <View style={styles.nvcHeader}>
                            <Icon name="psychology" size={16} color={COLORS.primary} />
                            <Text style={styles.nvcLabel}>NVC 제안 (비폭력 대화)</Text>
                          </View>
                          <Text style={styles.nvcText}>{item.nvcSuggestion}</Text>
                        </View>
                      </View>
                    )}
                    <Text style={styles.myMessageTime}>{item.time}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="delete" size={18} color={COLORS.textMuted} />
          <Text style={styles.deleteText}>기록 삭제</Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },

  // Date
  dateText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    opacity: 0.8,
  },

  // Audio Card
  audioCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}10`,
    ...SHADOWS.sm,
  },
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  audioInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  audioTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  audioMeta: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  volumeButton: {
    padding: SPACING.xs,
  },
  waveformContainer: {
    marginTop: SPACING.md,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    gap: 3,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  timeText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textMuted,
  },

  // Insight Card
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.primary}10`,
    ...SHADOWS.sm,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  insightLabel: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  insightContent: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  highlight: {
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.primary,
  },

  // Section
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  fullRecordBadge: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  fullRecordText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },

  // Emotion Tags
  emotionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  emotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  emotionTagText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textPrimary,
  },

  // Conversation
  conversation: {
    gap: SPACING.lg,
  },
  partnerMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  partnerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
  },
  messageContent: {
    flex: 1,
    maxWidth: '85%',
  },
  partnerBubble: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  messageText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  messageTime: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },

  // My Message
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  myMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    width: '100%',
  },
  myMessageContent: {
    maxWidth: '85%',
  },
  myBubble: {
    backgroundColor: `${COLORS.primary}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: `${COLORS.primary}10`,
  },
  myMessageText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  myAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myAvatarText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  myMessageTime: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginRight: 44,
  },

  // NVC Card
  nvcContainer: {
    width: '80%',
    marginRight: 44,
    marginTop: SPACING.sm,
  },
  nvcCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
    ...SHADOWS.sm,
  },
  nvcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  nvcLabel: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nvcText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Delete Button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xl,
  },
  deleteText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
  },
});
