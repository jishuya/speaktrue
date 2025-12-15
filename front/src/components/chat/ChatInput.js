import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { Icon } from '../ui';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  onAttach,
  onVoice,
  placeholder = '감정을 입력해 주세요...',
  disabled = false,
  showAttach = true,
  showVoice = true,
  maxHeight = 100,
}) {
  const [inputHeight, setInputHeight] = useState(44);

  const handleSend = () => {
    if (value?.trim() && !disabled) {
      onSend?.(value.trim());
      Keyboard.dismiss();
    }
  };

  const handleContentSizeChange = (event) => {
    const height = event.nativeEvent.contentSize.height;
    setInputHeight(Math.min(Math.max(44, height), maxHeight));
  };

  const canSend = value?.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        {showAttach && (
          <TouchableOpacity style={styles.iconButton} onPress={onAttach}>
            <Icon name="add-circle-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.input, { height: inputHeight }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          multiline
          onContentSizeChange={handleContentSizeChange}
          editable={!disabled}
        />

        {showVoice && !canSend && (
          <TouchableOpacity style={styles.iconButton} onPress={onVoice}>
            <Icon name="mic" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Icon
            name="send"
            size={20}
            color={canSend ? COLORS.surface : COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 플로팅 액션 버튼 (관점 전환 버튼 등)
export function FloatingActionButton({ label, icon, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.fab, style]} onPress={onPress} activeOpacity={0.9}>
      <Icon name={icon} size={20} color={COLORS.primary} />
      <View style={styles.fabTextContainer}>
        <Icon name={icon} size={20} color={COLORS.primary} style={styles.fabIcon} />
        <View style={styles.fabLabel}>
          <Icon name="visibility" size={18} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// 상대방 관점 보기 버튼
export function PerspectiveButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.perspectiveButton} onPress={onPress} activeOpacity={0.9}>
      <Icon name="visibility" size={20} color={COLORS.primary} />
      <View style={styles.perspectiveText}>
        <Icon name="visibility" size={18} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.primary}10`,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xxl,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: `${COLORS.primary}10`,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.borderLight,
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.md,
  },

  // Floating Action Button
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  fabIcon: {
    marginRight: SPACING.sm,
  },
  fabTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  // Perspective Button
  perspectiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
    gap: SPACING.sm,
  },
  perspectiveText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
