import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, Animated } from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ScamCheckSheet } from '../../components/ScamCheckSheet';

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
 * 설정 화면
 * 
 * 접근성 모드 선택 및 테마 선택 UI 제공
 */
export const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>설정 화면</Text>
    </View>
  );
};

const oldSettingsScreen = () => {
  const { mode, setMode, spacing, buttonHeight, fontSizes, scaleAnim } = useA11y();
  const { themeMode, activeTheme, setThemeMode, colors } = useTheme();
  const [showScamCheck, setShowScamCheck] = useState(false);

  // 다크 모드에 따른 색상 적용
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#212121';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#666666';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#F5F5F5';
  const selectedCardBg = activeTheme === 'dark' ? colors.dark.background.tertiary : '#E3F2FD';
  const borderColor = activeTheme === 'dark' ? colors.dark.border : 'transparent';
  const accentColor = activeTheme === 'dark' ? colors.dark.status.info : '#2196F3';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={{ padding: spacing }}>
        <Text
          style={{
            fontSize: fontSizes.heading1,
            fontWeight: '700',
            color: textPrimary,
          }}
        >
          ⚙️ 설정
        </Text>

        {/* 테마 모드 선택 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Text
            style={{
              fontSize: fontSizes.heading2,
              fontWeight: '600',
              color: textPrimary,
            }}
          >
            테마 설정
          </Text>

          <Text
            style={{
              fontSize: fontSizes.body,
              color: textSecondary,
              marginTop: spacing,
            }}
          >
            밝은 화면과 어두운 화면을 선택할 수 있어요.
          </Text>

          {THEME_MODES.map((themeModeOption) => (
            <View
              key={themeModeOption.key}
              style={[
                styles.modeCard,
                {
                  marginTop: spacing,
                  padding: spacing,
                  borderRadius: 8,
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                },
                themeMode === themeModeOption.key && {
                  borderColor: accentColor,
                  backgroundColor: selectedCardBg,
                },
              ]}
            >
              <Pressable
                onPress={() => setThemeMode(themeModeOption.key)}
                style={{
                  height: buttonHeight,
                  justifyContent: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel={`${themeModeOption.label} 선택`}
                accessibilityHint={`버튼을 누르면 ${themeModeOption.description}`}
                accessibilityState={{ selected: themeMode === themeModeOption.key }}
              >
                <Text
                  style={{
                    fontSize: fontSizes.heading2,
                    fontWeight: '600',
                    color: themeMode === themeModeOption.key ? accentColor : textPrimary,
                  }}
                >
                  {themeModeOption.icon} {themeModeOption.label}
                </Text>
                <Text
                  style={{
                    fontSize: fontSizes.body,
                    color: textSecondary,
                    marginTop: 4,
                  }}
                >
                  {themeModeOption.description}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* 접근성 모드 선택 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Text
            style={{
              fontSize: fontSizes.heading2,
              fontWeight: '600',
              color: textPrimary,
            }}
          >
            화면 크기 조정
          </Text>

          <Text
            style={{
              fontSize: fontSizes.body,
              color: textSecondary,
              marginTop: spacing,
            }}
          >
            글자와 버튼 크기를 조정할 수 있어요.
          </Text>

          {A11Y_MODES.map((modeOption) => (
            <View
              key={modeOption.key}
              style={[
                styles.modeCard,
                {
                  marginTop: spacing,
                  padding: spacing,
                  borderRadius: 8,
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                },
                mode === modeOption.key && {
                  borderColor: accentColor,
                  backgroundColor: selectedCardBg,
                },
              ]}
            >
              <Pressable
                onPress={() => setMode(modeOption.key)}
                style={{
                  height: buttonHeight,
                  justifyContent: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel={`${modeOption.label} 모드`}
                accessibilityHint={`버튼을 누르면 ${modeOption.description}`}
                accessibilityState={{ selected: mode === modeOption.key }}
              >
                <Text
                  style={{
                    fontSize: fontSizes.heading2,
                    fontWeight: '600',
                    color: mode === modeOption.key ? accentColor : textPrimary,
                  }}
                >
                  {modeOption.label}
                </Text>
                <Text
                  style={{
                    fontSize: fontSizes.body,
                    color: textSecondary,
                    marginTop: 4,
                  }}
                >
                  {modeOption.description}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* 미리보기 */}
        <Animated.View
          style={{
            marginTop: spacing * 2,
            padding: spacing,
            backgroundColor: activeTheme === 'dark' ? colors.dark.background.tertiary : '#F0F8FF',
            borderRadius: 8,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Text
            style={{
              fontSize: fontSizes.heading2,
              fontWeight: '600',
              color: accentColor,
              marginBottom: spacing / 2,
            }}
          >
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
          <Text
            style={{
              fontSize: fontSizes.caption,
              color: textSecondary,
              marginTop: spacing / 2,
            }}
          >
            💡 모드 변경 시 즉시 화면 크기가 바뀌어요!
          </Text>
        </Animated.View>

        {/* 터치 영역 안내 */}
        <View
          style={{
            marginTop: spacing * 2,
            padding: spacing,
            backgroundColor: activeTheme === 'dark' ? colors.dark.background.tertiary : '#FFF4E6',
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: fontSizes.body,
              color: textPrimary,
            }}
          >
            ✋ 터치 영역: 모든 버튼은 최소 {buttonHeight}dp 크기예요.
          </Text>
          <Text
            style={{
              fontSize: fontSizes.caption,
              color: textSecondary,
              marginTop: 4,
            }}
          >
            손떨림이 있어도 쉽게 누를 수 있어요.
          </Text>
        </View>

        {/* 가족 연결 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Text
            style={{
              fontSize: fontSizes.heading2,
              fontWeight: '600',
              color: textPrimary,
            }}
          >
            가족 기능
          </Text>

          <Pressable
            onPress={() => {
              // TODO: 네비게이션 연결 (FamilyLinkScreen으로 이동)
              console.log('가족 연결 화면으로 이동');
            }}
            style={{
              marginTop: spacing,
              height: buttonHeight,
              backgroundColor: activeTheme === 'dark' ? colors.dark.status.success : '#4CAF50',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="가족 연결"
            accessibilityHint="버튼을 누르면 가족과 연결하여 학습 활동을 공유할 수 있습니다"
          >
            <Text
              style={{
                fontSize: fontSizes.body,
                fontWeight: '600',
                color: '#FFFFFF',
              }}
            >
              👨‍👩‍👧‍👦 가족 연결
            </Text>
          </Pressable>
        </View>

        {/* 사기 검사 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Text
            style={{
              fontSize: fontSizes.heading2,
              fontWeight: '600',
              color: textPrimary,
            }}
          >
            안전 기능
          </Text>

          <Pressable
            onPress={() => setShowScamCheck(true)}
            style={{
              marginTop: spacing,
              height: buttonHeight,
              backgroundColor: accentColor,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="사기 검사"
            accessibilityHint="버튼을 누르면 의심스러운 문자나 메시지를 검사할 수 있습니다"
          >
            <Text
              style={{
                fontSize: fontSizes.body,
                fontWeight: '600',
                color: '#FFFFFF',
              }}
            >
              🛡️ 사기 검사
            </Text>
          </Pressable>
        </View>
      </View>

      <ScamCheckSheet visible={showScamCheck} onClose={() => setShowScamCheck(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeCard: {
    borderWidth: 2,
  },
});
