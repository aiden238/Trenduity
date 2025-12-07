import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TermsOfServiceScreen } from '../Legal/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from '../Legal/PrivacyPolicyScreen';
import { Typography } from '../../components/shared/Typography';
import { Card } from '../../components/shared/Card';
import { COLORS, SPACING, SHADOWS, RADIUS } from '../../tokens/colors';
import { useA11y } from '../../contexts/A11yContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

/**
 * 로그인 화면
 * 
 * 기능:
 * - 이메일/비밀번호 로그인
 * - SNS 로그인 버튼 (카카오/네이버/구글)
 * - 회원가입 페이지로 이동
 * - 시니어 친화적 큰 글자 및 터치 영역
 */
export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { mode, spacing, buttonHeight, fontSizes } = useA11y();
  const { login, socialLogin } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleLogin = async () => {
    // 유효성 검사
    if (!email.trim()) {
      showError('이메일을 입력해 주세요.');
      return;
    }
    if (!password.trim()) {
      showError('비밀번호를 입력해 주세요.');
      return;
    }
    if (!email.includes('@')) {
      showError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      showSuccess('로그인 되었습니다!');
      navigation.replace('Main');
    } catch (error: any) {
      showError(error.message || '로그인 실패');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 소셜 로그인 처리
   */
  const handleSocialLogin = async (provider: 'kakao' | 'naver' | 'google') => {
    setIsSocialLoading(provider);
    try {
      await socialLogin(provider);
      
      const providerNames = {
        kakao: '카카오',
        naver: '네이버',
        google: 'Google',
      };
      
      showSuccess(`${providerNames[provider]} 로그인 성공!`);
      navigation.replace('Main');
    } catch (error: any) {
      showError(error.message || '소셜 로그인에 실패했습니다.');
    } finally {
      setIsSocialLoading(null);
    }
  };

  const handleNavigateToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: COLORS.primary.main }]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* 로고 & 타이틀 */}
          <View style={[styles.header, { marginBottom: spacing.xl }]}>
            <View style={[styles.logoContainer, { marginBottom: spacing.md }]}>
              <Typography
                variant="display"
                mode={mode}
                style={[styles.logoText, { fontSize: fontSizes.display }]}
              >
                Trenduity
              </Typography>
            </View>
            <Typography
              variant="heading"
              mode={mode}
              style={[styles.subtitle, { fontSize: fontSizes.heading2 }]}
            >
              디지털 세상을 쉽게
            </Typography>
          </View>

          {/* 로그인 폼 카드 */}
          <Card
            shadow="lg"
            radius="xl"
            style={[styles.formCard, { padding: spacing.lg }]}
          >
            <Typography
              variant="heading"
              mode={mode}
              style={[styles.formTitle, { fontSize: fontSizes.heading2, marginBottom: spacing.lg }]}
            >
              로그인
            </Typography>

            {/* 이메일 입력 */}
            <View style={{ marginBottom: spacing.md }}>
              <Typography
                variant="body"
                mode={mode}
                style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}
              >
                이메일
              </Typography>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="이메일을 입력하세요"
                placeholderTextColor={COLORS.neutral.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                style={[
                  styles.input,
                  {
                    height: buttonHeight,
                    paddingHorizontal: spacing.md,
                    borderRadius: RADIUS.md,
                    fontSize: fontSizes.body,
                    color: COLORS.neutral.text.primary,
                  },
                ]}
                accessibilityLabel="이메일 입력"
                accessibilityHint="이메일 주소를 입력하세요"
              />
            </View>

            {/* 비밀번호 입력 */}
            <View style={{ marginBottom: spacing.lg }}>
              <Typography
                variant="body"
                mode={mode}
                style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}
              >
                비밀번호
              </Typography>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={COLORS.neutral.text.tertiary}
                secureTextEntry={true}
                autoCapitalize="none"
                autoComplete="password"
                style={[
                  styles.input,
                  {
                    height: buttonHeight,
                    paddingHorizontal: spacing.md,
                    borderRadius: RADIUS.md,
                    fontSize: fontSizes.body,
                    color: COLORS.neutral.text.primary,
                  },
                ]}
                accessibilityLabel="비밀번호 입력"
                accessibilityHint="비밀번호를 입력하세요"
              />
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={[
                styles.loginButton,
                { height: buttonHeight * 1.2, marginBottom: spacing.md },
              ]}
              accessibilityLabel="로그인"
              accessibilityHint="버튼을 누르면 로그인합니다"
            >
              <View style={[styles.buttonGradient, { height: buttonHeight * 1.2, backgroundColor: COLORS.primary.main }]}>
                <Typography
                  variant="body"
                  mode={mode}
                  style={[styles.buttonText, { fontSize: fontSizes.body }]}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Typography>
              </View>
            </TouchableOpacity>

            {/* 회원가입 링크 */}
            <TouchableOpacity
              onPress={handleNavigateToSignup}
              style={[styles.signupLink, { paddingVertical: spacing.md }]}
              accessibilityLabel="회원가입"
              accessibilityHint="회원가입 화면으로 이동합니다"
            >
              <Typography
                variant="body"
                mode={mode}
                style={[styles.linkText, { fontSize: fontSizes.body }]}
              >
                아직 계정이 없으신가요? <Typography style={{ color: COLORS.primary.main, fontWeight: '600' }}>회원가입</Typography>
              </Typography>
            </TouchableOpacity>
          </Card>

          {/* SNS 로그인 */}
          <View style={[styles.socialSection, { marginTop: spacing.xl }]}>
            <Typography
              variant="body"
              mode={mode}
              style={[styles.dividerText, { fontSize: fontSizes.caption, marginBottom: spacing.md }]}
            >
              또는 다른 방법으로 로그인
            </Typography>

            <View style={[styles.socialButtons, { gap: spacing.md }]}>
              {/* 카카오 */}
              <TouchableOpacity
                onPress={() => handleSocialLogin('kakao')}
                disabled={isSocialLoading !== null}
                style={[styles.socialButton, { height: buttonHeight, backgroundColor: '#FEE500' }]}
                accessibilityLabel="카카오로 시작하기"
              >
                <View style={styles.socialButtonContent}>
                  {isSocialLoading === 'kakao' ? (
                    <Typography style={[styles.socialButtonText, { fontSize: fontSizes.body, color: '#000000' }]}>
                      로그인 중...
                    </Typography>
                  ) : (
                    <>
                      <Image
                        source={require('../../../assets/kakao-icon.png')}
                        style={{ width: fontSizes.body * 1.5, height: fontSizes.body * 1.5 }}
                        resizeMode="contain"
                      />
                      <Typography style={[styles.socialButtonText, { fontSize: fontSizes.body, color: '#000000' }]}>
                        카카오로 시작하기
                      </Typography>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* 네이버 */}
              <TouchableOpacity
                onPress={() => handleSocialLogin('naver')}
                disabled={isSocialLoading !== null}
                style={[styles.socialButton, { height: buttonHeight, backgroundColor: '#03C75A' }]}
                accessibilityLabel="네이버로 시작하기"
              >
                <View style={styles.socialButtonContent}>
                  {isSocialLoading === 'naver' ? (
                    <Typography style={[styles.socialButtonText, { fontSize: fontSizes.body, color: '#FFFFFF' }]}>
                      로그인 중...
                    </Typography>
                  ) : (
                    <>
                      <Image
                        source={require('../../../assets/naver-icon.png')}
                        style={{ width: fontSizes.body * 1.5, height: fontSizes.body * 1.5 }}
                        resizeMode="contain"
                      />
                      <Typography style={[styles.socialButtonText, { fontSize: fontSizes.body, color: '#FFFFFF' }]}>
                        네이버로 시작하기
                      </Typography>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              {/* 구글 */}
              <TouchableOpacity
                onPress={() => handleSocialLogin('google')}
                disabled={isSocialLoading !== null}
                style={[styles.socialButton, { height: buttonHeight, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.neutral.border }]}
                accessibilityLabel="구글로 시작하기"
              >
                <View style={styles.socialButtonContent}>
                  {isSocialLoading === 'google' ? (
                    <Typography style={[styles.socialButtonText, { fontSize: fontSizes.body, color: COLORS.neutral.text.primary }]}>
                      로그인 중...
                    </Typography>
                  ) : (
                    <>
                      <Image
                        source={require('../../../assets/google-icon.png')}
                        style={{ width: fontSizes.body * 1.5, height: fontSizes.body * 1.5 }}
                        resizeMode="contain"
                      />
                      <Typography style={[styles.socialButtonText, { fontSize: fontSizes.body, color: COLORS.neutral.text.primary }]}>
                        Google로 시작하기
                      </Typography>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 법적 문서 링크 */}
          <View style={[styles.legalSection, { marginTop: spacing.lg }]}>
            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                <Typography
                  variant="caption"
                  mode={mode}
                  style={[styles.legalLinkText, { fontSize: fontSizes.caption }]}
                >
                  이용약관
                </Typography>
              </TouchableOpacity>
              <Typography
                variant="caption"
                mode={mode}
                style={[styles.legalDivider, { fontSize: fontSizes.caption }]}
              >
                {' | '}
              </Typography>
              <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
                <Typography
                  variant="caption"
                  mode={mode}
                  style={[styles.legalLinkText, { fontSize: fontSizes.caption }]}
                >
                  개인정보 처리방침
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* 이용약관 모달 */}
        <Modal
          visible={showTermsModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowTermsModal(false)}
        >
          <TermsOfServiceScreen onClose={() => setShowTermsModal(false)} />
        </Modal>

        {/* 개인정보 처리방침 모달 */}
        <Modal
          visible={showPrivacyModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPrivacyModal(false)}
        >
          <PrivacyPolicyScreen onClose={() => setShowPrivacyModal(false)} />
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    color: COLORS.neutral.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    color: COLORS.neutral.text.secondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.neutral.background,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  loginButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
    borderWidth: 0,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  signupLink: {
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.neutral.text.secondary,
    textAlign: 'center',
  },
  socialSection: {
    alignItems: 'center',
  },
  dividerText: {
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
  socialButtons: {
    width: '100%',
  },
  socialButton: {
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialButtonText: {
    fontWeight: '600',
  },
  legalSection: {
    alignItems: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLinkText: {
    color: '#FFFFFF',
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
  legalDivider: {
    color: '#FFFFFF',
    opacity: 0.6,
  },
});
