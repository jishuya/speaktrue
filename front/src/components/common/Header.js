import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Icon, Logo } from '../ui';
import { COLORS, UI_COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

const PROFILE_IMAGE = require('../../assets/images/profile_female.png');

export default function Header({
  title,
  subtitle,
  label,
  showBack = false,
  showClose = false,
  showProfile = false,
  showLogo = false,
  rightIcon,
  rightIconBadge = false,
  onBackPress,
  onClosePress,
  onRightPress,
  onProfilePress,
  transparent = false,
  centerTitle = false,
  borderBottom = false,
  // HomeScreen 외의 화면에서 진한 배경색 사용
  darkBackground = false,
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
        {showLogo && (
          <View style={styles.logoContainer}>
            <Logo size={36} color={COLORS.primary} />
          </View>
        )}
        {!centerTitle && title && (
          <View style={[styles.titleContainer, (showBack || showLogo) && styles.titleWithBack]}>
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
          <Image source={PROFILE_IMAGE} style={styles.profileImage} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        transparent && styles.transparent,
        darkBackground && styles.darkBackground,
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
  darkBackground: {
    backgroundColor: UI_COLORS.headerDarkBg,
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
    width: 24,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoContainer: {
    marginRight: SPACING.xs,
  },
  titleContainer: {
    gap: 2,
  },
  titleWithBack: {
    marginLeft: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.xs,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
});
