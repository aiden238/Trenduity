import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../tokens/colors';

const A11Y_MODES = [
  {
    key: 'normal' as const,
    label: '기본',
    description: '일반적인 크기로 표시해요.',
  },
  {
    key: 'easy' as const,
    label: '쉬움',
    description: '글자와 버튼을 조금 크게 표시해요.',
  },
  {
    key: 'ultra' as const,
    label: '초대형',
    description: '글자와 버튼을 아주 크게 표시해요.',
  },
];

const THEME_MODES = [
  {
    key: 'system' as const,
    label: '시스템 설정',
    description: '기기 설정을 따라요.',
    icon: '⚙️',
  },
  {
    key: 'light' as const,
    label: '라이트 모드',
    description: '밝은 화면으로 표시해요.',
    icon: '☀️',
  },
  {
    key: 'dark' as const,
    label: '다크 모드',
    description: '어두운 화면으로 표시해요.',
    icon: '🌙',
  },
];

/**
 * 설정 화면 (마이페이지)
 * 
 * 접근성 모드 선택, 테마 선택, 프로필 관리, 로그아웃
 */
export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { mode, setMode, spacing, buttonHeight, fontSizes, scaleAnim } = useA11y();
  const { themeMode, activeTheme, setThemeMode, colors } = useTheme();
  const { user, logout } = useAuth();

  // 다크 모드에 따른 색상 적용
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#212121';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#666666';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#F5F5F5';
  const selectedCardBg = activeTheme === 'dark' ? colors.dark.background.tertiary : '#E3F2FD';
  const borderColor = activeTheme === 'dark' ? colors.dark.border : 'transparent';
  const accentColor = activeTheme === 'dark' ? colors.dark.status.info : COLORS.primary.main;

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={{ padding: spacing.md }}>
        {/* 프로필 섹션 */}
        <View style={[styles.profileSection, { backgroundColor: COLORS.primary.main, padding: spacing.lg, borderRadius: 16 }]}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>👤</Text>
          </View>
          <Text style={[styles.profileName, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
            {user?.name || '회원'}님
          </Text>
          <Text style={[styles.profileEmail, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
            {user?.email || ''}
          </Text>
        </View>

        {/* 테마 모드 선택 */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
            🎨 테마 설정
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: fontSizes.body, color: textSecondary }]}>
            밝은 화면과 어두운 화면을 선택할 수 있어요.
          </Text>

          {THEME_MODES.map((themeModeOption) => (
            <Pressable
              key={themeModeOption.key}
              onPress={() => setThemeMode(themeModeOption.key)}
              style={[
                styles.optionCard,
                {
                  marginTop: spacing.sm,
                  padding: spacing.md,
                  backgroundColor: themeMode === themeModeOption.key ? selectedCardBg : cardBg,
                  borderColor: themeMode === themeModeOption.key ? accentColor : borderColor,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${themeModeOption.label} 선택`}
              accessibilityState={{ selected: themeMode === themeModeOption.key }}
            >
              <Text style={[styles.optionLabel, { fontSize: fontSizes.heading2, color: themeMode === themeModeOption.key ? accentColor : textPrimary }]}>
                {themeModeOption.icon} {themeModeOption.label}
              </Text>
              <Text style={[styles.optionDescription, { fontSize: fontSizes.body, color: textSecondary }]}>
                {themeModeOption.description}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 설명모드 (구현중) */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
            💡 설명모드 (구현중)
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: fontSizes.body, color: textSecondary }]}>
            화면에 대한 설명을 더 많이 보여드려요.
          </Text>

          <View style={{ flexDirection: 'row', marginTop: spacing.sm, gap: spacing.sm }}>
            <Pressable
              style={[
                styles.modeButton,
                {
                  flex: 1,
                  padding: spacing.md,
                  backgroundColor: cardBg,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: borderColor,
                  opacity: 0.6,
                },
              ]}
              disabled={true}
            >
              <Text style={[styles.modeButtonText, { fontSize: fontSizes.heading2, color: textPrimary, textAlign: 'center' }]}>
                EASY
              </Text>
              <Text style={[styles.modeButtonDesc, { fontSize: fontSizes.small, color: textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
                쉬운 모드
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.modeButton,
                {
                  flex: 1,
                  padding: spacing.md,
                  backgroundColor: cardBg,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: borderColor,
                  opacity: 0.6,
                },
              ]}
              disabled={true}
            >
              <Text style={[styles.modeButtonText, { fontSize: fontSizes.heading2, color: textPrimary, textAlign: 'center' }]}>
                PRO
              </Text>
              <Text style={[styles.modeButtonDesc, { fontSize: fontSizes.small, color: textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
                활용 모드
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.comingSoon, { fontSize: fontSizes.small, color: textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
            🚧 곧 만나보실 수 있어요!
          </Text>
        </View>

        {/* 접근성 모드 선택 */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
            👀 화면 크기 조정
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: fontSizes.body, color: textSecondary }]}>
            글자와 버튼 크기를 조정할 수 있어요.
          </Text>

          {A11Y_MODES.map((modeOption) => (
            <Pressable
              key={modeOption.key}
              onPress={() => setMode(modeOption.key)}
              style={[
                styles.optionCard,
                {
                  marginTop: spacing.sm,
                  padding: spacing.md,
                  backgroundColor: mode === modeOption.key ? selectedCardBg : cardBg,
                  borderColor: mode === modeOption.key ? accentColor : borderColor,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${modeOption.label} 모드`}
              accessibilityState={{ selected: mode === modeOption.key }}
            >
              <Text style={[styles.optionLabel, { fontSize: fontSizes.heading2, color: mode === modeOption.key ? accentColor : textPrimary }]}>
                {modeOption.label}
              </Text>
              <Text style={[styles.optionDescription, { fontSize: fontSizes.body, color: textSecondary }]}>
                {modeOption.description}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 미리보기 */}
        <Animated.View
          style={[
            styles.previewCard,
            {
              marginTop: spacing.xl,
              padding: spacing.md,
              backgroundColor: activeTheme === 'dark' ? colors.dark.background.tertiary : '#F0F8FF',
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.previewTitle, { fontSize: fontSizes.heading2, color: accentColor }]}>
            ✨ 실시간 미리보기
          </Text>
          <Text style={{ fontSize: fontSizes.body, color: textPrimary }}>
            제목 크기: {fontSizes.heading1}dp
          </Text>
          <Text style={{ fontSize: fontSizes.body, color: textPrimary }}>
            본문 크기: {fontSizes.body}dp
          </Text>
          <Text style={{ fontSize: fontSizes.body, color: textPrimary }}>
            버튼 높이: {buttonHeight}dp
          </Text>
        </Animated.View>

        {/* 기타 메뉴 */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={[styles.sectionTitle, { fontSize: fontSizes.heading2, color: textPrimary }]}>
            📋 기타
          </Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBg, marginTop: spacing.sm }]}
            onPress={() => navigation.navigate('Subscription')}
            accessibilityLabel="도우미 관리"
          >
            <Text style={[styles.menuItemText, { fontSize: fontSizes.body, color: textPrimary }]}>
              🤖 도우미 관리
            </Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBg, marginTop: spacing.sm }]}
            accessibilityLabel="가족 연결"
          >
            <Text style={[styles.menuItemText, { fontSize: fontSizes.body, color: textPrimary }]}>
              👨‍👩‍👧‍👦 가족 연결
            </Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBg, marginTop: spacing.sm }]}
            onPress={() => navigation.navigate('Terms')}
            accessibilityLabel="이용약관"
          >
            <Text style={[styles.menuItemText, { fontSize: fontSizes.body, color: textPrimary }]}>
              📄 이용약관
            </Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBg, marginTop: spacing.sm }]}
            onPress={() => navigation.navigate('Privacy')}
            accessibilityLabel="개인정보처리방침"
          >
            <Text style={[styles.menuItemText, { fontSize: fontSizes.body, color: textPrimary }]}>
              🔒 개인정보처리방침
            </Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: cardBg, marginTop: spacing.sm }]}
            accessibilityLabel="앱 정보"
          >
            <Text style={[styles.menuItemText, { fontSize: fontSizes.body, color: textPrimary }]}>
              ℹ️ 앱 버전 1.0.0
            </Text>
          </TouchableOpacity>

          {/* 관리자 메뉴 (관리자 권한 있을 때만 표시) */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: '#1F2937', marginTop: spacing.sm }]}
              onPress={() => navigation.navigate('Admin')}
              accessibilityLabel="관리자 페이지"
            >
              <Text style={[styles.menuItemText, { fontSize: fontSizes.body, color: '#FFFFFF' }]}>
                ⚙️ 관리자 페이지
              </Text>
              <Text style={[styles.menuItemArrow, { color: '#FFFFFF' }]}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#FF5252', height: buttonHeight, marginTop: spacing.xl, marginBottom: spacing.xl }]}
          onPress={handleLogout}
          accessibilityLabel="로그아웃"
          accessibilityRole="button"
        >
          <Text style={[styles.logoutButtonText, { fontSize: fontSizes.body }]}>
            🚪 로그아웃
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 48,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 40,
  },
  profileName: {
    fontWeight: '700',
  },
  profileEmail: {
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    marginBottom: 8,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 2,
  },
  optionLabel: {
    fontWeight: '600',
  },
  optionDescription: {
    marginTop: 4,
  },
  previewCard: {
    borderRadius: 12,
  },
  previewTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  menuItemText: {
    fontWeight: '500',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#999',
  },
  logoutButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modeButton: {
    alignItems: 'center',
  },
  modeButtonText: {
    fontWeight: '700',
  },
  modeButtonDesc: {
    fontWeight: '500',
  },
  comingSoon: {
    fontStyle: 'italic',
  },
});
