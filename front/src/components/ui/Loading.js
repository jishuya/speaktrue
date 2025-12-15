import { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS } from '../../constants/theme';

// Spinner (기본 로딩)
export function Spinner({ size = 'medium', color = COLORS.primary }) {
  return <ActivityIndicator size={size} color={color} />;
}

// 로딩 오버레이 (전체 화면)
export function LoadingOverlay({ visible, message = '로딩 중...' }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.overlayMessage}>{message}</Text>
      </View>
    </View>
  );
}

// Skeleton (콘텐츠 플레이스홀더)
export function Skeleton({ width, height, borderRadius = BORDER_RADIUS.md, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

// Skeleton 텍스트
export function SkeletonText({ lines = 3, lastLineWidth = '60%' }) {
  return (
    <View style={styles.skeletonTextContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={14}
          style={styles.skeletonLine}
        />
      ))}
    </View>
  );
}

// Skeleton 카드
export function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonCardHeader}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.skeletonCardHeaderText}>
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
      <SkeletonText lines={2} />
    </View>
  );
}

// Skeleton 리스트 아이템
export function SkeletonListItem() {
  return (
    <View style={styles.skeletonListItem}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.skeletonListContent}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayMessage: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },

  // Skeleton
  skeleton: {
    backgroundColor: COLORS.borderLight,
  },
  skeletonTextContainer: {
    gap: SPACING.sm,
  },
  skeletonLine: {
    marginBottom: SPACING.xs,
  },

  // Skeleton Card
  skeletonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  skeletonCardHeaderText: {
    marginLeft: SPACING.md,
    flex: 1,
  },

  // Skeleton List Item
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skeletonListContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
});
