import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon } from '../components/ui';
import { Header, MenuItem, MenuGroup } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileName, setProfileName] = useState('김지수');
  const [profileEmail, setProfileEmail] = useState('jisoo.kim@truespeak.com');
  const [profileGender, setProfileGender] = useState('남');
  const [partnerName, setPartnerName] = useState('스투');
  const [profileAvatar, setProfileAvatar] = useState('male');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editPartnerName, setEditPartnerName] = useState('');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // 아바타 컴포넌트
  const MaleAvatar = ({ size = 96 }) => (
    <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      {/* 얼굴 */}
      <View style={[styles.avatarFace, { width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375 }]}>
        {/* 머리카락 (짧은 스타일) */}
        <View style={[styles.maleHair, { width: size * 0.6, height: size * 0.25, top: -size * 0.05 }]} />
        {/* 눈 */}
        <View style={styles.eyesContainer}>
          <View style={[styles.eye, { width: size * 0.1, height: size * 0.1 }]} />
          <View style={[styles.eye, { width: size * 0.1, height: size * 0.1 }]} />
        </View>
        {/* 입 */}
        <View style={[styles.mouth, { width: size * 0.15, height: size * 0.05, marginTop: size * 0.08 }]} />
      </View>
    </View>
  );

  const FemaleAvatar = ({ size = 96 }) => (
    <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#FFE4EC' }]}>
      {/* 얼굴 */}
      <View style={[styles.avatarFace, { width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375 }]}>
        {/* 머리카락 (긴 스타일) */}
        <View style={[styles.femaleHairLeft, { height: size * 0.5, left: -size * 0.12 }]} />
        <View style={[styles.femaleHairRight, { height: size * 0.5, right: -size * 0.12 }]} />
        <View style={[styles.femaleHairTop, { width: size * 0.65, height: size * 0.2, top: -size * 0.08 }]} />
        {/* 눈 */}
        <View style={styles.eyesContainer}>
          <View style={[styles.eye, { width: size * 0.1, height: size * 0.1 }]} />
          <View style={[styles.eye, { width: size * 0.1, height: size * 0.1 }]} />
        </View>
        {/* 입 */}
        <View style={[styles.femaleMouth, { width: size * 0.12, height: size * 0.05, marginTop: size * 0.08 }]} />
      </View>
    </View>
  );

  const renderAvatar = (type, size = 96) => {
    if (type === 'male') {
      return <MaleAvatar size={size} />;
    }
    return <FemaleAvatar size={size} />;
  };

  const handleOpenProfileModal = () => {
    setEditName(profileName);
    setEditEmail(profileEmail);
    setEditGender(profileGender);
    setEditPartnerName(partnerName);
    setProfileModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (editName.trim() === '') {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }
    setProfileName(editName.trim());
    setProfileEmail(editEmail.trim());
    setProfileGender(editGender);
    setPartnerName(editPartnerName.trim());
    setProfileModalVisible(false);
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
            {renderAvatar(profileAvatar, 96)}
            <TouchableOpacity style={styles.editButton} onPress={() => setAvatarModalVisible(true)}>
              <Icon name="edit" size={14} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profileName}</Text>
          <Text style={styles.profileEmail}>{profileEmail}</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleOpenProfileModal}>
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
        <Text style={styles.version}>SpeakTrue v1.0.2</Text>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setProfileModalVisible(false)}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>프로필 수정</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <Icon name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이름</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="이름을 입력하세요"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이메일</Text>
                <TextInput
                  style={styles.textInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="이메일을 입력하세요"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>성별</Text>
                <View style={styles.genderSelector}>
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      editGender === '남' && styles.genderOptionSelected,
                    ]}
                    onPress={() => setEditGender('남')}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        editGender === '남' && styles.genderOptionTextSelected,
                      ]}
                    >
                      남
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderOption,
                      editGender === '여' && styles.genderOptionSelected,
                    ]}
                    onPress={() => setEditGender('여')}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        editGender === '여' && styles.genderOptionTextSelected,
                      ]}
                    >
                      여
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>상대방 이름</Text>
                <TextInput
                  style={styles.textInput}
                  value={editPartnerName}
                  onChangeText={setEditPartnerName}
                  placeholder="상대방 이름을 입력하세요"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Avatar Selection Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setAvatarModalVisible(false)}
          />
          <View style={styles.avatarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>프로필 이미지 선택</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setAvatarModalVisible(false)}
              >
                <Icon name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarOptions}>
              <TouchableOpacity
                style={[
                  styles.avatarOptionItem,
                  profileAvatar === 'male' && styles.avatarOptionSelected,
                ]}
                onPress={() => {
                  setProfileAvatar('male');
                  setAvatarModalVisible(false);
                }}
              >
                {renderAvatar('male', 80)}
                <Text style={[
                  styles.avatarOptionLabel,
                  profileAvatar === 'male' && styles.avatarOptionLabelSelected,
                ]}>남자</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.avatarOptionItem,
                  profileAvatar === 'female' && styles.avatarOptionSelected,
                ]}
                onPress={() => {
                  setProfileAvatar('female');
                  setAvatarModalVisible(false);
                }}
              >
                {renderAvatar('female', 80)}
                <Text style={[
                  styles.avatarOptionLabel,
                  profileAvatar === 'female' && styles.avatarOptionLabelSelected,
                ]}>여자</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}E6`,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderOption: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  genderOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  // Avatar styles
  avatarContainer: {
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarFace: {
    backgroundColor: '#FFDBAC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  maleHair: {
    position: 'absolute',
    backgroundColor: '#4A3728',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  femaleHairLeft: {
    position: 'absolute',
    width: 12,
    backgroundColor: '#5D4037',
    borderBottomLeftRadius: 10,
    top: -5,
  },
  femaleHairRight: {
    position: 'absolute',
    width: 12,
    backgroundColor: '#5D4037',
    borderBottomRightRadius: 10,
    top: -5,
  },
  femaleHairTop: {
    position: 'absolute',
    backgroundColor: '#5D4037',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  eyesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 5,
  },
  eye: {
    backgroundColor: '#3E2723',
    borderRadius: 50,
  },
  mouth: {
    backgroundColor: '#D7907B',
    borderRadius: 10,
  },
  femaleMouth: {
    backgroundColor: '#E57373',
    borderRadius: 10,
  },
  // Avatar Modal styles
  avatarModalContainer: {
    width: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  avatarOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  avatarOptionItem: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  avatarOptionLabel: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  avatarOptionLabelSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
});
