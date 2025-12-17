import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../constants/theme';

export default function Avatar({
  source,
  name,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showOnlineStatus = false,
  isOnline = false,
  showBorder = false,
  style,
}) {
  const sizeStyles = {
    sm: { width: 32, height: 32, borderRadius: 16 },
    md: { width: 40, height: 40, borderRadius: 20 },
    lg: { width: 48, height: 48, borderRadius: 24 },
    xl: { width: 80, height: 80, borderRadius: 40 },
  };

  const statusSize = {
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
  };

  const fontSize = {
    sm: FONT_SIZE.xs,
    md: FONT_SIZE.sm,
    lg: FONT_SIZE.base,
    xl: FONT_SIZE.xxl,
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.split(' ');
    return words.map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.avatarContainer,
          sizeStyles[size],
          showBorder && styles.bordered,
        ]}
      >
        {source ? (
          <Image source={source} style={[styles.image, sizeStyles[size]]} />
        ) : (
          <View style={[styles.placeholder, sizeStyles[size]]}>
            <Text style={[styles.initials, { fontSize: fontSize[size] }]}>
              {getInitials(name)}
            </Text>
          </View>
        )}
      </View>
      {showOnlineStatus && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusSize[size],
              height: statusSize[size],
              borderRadius: statusSize[size] / 2,
              backgroundColor: isOnline ? COLORS.online : COLORS.offline,
            },
          ]}
        />
      )}
    </View>
  );
}

// AI 아바타 (특별 스타일)
export function AIAvatar({ size = 'md', style }) {
  const sizeStyles = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
  };

  return (
    <View style={[styles.aiAvatarContainer, sizeStyles[size], style]}>
      <View style={[styles.aiAvatar, sizeStyles[size]]}>
        <Text style={styles.aiAvatarText}>AI</Text>
      </View>
      <View style={styles.aiStatusDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatarContainer: {
    overflow: 'hidden',
    backgroundColor: COLORS.primaryBg,
  },
  bordered: {
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  // AI Avatar
  aiAvatarContainer: {
    position: 'relative',
  },
  aiAvatar: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primary}30`,
  },
  aiAvatarText: {
    fontSize: FONT_SIZE.md,  // 14px - 아바타 내 텍스트
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  aiStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
});
