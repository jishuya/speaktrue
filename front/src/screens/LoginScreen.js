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
import { Logo, Icon } from '../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../store/AuthContext';
import authService from '../services/auth';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
                  <TouchableOpacity>
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
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
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
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© SpeakTrue. All rights reserved.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
