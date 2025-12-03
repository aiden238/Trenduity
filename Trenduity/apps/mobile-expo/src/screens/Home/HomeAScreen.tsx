import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HomeAScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Trenduity 앱 테스트</Text>
      <Text style={styles.subtitle}>앱이 정상적으로 로드되었습니다!</Text>
      <Text style={styles.info}>BFF 서버: localhost:8000</Text>
      <Text style={styles.info}>Expo 서버: port 8082</Text>
      <Text style={styles.note}> USB 디버깅 연결 성공</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  info: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  note: {
    fontSize: 16,
    color: '#22C55E',
    marginTop: 16,
    fontWeight: '600',
  },
});
