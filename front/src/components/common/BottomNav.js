import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

const NAV_ITEMS = [
  { key: 'Home', icon: 'home', label: '홈' },
  { key: 'History', icon: 'history', label: '기록' },
  { key: 'Settings', icon: 'settings', label: '설정' },
];

export default function BottomNav({ currentRoute, onNavigate, showCenterButton = true }) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item, index) => {
          // 중앙 버튼 위치에 플레이스홀더 추가
          if (showCenterButton && index === 1) {
            return (
              <React.Fragment key={item.key}>
                <NavItem
                  item={item}
                  isActive={currentRoute === item.key}
                  onPress={() => onNavigate(item.key)}
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
              onPress={() => onNavigate(item.key)}
            />
          );
        })}
      </View>

      {showCenterButton && (
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => onNavigate('Empathy')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="edit" size={28} color={COLORS.surface} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function NavItem({ item, isActive, onPress }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <MaterialIcons
        name={isActive ? item.icon : `${item.icon}`}
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
});
