import React, { useEffect, useRef } from 'react';
import { Text, TextStyle, Animated, Easing } from 'react-native';

export interface AnimatedNumberProps {
  /**
   * 표시할 최종 값
   */
  value: number;

  /**
   * 애니메이션 지속 시간 (ms)
   * @default 1000
   */
  duration?: number;

  /**
   * 텍스트 스타일
   */
  style?: TextStyle;

  /**
   * 접근성 라벨
   */
  accessibilityLabel?: string;

  /**
   * 숫자 포맷팅 함수
   * @default (num) => Math.round(num).toString()
   */
  formatter?: (value: number) => string;
}

/**
 * AnimatedNumber 컴포넌트
 * 
 * 숫자가 부드럽게 카운트업되는 애니메이션을 제공합니다.
 * 게임화 통계, 포인트 변화 등을 시각적으로 표현할 때 사용합니다.
 * 
 * @example
 * ```tsx
 * <AnimatedNumber
 *   value={350}
 *   duration={1000}
 *   style={{ fontSize: 32, fontWeight: 'bold' }}
 *   formatter={(num) => `${Math.round(num)} pt`}
 * />
 * ```
 */
export function AnimatedNumber({
  value,
  duration = 1000,
  style,
  accessibilityLabel,
  formatter = (num) => Math.round(num).toString(),
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState('0');

  useEffect(() => {
    // 애니메이션 리스너: 값이 변경될 때마다 화면 업데이트
    const listenerId = animatedValue.addListener(({ value: currentValue }) => {
      setDisplayValue(formatter(currentValue));
    });

    // 카운트업 애니메이션 시작
    Animated.timing(animatedValue, {
      toValue: value,
      duration: duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Text 애니메이션이므로 false
    }).start();

    // 클린업: 리스너 제거
    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, duration, animatedValue, formatter]);

  return (
    <Text
      style={style}
      accessibilityLabel={accessibilityLabel || `${value}`}
      accessibilityLiveRegion="polite"
    >
      {displayValue}
    </Text>
  );
}

/**
 * 숫자 포맷팅 유틸리티
 */
export const numberFormatters = {
  /**
   * 정수 표시 (예: 350)
   */
  integer: (num: number) => Math.round(num).toString(),

  /**
   * 소수점 1자리 (예: 3.5)
   */
  decimal: (num: number) => num.toFixed(1),

  /**
   * 천 단위 쉼표 (예: 1,350)
   */
  withCommas: (num: number) =>
    Math.round(num).toLocaleString('ko-KR'),

  /**
   * 포인트 단위 (예: 350 pt)
   */
  points: (num: number) => `${Math.round(num)} pt`,

  /**
   * 퍼센트 (예: 75%)
   */
  percent: (num: number) => `${Math.round(num)}%`,

  /**
   * 일 단위 (예: 7일)
   */
  days: (num: number) => `${Math.round(num)}일`,
};
