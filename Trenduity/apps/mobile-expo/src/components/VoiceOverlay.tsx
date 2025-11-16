import React, { useState } from 'react';
import { Modal, View, StyleSheet, TextInput, Linking, Pressable, Text } from 'react-native';
import { useA11y } from '../contexts/A11yContext';
import { useVoiceIntent, ParsedIntent } from '../hooks/useVoiceIntent';
import { useNavigation } from '@react-navigation/native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * 음성 명령 오버레이
 * 
 * 2단계 UI:
 * 1. 입력 단계: 음성 명령 텍스트 입력
 * 2. 확인 단계: 파싱된 인텐트 요약 및 실행 확인
 */
export default function VoiceOverlay({ visible, onClose }: Props) {
  const [inputText, setInputText] = useState('');
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  
  const parseIntent = useVoiceIntent();
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const navigation = useNavigation();
  
  // 파싱 핸들러
  const handleParse = async () => {
    if (!inputText.trim()) return;
    
    try {
      const result = await parseIntent.mutateAsync(inputText);
      setParsedIntent(result);
    } catch (err) {
      // 에러는 useMutation에서 처리
      console.error('Parse error:', err);
    }
  };
  
  // 실행 핸들러
  const handleConfirm = () => {
    if (!parsedIntent) return;
    
    const { action } = parsedIntent;
    
    // 액션 실행
    try {
      if (action.kind === 'route' && action.route) {
        // 앱 내 화면 이동
        navigation.navigate(action.route as never);
      } else if (action.kind === 'url' && action.url) {
        // 외부 URL 열기
        Linking.openURL(action.url);
      } else if (action.kind === 'contact_lookup') {
        // TODO: 연락처 앱 연동 (실제 구현 필요)
        alert(`${action.name}님의 연락처를 찾아주세요.`);
      } else if (action.kind === 'sms') {
        // TODO: SMS 앱 연동
        alert(`${action.name}님께 문자를 보내세요.`);
      } else if (action.kind === 'reminder') {
        // 알림 기능 미구현
        alert('알림 기능은 곧 지원 예정이에요.');
      }
    } catch (err) {
      console.error('Action execution error:', err);
      alert('명령 실행에 실패했어요.');
    }
    
    // 닫기
    handleClose();
  };
  
  // 닫기 핸들러
  const handleClose = () => {
    setInputText('');
    setParsedIntent(null);
    parseIntent.reset();
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.modal, { padding: spacing * 2 }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 제목 */}
          <Text
            style={{
              fontSize: fontSizes.heading1,
              fontWeight: '700',
              color: '#212121',
            }}
          >
            🎤 음성 명령
          </Text>
          
          {!parsedIntent ? (
            <>
              {/* 입력 단계 */}
              <Text
                style={{
                  fontSize: fontSizes.body,
                  color: '#666666',
                  marginTop: spacing
                }}
              >
                무엇을 도와드릴까요?
              </Text>
              
              {/* 입력 필드 */}
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="예: 엄마한테 전화해"
                placeholderTextColor="#999999"
                style={[
                  styles.input,
                  {
                    marginTop: spacing,
                    padding: spacing,
                    fontSize: fontSizes.body,
                  }
                ]}
                multiline
                autoFocus
                accessibilityLabel="음성 명령 입력"
              />
              
              {/* 예시 명령어 */}
              <View style={{ marginTop: spacing }}>
                <Text
                  style={{
                    fontSize: fontSizes.caption,
                    color: '#999999'
                  }}
                >
                  💡 예시: "엄마한테 전화해", "오늘 날씨 검색", "인사이트 열어줘"
                </Text>
              </View>
              
              {/* 버튼 */}
              <View style={{ flexDirection: 'row', marginTop: spacing * 2, gap: spacing }}>
                <Pressable
                  onPress={handleClose}
                  style={{
                    flex: 1,
                    height: buttonHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#E0E0E0',
                    borderRadius: 8,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="취소"
                >
                  <Text style={{ fontSize: fontSizes.body, fontWeight: '600', color: '#212121' }}>
                    취소
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleParse}
                  disabled={!inputText.trim() || parseIntent.isPending}
                  style={{
                    flex: 1,
                    height: buttonHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: (!inputText.trim() || parseIntent.isPending) ? '#CCCCCC' : '#2196F3',
                    borderRadius: 8,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="확인"
                >
                  <Text style={{ fontSize: fontSizes.body, fontWeight: '600', color: '#FFF' }}>
                    {parseIntent.isPending ? '분석 중...' : '확인'}
                  </Text>
                </Pressable>
              </View>
              
              {/* 에러 메시지 */}
              {parseIntent.isError && (
                <Text
                  style={{
                    fontSize: fontSizes.caption,
                    color: '#F44336',
                    marginTop: spacing,
                    textAlign: 'center'
                  }}
                >
                  {parseIntent.error?.message}
                </Text>
              )}
            </>
          ) : (
            <>
              {/* 확인 단계 */}
              <Text
                style={{
                  fontSize: fontSizes.body,
                  marginTop: spacing * 2,
                  color: '#212121',
                }}
              >
                다음 명령을 실행할까요?
              </Text>
              
              {/* 인텐트 카드 */}
              <View
                style={[
                  styles.intentCard,
                  { marginTop: spacing, padding: spacing }
                ]}
              >
                <Text
                  style={{
                    fontSize: fontSizes.heading2,
                    fontWeight: '600',
                    color: '#2196F3'
                  }}
                >
                  {parsedIntent.summary}
                </Text>
                
                {parsedIntent.action.hint && (
                  <Text
                    style={{
                      fontSize: fontSizes.caption,
                      color: '#666666',
                      marginTop: spacing / 2
                    }}
                  >
                    {parsedIntent.action.hint}
                  </Text>
                )}
              </View>
              
              {/* 버튼 */}
              <View style={{ flexDirection: 'row', marginTop: spacing * 2, gap: spacing }}>
                <Pressable
                  onPress={handleClose}
                  style={{
                    flex: 1,
                    height: buttonHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#E0E0E0',
                    borderRadius: 8,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="취소"
                >
                  <Text style={{ fontSize: fontSizes.body, fontWeight: '600', color: '#212121' }}>
                    취소
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirm}
                  style={{
                    flex: 1,
                    height: buttonHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#2196F3',
                    borderRadius: 8,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="실행"
                >
                  <Text style={{ fontSize: fontSizes.body, fontWeight: '600', color: '#FFF' }}>
                    실행
                  </Text>
                </Pressable>
              </View>
            </>
          )}
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
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    maxHeight: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  intentCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
});
