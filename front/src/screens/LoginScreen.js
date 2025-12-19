import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Input, Button } from '../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: 로그인 로직 구현
    navigation.replace('Main');
  };

  const handleSocialLogin = (provider) => {
    // TODO: 소셜 로그인 구현
    console.log(`${provider} login`);
  };

  const handleForgotPassword = () => {
    // TODO: 비밀번호 찾기 화면으로 이동
    console.log('Forgot password');
  };

  const handleSignUp = () => {
    // TODO: 회원가입 화면으로 이동
    console.log('Sign up');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background decorations */}
        <View style={styles.bgDecoration1} />
        <View style={styles.bgDecoration2} />

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Icon name="spa" size={48} color={COLORS.surface} />
          </View>
          <Text style={styles.title}>SpeakTrue</Text>
          <Text style={styles.subtitle}>
            서로의 마음을 잇는{'\n'}따뜻한 대화의 시작
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Input
            label="아이디 또는 이메일"
            value={email}
            onChangeText={setEmail}
            placeholder="이메일을 입력해주세요"
            keyboardType="email-address"
            leftIcon="mail"
            autoCapitalize="none"
          />

          <View style={styles.passwordLabelRow}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>비밀번호 찾기</Text>
            </TouchableOpacity>
          </View>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력해주세요"
            secureTextEntry
            leftIcon="lock"
            style={styles.passwordInput}
          />

          <Button
            title="로그인"
            onPress={handleLogin}
            size="lg"
            rightIcon="arrow-forward"
            style={styles.loginButton}
          />
        </View>

        {/* Social Login Section */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>SNS 계정으로 시작하기</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('google')}
            activeOpacity={0.7}
          >
            <Text style={styles.googleIcon}>G</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.appleButton]}
            onPress={() => handleSocialLogin('apple')}
            activeOpacity={0.7}
          >
            <Icon name="apple" size={22} color={COLORS.surface} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.kakaoButton]}
            onPress={() => handleSocialLogin('kakao')}
            activeOpacity={0.7}
          >
            <Icon name="chat-bubble" size={22} color="#3B1E1E" />
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>아직 계정이 없으신가요?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpLink}>회원가입</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© SpeakTrue. All rights reserved.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xl,
  },
  bgDecoration1: {
    position: 'absolute',
    top: -96,
    right: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${COLORS.primary}10`,
  },
  bgDecoration2: {
    position: 'absolute',
    bottom: 96,
    left: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${COLORS.primary}05`,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    transform: [{ rotate: '3deg' }],
    ...SHADOWS.lg,
  },
  title: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.extraBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },

  // Form
  formSection: {
    width: '100%',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  inputLabel: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  forgotPassword: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.primary,
  },
  passwordInput: {
    marginBottom: 0,
  },
  loginButton: {
    marginTop: SPACING.lg,
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
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
  },

  // Social Buttons
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  googleIcon: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderColor: '#FEE500',
  },

  // Sign Up
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxxl,
  },
  signUpText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textMuted,
  },
  signUpLink: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,  // 14px - 터치 가능 텍스트
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    textDecorationLine: 'underline',
  },

  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    color: COLORS.borderLight,
  },
});
