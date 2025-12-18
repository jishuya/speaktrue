import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '../components/ui';
import { Header } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

// 여정 데이터
const JOURNEY_DATA = [
  {
    id: '1',
    date: '어제',
    title: '일요일의 대화',
    content: '집안일 분담에 대해 이야기를 나누고...',
    tags: ['집안일', '답답함'],
    resolved: true,
  },
  {
    id: '2',
    date: '10월 24일 (금)',
    title: '고마움의 쪽지',
    content: '내 이야기를 끝까지 들어줘서 고마...',
    tags: ['소통', '감사함'],
    resolved: false,
  },
];

export default function HomeScreen({ navigation }) {
  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="SpeakTrue"
        showLogo
        // rightIcon="settings"
        // onRightPress={() => handleNavigate('Settings')}
        showProfile
        onProfilePress={() => handleNavigate('Settings')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>



          
          <Text style={styles.greetingTitle}>
            안녕하세요, 지수님.
          </Text>
          <Text style={styles.greetingSubtitle}>
            오늘은 어떤 마음인가요?
          </Text>
        </View>

        {/* Main CTA Button - 내 편에게 털어놓기 */}
        <TouchableOpacity
          style={styles.mainCtaButton}
          onPress={() => handleNavigate('Empathy')}
          activeOpacity={0.9}
        >
          <View style={styles.mainCtaContentRow}>
            <View style={styles.mainCtaIconContainer}>
              <Icon name="ear-hearing" size={28} color={COLORS.surface} />
            </View>
            <View style={styles.mainCtaTextContainer}>
              <Text style={styles.mainCtaTitle}>내 마음 털어놓기</Text>
              <Text style={styles.mainCtaSubtitle}>지금 느끼는 감정을 솔직하게 말해줘</Text>
            </View>
          </View>
          <View style={styles.mainCtaGlow} />
        </TouchableOpacity>

        {/* Feature Grid */}
        <View style={styles.featureGrid}>
          {/* 내가 진짜 하고 싶은 말은 */}
          <TouchableOpacity
            style={[styles.featureCard, styles.featureCardWarm]}
            onPress={() => handleNavigate('Transform')}
            activeOpacity={0.9}
          >
            <View style={[styles.featureIconContainer, styles.featureIconWarm]}>
              <Icon name="psychology" size={20} color="#9C7C58" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>내가 진짜{'\n'}하고 싶은 말은</Text>
              <Text style={styles.featureSubtitle}>진심 전달하기</Text>
            </View>
            <View style={styles.featureCardGlow} />
          </TouchableOpacity>

          {/* 그때 이렇게 말했다면 */}
          <TouchableOpacity
            style={[styles.featureCard, styles.featureCardGreen]}
            onPress={() => handleNavigate('Perspective')}
            activeOpacity={0.9}
          >
            <View style={[styles.featureIconContainer, styles.featureIconGreen]}>
              <Icon name="history" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>상대방 마음은{'\n'}어땠을까</Text>
              <Text style={styles.featureSubtitle}>상대방 이해하기</Text>
            </View>
            <View style={styles.featureCardGlow} />
          </TouchableOpacity>
        </View>

        {/* Secondary Feature Grid */}
        <View style={styles.featureGrid}>
          {/* 패턴분석 */}
          <TouchableOpacity
            style={[styles.featureCardSmall, styles.featureCardBlue]}
            onPress={() => handleNavigate('Patterns')}
            activeOpacity={0.9}
          >
            <View style={[styles.featureIconContainer, styles.featureIconBlue]}>
              <Icon name="analytics" size={20} color="#5B7BA3" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>패턴분석</Text>
              <Text style={styles.featureSubtitle}>대화 패턴 알아보기</Text>
            </View>
          </TouchableOpacity>

          {/* 레코딩분석 */}
          <TouchableOpacity
            style={[styles.featureCardSmall, styles.featureCardPurple]}
            onPress={() => handleNavigate('RecordingDetail')}
            activeOpacity={0.9}
          >
            <View style={[styles.featureIconContainer, styles.featureIconPurple]}>
              <Icon name="mic" size={20} color="#8B7BA3" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>레코딩분석</Text>
              <Text style={styles.featureSubtitle}>녹음 대화 분석하기</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Journey Section */}
        <View style={styles.journeySection}>
          <View style={styles.journeySectionHeader}>
            <Text style={styles.journeySectionTitle}>우리의 여정</Text>
            <TouchableOpacity onPress={() => handleNavigate('History')}>
              <Text style={styles.journeySectionLink}>더보기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.journeyScrollContent}
          >
            {JOURNEY_DATA.map((item) => (
              <TouchableOpacity key={item.id} style={styles.journeyCard} activeOpacity={0.95}>
                <View style={styles.journeyCardHeader}>
                  <Text style={styles.journeyDate}>{item.date}</Text>
                  <View style={[styles.statusBadge, item.resolved ? styles.resolvedBadge : styles.unresolvedBadge]}>
                    <Text style={[styles.statusText, item.resolved ? styles.resolvedText : styles.unresolvedText]}>
                      {item.resolved ? '해결' : '미해결'}
                    </Text>
                  </View>
                </View>
                <View style={styles.journeyCardContent}>
                  <Text style={styles.journeyTitle}>{item.title}</Text>
                  <Text style={styles.journeyContent} numberOfLines={1}>{item.content}</Text>
                </View>
                <View style={styles.journeyCardFooter}>
                  {item.tags.map((tag, index) => (
                    <View key={index} style={styles.journeyTag}>
                      <Text style={styles.journeyTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Greeting
  greetingSection: {
    paddingTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  greetingTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Main CTA Button
  mainCtaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.lg,
  },
  mainCtaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  mainCtaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  mainCtaTextContainer: {
    flex: 1,
  },
  mainCtaTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
    lineHeight: 28,
  },
  mainCtaSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  mainCtaGlow: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Feature Grid
  featureGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  featureCard: {
    flex: 1,
    height: 176,
    padding: SPACING.lg,
    borderRadius: 32,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  featureCardWarm: {
    backgroundColor: '#F0EBE0',
  },
  featureCardGreen: {
    backgroundColor: '#E0EDE8',
  },
  featureCardSmall: {
    flex: 1,
    height: 120,
    padding: SPACING.lg,
    borderRadius: 24,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  featureCardBlue: {
    backgroundColor: '#E0E8ED',
  },
  featureCardPurple: {
    backgroundColor: '#EBE0ED',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  featureIconWarm: {
    backgroundColor: COLORS.surface,
  },
  featureIconGreen: {
    backgroundColor: COLORS.surface,
  },
  featureIconBlue: {
    backgroundColor: COLORS.surface,
  },
  featureIconPurple: {
    backgroundColor: COLORS.surface,
  },
  featureTextContainer: {
    zIndex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  featureSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  featureCardGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: 80,
    borderBottomLeftRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  // Journey Section
  journeySection: {
    marginTop: SPACING.md,
  },
  journeySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  journeySectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  journeySectionLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.primary,
  },
  journeyScrollContent: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  journeyCard: {
    width: 240,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  journeyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journeyDate: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
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
  journeyCardContent: {
    gap: SPACING.xs,
  },
  journeyTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  journeyContent: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  journeyCardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  journeyTag: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  journeyTagText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
  },
});
