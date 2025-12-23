import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import profileFemaleImage from '../assets/images/profile_female.png';
import profileMaleImage from '../assets/images/profile_male.png';
import { Header, MenuItem, MenuGroup, ProfileEditModal } from '../components/common';
import { ConfirmModal, AlertModal } from '../components/ui/Modal';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../services/api';
import { useAuth } from '../store/AuthContext';

// 성별 변환 함수
const genderToKorean = (gender) => {
  if (gender === 'male') return '남';
  if (gender === 'female') return '여';
  return gender || '';
};

const genderToEnglish = (gender) => {
  if (gender === '남') return 'male';
  if (gender === '여') return 'female';
  return gender || '';
};

// 역할 변환 함수
const typeToKorean = (type) => {
  if (type === 'husband') return '남편';
  if (type === 'wife') return '아내';
  return type || '';
};

const typeToEnglish = (type) => {
  if (type === '남편') return 'husband';
  if (type === '아내') return 'wife';
  return type || '';
};

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [comingSoonModalVisible, setComingSoonModalVisible] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    gender: '',
    type: '',
    partnerName: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // OAuth 사용자인지 확인 (oauth_provider가 있으면 OAuth 사용자)
  const isOAuthUser = user?.oauthProvider != null;

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getProfile(user.id);
      setProfile({
        name: data.name || '',
        email: data.email || '',
        gender: genderToKorean(data.gender),
        type: typeToKorean(data.type),
        partnerName: data.partnerName || '',
      });
    } catch {
      // 에러 시 기본값 유지
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (updatedProfile) => {
    try {
      setSaving(true);
      const data = await api.updateProfile(user.id, {
        ...updatedProfile,
        gender: genderToEnglish(updatedProfile.gender),
        type: typeToEnglish(updatedProfile.type),
      });
      setProfile({
        name: data.name || '',
        email: data.email || '',
        gender: genderToKorean(data.gender),
        type: typeToKorean(data.type),
        partnerName: data.partnerName || '',
      });
      setProfileModalVisible(false);
    } catch {
      Alert.alert('오류', '프로필 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    const result = await api.changePassword(currentPassword, newPassword);
    if (result.success) {
      Alert.alert('성공', '비밀번호가 변경되었습니다.');
    } else {
      throw new Error(result.error || '비밀번호 변경에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    console.log('=== handleLogout called ===');
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    console.log('=== Logout confirmed ===');
    try {
      await logout();
      console.log('=== logout() finished ===');
    } catch (error) {
      console.error('=== handleLogout error ===', error);
    }
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <Header
        title="설정"
        showBack
        centerTitle
        darkBackground
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileGlow} />
          <View style={styles.profileImageContainer}>
            <Image
              source={profile.gender === '남' ? profileMaleImage : profileFemaleImage}
              style={styles.profileImageImg}
            />
          </View>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: SPACING.md }} />
          ) : (
            <>
              <Text style={styles.profileName}>{profile.name || '이름 없음'}</Text>
              <Text style={styles.profileEmail}>{profile.email || '이메일 없음'}</Text>
            </>
          )}
          <TouchableOpacity style={styles.editProfileButton} onPress={() => setProfileModalVisible(true)}>
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
            onPress={() => setComingSoonModalVisible(true)}
          />
          <MenuItem
            icon="language"
            iconBgColor="#E3F2FD"
            iconColor="#1976D2"
            title="언어 설정"
            value="한국어"
            onPress={() => setComingSoonModalVisible(true)}
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
        <Text style={styles.version}>SpeakTrue v1.0.2</Text>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onSave={handleSaveProfile}
        onChangePassword={handleChangePassword}
        initialData={profile}
        loading={saving}
        isOAuthUser={isOAuthUser}
      />

      {/* Logout Confirm Modal */}
      <ConfirmModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        confirmType="danger"
      />

      {/* Coming Soon Alert Modal */}
      <AlertModal
        visible={comingSoonModalVisible}
        onClose={() => setComingSoonModalVisible(false)}
        title="알림"
        message="준비 중입니다"
        confirmText="확인"
        type="info"
      />
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
    paddingTop: SPACING.md,
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
  profileImageImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.surface,
    ...SHADOWS.md,
  },
  profileInitial: {
    fontSize: FONT_SIZE.display,
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
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
});
