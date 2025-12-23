import { useState, useEffect } from 'react';
import {
  View,
  Text,
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
                <Logo size={56} color={COLORS.surface} />
              </View>
              <Text style={styles.title}>
                <Text style={styles.titleBold}>SpeakTrue</Text>
              </Text>
              <Text style={styles.subtitle}>
                서로의 마음을 잇는{'\n'}따뜻한 대화의 시작
              </Text>
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
                <Icon name="chat-bubble" size={22} color="#3B1E1E" />
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
    paddingVertical: SPACING.xl,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    transform: [{ rotate: '3deg' }],
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
  },
  titleBold: {
    fontFamily: FONT_FAMILY.base,
    fontWeight: '800',
  },
  subtitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 16,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  dividerText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 14,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
  },

  // Social Buttons
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButton: {
    backgroundColor: COLORS.surface,
  },
  googleIcon: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  naverButton: {
    backgroundColor: '#03C75A',
    borderColor: '#03C75A',
  },
  naverIcon: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 22,
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
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },

  // Footer
  footer: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
