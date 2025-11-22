import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useA11y } from '../../contexts/A11yContext';
import { useFamilyLink } from '../../hooks/useFamilyLink';

/**
 * 가족 연결 화면
 * 
 * 기능:
 * - 연결된 가족 목록 표시
 * - 가족 초대 링크 생성
 * - 권한 관리 (읽기, 알림)
 * 
 * A11y: 모든 요소에 접근성 토큰 적용
 */
export const FamilyLinkScreen = () => {
  const { spacing, buttonHeight, fontSizes } = useA11y();
  const { members, isMembersLoading, inviteFamily, isInviting } = useFamilyLink();
  const [newUserId, setNewUserId] = useState('');

  const handleInvite = () => {
    if (!newUserId.trim()) {
      Alert.alert('알림', '가족의 사용자 ID를 입력해주세요.');
      return;
    }

    inviteFamily(
      { user_id: newUserId.trim() },
      {
        onSuccess: (data) => {
          Alert.alert(
            '초대 완료',
            data.message || '가족 연결이 완료되었어요!',
            [{ text: '확인', onPress: () => setNewUserId('') }]
          );
        },
        onError: (error) => {
          Alert.alert('오류', error.message || '초대에 실패했어요. 다시 시도해주세요.');
        },
      }
    );
  };

  if (isMembersLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text
          style={{
            fontSize: fontSizes.body,
            color: '#666666',
            marginTop: spacing,
          }}
        >
          가족 목록을 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: spacing }}>
        {/* 헤더 */}
        <Text
          style={{
            fontSize: fontSizes.heading1,
            fontWeight: '700',
            color: '#212121',
          }}
          accessibilityRole="header"
        >
          👨‍👩‍👧‍👦 가족 연결
        </Text>

        <Text
          style={{
            fontSize: fontSizes.body,
            color: '#666666',
            marginTop: spacing / 2,
          }}
        >
          가족과 연결하면 학습 활동을 공유할 수 있어요.
        </Text>

        {/* 연결된 가족 목록 */}
        <View style={{ marginTop: spacing * 2 }}>
          <Text
            style={{
              fontSize: fontSizes.heading2,
              fontWeight: '600',
              color: '#212121',
            }}
          >
            연결된 가족 ({members.length}명)
          </Text>

          {members.length === 0 ? (
            <View
              style={{
                marginTop: spacing,
                padding: spacing * 1.5,
                backgroundColor: '#F5F5F5',
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: fontSizes.body,
                  color: '#666666',
                  textAlign: 'center',
                }}
              >
                아직 연결된 가족이 없어요.
              </Text>
              <Text
                style={{
                  fontSize: fontSizes.caption,
                  color: '#999999',
                  textAlign: 'center',
                  marginTop: spacing / 2,
                }}
              >
                아래에서 가족을 초대해보세요!
              </Text>
            </View>
          ) : (
            members.map((member, index) => (
              <View
                key={member.user_id}
                style={{
                  marginTop: spacing,
                  padding: spacing,
                  backgroundColor: '#E3F2FD',
                  borderRadius: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: '#2196F3',
                }}
                accessible={true}
                accessibilityLabel={`${member.name} 님, 마지막 활동: ${
                  member.last_activity
                    ? new Date(member.last_activity).toLocaleDateString('ko-KR')
                    : '없음'
                }`}
              >
                <Text
                  style={{
                    fontSize: fontSizes.heading2,
                    fontWeight: '600',
                    color: '#212121',
                  }}
                >
                  {member.name}
                </Text>

                <Text
                  style={{
                    fontSize: fontSizes.body,
                    color: '#666666',
                    marginTop: spacing / 4,
                  }}
                >
                  마지막 활동:{' '}
                  {member.last_activity
                    ? new Date(member.last_activity).toLocaleDateString('ko-KR')
                    : '활동 없음'}
                </Text>

                {/* 권한 표시 */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: spacing / 2,
                    gap: spacing / 2,
                  }}
                >
                  {member.perms.read && (
                    <View style={styles.permBadge}>
                      <Text style={styles.permText}>📖 읽기</Text>
                    </View>
                  )}
                  {member.perms.alerts && (
                    <View style={styles.permBadge}>
                      <Text style={styles.permText}>🔔 알림</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* 가족 초대 */}
        <View style={{ marginTop: spacing * 3 }}>
          <Text
            style={{
              fontSize: fontSizes.heading2,
              fontWeight: '600',
              color: '#212121',
            }}
          >
            새 가족 초대
          </Text>

          <View
            style={{
              marginTop: spacing,
              padding: spacing * 1.5,
              backgroundColor: '#FFF4E6',
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: fontSizes.body,
                color: '#212121',
              }}
            >
              💡 초대 방법
            </Text>
            <Text
              style={{
                fontSize: fontSizes.caption,
                color: '#666666',
                marginTop: spacing / 2,
              }}
            >
              1. 아래에 가족의 사용자 ID를 입력하세요.
            </Text>
            <Text
              style={{
                fontSize: fontSizes.caption,
                color: '#666666',
              }}
            >
              2. "초대하기" 버튼을 누르세요.
            </Text>
            <Text
              style={{
                fontSize: fontSizes.caption,
                color: '#666666',
              }}
            >
              3. 가족이 자동으로 연결돼요!
            </Text>
          </View>

          {/* 초대 버튼 */}
          <Pressable
            onPress={handleInvite}
            disabled={isInviting}
            style={{
              marginTop: spacing * 1.5,
              height: buttonHeight,
              backgroundColor: isInviting ? '#CCCCCC' : '#2196F3',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="가족 초대하기"
            accessibilityHint="버튼을 누르면 입력한 사용자 ID로 가족 초대 링크를 생성합니다"
            accessibilityState={{ disabled: isInviting }}
          >
            {isInviting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  fontSize: fontSizes.body,
                  fontWeight: '600',
                  color: '#FFFFFF',
                }}
              >
                👋 가족 초대하기
              </Text>
            )}
          </Pressable>
        </View>

        {/* 주의사항 */}
        <View
          style={{
            marginTop: spacing * 2,
            padding: spacing,
            backgroundColor: '#FFEBEE',
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: fontSizes.body,
              color: '#212121',
            }}
          >
            ⚠️ 주의사항
          </Text>
          <Text
            style={{
              fontSize: fontSizes.caption,
              color: '#666666',
              marginTop: spacing / 2,
            }}
          >
            • 가족 연결은 신뢰할 수 있는 사람과만 하세요.
          </Text>
          <Text
            style={{
              fontSize: fontSizes.caption,
              color: '#666666',
            }}
          >
            • 연결된 가족은 나의 학습 활동을 볼 수 있어요.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  permBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  permText: {
    fontSize: 12,
    color: '#2196F3',
  },
});
