import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '../components/ui';
import { Header, Button } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function PerspectiveScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        showBack
        // showProfile
        borderBottom
        darkBackground
        onBackPress={() => navigation.goBack()}
        leftComponent={
          <View style={styles.headerCenter}>
            <View style={styles.aiAvatarSmall}>
              <Icon name="visibility" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>관점 전환</Text>
              <Text style={styles.headerSubtitle}>상대방 입장에서</Text>
            </View>
          </View>
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
              <Text style={styles.partnerName}>알렉스의 입장</Text>
              <Text style={styles.aiLabel}>AI 공감 해석</Text>
            </View>
          </View>
          <Text style={styles.cardContent}>
            알렉스님은 지금 화가 난 것이 아니라, 상황에{' '}
            <Text style={styles.highlight}>압도감</Text>을 느끼고 당황스러우신 것 같아요.
            관계를 소중히 여기기 때문에, 상처 주지 않고 생각을 정리할{' '}
            <Text style={styles.highlight}>자신만의 공간</Text>을 찾고 계신 듯합니다.
            {'\n\n'}
            알렉스님이 대화를 피하는 것처럼 보일 수 있지만, 사실은 감정이 격해진 상태에서{' '}
            <Text style={styles.highlight}>후회할 말</Text>을 하고 싶지 않은 마음이 큰 것 같아요.
            침묵은 무관심이 아니라, 오히려 관계를 지키려는{' '}
            <Text style={styles.highlight}>나름의 노력</Text>일 수 있습니다.
            {'\n\n'}
            또한 알렉스님은 자신의 감정을 말로 표현하는 것이 익숙하지 않을 수 있어요.
            어릴 때부터 감정을 드러내면 안 된다고 배웠거나,{' '}
            <Text style={styles.highlight}>취약함을 보이는 것</Text>이 불편하게 느껴질 수 있습니다.
            그래서 혼자 정리할 시간이 필요한 거예요. 이건 당신을 밀어내는 게 아니라,{' '}
            <Text style={styles.highlight}>더 나은 대화</Text>를 위한 준비 시간입니다.
          </Text>

          {/* Feedback */}
          <View style={styles.feedbackSection}>
            {/* <Text style={styles.feedbackLabel}>도움이 되셨나요?</Text> */}
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
          </View>
        </View>

        {/* Empathy Points */}
        <View style={styles.empathySection}>
          <Text style={styles.sectionTitle}>공감 포인트</Text>
          <View style={styles.empathyCard}>
            <View style={[styles.empathyIcon, { backgroundColor: '#E3F2FD' }]}>
              <Icon name="sentiment-dissatisfied" size={24} color="#1565C0" />
            </View>
            <View style={styles.empathyContent}>
              <Text style={styles.empathyLabel}>숨겨진 감정</Text>
              <Text style={styles.empathyValue}>미래에 대한 불안함</Text>
            </View>
          </View>
          <View style={styles.empathyCard}>
            <View style={[styles.empathyIcon, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="spa" size={24} color="#2E7D32" />
            </View>
            <View style={styles.empathyContent}>
              <Text style={styles.empathyLabel}>핵심 욕구</Text>
              <Text style={styles.empathyValue}>확신과 안정감</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  // Header styles
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  aiAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primary}20`,
  },
  headerInfo: {
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
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
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  highlight: {
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.primary,
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
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
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
    fontSize: FONT_SIZE.sm,  // 12px - 터치 가능한 작은 버튼
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
  },
});
