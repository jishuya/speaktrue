import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, PanResponder } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HomeScreen,
  EmpathyScreen,
  PerspectiveScreen,
  TransformScreen,
  HistoryScreen,
  PatternsScreen,
  SettingsScreen,
  LoginScreen,
  RecordingDetailScreen,
} from '../screens';
import { Icon } from '../components/ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const NAV_HEIGHT = 120; // 네비게이션 바 높이
const SWIPE_THRESHOLD = 30; // 스와이프 감지 임계값
const AUTO_HIDE_DELAY = 3000; // 자동 숨김 딜레이 (3초)

// 커스텀 탭 바 컴포넌트
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);
  const isHidden = useRef(false);

  // 네비게이션 보이기
  const showNav = () => {
    isHidden.current = false;
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
    isHidden.current = true;
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
  const handleNavigate = (routeName) => {
    resetHideTimer();
    navigation.navigate(routeName);
  };

  return (
    <>
      {/* 스와이프 감지 영역 (화면 하단) */}
      <View
        style={[styles.swipeArea, { bottom: insets.bottom }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.swipeIndicator} />
      </View>

      {/* 네비게이션 바 */}
      <Animated.View
        style={[
          styles.tabBarContainer,
          { paddingBottom: insets.bottom + SPACING.sm, transform: [{ translateY }] }
        ]}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            // 중앙 FAB 버튼 (Empathy)
            if (route.name === 'EmpathyTab') {
              return (
                <View key={route.key} style={styles.fabContainer}>
                  <TouchableOpacity
                    style={styles.fabButton}
                    onPress={() => handleNavigate('Empathy')}
                    activeOpacity={0.9}
                  >
                    <Icon name="favorite" size={32} color={COLORS.surface} />
                  </TouchableOpacity>
                  <Text style={styles.fabLabel}>털어놓기</Text>
                </View>
              );
            }

            // 일반 탭 아이템
            const getIconName = () => {
              switch (route.name) {
                case 'HomeTab': return 'home';
                case 'PatternsTab': return 'analytics';
                case 'TransformTab': return 'psychology';
                case 'HistoryTab': return 'history';
                default: return 'home';
              }
            };

            const getLabel = () => {
              switch (route.name) {
                case 'HomeTab': return '홈';
                case 'PatternsTab': return '패턴분석';
                case 'TransformTab': return '진심전달';
                case 'HistoryTab': return '기록';
                default: return '';
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={() => handleNavigate(route.name)}
                activeOpacity={0.7}
              >
                <Icon
                  name={getIconName()}
                  size={24}
                  color={isFocused ? COLORS.primary : COLORS.textMuted}
                />
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive
                ]}>
                  {getLabel()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </>
  );
}

// 빈 컴포넌트 (FAB 탭용 placeholder)
function EmptyScreen() {
  return null;
}

// 탭 네비게이터
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="PatternsTab" component={PatternsScreen} />
      <Tab.Screen
        name="EmpathyTab"
        component={EmptyScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Empathy');
          },
        })}
      />
      <Tab.Screen name="TransformTab" component={TransformScreen} />
      <Tab.Screen name="HistoryTab" component={HistoryScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: COLORS.backgroundLight,
          },
          animation: 'slide_from_right',
        }}
      >
        {/* Main Tabs */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Chat Screens */}
        <Stack.Screen
          name="Empathy"
          component={EmpathyScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Perspective"
          component={PerspectiveScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />

        {/* Settings Screen */}
        <Stack.Screen name="Settings" component={SettingsScreen} />

        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'fade' }}
        />

        {/* Recording Detail Screen */}
        <Stack.Screen name="RecordingDetail" component={RecordingDetailScreen} />

        {/* Transform Screen (NVC 변환) */}
        <Stack.Screen name="Transform" component={TransformScreen} />

        {/* History Screen */}
        <Stack.Screen name="History" component={HistoryScreen} />

        {/* Patterns Screen */}
        <Stack.Screen name="Patterns" component={PatternsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    height: 72,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  fabContainer: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  fabButton: {
    position: 'absolute',
    top: -48,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 24,
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
