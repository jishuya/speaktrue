import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo, Icon, Modal } from '../components/ui';
import { COLORS, SPACING, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../store/AuthContext';
import authService from '../services/auth';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 회원가입 모달 상태
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerGender, setRegisterGender] = useState(''); // 'male' or 'female'
  const [registerPartnerName, setRegisterPartnerName] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // 비밀번호 찾기 모달 상태
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: 이메일 입력, 2: 인증코드+새비밀번호
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Google OAuth hook
  const { response: googleResponse, promptAsync: googlePromptAsync } = authService.useGoogleAuth();

  // Google 로그인 응답 처리
  useEffect(() => {
    if (googleResponse) {
      handleGoogleResponse();
    }
  }, [googleResponse]);

  const handleGoogleResponse = async () => {
    const result = await authService.handleGoogleLogin(googleResponse);
    if (result.success) {
      await handleLoginWithToken('google', result.accessToken);
    } else {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 토큰으로 백엔드 로그인
  const handleLoginWithToken = async (provider, accessToken) => {
    try {
      const result = await login(provider, accessToken);
      if (result.success) {
        navigation.replace('MainTabs');
      } else {
        Alert.alert('로그인 실패', result.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 구글 로그인
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoadingProvider('google');
    try {
      await googlePromptAsync();
    } catch (error) {
      Alert.alert('오류', '구글 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setLoadingProvider('kakao');
    try {
      const result = await authService.loginWithKakao();
      if (result.success) {
        await handleLoginWithToken('kakao', result.accessToken);
      } else {
        Alert.alert('로그인 취소', '카카오 로그인이 취소되었습니다.');
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error) {
      Alert.alert('오류', '카카오 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 네이버 로그인
  const handleNaverLogin = async () => {
    setIsLoading(true);
    setLoadingProvider('naver');
    try {
      const result = await authService.loginWithNaver();
      if (result.success) {
        await handleLoginWithToken('naver', result.accessToken);
      } else {
        Alert.alert('로그인 취소', '네이버 로그인이 취소되었습니다.');
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error) {
      Alert.alert('오류', '네이버 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 일반 로그인
  const handleEmailLogin = async () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('email');
    try {
      const result = await login('email', null, { email, password });
      if (result.success) {
        navigation.replace('MainTabs');
      } else {
        Alert.alert('로그인 실패', result.error || '이메일 또는 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 회원가입 모달 초기화
  const resetRegisterForm = () => {
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterPasswordConfirm('');
    setRegisterName('');
    setRegisterGender('');
    setRegisterPartnerName('');
    setShowRegisterPassword(false);
  };

  // 비밀번호 찾기 모달 초기화
  const resetForgotPasswordForm = () => {
    setForgotPasswordStep(1);
    setForgotEmail('');
    setResetToken('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setShowNewPassword(false);
  };

  // 비밀번호 재설정 이메일 발송
  const handleSendResetEmail = async () => {
    if (!forgotEmail.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }

    setIsSendingResetEmail(true);
    try {
      await api.request('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      });
      Alert.alert('성공', '인증 코드가 이메일로 발송되었습니다.\n15분 내에 입력해주세요.');
      setForgotPasswordStep(2);
    } catch (error) {
      Alert.alert('오류', error.message || '이메일 발송에 실패했습니다.');
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  // 비밀번호 재설정
  const handleResetPassword = async () => {
    if (!resetToken.trim()) {
      Alert.alert('알림', '인증 코드를 입력해주세요.');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('알림', '새 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsResettingPassword(true);
    try {
      await api.request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: forgotEmail,
          token: resetToken,
          newPassword: newPassword,
        }),
      });
      Alert.alert('성공', '비밀번호가 재설정되었습니다.\n새 비밀번호로 로그인해주세요.', [
        {
          text: '확인',
          onPress: () => {
            setShowForgotPasswordModal(false);
            resetForgotPasswordForm();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('오류', error.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // 회원가입 처리
  const handleRegister = async () => {
    if (!registerName.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }
    if (!registerGender) {
      Alert.alert('알림', '성별을 선택해주세요.');
      return;
    }
    if (!registerPartnerName.trim()) {
      Alert.alert('알림', '상대방 이름을 입력해주세요.');
      return;
    }
    if (!registerEmail.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    if (!registerPassword.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    if (registerPassword.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (registerPassword !== registerPasswordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsRegistering(true);
    try {
      const response = await api.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerName,
          gender: registerGender,
          partnerName: registerPartnerName,
        }),
      });

      if (response.token && response.user) {
        Alert.alert('성공', '회원가입이 완료되었습니다.', [
          {
            text: '확인',
            onPress: async () => {
              setShowRegisterModal(false);
              resetRegisterForm();
              // 자동 로그인
              const result = await login('email', null, {
                email: registerEmail,
                password: registerPassword
              });
              if (result.success) {
                navigation.replace('MainTabs');
              }
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('회원가입 실패', error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsRegistering(false);
    }
  };

  const renderSocialButton = (provider, onPress, style, iconContent) => {
    const isCurrentLoading = loadingProvider === provider;
    const getLoaderColor = () => {
      if (provider === 'kakao') return '#3B1E1E';
      if (provider === 'google') return COLORS.textSecondary;
      return COLORS.surface;
    };

    return (
      <TouchableOpacity
        style={[styles.socialButton, style]}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        {isCurrentLoading ? (
          <ActivityIndicator size="small" color={getLoaderColor()} />
        ) : (
          iconContent
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background gradient effect */}
          <View style={styles.bgGradient} />
          {/* Background decorations */}
          <View style={styles.bgDecoration1} />
          <View style={styles.bgDecoration2} />

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Logo size={40} color={COLORS.surface} />
              </View>
              <Text style={styles.title}>
                <Text style={styles.titleBold}>SpeakTrue</Text>
              </Text>
              <Text style={styles.subtitle}>
                서로의 마음을 잇는{'\n'}따뜻한 대화의 시작
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>아이디 또는 이메일</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="mail" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="이메일을 입력해주세요"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <Text style={styles.inputLabel}>비밀번호</Text>
                  <TouchableOpacity onPress={() => setShowForgotPasswordModal(true)}>
                    <Text style={styles.forgotPassword}>비밀번호 찾기</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <Icon name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="비밀번호를 입력해주세요"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                  />
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleEmailLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {loadingProvider === 'email' ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>로그인</Text>
                    <Icon name="arrow-forward" size={16} color={COLORS.surface} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>SNS 계정으로 시작하기</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtons}>
              {/* Google */}
              {renderSocialButton(
                'google',
                handleGoogleLogin,
                styles.googleButton,
                <Text style={styles.googleIcon}>G</Text>
              )}

              {/* Naver */}
              {renderSocialButton(
                'naver',
                handleNaverLogin,
                styles.naverButton,
                <Text style={styles.naverIcon}>N</Text>
              )}

              {/* Kakao */}
              {renderSocialButton(
                'kakao',
                handleKakaoLogin,
                styles.kakaoButton,
                <Icon name="chat-bubble" size={18} color="#3B1E1E" />
              )}
            </View>

            {/* Privacy Text */}
            <Text style={styles.privacyText}>
              로그인 시 <Text style={styles.linkText}>이용약관</Text> 및{'\n'}
              <Text style={styles.linkText}>개인정보처리방침</Text>에 동의하게 됩니다.
            </Text>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>아직 계정이 없으신가요?</Text>
              <TouchableOpacity onPress={() => setShowRegisterModal(true)}>
                <Text style={styles.registerLink}>회원가입</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>© SpeakTrue. All rights reserved.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 회원가입 모달 */}
      <Modal
        visible={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false);
          resetRegisterForm();
        }}
        title="회원가입"
      >
        <View style={styles.modalContent}>
          {/* 이름 입력 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>이름 <Text style={styles.requiredMark}>*</Text></Text>
            <View style={styles.modalInputWrapper}>
              <Icon name="person" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalInput}
                placeholder="이름을 입력해주세요"
                placeholderTextColor={COLORS.textMuted}
                value={registerName}
                onChangeText={setRegisterName}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* 성별 선택 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>성별 <Text style={styles.requiredMark}>*</Text></Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  registerGender === 'male' && styles.genderButtonSelected,
                ]}
                onPress={() => setRegisterGender('male')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    registerGender === 'male' && styles.genderButtonTextSelected,
                  ]}
                >
                  남
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  registerGender === 'female' && styles.genderButtonSelected,
                ]}
                onPress={() => setRegisterGender('female')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    registerGender === 'female' && styles.genderButtonTextSelected,
                  ]}
                >
                  여
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 상대방 이름 입력 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>상대방 이름 <Text style={styles.requiredMark}>*</Text></Text>
            <View style={styles.modalInputWrapper}>
              <Icon name="favorite" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalInput}
                placeholder="배우자/파트너의 이름을 입력해주세요"
                placeholderTextColor={COLORS.textMuted}
                value={registerPartnerName}
                onChangeText={setRegisterPartnerName}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* 이메일 입력 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>이메일</Text>
            <View style={styles.modalInputWrapper}>
              <Icon name="mail" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalInput}
                placeholder="이메일을 입력해주세요"
                placeholderTextColor={COLORS.textMuted}
                value={registerEmail}
                onChangeText={setRegisterEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>비밀번호</Text>
            <View style={styles.modalInputWrapper}>
              <Icon name="lock" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalInput}
                placeholder="비밀번호 (6자 이상)"
                placeholderTextColor={COLORS.textMuted}
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry={!showRegisterPassword}
              />
              <TouchableOpacity onPress={() => setShowRegisterPassword(!showRegisterPassword)}>
                <Icon
                  name={showRegisterPassword ? 'visibility' : 'visibility-off'}
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>비밀번호 확인</Text>
            <View style={styles.modalInputWrapper}>
              <Icon name="lock" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalInput}
                placeholder="비밀번호를 다시 입력해주세요"
                placeholderTextColor={COLORS.textMuted}
                value={registerPasswordConfirm}
                onChangeText={setRegisterPasswordConfirm}
                secureTextEntry={!showRegisterPassword}
              />
            </View>
          </View>

          {/* 회원가입 버튼 */}
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleRegister}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color={COLORS.surface} />
            ) : (
              <Text style={styles.modalButtonText}>회원가입</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 비밀번호 찾기 모달 */}
      <Modal
        visible={showForgotPasswordModal}
        onClose={() => {
          setShowForgotPasswordModal(false);
          resetForgotPasswordForm();
        }}
        title={forgotPasswordStep === 1 ? '비밀번호 찾기' : '비밀번호 재설정'}
      >
        <View style={styles.modalContent}>
          {forgotPasswordStep === 1 ? (
            <>
              <Text style={styles.forgotPasswordDescription}>
                가입하신 이메일 주소를 입력하시면{'\n'}비밀번호 재설정 코드를 보내드립니다.
              </Text>

              {/* 이메일 입력 */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>이메일</Text>
                <View style={styles.modalInputWrapper}>
                  <Icon name="mail" size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="이메일을 입력해주세요"
                    placeholderTextColor={COLORS.textMuted}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* 인증코드 발송 버튼 */}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSendResetEmail}
                disabled={isSendingResetEmail}
              >
                {isSendingResetEmail ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.modalButtonText}>인증 코드 발송</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.forgotPasswordDescription}>
                {forgotEmail}로 발송된{'\n'}6자리 인증 코드를 입력해주세요.
              </Text>

              {/* 인증 코드 입력 */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>인증 코드</Text>
                <View style={styles.modalInputWrapper}>
                  <Icon name="vpn-key" size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={[styles.modalInput, styles.tokenInput]}
                    placeholder="6자리 코드"
                    placeholderTextColor={COLORS.textMuted}
                    value={resetToken}
                    onChangeText={setResetToken}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              {/* 새 비밀번호 입력 */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>새 비밀번호</Text>
                <View style={styles.modalInputWrapper}>
                  <Icon name="lock" size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="새 비밀번호 (6자 이상)"
                    placeholderTextColor={COLORS.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Icon
                      name={showNewPassword ? 'visibility' : 'visibility-off'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 새 비밀번호 확인 */}
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>새 비밀번호 확인</Text>
                <View style={styles.modalInputWrapper}>
                  <Icon name="lock" size={18} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="비밀번호를 다시 입력해주세요"
                    placeholderTextColor={COLORS.textMuted}
                    value={newPasswordConfirm}
                    onChangeText={setNewPasswordConfirm}
                    secureTextEntry={!showNewPassword}
                  />
                </View>
              </View>

              {/* 비밀번호 재설정 버튼 */}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleResetPassword}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.modalButtonText}>비밀번호 재설정</Text>
                )}
              </TouchableOpacity>

              {/* 인증코드 재발송 */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => setForgotPasswordStep(1)}
              >
                <Text style={styles.resendButtonText}>인증 코드 다시 받기</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 384,
    backgroundColor: `${COLORS.secondary}50`,
    opacity: 0.5,
  },
  bgDecoration1: {
    position: 'absolute',
    top: -96,
    right: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
  },
  bgDecoration2: {
    position: 'absolute',
    bottom: 96,
    left: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: COLORS.primary,
    opacity: 0.05,
  },

  // Main Content
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    transform: [{ rotate: '3deg' }],
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
  },
  titleBold: {
    fontFamily: FONT_FAMILY.base,
    fontWeight: '800',
  },
  subtitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 20,
  },

  // Form
  formContainer: {
    marginTop: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  forgotPassword: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 11,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  inputIcon: {
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontFamily: FONT_FAMILY.base,
    fontSize: 14,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
    gap: SPACING.xs,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 15,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  dividerText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 12,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.sm,
  },

  // Social Buttons
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButton: {
    backgroundColor: COLORS.surface,
  },
  googleIcon: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  naverButton: {
    backgroundColor: '#03C75A',
    borderColor: '#03C75A',
  },
  naverIcon: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderColor: '#FEE500',
  },

  // Privacy Text
  privacyText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 16,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },

  // Footer
  footer: {
    marginTop: SPACING.xl,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 11,
    color: COLORS.textMuted,
  },

  // Register Link
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  registerText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semiBold,
    marginLeft: SPACING.xs,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 18,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalCloseText: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  modalInputGroup: {
    marginBottom: SPACING.md,
  },
  modalInputLabel: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingLeft: SPACING.md,
    paddingRight: SPACING.xs,
  },
  modalInput: {
    flex: 1,
    fontFamily: FONT_FAMILY.base,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.sm,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  modalButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  modalButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 15,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.surface,
  },
  requiredMark: {
    color: COLORS.error || '#E53935',
    fontWeight: FONT_WEIGHT.bold,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  genderButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
  },
  genderButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 14,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  genderButtonTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  forgotPasswordDescription: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  tokenInput: {
    letterSpacing: 8,
    fontSize: 18,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  resendButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
});
