import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, PanResponder } from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

const NAV_ITEMS = [
  { key: 'Home', icon: 'home', label: '홈' },
  { key: 'History', icon: 'history', label: '기록' },
  { key: 'Settings', icon: 'settings', label: '설정' },
];

const NAV_HEIGHT = 120; // 네비게이션 바 높이
const SWIPE_THRESHOLD = 30; // 스와이프 감지 임계값
const AUTO_HIDE_DELAY = 3000; // 자동 숨김 딜레이 (3초)

export default function BottomNav({ currentRoute, onNavigate, showCenterButton = true }) {
  const translateY = useRef(new Animated.Value(NAV_HEIGHT)).current;
  const hideTimer = useRef(null);

  // 네비게이션 보이기
  const showNav = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
    resetHideTimer();
  };

  // 네비게이션 숨기기
  const hideNav = () => {
    Animated.spring(translateY, {
      toValue: NAV_HEIGHT,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
    clearHideTimer();
  };

  // 자동 숨김 타이머 리셋
  const resetHideTimer = () => {
    clearHideTimer();
    hideTimer.current = setTimeout(() => {
      hideNav();
    }, AUTO_HIDE_DELAY);
  };

  // 타이머 클리어
  const clearHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => clearHideTimer();
  }, []);

  // 스와이프 감지
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 위로 스와이프 감지 (화면 하단에서)
        return gestureState.dy < -10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -SWIPE_THRESHOLD) {
          showNav();
        }
      },
    })
  ).current;

  // 네비게이션 아이템 클릭 시 타이머 리셋
  const handleNavigate = (screen) => {
    resetHideTimer();
    onNavigate(screen);
  };

  return (
    <>
      {/* 스와이프 감지 영역 (화면 하단) */}
      <View
        style={styles.swipeArea}
        {...panResponder.panHandlers}
      >
        <View style={styles.swipeIndicator} />
      </View>

      {/* 네비게이션 바 */}
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY }] }
        ]}
      >
        <View style={styles.navBar}>
          {NAV_ITEMS.map((item, index) => {
            // 중앙 버튼 위치에 플레이스홀더 추가
            if (showCenterButton && index === 1) {
              return (
                <React.Fragment key={item.key}>
                  <NavItem
                    item={item}
                    isActive={currentRoute === item.key}
                    onPress={() => handleNavigate(item.key)}
                  />
                  <View style={styles.centerButtonPlaceholder} />
                </React.Fragment>
              );
            }
            return (
              <NavItem
                key={item.key}
                item={item}
                isActive={currentRoute === item.key}
                onPress={() => handleNavigate(item.key)}
              />
            );
          })}
        </View>

        {showCenterButton && (
          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => handleNavigate('Empathy')}
            activeOpacity={0.8}
          >
            <Icon name="edit" size={28} color={COLORS.surface} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </>
  );
}

function NavItem({ item, isActive, onPress }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <Icon
        name={item.icon}
        size={26}
        color={isActive ? COLORS.primary : COLORS.textMuted}
      />
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.nav,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  navLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  centerButtonPlaceholder: {
    width: 60,
  },
  centerButton: {
    position: 'absolute',
    bottom: SPACING.lg + 20,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  swipeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
    opacity: 0.3,
  },
});
