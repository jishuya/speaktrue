import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Header, TipCard, FeatureCard, BottomNav } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const JOURNEY_DATA = [
  {
    id: '1',
    date: '어제',
    title: '일요일의 대화',
    summary: '집안일 분담에 대해 이야기를 나누고...',
    rating: 5,
    status: '해결됨',
  },
  {
    id: '2',
    date: '10월 24일 (금)',
    title: '고마움의 쪽지',
    summary: '내 이야기를 끝까지 들어줘서 고마...',
    status: '감사함',
  },
];

export default function HomeScreen({ navigation }) {
  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitial}>나</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>함께하기</Text>
            <Text style={styles.headerTitle}>TrueSpeak</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={24} color={COLORS.textPrimary} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>
            안녕하세요, 사용자님. {'\n'}
            <Text style={styles.greetingSub}>대화할 준비 되셨나요?</Text>
          </Text>

          {/* Tip Card */}
          <TipCard
            title="오늘의 팁"
            content={`대답하기 위해서가 아니라,\n이해하기 위해 경청하세요.`}
          />
        </View>

        {/* Peace Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <MaterialIcons name="spa" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.streakContent}>
            <Text style={styles.streakLabel}>평화 유지 기록</Text>
            <View style={styles.streakValueRow}>
              <Text style={styles.streakValue}>12일째</Text>
              <Text style={styles.streakBadge}>잘하고 있어요!</Text>
            </View>
          </View>
          <View style={styles.streakDivider} />
          <MaterialIcons name="sentiment-satisfied" size={32} color={`${COLORS.primary}40`} />
        </View>

        {/* Feature Cards */}
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="favorite"
            title={`마음\n표현하기`}
            subtitle="솔직한 대화가 필요해..."
            color="#F1F8F6"
            iconColor={COLORS.primary}
            onPress={() => handleNavigate('Empathy')}
          />
          <View style={{ width: SPACING.md }} />
          <FeatureCard
            icon="lightbulb"
            title={`따뜻하게\n말하기`}
            subtitle="상처주지 않으려면?"
            color="#FAF7F0"
            iconColor={COLORS.accentWarm}
            onPress={() => handleNavigate('Transform')}
          />
        </View>

        {/* Journey Section */}
        <View style={styles.journeySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>우리의 여정</Text>
            <TouchableOpacity onPress={() => handleNavigate('History')}>
              <Text style={styles.sectionLink}>더보기</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.journeyScroll}
          >
            {JOURNEY_DATA.map((item) => (
              <View key={item.id} style={styles.journeyCard}>
                <View style={styles.journeyHeader}>
                  <Text style={styles.journeyDate}>{item.date}</Text>
                  {item.rating && (
                    <Text style={styles.journeyRating}>{'★'.repeat(item.rating)}</Text>
                  )}
                </View>
                <Text style={styles.journeyTitle}>{item.title}</Text>
                <Text style={styles.journeySummary} numberOfLines={1}>{item.summary}</Text>
                <View style={styles.journeyFooter}>
                  <View style={styles.avatarGroup}>
                    <View style={[styles.smallAvatar, { backgroundColor: COLORS.primarySoft }]} />
                    <View style={[styles.smallAvatar, { marginLeft: -8, backgroundColor: COLORS.secondary }]} />
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Bottom spacing for nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        currentRoute="Home"
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primary}30`,
  },
  profileInitial: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  headerLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentWarm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  greetingSection: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.extraBold,
    color: COLORS.textPrimary,
    lineHeight: 40,
    marginBottom: SPACING.md,
  },
  greetingSub: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSoft,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}10`,
    marginBottom: SPACING.md,
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  streakContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  streakLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  streakValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  streakBadge: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: `${COLORS.primary}20`,
    marginHorizontal: SPACING.md,
  },
  featureGrid: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  journeySection: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.primary,
  },
  journeyScroll: {
    paddingRight: SPACING.lg,
  },
  journeyCard: {
    width: 240,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  journeyDate: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  journeyRating: {
    fontSize: FONT_SIZE.xs,
    color: '#F5A623',
  },
  journeyTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  journeySummary: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  journeyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  statusBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
  },
});
