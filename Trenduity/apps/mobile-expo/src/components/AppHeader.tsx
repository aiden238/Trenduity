import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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

  const handleEmergencySupport = () => {
    navigation.navigate('EmergencySupport');
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
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
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
              marginRight: spacing.sm,
            },
          ]}
          onPress={handleEmergencySupport}
          accessibilityLabel="긴급 상담하기"
          accessibilityHint="긴급 상담 페이지로 이동합니다"
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
            긴급 상담
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
          accessibilityLabel="AI 생활도우미"
          accessibilityHint="AI 생활도우미 화면으로 이동합니다"
          accessibilityRole="button"
        >
          <Text style={styles.icon}>🤖</Text>
          <Text
            style={[
              styles.buttonText,
              {
                color: '#FFFFFF',
              },
            ]}
          >
            생활도우미
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
