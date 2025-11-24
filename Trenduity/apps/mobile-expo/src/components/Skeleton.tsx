import React from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonProps {
  /** 너비 */
  width?: number | string;
  /** 높이 */
  height?: number | string;
  /** 모양 타입 */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** 애니메이션 활성화 */
  animation?: boolean;
  /** 스타일 */
  style?: ViewStyle;
}

/**
 * 기본 Skeleton 컴포넌트 (React Native)
 * 로딩 상태를 표시하는 shimmer 효과
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  variant = 'text',
  animation = true,
  style,
}) => {
  const { isDark } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!animation) return;

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [animation, animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: isDark
      ? ['#334155', '#475569', '#334155'] // slate-700 → slate-600 → slate-700
      : ['#E2E8F0', '#F1F5F9', '#E2E8F0'], // slate-200 → slate-100 → slate-200
  });

  const borderRadius = {
    text: 4,
    circular: 999,
    rectangular: 0,
    rounded: 12,
  }[variant];

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: animation ? backgroundColor : (isDark ? '#334155' : '#E2E8F0'),
        },
        style,
      ]}
      accessible={true}
      accessibilityLabel="로딩 중"
      accessibilityRole="progressbar"
    />
  );
};

interface TextSkeletonProps {
  /** 줄 수 */
  lines?: number;
  /** 마지막 줄 너비 (%) */
  lastLineWidth?: number;
}

/**
 * 텍스트용 Skeleton
 * 여러 줄의 텍스트 로딩 상태 표시
 */
export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 3,
  lastLineWidth = 60,
}) => {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? `${lastLineWidth}%` : '100%'}
          style={i < lines - 1 ? { marginBottom: 12 } : undefined}
        />
      ))}
    </View>
  );
};

interface CardSkeletonProps {
  /** 아바타 포함 여부 */
  avatar?: boolean;
  /** 제목 포함 여부 */
  title?: boolean;
  /** 설명 줄 수 */
  descriptionLines?: number;
}

/**
 * 카드용 Skeleton
 * 프로필 카드, 콘텐츠 카드 등의 로딩 상태
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  avatar = true,
  title = true,
  descriptionLines = 2,
}) => {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
      ]}
    >
      {/* 헤더 영역 */}
      <View style={styles.cardHeader}>
        {avatar && <Skeleton variant="circular" width={48} height={48} />}
        <View style={styles.cardHeaderText}>
          {title && (
            <Skeleton height={24} width="60%" style={{ marginBottom: 8 }} />
          )}
          <Skeleton height={16} width="40%" />
        </View>
      </View>

      {/* 설명 영역 */}
      {descriptionLines > 0 && (
        <View style={styles.cardDescription}>
          {Array.from({ length: descriptionLines }).map((_, i) => (
            <Skeleton
              key={i}
              height={16}
              width={i === descriptionLines - 1 ? '70%' : '100%'}
              style={i < descriptionLines - 1 ? { marginBottom: 8 } : undefined}
            />
          ))}
        </View>
      )}
    </View>
  );
};

interface ListSkeletonProps {
  /** 아이템 개수 */
  items?: number;
  /** 아바타 포함 여부 */
  avatar?: boolean;
}

/**
 * 리스트용 Skeleton
 * 멤버 리스트, 알림 리스트 등의 로딩 상태
 */
export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 5,
  avatar = true,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.listContainer}>
      {Array.from({ length: items }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.listItem,
            { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
          ]}
        >
          {avatar && <Skeleton variant="circular" width={40} height={40} />}
          <View style={styles.listItemText}>
            <Skeleton height={20} width="50%" style={{ marginBottom: 8 }} />
            <Skeleton height={16} width="70%" />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  textContainer: {
    width: '100%',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardDescription: {
    marginTop: 8,
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemText: {
    flex: 1,
    marginLeft: 12,
  },
});
