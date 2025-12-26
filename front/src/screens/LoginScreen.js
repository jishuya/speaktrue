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
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Modal, AlertModal } from '../components/ui';

const LogoImage = require('../assets/logo/logo_only.png');
import { COLORS, SPACING, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../store/AuthContext';
import authService from '../services/auth';
import api from '../services/api';

export default function LoginScreen() {
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
  const [registerType, setRegisterType] = useState(''); // 'husband' or 'wife'
  const [registerPartnerName, setRegisterPartnerName] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

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

  // 커스텀 Alert 모달 상태
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onClose: null,
  });

  // Alert 표시 헬퍼 함수
  const showAlert = (title, message, type = 'info', onClose = null) => {
    setAlertModal({
      visible: true,
      title,
      message,
      type,
      onClose,
    });
  };

  const hideAlert = () => {
    const callback = alertModal.onClose;
    setAlertModal(prev => ({ ...prev, visible: false }));
    if (callback) {
      callback();
    }
  };

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
      if (!result.success) {
        showAlert('로그인 실패', result.error || '로그인에 실패했습니다.', 'error');
      }
      // 로그인 성공 시 AuthContext의 isAuthenticated가 true로 변경되면
      // AppNavigator가 자동으로 MainTabs를 렌더링합니다
    } catch (error) {
      showAlert('오류', '로그인 중 오류가 발생했습니다.', 'error');
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
      showAlert('오류', '구글 로그인 중 오류가 발생했습니다.', 'error');
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
        showAlert('로그인 취소', '카카오 로그인이 취소되었습니다.', 'warning');
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error) {
      showAlert('오류', '카카오 로그인 중 오류가 발생했습니다.', 'error');
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
        showAlert('로그인 취소', '네이버 로그인이 취소되었습니다.', 'warning');
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error) {
      showAlert('오류', '네이버 로그인 중 오류가 발생했습니다.', 'error');
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 일반 로그인
  const handleEmailLogin = async () => {
    if (!email.trim()) {
      showAlert('알림', '이메일을 입력해주세요.', 'warning');
      return;
    }
    if (!password.trim()) {
      showAlert('알림', '비밀번호를 입력해주세요.', 'warning');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('email');
    try {
      const result = await login('email', null, { email, password });
      if (!result.success) {
        showAlert('로그인 실패', result.error || '이메일 또는 비밀번호를 확인해주세요.', 'error');
      }
      // 로그인 성공 시 AuthContext의 isAuthenticated가 true로 변경되면
      // AppNavigator가 자동으로 MainTabs를 렌더링합니다
    } catch (error) {
      showAlert('오류', '로그인 중 오류가 발생했습니다.', 'error');
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
    setRegisterType('');
    setRegisterPartnerName('');
    setShowRegisterPassword(false);
    setAgreeTerms(false);
    setAgreePrivacy(false);
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
      showAlert('알림', '이메일을 입력해주세요.', 'warning');
      return;
    }

    setIsSendingResetEmail(true);
    try {
      await api.request('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      });
      showAlert('성공', '인증 코드가 이메일로 발송되었습니다.\n15분 내에 입력해주세요.', 'success', () => {
        setForgotPasswordStep(2);
      });
    } catch (error) {
      showAlert('오류', error.message || '이메일 발송에 실패했습니다.', 'error');
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  // 비밀번호 재설정
  const handleResetPassword = async () => {
    if (!resetToken.trim()) {
      showAlert('알림', '인증 코드를 입력해주세요.', 'warning');
      return;
    }
    if (!newPassword.trim()) {
      showAlert('알림', '새 비밀번호를 입력해주세요.', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('알림', '비밀번호는 6자 이상이어야 합니다.', 'warning');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      showAlert('알림', '비밀번호가 일치하지 않습니다.', 'warning');
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
      showAlert('성공', '비밀번호가 재설정되었습니다.\n새 비밀번호로 로그인해주세요.', 'success', () => {
        setShowForgotPasswordModal(false);
        resetForgotPasswordForm();
      });
    } catch (error) {
      showAlert('오류', error.message || '비밀번호 재설정에 실패했습니다.', 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // 이메일 유효성 검사
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 회원가입 폼 유효성 검사
  const isRegisterFormValid = () => {
    return (
      registerName.trim() &&
      registerGender &&
      registerType &&
      registerPartnerName.trim() &&
      registerEmail.trim() &&
      isValidEmail(registerEmail) &&
      registerPassword.trim() &&
      registerPassword.length >= 6 &&
      registerPassword === registerPasswordConfirm &&
      agreeTerms &&
      agreePrivacy
    );
  };

  // 회원가입 처리
  const handleRegister = async () => {
    if (!registerName.trim()) {
      showAlert('알림', '이름을 입력해주세요.', 'warning');
      return;
    }
    if (!registerGender) {
      showAlert('알림', '성별을 선택해주세요.', 'warning');
      return;
    }
    if (!registerType) {
      showAlert('알림', '역할을 선택해주세요.', 'warning');
      return;
    }
    if (!registerPartnerName.trim()) {
      showAlert('알림', '상대방 이름을 입력해주세요.', 'warning');
      return;
    }
    if (!registerEmail.trim()) {
      showAlert('알림', '이메일을 입력해주세요.', 'warning');
      return;
    }
    if (!isValidEmail(registerEmail)) {
      showAlert('알림', '올바른 이메일 형식을 입력해주세요.', 'warning');
      return;
    }
    if (!registerPassword.trim()) {
      showAlert('알림', '비밀번호를 입력해주세요.', 'warning');
      return;
    }
    if (registerPassword.length < 6) {
      showAlert('알림', '비밀번호는 6자 이상이어야 합니다.', 'warning');
      return;
    }
    if (registerPassword !== registerPasswordConfirm) {
      showAlert('알림', '비밀번호가 일치하지 않습니다.', 'warning');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      showAlert('알림', '이용약관 및 개인정보처리방침에 동의해주세요.', 'warning');
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
          type: registerType,
          partnerName: registerPartnerName,
        }),
      });

      if (response.token && response.user) {
        // 이메일/비밀번호 저장
        const savedEmail = registerEmail;
        const savedPassword = registerPassword;

        // 로딩 상태 해제
        setIsRegistering(false);
        setShowRegisterModal(false);
        resetRegisterForm();

        // 성공 알림 표시 (확인 버튼 누르면 자동 로그인)
        showAlert(
          '회원가입 완료',
          '회원가입이 성공적으로 \n완료되었습니다.\n자동으로 로그인됩니다.',
          'success',
          () => {
            // 모달이 완전히 닫힌 후 로그인 실행
            setTimeout(async () => {
              await login('email', null, {
                email: savedEmail,
                password: savedPassword
              });
              // 로그인 성공 시 AuthContext의 isAuthenticated가 true로 변경되면
              // AppNavigator가 자동으로 MainTabs를 렌더링합니다
            }, 100);
          }
        );
      }
    } catch (error) {
      // 에러 메시지 분류
      const errorMessage = error.message || '회원가입 중 오류가 발생했습니다.';
      const isEmailDuplicate = errorMessage.includes('이미 사용 중인 이메일') || errorMessage.includes('already');

      // 로딩 상태 해제
      setIsRegistering(false);

      // 커스텀 Alert 표시
      showAlert(
        isEmailDuplicate ? '이메일 중복' : '회원가입 실패',
        errorMessage,
        'error'
      );
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
                <Image source={LogoImage} style={styles.logoImage} />
              </View>
              <Text style={styles.title}>
                <Text style={styles.titleBold}>Usagain</Text>
              </Text>
              <Text style={styles.subtitle}>
                서로의 마음을 잇는 따뜻한 대화의 시작
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
              {/* {renderSocialButton(
                'kakao',
                handleKakaoLogin,
                styles.kakaoButton,
                <Icon name="chat-bubble" size={18} color="#3B1E1E" />
              )} */}
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
              <Text style={styles.footerText}>© Usagain. All rights reserved.</Text>
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
        scrollable={true}
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

          {/* 역할 선택 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>역할 <Text style={styles.requiredMark}>*</Text></Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  registerType === 'husband' && styles.genderButtonSelected,
                ]}
                onPress={() => setRegisterType('husband')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    registerType === 'husband' && styles.genderButtonTextSelected,
                  ]}
                >
                  남편
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  registerType === 'wife' && styles.genderButtonSelected,
                ]}
                onPress={() => setRegisterType('wife')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    registerType === 'wife' && styles.genderButtonTextSelected,
                  ]}
                >
                  아내
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
                placeholder="배우자의 이름을 입력해주세요"
                placeholderTextColor={COLORS.textMuted}
                value={registerPartnerName}
                onChangeText={setRegisterPartnerName}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* 이메일 입력 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>이메일 <Text style={styles.requiredMark}>*</Text></Text>
            <View style={[
              styles.modalInputWrapper,
              registerEmail.length > 0 && !isValidEmail(registerEmail) && styles.modalInputError,
            ]}>
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
            {registerEmail.length > 0 && !isValidEmail(registerEmail) ? (
              <Text style={styles.errorText}>올바른 이메일 형식을 입력해주세요</Text>
            ) : null}
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>비밀번호 <Text style={styles.requiredMark}>*</Text></Text>
            <View style={[
              styles.modalInputWrapper,
              registerPassword.length > 0 && registerPassword.length < 6 && styles.modalInputError,
            ]}>
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
            {registerPassword.length > 0 && registerPassword.length < 6 ? (
              <Text style={styles.errorText}>비밀번호는 6자 이상이어야 합니다</Text>
            ) : null}
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.modalInputGroup}>
            <Text style={styles.modalInputLabel}>비밀번호 확인 <Text style={styles.requiredMark}>*</Text></Text>
            <View style={[
              styles.modalInputWrapper,
              registerPasswordConfirm.length > 0 && registerPassword !== registerPasswordConfirm && styles.modalInputError,
            ]}>
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
            {registerPasswordConfirm.length > 0 && registerPassword !== registerPasswordConfirm ? (
              <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
            ) : null}
          </View>

          {/* 약관 동의 */}
          <View style={styles.agreementContainer}>
            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <Icon name="check" size={14} color={COLORS.surface} />}
              </View>
              <Text style={styles.agreementText}>
                <Text style={styles.requiredMark}>[필수]</Text> 이용약관에 동의합니다
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://jishuya.github.io/Usagain/terms.html')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.agreementLink}>보기</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => setAgreePrivacy(!agreePrivacy)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreePrivacy && styles.checkboxChecked]}>
                {agreePrivacy && <Icon name="check" size={14} color={COLORS.surface} />}
              </View>
              <Text style={styles.agreementText}>
                <Text style={styles.requiredMark}>[필수]</Text> 개인정보처리방침에 동의합니다
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://jishuya.github.io/Usagain/privacy.html')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.agreementLink}>보기</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* 회원가입 버튼 */}
          <TouchableOpacity
            style={[
              styles.modalButton,
              (!isRegisterFormValid() || isRegistering) && styles.modalButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!isRegisterFormValid() || isRegistering}
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

      {/* 커스텀 Alert 모달 */}
      <AlertModal
        visible={alertModal.visible}
        onClose={hideAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
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
  logoImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
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
    fontSize: 16,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
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
    paddingVertical: SPACING.md,
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
    marginBottom: SPACING.sm,
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
  modalInputError: {
    borderColor: COLORS.error || '#E53935',
  },
  errorText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 11,
    color: COLORS.error || '#E53935',
    marginTop: 2,
    marginLeft: SPACING.xs,
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
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
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
    height: 44,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
  },
  genderButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 14,
    lineHeight: 20,
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
  agreementContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  agreementText: {
    flex: 1,
    fontFamily: FONT_FAMILY.base,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  agreementLink: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
    marginLeft: SPACING.xs,
  },
});
