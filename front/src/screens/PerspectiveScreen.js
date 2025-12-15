import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function PerspectiveScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>관점 전환</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="diversity-1" size={48} color={COLORS.primary} />
            <View style={styles.heroIconBadge}>
              <MaterialIcons name="favorite" size={16} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.heroTitle}>알렉스의 마음 헤아리기</Text>
          <Text style={styles.heroSubtitle}>
            잠시 멈춰 상대방의 입장이 되어보면, 대화의 온도가 달라집니다.
          </Text>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardGlow} />
          <View style={styles.cardHeader}>
            <View style={styles.partnerAvatar}>
              <Text style={styles.avatarText}>상</Text>
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
          </Text>

          {/* Feedback */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackLabel}>도움이 되셨나요?</Text>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity style={styles.feedbackButton}>
                <MaterialIcons name="thumb-up" size={18} color={COLORS.primary} />
                <Text style={styles.feedbackButtonText}>네, 공감돼요</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.feedbackButton, styles.feedbackButtonSecondary]}>
                <MaterialIcons name="thumb-down" size={18} color={COLORS.textMuted} />
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
              <MaterialIcons name="sentiment-dissatisfied" size={24} color="#1565C0" />
            </View>
            <View style={styles.empathyContent}>
              <Text style={styles.empathyLabel}>숨겨진 감정</Text>
              <Text style={styles.empathyValue}>미래에 대한 불안함</Text>
            </View>
          </View>
          <View style={styles.empathyCard}>
            <View style={[styles.empathyIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialIcons name="spa" size={24} color="#2E7D32" />
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
          size="lg"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
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
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.secondaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  heroIconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  heroTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extraBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
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
    fontSize: FONT_SIZE.xs,
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
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginLeft: 6,
  },
  feedbackTextSecondary: {
    color: COLORS.textMuted,
  },
  empathySection: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.md,
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
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  empathyValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.backgroundLight,
  },
});
