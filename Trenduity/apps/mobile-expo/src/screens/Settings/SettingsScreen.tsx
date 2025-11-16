import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
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

/**
 * 설정 화면
 * 
 * 접근성 모드 선택 UI 제공
 */
export const SettingsScreen = () => {
  const { mode, setMode, spacing, buttonHeight, fontSizes } = useA11y();
  const [showScamCheck, setShowScamCheck] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing }}>
        <Text
          style={{
            fontSize: fontSizes.heading1,
            fontWeight: '700',
            color: '#212121',
          }}
        >
          ⚙️ 설정
        </Text>

        {/* 접근성 모드 선택 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Text
            style={{
              fontSize: fontSizes.heading2,
              fontWeight: '600',
              color: '#212121',
            }}
          >
            화면 크기 조정
          </Text>

          <Text
            style={{
              fontSize: fontSizes.body,
              color: '#666666',
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
                },
                mode === modeOption.key && styles.selectedCard,
              ]}
            >
              <Pressable
                onPress={() => setMode(modeOption.key)}
                style={{
                  height: buttonHeight,
                  justifyContent: 'center',
                }}
                accessibilityLabel={`${modeOption.label} 모드`}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: fontSizes.heading2,
                    fontWeight: '600',
                    color: mode === modeOption.key ? '#2196F3' : '#212121',
                  }}
                >
                  {modeOption.label}
                </Text>
                <Text
                  style={{
                    fontSize: fontSizes.body,
                    color: '#666666',
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
        <View
          style={{
            marginTop: spacing * 2,
            padding: spacing,
            backgroundColor: '#F0F8FF',
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: fontSizes.body, color: '#212121' }}>
            ✨ 미리보기: 이 화면이 바로 선택한 크기로 보여요!
          </Text>
        </View>

        {/* 사기 검사 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Text
            style={{
              fontSize: fontSizes.heading2,
              fontWeight: '600',
              color: '#212121',
            }}
          >
            안전 기능
          </Text>

          <Pressable
            onPress={() => setShowScamCheck(true)}
            style={{
              marginTop: spacing,
              height: buttonHeight,
              backgroundColor: '#2196F3',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityLabel="사기 검사"
            accessibilityRole="button"
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
    backgroundColor: '#FFFFFF',
  },
  modeCard: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
});
