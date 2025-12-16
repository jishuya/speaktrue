import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Icon } from '../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

// 여정 데이터
const JOURNEY_DATA = [
  {
    id: '1',
    date: '어제',
    title: '일요일의 대화',
    content: '집안일 분담에 대해 이야기를 나누고...',
    tag: '해결됨',
    hasRating: true,
    avatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDLFIJQHY78xArDdrq1ZHS4hAcUPs7lBDin7aAauZMhFi4DUhNYC12D4AOHeLdIFcNU9MQxaaKTIXLgQhSsyx2jQQPfEawRQYPU0SONu143Q2DW83Mf8rh6bqLz3bg_TjtJwkBr7lxeM2ice-jGPU1WIsQFUOCob5FBKzYERXcEu8CB94oYXQ7grz43nI_QuE_NSzE1ojohzaUpL3zGPGHp5GMUIM_duZgIOZSoumjsNQbTcssxmy932WEe807_x7O-c8aK2QcBJC-Q',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAscrjTbUjc_rYbE44Tz8YBFGp9N6kUsmlcAmZynwGC_Q5ehPDjmBdqEqo-3Thjg3HkkyoH_cPHYI5pltYMS_oJBHOdUK88LJsG7NXF7u7lsPpEE872E0ocnBiX-xo5r9V2wwEJorgoQqhNqOJ2bYq5foyhZjOfYlGwyVfubnnC7_1-de_8Ww315IMK1DTWmzMSAIXF5wYfWP0i22cLvU2UO25LbnN-2LwOBtima_VjeIddY0G2_ZpgISlsU3CQE7FNDHXfTmf3HqDH',
    ],
  },
  {
    id: '2',
    date: '10월 24일 (금)',
    title: '고마움의 쪽지',
    content: '내 이야기를 끝까지 들어줘서 고마...',
    tag: '감사함',
    hasRating: false,
    avatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCV17mh6L-Qwb4a4bC7N4fKlc4OwkgynL928fZe08yjgypIgMG285T9SXx0nRp24OjQ6q866OSSnSPFjYx4U5xhPgxqSuxBjWO4hoBrEzNg46vEg3ow2zN-UkWMYridh3F9NSIzGBbVLqU7_y9gYjhpsXEWfAgSKu_ey8fNsPgT6mlVmQ9O2bcxrwIqw3H1veVGlNJ4X2XbpSiK9m6mmxslZugcpZsLi7vmTVdB_DVhJIt8EDzELbfDbiZI8Lzh8ljgyEPCQfNtGb6c',
    ],
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
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALGg4RghdltOox3ir7GSZ7t_iAwg6jzE1CXCAFsxTFncjZsR41Q8a6b6JQQpZFoTopU_tI0WHGAlqtyHMSgQonB0hMjb4X_9kr-IXUp2qVZlBAXB2HBjwkOZvRk5GDr9tLlyKgwvZ_v8-Iy_4oa8SyL43ga3vgCQLTDYW6VMonXLD8MCvNHDuTjNwdL-kjAnmmV3hZ_Q76cg7aud-8SYXI8lfg_FGFj0GaTMEgIx2-3MsXK3298_x4hymvHiPzLX2RdouZC9HWqY34' }}
              style={styles.profileImage}
            />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>함께하기</Text>
            <Text style={styles.headerTitle}>TrueSpeak</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="notifications" size={24} color={COLORS.textPrimary} />
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
          <View style={styles.mainCtaContent}>
            <View style={styles.mainCtaIconContainer}>
              <Icon name="favorite" size={28} color={COLORS.surface} />
            </View>
            <View style={styles.mainCtaTextContainer}>
              <Text style={styles.mainCtaTitle}>내 편에게{'\n'}털어놓기</Text>
              <Text style={styles.mainCtaSubtitle}>지금 느끼는 감정을 솔직하게 표현해보세요.</Text>
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
              <Text style={styles.featureSubtitle}>마음 속 깊은 진심 찾기</Text>
            </View>
            <View style={styles.featureCardGlow} />
          </TouchableOpacity>

          {/* 그때 이렇게 말했다면 */}
          <TouchableOpacity
            style={[styles.featureCard, styles.featureCardGreen]}
            onPress={() => handleNavigate('History')}
            activeOpacity={0.9}
          >
            <View style={[styles.featureIconContainer, styles.featureIconGreen]}>
              <Icon name="history" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>그때 이렇게{'\n'}말했다면</Text>
              <Text style={styles.featureSubtitle}>더 나은 대화 연습하기</Text>
            </View>
            <View style={styles.featureCardGlow} />
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
                  {item.hasRating && (
                    <Text style={styles.journeyRating}>★★★★★</Text>
                  )}
                </View>
                <View style={styles.journeyCardContent}>
                  <Text style={styles.journeyTitle}>{item.title}</Text>
                  <Text style={styles.journeyContent} numberOfLines={1}>{item.content}</Text>
                </View>
                <View style={styles.journeyCardFooter}>
                  <View style={styles.avatarStack}>
                    {item.avatars.map((avatar, index) => (
                      <Image
                        key={index}
                        source={{ uri: avatar }}
                        style={[
                          styles.avatarSmall,
                          index > 0 && { marginLeft: -8 },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.journeyTag}>
                    <Text style={styles.journeyTagText}>{item.tag}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom spacing for nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="home" size={24} color={COLORS.primary} />
            <Text style={[styles.navLabel, styles.navLabelActive]}>홈</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavigate('Patterns')}
          >
            <Icon name="analytics" size={24} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>패턴 분석</Text>
          </TouchableOpacity>

          {/* Center FAB */}
          <View style={styles.navItemCenter}>
            <TouchableOpacity
              style={styles.fabButton}
              onPress={() => handleNavigate('Empathy')}
              activeOpacity={0.9}
            >
              <Icon name="favorite" size={32} color={COLORS.surface} />
            </TouchableOpacity>
            <Text style={styles.fabLabel}>내 편에게{'\n'}털어놓기</Text>
          </View>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavigate('Transform')}
          >
            <Icon name="psychology" size={24} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>진심 찾기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavigate('History')}
          >
            <Icon name="history" size={24} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>대화 연습</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingTop: SPACING.xl + SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  profileContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: `${COLORS.primary}30`,
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
    gap: 2,
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
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
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
    fontSize: 28,
    fontWeight: FONT_WEIGHT.extraBold,
    color: COLORS.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 24,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Main CTA Button
  mainCtaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 40,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    minHeight: 200,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.lg,
  },
  mainCtaContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  mainCtaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  mainCtaTextContainer: {
    marginTop: 'auto',
  },
  mainCtaTitle: {
    fontSize: 24,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
    lineHeight: 32,
    marginBottom: SPACING.sm,
  },
  mainCtaSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: 'rgba(255,255,255,0.9)',
  },
  mainCtaGlow: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
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
    backgroundColor: '#FAF7F0',
  },
  featureCardGreen: {
    backgroundColor: '#F1F8F6',
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
    fontSize: FONT_SIZE.xs,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  journeyRating: {
    fontSize: FONT_SIZE.xs,
    color: '#FBBF24',
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
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.surface,
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

  // Bottom Navigation
  bottomNavContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'flex-end',
    height: 72,
    ...SHADOWS.nav,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: SPACING.sm,
    gap: 4,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  navLabelActive: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  navItemCenter: {
    width: 64,
    alignItems: 'center',
  },
  fabButton: {
    position: 'absolute',
    top: -48,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.xl,
  },
  fabLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 12,
    marginTop: SPACING.xs,
  },
});
