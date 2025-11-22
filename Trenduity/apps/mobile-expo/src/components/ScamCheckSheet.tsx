import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useA11y } from '../contexts/A11yContext';
import { useScamCheck, ScamCheckResult, ScamLabel } from '../hooks/useScamCheck';

interface ScamCheckSheetProps {
  visible: boolean;
  onClose: () => void;
}

type SheetStage = 'input' | 'result';

const LABEL_CONFIG: Record<
  ScamLabel,
  { color: string; bgColor: string; emoji: string; title: string }
> = {
  safe: {
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    emoji: '✅',
    title: '안전한 메시지입니다',
  },
  warn: {
    color: '#FF9800',
    bgColor: '#FFF3E0',
    emoji: '⚠️',
    title: '조금 의심스러운 메시지입니다',
  },
  danger: {
    color: '#F44336',
    bgColor: '#FFEBEE',
    emoji: '🚨',
    title: '매우 위험한 메시지입니다',
  },
};

export function ScamCheckSheet({ visible, onClose }: ScamCheckSheetProps) {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const [stage, setStage] = useState<SheetStage>('input');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ScamCheckResult | null>(null);

  const scamCheckMutation = useScamCheck();

  const handleCheck = async () => {
    if (inputText.trim().length < 5) {
      Alert.alert('입력 필요', '최소 5자 이상 입력해 주세요.');
      return;
    }

    scamCheckMutation.mutate(
      { input: inputText },
      {
        onSuccess: (data) => {
          setResult(data);
          setStage('result');
        },
        onError: (error: any) => {
          Alert.alert('오류', error.message || '검사에 실패했습니다. 다시 시도해 주세요.');
        },
      }
    );
  };

  const handleReset = () => {
    setStage('input');
    setInputText('');
    setResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const labelConfig = result ? LABEL_CONFIG[result.label] : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose} accessible={false}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.sheet, { padding: spacing }]}>
            {/* Header */}
            <Text style={[styles.title, { fontSize: fontSizes.heading1, marginBottom: spacing }]}>
              🛡️ 사기 검사
            </Text>

            {stage === 'input' && (
              <>
                <Text
                  style={[
                    styles.description,
                    { fontSize: fontSizes.caption, marginBottom: spacing },
                  ]}
                >
                  의심스러운 문자나 메시지를 붙여넣어 주세요. 사기인지 검사해 드립니다.
                </Text>

                <TextInput
                  style={[
                    styles.textInput,
                    {
                      fontSize: fontSizes.body,
                      padding: spacing,
                      marginBottom: spacing / 2,
                      minHeight: buttonHeight * 3,
                    },
                  ]}
                  placeholder="여기에 문자 내용을 붙여넣으세요..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={500}
                  value={inputText}
                  onChangeText={setInputText}
                  accessibilityLabel="검사할 문자 입력"
                />

                <Text style={[styles.charCount, { fontSize: fontSizes.caption, marginBottom: spacing }]}>
                  {inputText.length} / 500자
                </Text>

                <View style={[styles.buttonRow, { gap: spacing }]}>
                  <Pressable
                    style={[
                      styles.button,
                      styles.cancelButton,
                      { height: buttonHeight, borderRadius: 8 },
                    ]}
                    onPress={handleClose}
                    accessibilityRole="button"
                    accessibilityLabel="취소"
                  >
                    <Text style={[styles.buttonText, { fontSize: fontSizes.body }]}>취소</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.button,
                      styles.checkButton,
                      { height: buttonHeight, borderRadius: 8 },
                      scamCheckMutation.isPending && styles.buttonDisabled,
                    ]}
                    onPress={handleCheck}
                    disabled={scamCheckMutation.isPending || inputText.trim().length < 5}
                    accessibilityRole="button"
                    accessibilityLabel="검사하기"
                  >
                    {scamCheckMutation.isPending ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={[styles.buttonText, styles.checkButtonText, { fontSize: fontSizes.body }]}>
                        검사하기
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}

            {stage === 'result' && result && labelConfig && (
              <>
                <View
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: labelConfig.bgColor,
                      borderColor: labelConfig.color,
                      padding: spacing,
                      marginBottom: spacing,
                      borderRadius: spacing / 2,
                    },
                  ]}
                >
                  <Text style={[styles.resultEmoji, { fontSize: fontSizes.heading1 * 2 }]}>
                    {labelConfig.emoji}
                  </Text>
                  <Text
                    style={[
                      styles.resultTitle,
                      { fontSize: fontSizes.heading1, color: labelConfig.color, marginTop: spacing / 2 },
                    ]}
                  >
                    {labelConfig.title}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.tipsHeader,
                    { fontSize: fontSizes.body, marginBottom: spacing / 2 },
                  ]}
                >
                  💡 대응 방법
                </Text>

                <ScrollView
                  style={[styles.tipsScrollView, { marginBottom: spacing }]}
                  contentContainerStyle={{ gap: spacing / 2 }}
                >
                  {result.tips.map((tip, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tipItem,
                        { padding: spacing, borderRadius: 8 },
                      ]}
                    >
                      <Text style={[styles.tipBullet, { fontSize: fontSizes.body }]}>•</Text>
                      <Text style={[styles.tipText, { fontSize: fontSizes.body, flex: 1 }]}>
                        {tip}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={[styles.buttonRow, { gap: spacing }]}>
                  <Pressable
                    style={[
                      styles.button,
                      styles.resetButton,
                      { height: buttonHeight, borderRadius: 8 },
                    ]}
                    onPress={handleReset}
                    accessibilityRole="button"
                    accessibilityLabel="다시 검사"
                  >
                    <Text style={[styles.buttonText, { fontSize: fontSizes.body }]}>다시 검사</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.button,
                      styles.confirmButton,
                      { height: buttonHeight, borderRadius: 8 },
                    ]}
                    onPress={handleClose}
                    accessibilityRole="button"
                    accessibilityLabel="확인"
                  >
                    <Text style={[styles.buttonText, styles.confirmButtonText, { fontSize: fontSizes.body }]}>
                      확인
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '90%',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  description: {
    color: '#666',
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#999',
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  checkButton: {
    backgroundColor: '#2196F3',
  },
  checkButtonText: {
    color: '#FFF',
  },
  resetButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#FFF',
  },
  resultCard: {
    borderWidth: 2,
    alignItems: 'center',
  },
  resultEmoji: {
    textAlign: 'center',
  },
  resultTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  tipsHeader: {
    fontWeight: '600',
    color: '#212121',
  },
  tipsScrollView: {
    maxHeight: 200,
  },
  tipItem: {
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    color: '#2196F3',
    marginRight: 8,
    fontWeight: '700',
  },
  tipText: {
    color: '#424242',
    lineHeight: 22,
  },
});
