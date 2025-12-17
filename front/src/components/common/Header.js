import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

const PROFILE_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuALGg4RghdltOox3ir7GSZ7t_iAwg6jzE1CXCAFsxTFncjZsR41Q8a6b6JQQpZFoTopU_tI0WHGAlqtyHMSgQonB0hMjb4X_9kr-IXUp2qVZlBAXB2HBjwkOZvRk5GDr9tLlyKgwvZ_v8-Iy_4oa8SyL43ga3vgCQLTDYW6VMonXLD8MCvNHDuTjNwdL-kjAnmmV3hZ_Q76cg7aud-8SYXI8lfg_FGFj0GaTMEgIx2-3MsXK3298_x4hymvHiPzLX2RdouZC9HWqY34';

export default function Header({
  title,
  subtitle,
  label,
  showBack = false,
  showClose = false,
  showProfile = false,
  rightIcon,
  rightIconBadge = false,
  onBackPress,
  onClosePress,
  onRightPress,
  onProfilePress,
  transparent = false,
  centerTitle = false,
  borderBottom = false,
  // 커스텀 좌측 컴포넌트 (AI 아바타 등)
  leftComponent,
  style,
}) {
  const renderLeftSection = () => {
    // 커스텀 좌측 컴포넌트가 있으면 그것을 렌더링
    if (leftComponent) {
      return (
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
              <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          {leftComponent}
        </View>
      );
    }

    return (
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        {!centerTitle && title && (
          <View style={[styles.titleContainer, showBack && styles.titleWithBack]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>
    );
  };

  const renderRightSection = () => (
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
      {showProfile && (
        <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
          <Image source={{ uri: PROFILE_IMAGE_URL }} style={styles.profileImage} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        transparent && styles.transparent,
        borderBottom && styles.borderBottom,
        style,
      ]}
    >
      {renderLeftSection()}

      {centerTitle && title && (
        <View style={styles.centerTitleContainer}>
          <Text style={styles.centerTitle}>{title}</Text>
        </View>
      )}

      {renderRightSection()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primary}05`,
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
    gap: 2,
  },
  titleWithBack: {
    marginLeft: SPACING.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  centerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
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
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
});
