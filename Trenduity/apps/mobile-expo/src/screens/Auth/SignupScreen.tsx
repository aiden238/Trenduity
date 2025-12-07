import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../../components/shared/Typography';
import { Card } from '../../components/shared/Card';
import { COLORS, SPACING, RADIUS } from '../../tokens/colors';
import { useA11y } from '../../contexts/A11yContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

/**
 * 회원가입 화면
 * 
 * 기능:
 * - 이메일/비밀번호 회원가입
 * - 이름(선택), 전화번호(선택) 입력
 * - 시니어 친화적 큰 글자 및 터치 영역
 */
export const SignupScreen = () => {
  const navigation = useNavigation<any>();
  const { mode, spacing, buttonHeight, fontSizes } = useA11y();
  const { signup } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // 유효성 검사
    if (!email.trim()) {
      showError('이메일을 입력해 주세요.');
      return;
    }
    if (!email.includes('@')) {
      showError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    if (!password.trim()) {
      showError('비밀번호를 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      showError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      showError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (phone && !/^\d{10,11}$/.test(phone.replace(/-/g, ''))) {
      showError('올바른 전화번호 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = phone ? phone.replace(/-/g, '') : undefined;
      await signup(email, password, name || undefined, cleanPhone);
      showSuccess('회원가입이 완료되었습니다!');
      navigation.replace('Main');
    } catch (error: any) {
      showError(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigation.goBack();
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
          {/* 헤더 */}
          <View style={[styles.header, { marginBottom: spacing.xl }]}>
            <TouchableOpacity
              onPress={handleNavigateToLogin}
              style={[styles.backButton, { marginBottom: spacing.md }]}
              accessibilityLabel="뒤로 가기"
            >
              <Typography
                variant="body"
                mode={mode}
                style={{ fontSize: fontSizes.body, color: COLORS.neutral.white }}
              >
                ← 뒤로
              </Typography>
            </TouchableOpacity>
            <Typography
              variant="display"
              mode={mode}
              style={[styles.title, { fontSize: fontSizes.display }]}
            >
              회원가입
            </Typography>
            <Typography
              variant="body"
              mode={mode}
              style={[styles.subtitle, { fontSize: fontSizes.body }]}
            >
              간단한 정보만 입력하세요
            </Typography>
          </View>

          {/* 회원가입 폼 카드 */}
          <Card
            shadow="lg"
            radius="xl"
            style={[styles.formCard, { padding: spacing.lg }]}
          >
            {/* 이메일 입력 */}
            <View style={{ marginBottom: spacing.md }}>
              <Typography
                variant="body"
                mode={mode}
                style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}
              >
                이메일 *
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
              />
            </View>

            {/* 비밀번호 입력 */}
            <View style={{ marginBottom: spacing.md }}>
              <Typography
                variant="body"
                mode={mode}
                style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}
              >
                비밀번호 * (6자 이상)
              </Typography>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={COLORS.neutral.text.tertiary}
                secureTextEntry={true}
                autoCapitalize="none"
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
              />
            </View>

            {/* 비밀번호 확인 */}
            <View style={{ marginBottom: spacing.md }}>
              <Typography
                variant="body"
                mode={mode}
                style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}
              >
                비밀번호 확인 *
              </Typography>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={COLORS.neutral.text.tertiary}
                secureTextEntry={true}
                autoCapitalize="none"
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
                accessibilityLabel="비밀번호 확인 입력"
              />
            </View>

            {/* 이름 입력 (선택) */}
            <View style={{ marginBottom: spacing.md }}>
              <Typography
                variant="body"
                mode={mode}
                style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}
              >
                이름 (선택)
              </Typography>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="이름을 입력하세요"
                placeholderTextColor={COLORS.neutral.text.tertiary}
                autoCapitalize="words"
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
                accessibilityLabel="이름 입력"
              />
            </View>

            {/* 전화번호 입력 (선택) */}
            <View style={{ marginBottom: spacing.lg }}>
              <Typography
                variant="body"
                mode={mode}
                style={[styles.label, { fontSize: fontSizes.body, marginBottom: spacing.xs }]}
              >
                전화번호 (선택)
              </Typography>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="01012345678"
                placeholderTextColor={COLORS.neutral.text.tertiary}
                keyboardType="phone-pad"
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
                accessibilityLabel="전화번호 입력"
              />
            </View>

            {/* 회원가입 버튼 */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={isLoading}
              style={[
                styles.signupButton,
                { height: buttonHeight * 1.2, marginBottom: spacing.md },
              ]}
              accessibilityLabel="회원가입"
              accessibilityHint="버튼을 누르면 회원가입합니다"
            >
              <View style={[styles.buttonGradient, { height: buttonHeight * 1.2, backgroundColor: COLORS.primary.main }]}>
                <Typography
                  variant="body"
                  mode={mode}
                  style={[styles.buttonText, { fontSize: fontSizes.body }]}
                >
                  {isLoading ? '가입 중...' : '회원가입'}
                </Typography>
              </View>
            </TouchableOpacity>

            {/* 로그인 링크 */}
            <TouchableOpacity
              onPress={handleNavigateToLogin}
              style={[styles.loginLink, { paddingVertical: spacing.md }]}
              accessibilityLabel="로그인으로 돌아가기"
            >
              <Typography
                variant="body"
                mode={mode}
                style={[styles.linkText, { fontSize: fontSizes.body }]}
              >
                이미 계정이 있으신가요? <Typography style={{ color: COLORS.primary.main, fontWeight: '600' }}>로그인</Typography>
              </Typography>
            </TouchableOpacity>
          </Card>
        </ScrollView>
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
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  title: {
    color: COLORS.neutral.white,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.neutral.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.neutral.white,
  },
  label: {
    color: COLORS.neutral.text.secondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.neutral.gray100,
    borderWidth: 1,
    borderColor: COLORS.neutral.gray200,
  },
  signupButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
  },
  buttonText: {
    color: COLORS.neutral.white,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.neutral.text.secondary,
  },
});
