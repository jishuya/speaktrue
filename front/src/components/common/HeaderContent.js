import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

// 아이콘이 있는 헤더 콘텐츠
export function HeaderWithIcon({ icon, title, subtitle, iconColor = COLORS.primary }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// AI 아바타가 있는 헤더 콘텐츠 (텍스트 아바타)
export function HeaderWithAvatar({ avatarText = 'AI', title, subtitle, showOnlineDot = false }) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{avatarText}</Text>
        {showOnlineDot && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primary}20`,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  textContainer: {
    marginLeft: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
});
