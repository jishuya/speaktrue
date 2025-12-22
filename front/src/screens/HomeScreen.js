import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/ui';
import { Header, StatusBadge } from '../components/common';
import { COLORS, FEATURE_CARD_COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
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
    return '오늘';
  } else if (diffDays === 1) {
    return '어제';
  } else {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${dayNames[date.getDay()]})`;
  }
};

export default function HomeScreen({ navigation }) {
  const [journeyData, setJourneyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJourneyData = async () => {
    try {
      setLoading(true);
      const data = await api.getHistorySummary(TEMP_USER_ID);

      // 최근 5개만 표시
      const recentSessions = data.sessions.slice(0, 5).map(session => ({
        id: session.id,
        date: formatDate(session.date),
        title: session.content.substring(0, 15) + (session.content.length > 15 ? '...' : ''),
        content: session.content,
        tags: session.tags.slice(0, 2),
        resolved: session.resolved,
      }));

      setJourneyData(recentSessions);
    } catch {
      setJourneyData([]);
    } finally {
      setLoading(false);
    }
  };

  // 화면 포커스될 때마다 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchJourneyData();
    }, [])
  );

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <Header
        title="SpeakTrue"
        showLogo
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

        {/* Feature Grid - 내 마음 털어놓기 & 내가 진짜 하고 싶은 말은 */}
        <View style={styles.featureGrid}>
          {/* 내 마음 털어놓기 */}
          <TouchableOpacity
            style={[styles.featureCard, styles.featureCardGreen]}
            onPress={() => handleNavigate('Empathy')}
            activeOpacity={0.9}
          >
            <View style={[styles.featureIconContainer, styles.featureIconGreen]}>
              <Icon name="ear-hearing" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>내 마음{'\n'}털어놓기</Text>
              <Text style={styles.featureSubtitle}>솔직하게 말하기</Text>
            </View>
            <View style={styles.featureCardGlow} />
          </TouchableOpacity>

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
        </View>

        {/* 상대방 마음은 어땠을까 - 주석처리 */}
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}

        {/* Secondary Feature Grid */}
        <View style={[styles.featureGrid, styles.secondaryFeatureGrid]}>
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

          {loading ? (
            <View style={styles.journeyLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : journeyData.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.journeyScrollContent}
            >
              {journeyData.map((item) => (
                <TouchableOpacity key={item.id} style={styles.journeyCard} activeOpacity={0.95}>
                  <View style={styles.journeyCardHeader}>
                    <Text style={styles.journeyDate}>{item.date}</Text>
                    <StatusBadge status={item.resolved ? 'resolved' : 'unresolved'} />
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
          ) : (
            <View style={styles.journeyEmptyContainer}>
              <Icon name="history" size={32} color={COLORS.textMuted} />
              <Text style={styles.journeyEmptyText}>아직 상담 기록이 없어요</Text>
            </View>
          )}
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  greetingTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  greetingSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
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
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  secondaryFeatureGrid: {
    marginBottom: SPACING.lg,
  },
  featureCard: {
    flex: 1,
    height: 130,
    padding: SPACING.md,
    borderRadius: 24,
    justifyContent: 'flex-start',
    gap: SPACING.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  featureCardWarm: {
    backgroundColor: FEATURE_CARD_COLORS.warm,
  },
  featureCardGreen: {
    backgroundColor: FEATURE_CARD_COLORS.green,
  },
  featureCardSmall: {
    flex: 1,
    height: 110,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
    borderRadius: 20,
    justifyContent: 'flex-start',
    gap: SPACING.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  featureCardBlue: {
    backgroundColor: FEATURE_CARD_COLORS.blue,
  },
  featureCardPurple: {
    backgroundColor: FEATURE_CARD_COLORS.purple,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    flex: 1,
    zIndex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  featureSubtitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.sm,
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
    marginTop: SPACING.sm,
  },
  journeySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  journeySectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  journeySectionLink: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.primary,
  },
  journeyScrollContent: {
    paddingRight: SPACING.lg,
    gap: SPACING.sm,
  },
  journeyCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
    gap: SPACING.sm,
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
  journeyCardContent: {
    gap: 2,
  },
  journeyTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  journeyContent: {
    fontSize: FONT_SIZE.xs,
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
  journeyLoadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  journeyEmptyContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  journeyEmptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
});
