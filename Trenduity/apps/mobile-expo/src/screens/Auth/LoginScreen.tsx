import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../tokens/colors';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim()) {
      alert('전화번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    
    // 임시: 1초 후 메인 화면으로 이동
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('Main');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.title}>Trenduity</Text>
          <Text style={styles.subtitle}>
            안녕하세요!{'\n'}
            전화번호로 간편하게 로그인하세요
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>전화번호</Text>
          <TextInput
            style={styles.input}
            placeholder="010-1234-5678"
            placeholderTextColor={COLORS.neutral.text.tertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={13}
            accessibilityLabel="전화번호 입력"
            accessibilityHint="전화번호를 입력하여 로그인하세요"
          />

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="로그인 버튼"
          >
            <Text style={styles.buttonText}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => alert('회원가입 기능 준비 중')}
          >
            <Text style={styles.signupText}>
              처음이신가요? <Text style={styles.signupLink}>회원가입</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            시니어를 위한 디지털 리터러시 학습 플랫폼
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary.main,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.neutral.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.neutral.surface,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 18,
    color: COLORS.neutral.text.primary,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  button: {
    backgroundColor: COLORS.primary.main,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signupButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: COLORS.neutral.text.secondary,
  },
  signupLink: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.neutral.text.tertiary,
    textAlign: 'center',
  },
});
