import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function ProfileEditModal({
  visible,
  onClose,
  onSave,
  onChangePassword,
  initialData = {},
  loading = false,
  isOAuthUser = false,
}) {
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editType, setEditType] = useState('');
  const [editPartnerName, setEditPartnerName] = useState('');

  // 비밀번호 변경 관련 상태
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setEditName(initialData.name || '');
      setEditEmail(initialData.email || '');
      setEditGender(initialData.gender || '');
      setEditType(initialData.type || '');
      setEditPartnerName(initialData.partnerName || '');
      // 비밀번호 관련 초기화
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    }
  }, [visible, initialData]);

  const handleSave = () => {
    if (editName.trim() === '') {
      return;
    }
    onSave({
      name: editName.trim(),
      email: editEmail.trim(),
      gender: editGender,
      type: editType,
      partnerName: editPartnerName.trim(),
    });
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (!newPassword) {
      setPasswordError('새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setPasswordLoading(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setShowPasswordSection(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>프로필 수정</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Icon name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
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
              <Text style={styles.inputLabel}>역할</Text>
              <View style={styles.genderSelector}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editType === '남편' && styles.genderOptionSelected,
                  ]}
                  onPress={() => setEditType('남편')}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      editType === '남편' && styles.genderOptionTextSelected,
                    ]}
                  >
                    남편
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    editType === '아내' && styles.genderOptionSelected,
                  ]}
                  onPress={() => setEditType('아내')}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      editType === '아내' && styles.genderOptionTextSelected,
                    ]}
                  >
                    아내
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

            {/* 비밀번호 변경 섹션 - OAuth 사용자는 표시 안함 */}
            {!isOAuthUser && (
              <View style={styles.passwordSection}>
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPasswordSection(!showPasswordSection)}
                >
                  <Text style={styles.passwordToggleText}>비밀번호 변경</Text>
                  <Icon
                    name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>

                {showPasswordSection && (
                  <View style={styles.passwordInputs}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>현재 비밀번호</Text>
                      <View style={styles.passwordInputWrapper}>
                        <TextInput
                          style={styles.passwordInput}
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          placeholder="현재 비밀번호"
                          placeholderTextColor={COLORS.textMuted}
                          secureTextEntry={!showCurrentPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={styles.eyeButton}
                        >
                          <Icon
                            name={showCurrentPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={COLORS.textMuted}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>새 비밀번호</Text>
                      <View style={styles.passwordInputWrapper}>
                        <TextInput
                          style={styles.passwordInput}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="새 비밀번호 (6자 이상)"
                          placeholderTextColor={COLORS.textMuted}
                          secureTextEntry={!showNewPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowNewPassword(!showNewPassword)}
                          style={styles.eyeButton}
                        >
                          <Icon
                            name={showNewPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={COLORS.textMuted}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>새 비밀번호 확인</Text>
                      <TextInput
                        style={styles.textInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="새 비밀번호 확인"
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry={true}
                      />
                    </View>

                    {passwordError ? (
                      <Text style={styles.errorText}>{passwordError}</Text>
                    ) : null}

                    <TouchableOpacity
                      style={[
                        styles.changePasswordButton,
                        passwordLoading && styles.changePasswordButtonDisabled,
                      ]}
                      onPress={handleChangePassword}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <ActivityIndicator size="small" color={COLORS.surface} />
                      ) : (
                        <Text style={styles.changePasswordButtonText}>비밀번호 변경</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.surface} />
              ) : (
                <Text style={styles.saveButtonText}>저장</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxHeight: '80%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  modalScrollView: {
    flexGrow: 0,
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },

  // 비밀번호 변경 섹션
  passwordSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  passwordToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  passwordToggleText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
  },
  passwordInputs: {
    marginTop: SPACING.md,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingRight: SPACING.xs,
  },
  passwordInput: {
    flex: 1,
    paddingLeft: SPACING.md,
    paddingRight: 0,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    padding: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  changePasswordButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  changePasswordButtonDisabled: {
    opacity: 0.6,
  },
  changePasswordButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.surface,
  },
});
