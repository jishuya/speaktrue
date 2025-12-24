import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function HomeBottomBar({ navigation }) {
  const insets = useSafeAreaInsets();

  const navItems = [
    { name: 'Patterns', icon: 'analytics', label: '패턴분석' },
    { name: 'History', icon: 'history', label: '기록' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.sm }]}>
      <View style={styles.bar}>
        {/* 왼쪽 아이템들 */}
        {navItems.slice(0, 1).map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.name)}
            activeOpacity={0.7}
          >
            <Icon name={item.icon} size={24} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* 가운데 FAB 버튼 */}
        <View style={styles.fabWrapper}>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => navigation.navigate('Empathy')}
            activeOpacity={0.9}
          >
            <Icon name="favorite" size={28} color={COLORS.surface} />
          </TouchableOpacity>
          <Text style={styles.fabLabel}>털어놓기</Text>
        </View>

        {/* 오른쪽 아이템들 */}
        {navItems.slice(1).map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.name)}
            activeOpacity={0.7}
          >
            <Icon name={item.icon} size={24} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 72,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  navLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  fabWrapper: {
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    ...SHADOWS.lg,
  },
  fabLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 4,
  },
});
