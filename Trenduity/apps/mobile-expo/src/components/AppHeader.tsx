import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useA11y } from '../contexts/A11yContext';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../tokens/colors';

interface AppHeaderProps {
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title = 'AI 배움터' }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { spacing } = useA11y();
  const { colors, activeTheme } = useTheme();

  const handlePhoneCall = async () => {
    const phoneNumber = 'tel:1577-0199';
    try {
      const supported = await Linking.canOpenURL(phoneNumber);
      if (supported) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert('전화 걸기 실패', '전화 앱을 열 수 없습니다.');
      }
    } catch (error) {
      console.error('전화 걸기 에러:', error);
      Alert.alert('오류', '전화를 걸 수 없습니다.');
    }
  };

  const handleAIChat = () => {
    navigation.navigate('AIChat');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: activeTheme === 'dark' ? '#1F2937' : '#FFFFFF',
          paddingHorizontal: spacing,
          paddingVertical: spacing * 0.75,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: activeTheme === 'dark' ? '#FFFFFF' : '#000000',
            fontSize: 18,
          },
        ]}
      >
        {title}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: COLORS.primary.main,
              marginRight: spacing * 0.5,
            },
          ]}
          onPress={handlePhoneCall}
          accessibilityLabel="전화 상담하기"
          accessibilityHint="1577-0199로 전화를 겁니다"
          accessibilityRole="button"
        >
          <Text style={styles.icon}>📞</Text>
          <Text
            style={[
              styles.buttonText,
              {
                color: '#FFFFFF',
              },
            ]}
          >
            전화 상담
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: COLORS.secondary.main,
            },
          ]}
          onPress={handleAIChat}
          accessibilityLabel="AI 채팅하기"
          accessibilityHint="AI 채팅 화면으로 이동합니다"
          accessibilityRole="button"
        >
          <Text style={styles.icon}>💬</Text>
          <Text
            style={[
              styles.buttonText,
              {
                color: '#FFFFFF',
              },
            ]}
          >
            AI 챗
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontWeight: '700',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
