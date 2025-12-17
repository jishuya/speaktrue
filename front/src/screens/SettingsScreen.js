import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Icon } from '../components/ui';
import { BottomNav, MenuItem, MenuGroup } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileGlow} />
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitial}>김</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Icon name="edit" size={14} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>김지수</Text>
          <Text style={styles.profileEmail}>jisoo.kim@truespeak.com</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>프로필 수정</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <MenuGroup title="앱 설정">
          <MenuItem
            icon="notifications"
            iconBgColor="#FFF3E0"
            iconColor="#F57C00"
            title="알림 설정"
            subtitle="파트너 메시지 및 코칭 알림"
            showSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
          />
          <MenuItem
            icon="language"
            iconBgColor="#E3F2FD"
            iconColor="#1976D2"
            title="언어 설정"
            value="한국어"
            onPress={() => {}}
          />
        </MenuGroup>

        {/* Insights & Support */}
        <MenuGroup title="인사이트 및 지원">
          <MenuItem
            icon="analytics"
            iconBgColor={`${COLORS.primary}20`}
            iconColor={COLORS.primary}
            title="대화 패턴 분석"
            subtitle="나의 NVC 실천 기록 확인하기"
            onPress={() => navigation.navigate('Patterns')}
          />
          <MenuItem
            icon="menu-book"
            iconBgColor="#F3E5F5"
            iconColor="#7B1FA2"
            title="사용자 가이드"
            onPress={() => {}}
          />
          <MenuItem
            icon="chat-bubble"
            iconBgColor="#E0F2F1"
            iconColor="#00796B"
            title="의견 보내기"
            onPress={() => {}}
          />
        </MenuGroup>

        {/* Account & Info */}
        <MenuGroup title="계정 및 정보">
          <MenuItem
            icon="description"
            iconBgColor={COLORS.borderLight}
            iconColor={COLORS.textSecondary}
            title="이용 약관"
            onPress={() => {}}
          />
          <MenuItem
            icon="logout"
            iconBgColor={COLORS.borderLight}
            iconColor={COLORS.textSecondary}
            title="로그아웃"
            danger
            onPress={handleLogout}
          />
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>계정 삭제</Text>
          </TouchableOpacity>
        </MenuGroup>

        {/* Version */}
        <Text style={styles.version}>TrueSpeak v1.0.2</Text>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        currentRoute="Settings"
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  profileGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: `${COLORS.primary}10`,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.surface,
    ...SHADOWS.md,
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  profileName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  profileEmail: {
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  editProfileButton: {
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  editProfileText: {
    fontSize: FONT_SIZE.md,  // 14px - 터치 가능 텍스트
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  deleteText: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    color: COLORS.textMuted,
  },
  version: {
    fontSize: 11,  // 최소 라벨 크기
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
});
