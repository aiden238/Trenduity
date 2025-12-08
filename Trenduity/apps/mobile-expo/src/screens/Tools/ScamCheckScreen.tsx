import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../tokens/colors';

type RiskLevel = 'safe' | 'warn' | 'danger' | null;

interface CheckResult {
  label: RiskLevel;
  tips: string[];
}

export const ScamCheckScreen = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  
  const { fontSizes, spacing, buttonHeight } = useA11y();
  const { activeTheme, colors } = useTheme();
  const { accessToken } = useAuth();
  
  // 테마 색상
  const bgColor = activeTheme === 'dark' ? colors.dark.background.primary : '#F9FAFB';
  const cardBg = activeTheme === 'dark' ? colors.dark.background.secondary : '#FFFFFF';
  const textPrimary = activeTheme === 'dark' ? colors.dark.text.primary : '#000000';
  const textSecondary = activeTheme === 'dark' ? colors.dark.text.secondary : '#6B7280';

  const BFF_URL = process.env.EXPO_PUBLIC_BFF_API_URL || 'https://trenduity-bff.onrender.com';

  const checkScam = async () => {
    if (!inputText.trim() || inputText.trim().length < 5) {
      Alert.alert('알림', '검사할 내용을 5자 이상 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${BFF_URL}/v1/scam/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ input: inputText.trim() }),
      });

      const data = await response.json();

      if (data.ok && data.data) {
        setResult(data.data);
      } else {
        Alert.alert('오류', data.error?.message || '검사에 실패했어요. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('Scam check error:', error);
      Alert.alert('오류', '네트워크 연결이 불안정해요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'safe': return '#10B981';
      case 'warn': return '#F59E0B';
      case 'danger': return '#EF4444';
      default: return textSecondary;
    }
  };

  const getRiskEmoji = (level: RiskLevel) => {
    switch (level) {
      case 'safe': return '✅';
      case 'warn': return '⚠️';
      case 'danger': return '🚨';
      default: return '❓';
    }
  };

  const getRiskTitle = (level: RiskLevel) => {
    switch (level) {
      case 'safe': return '안전해요';
      case 'warn': return '주의가 필요해요';
      case 'danger': return '위험해요!';
      default: return '분석 중';
    }
  };

  const renderResult = () => {
    if (!result) return null;

    const color = getRiskColor(result.label);
    const emoji = getRiskEmoji(result.label);
    const title = getRiskTitle(result.label);

    return (
      <View style={[styles.resultContainer, { backgroundColor: cardBg, padding: spacing.lg, borderRadius: 16, marginTop: spacing.lg }]}>
        <View style={[styles.resultHeader, { borderLeftColor: color, borderLeftWidth: 4, paddingLeft: spacing.md }]}>
          <Text style={[styles.resultEmoji, { fontSize: fontSizes.heading1 * 1.5 }]}>
            {emoji}
          </Text>
          <Text style={[styles.resultTitle, { fontSize: fontSizes.heading1, color }]}>
            {title}
          </Text>
        </View>

        {result.tips && result.tips.length > 0 && (
          <View style={[styles.tipsContainer, { marginTop: spacing.lg }]}>
            <Text style={[styles.tipsTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.sm }]}>
              💡 대응 방법
            </Text>
            {result.tips.map((tip, index) => (
              <View key={index} style={[styles.tipItem, { marginBottom: spacing.sm }]}>
                <Text style={[styles.tipBullet, { fontSize: fontSizes.body, color: COLORS.primary.main }]}>•</Text>
                <Text style={[styles.tipText, { fontSize: fontSizes.body, color: textPrimary, flex: 1 }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        )}

        {result.label === 'danger' && (
          <View style={[styles.emergencyBox, { backgroundColor: '#FEE2E2', padding: spacing.md, borderRadius: 12, marginTop: spacing.md }]}>
            <Text style={[styles.emergencyText, { fontSize: fontSizes.body, color: '#991B1B' }]}>
              📞 의심스러우면 가족이나 경찰(112)에 먼저 확인하세요!
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: COLORS.accent.orange, padding: spacing.lg, paddingTop: spacing.lg + 40 }]}>
        <Text style={[styles.headerTitle, { fontSize: fontSizes.heading1, color: '#FFFFFF' }]}>
          🛡️ 사기 검사
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: fontSizes.body, color: 'rgba(255,255,255,0.9)' }]}>
          의심되는 문자나 메시지를 검사해보세요
        </Text>
      </View>

      <View style={{ padding: spacing.lg }}>
        {/* 안내 */}
        <View style={[styles.infoBox, { backgroundColor: cardBg, padding: spacing.md, borderRadius: 12, marginBottom: spacing.lg }]}>
          <Text style={[styles.infoText, { fontSize: fontSizes.body, color: textSecondary }]}>
            📱 받은 문자나 메시지 내용을 아래에 붙여넣고 검사 버튼을 눌러주세요.
          </Text>
        </View>

        {/* 입력 영역 */}
        <Text style={[styles.inputLabel, { fontSize: fontSizes.body, color: textPrimary, marginBottom: spacing.sm }]}>
          검사할 내용
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: cardBg,
              fontSize: fontSizes.body,
              color: textPrimary,
              padding: spacing.md,
              borderRadius: 12,
              minHeight: 150,
              textAlignVertical: 'top',
            },
          ]}
          placeholder="의심되는 문자나 메시지를 여기에 붙여넣으세요..."
          placeholderTextColor={textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          accessibilityLabel="검사할 내용 입력"
        />
        <Text style={[styles.charCount, { fontSize: fontSizes.caption, color: textSecondary, marginTop: spacing.xs, textAlign: 'right' }]}>
          {inputText.length}/500자
        </Text>

        {/* 검사 버튼 */}
        <TouchableOpacity
          style={[
            styles.checkButton,
            {
              backgroundColor: isLoading ? '#9CA3AF' : COLORS.accent.orange,
              height: buttonHeight * 1.2,
              borderRadius: 12,
              marginTop: spacing.md,
            },
          ]}
          onPress={checkScam}
          disabled={isLoading || inputText.trim().length < 5}
          accessibilityRole="button"
          accessibilityLabel="사기 검사하기"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.checkButtonText, { fontSize: fontSizes.body, color: '#FFFFFF', fontWeight: '700' }]}>
              🔍 검사하기
            </Text>
          )}
        </TouchableOpacity>

        {/* 결과 */}
        {renderResult()}

        {/* 예시 */}
        <View style={[styles.examplesContainer, { marginTop: spacing.xl }]}>
          <Text style={[styles.examplesTitle, { fontSize: fontSizes.heading2, color: textPrimary, marginBottom: spacing.md }]}>
            📋 이런 문자를 조심하세요
          </Text>
          
          {[
            { emoji: '🚨', text: '"경찰청입니다. 범죄에 연루되었습니다..."' },
            { emoji: '💰', text: '"국민지원금 신청하세요" + 이상한 링크' },
            { emoji: '📦', text: '"택배 배송 실패. 주소 확인 필요"' },
            { emoji: '🏦', text: '"계좌가 정지되었습니다. 확인하세요"' },
          ].map((example, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.exampleItem, { backgroundColor: cardBg, padding: spacing.md, borderRadius: 8, marginBottom: spacing.sm }]}
              onPress={() => setInputText(example.text)}
              accessibilityRole="button"
              accessibilityLabel={`예시: ${example.text}`}
            >
              <Text style={[styles.exampleText, { fontSize: fontSizes.small, color: textSecondary }]}>
                {example.emoji} {example.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  infoBox: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoText: {},
  inputLabel: {
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  charCount: {},
  checkButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkButtonText: {},
  resultContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultEmoji: {
    marginRight: 8,
  },
  resultTitle: {
    fontWeight: '700',
  },
  tipsContainer: {},
  tipsTitle: {
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
  },
  tipBullet: {
    marginRight: 8,
  },
  tipText: {
    lineHeight: 24,
  },
  emergencyBox: {},
  emergencyText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  examplesContainer: {},
  examplesTitle: {
    fontWeight: '600',
  },
  exampleItem: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exampleText: {},
});
