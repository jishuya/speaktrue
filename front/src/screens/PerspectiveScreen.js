import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/ui';
import { Header, HeaderWithIcon, Button } from '../components/common';
import { COLORS, EMOTION_STYLES, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { api } from '../services';

export default function PerspectiveScreen({ navigation, route }) {
  const { conversationHistory, sessionId } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [perspectiveData, setPerspectiveData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (conversationHistory && conversationHistory.length > 0) {
      fetchPerspectiveAnalysis();
    } else {
      setError('대화 기록이 없습니다.');
      setIsLoading(false);
    }
  }, []);

  const fetchPerspectiveAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getPerspectiveAnalysis(conversationHistory, sessionId);

      // 백엔드는 { reply: { sections, empathyPoints } } 형태로 응답
      const data = response.reply || response;

      // 새로운 JSON 형식 처리
      if (data.sections) {
        setPerspectiveData({
          sections: data.sections,
          hiddenEmotion: data.empathyPoints?.hiddenEmotion || '파악 중...',
          coreNeed: data.empathyPoints?.coreNeed || '파악 중...',
        });
      } else {
        // 기존 형식 호환 (문자열 응답인 경우)
        const content = typeof data === 'string' ? data : (data.reply || JSON.stringify(data));
        setPerspectiveData({
          sections: null,
          content: content,
          hiddenEmotion: '파악 중...',
          coreNeed: '파악 중...',
        });
      }
    } catch {
      setError('관점 분석 중 문제가 발생했어요. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 섹션별 소제목 매핑
  const sectionTitles = {
    summary: '대화 요약',
    emotionReaffirm: '사용자 감정 재확인',
    partnerPerspective: '상대방(남편)의 입장 해석',
    hiddenNeedAnalysis: '숨겨진 욕구 분석',
    communicationTip: '실질적인 소통 방안',
  };

  // 섹션별 콘텐츠 렌더링
  const renderSections = () => {
    if (!perspectiveData?.sections) {
      // 기존 형식인 경우 그대로 표시
      return (
        <Text style={styles.cardContent}>
          {perspectiveData?.content}
        </Text>
      );
    }

    const { sections } = perspectiveData;
    const sectionOrder = ['summary', 'emotionReaffirm', 'partnerPerspective', 'hiddenNeedAnalysis', 'communicationTip'];

    return sectionOrder.map((key) => {
      const content = sections[key];
      if (!content) return null;

      return (
        <View key={key} style={styles.sectionBlock}>
          <Text style={styles.sectionSubtitle}>{sectionTitles[key]}:</Text>
          <Text style={styles.sectionContent}>{content}</Text>
        </View>
      );
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header
          showBack
          borderBottom
          darkBackground
          onBackPress={() => navigation.goBack()}
          leftComponent={
            <HeaderWithIcon
              icon="favorite"
              title="관점 전환"
              subtitle="상대방 입장에서"
            />
          }
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>상대방의 관점을 분석하고 있어요...</Text>
          <Text style={styles.loadingSubText}>잠시만 기다려 주세요</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header
          showBack
          borderBottom
          darkBackground
          onBackPress={() => navigation.goBack()}
          leftComponent={
            <HeaderWithIcon
              icon="favorite"
              title="관점 전환"
              subtitle="상대방 입장에서"
            />
          }
        />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="다시 시도"
            size="sm"
            onPress={fetchPerspectiveAnalysis}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <Header
        showBack
        borderBottom
        darkBackground
        onBackPress={() => navigation.goBack()}
        leftComponent={
          <HeaderWithIcon
            icon="visibility"
            title="관점 전환"
            subtitle="상대방 입장에서"
          />
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Motivation Hint */}
        <View style={styles.motivationHint}>
          <Icon name="ear-hearing" size={20} color={COLORS.textSecondary} style={styles.hintIcon} />
          <Text style={styles.hintText}>
            상대방도 나름의 이유가 있었을 거예요
          </Text>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardGlow} />
          <View style={styles.cardHeader}>
            <View style={styles.partnerAvatar}>
              <Text style={styles.avatarText}>상대</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.partnerName}>상대님의 입장</Text>
              <Text style={styles.aiLabel}>AI 공감 해석</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            {renderSections()}
          </View>

          {/* Feedback */}
          {/* <View style={styles.feedbackSection}>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity style={styles.feedbackButton}>
                <Icon name="thumb-up" size={18} color={COLORS.primary} />
                <Text style={styles.feedbackButtonText}>네, 공감돼요</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.feedbackButton, styles.feedbackButtonSecondary]}>
                <Icon name="thumb-down" size={18} color={COLORS.textMuted} />
                <Text style={[styles.feedbackButtonText, styles.feedbackTextSecondary]}>잘 모르겠어요</Text>
              </TouchableOpacity>
            </View>
          </View> */}
        </View>

        {/* Empathy Points */}
        <View style={styles.empathySection}>
          <Text style={styles.sectionTitle}>공감 포인트</Text>
          <View style={styles.empathyCard}>
            <View style={[styles.empathyIcon, { backgroundColor: EMOTION_STYLES.anxious.bg }]}>
              <Icon name="sentiment-dissatisfied" size={24} color={EMOTION_STYLES.anxious.color} />
            </View>
            <View style={styles.empathyContent}>
              <Text style={styles.empathyLabel}>숨겨진 감정</Text>
              <Text style={styles.empathyValue}>{perspectiveData?.hiddenEmotion}</Text>
            </View>
          </View>
          <View style={styles.empathyCard}>
            <View style={[styles.empathyIcon, { backgroundColor: EMOTION_STYLES.happy.bg }]}>
              <Icon name="spa" size={24} color={EMOTION_STYLES.happy.color} />
            </View>
            <View style={styles.empathyContent}>
              <Text style={styles.empathyLabel}>핵심 욕구</Text>
              <Text style={styles.empathyValue}>{perspectiveData?.coreNeed}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCta}>
        <Button
          title="소통할 준비가 되었어요"
          icon="arrow-forward"
          iconPosition="right"
          size="md"
          fullWidth
          onPress={() => navigation.goBack()}
        />
      </View>
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
    paddingBottom: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
  },
  motivationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.xs,
  },
  hintIcon: {
    marginRight: 4,
  },
  hintText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.soft,
    borderWidth: 1,
    borderColor: `${COLORS.primary}08`,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}10`,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  avatarText: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  cardHeaderText: {
    marginLeft: SPACING.md,
  },
  partnerName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  aiLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardContent: {
    marginTop: SPACING.sm,
  },
  sectionBlock: {
    marginBottom: SPACING.md,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionContent: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  feedbackSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  feedbackButtonSecondary: {
    backgroundColor: COLORS.borderLight,
  },
  feedbackButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginLeft: 6,
  },
  feedbackTextSecondary: {
    color: COLORS.textMuted,
  },
  empathySection: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  empathyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  empathyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  empathyContent: {
    flex: 1,
  },
  empathyLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  empathyValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  bottomCta: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
  },
});
