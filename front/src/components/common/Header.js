import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

export default function Header({
  title,
  subtitle,
  showBack = false,
  showClose = false,
  rightIcon,
  rightIconBadge = false,
  onBackPress,
  onClosePress,
  onRightPress,
  transparent = false,
  centerTitle = false,
  style,
}) {
  return (
    <View style={[styles.container, transparent && styles.transparent, style]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        {!centerTitle && title && (
          <View style={styles.titleContainer}>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            <Text style={styles.title}>{title}</Text>
          </View>
        )}
      </View>

      {centerTitle && title && (
        <View style={styles.centerTitleContainer}>
          <Text style={styles.centerTitle}>{title}</Text>
        </View>
      )}

      <View style={styles.rightSection}>
        {rightIcon && (
          <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
            <Icon name={rightIcon} size={24} color={COLORS.textPrimary} />
            {rightIconBadge && <View style={styles.badge} />}
          </TouchableOpacity>
        )}
        {showClose && (
          <TouchableOpacity style={styles.iconButton} onPress={onClosePress}>
            <Icon name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.backgroundLight,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  titleContainer: {
    marginLeft: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  centerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentWarm,
  },
});
