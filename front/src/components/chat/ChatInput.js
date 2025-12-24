import { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, ActivityIndicator, Image, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, ImagePickerModal } from '../ui';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS, FONT_FAMILY, FONT_WEIGHT } from '../../constants/theme';
import { useSpeechRecognition, useImagePicker } from '../../hooks';

const MIN_HEIGHT = 44;

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  onAttach,
  attachedImage,
  onRemoveImage,
  placeholder = '감정을 입력해 주세요...',
  disabled = false,
  isLoading = false,
  showAttach = true,
  showVoice = true,
  maxHeight = 100,
}) {
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // 키보드 상태 감지
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideListener = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const isDisabled = disabled || isLoading;

  // 음성 인식 훅
  const { isListening, toggleListening } = useSpeechRecognition({
    onResult: (text) => {
      // 기존 텍스트에 음성 인식 결과 추가
      const newText = value ? `${value} ${text}` : text;
      onChangeText?.(newText);
    },
  });

  // 이미지 첨부 훅
  const { pickImage, takePhoto, showImageOptions, hideImageOptions, isModalVisible } = useImagePicker({
    onImageSelected: (image) => {
      onAttach?.(image);
    },
  });

  // 텍스트가 비어있으면 높이를 초기화
  useEffect(() => {
    if (!value || value.length === 0) {
      setInputHeight(MIN_HEIGHT);
    }
  }, [value]);

  const handleSend = () => {
    if (value?.trim() && !isDisabled) {
      onSend?.(value.trim());
      Keyboard.dismiss();
    }
  };

  const handleContentSizeChange = (event) => {
    const height = event.nativeEvent.contentSize.height;
    setInputHeight(Math.min(Math.max(MIN_HEIGHT, height), maxHeight));
  };

  const handleKeyPress = (event) => {
    // Enter 키 누르면 전송 (Shift+Enter는 줄바꿈)
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      event.preventDefault?.();
      handleSend();
    }
  };

  // 이미지가 있거나 텍스트가 있으면 전송 가능
  const canSend = (value?.trim().length > 0 || attachedImage) && !isDisabled;
  // 이미지만 있고 텍스트가 없으면 전송 불가 (텍스트 필수)
  const canActuallySend = value?.trim().length > 0 && !isDisabled;

  // 키보드가 보이면 bottom inset 제거 (키보드가 이미 공간 차지)
  const bottomPadding = isKeyboardVisible ? SPACING.sm : SPACING.sm + insets.bottom;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {/* 첨부된 이미지 미리보기 */}
      {attachedImage && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreviewWrapper}>
            <Image source={{ uri: attachedImage.uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={onRemoveImage}
            >
              <Icon name="close" size={16} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.imageHint}>이미지와 함께 메시지를 입력해주세요</Text>
        </View>
      )}

      <View style={styles.inputWrapper}>
        {showAttach && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={showImageOptions}
            disabled={isDisabled}
          >
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
          editable={!isDisabled}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
          onKeyPress={handleKeyPress}
        />

        {showVoice && !canSend && (
          <TouchableOpacity
            style={[styles.iconButton, isListening && styles.iconButtonActive]}
            onPress={toggleListening}
            disabled={isDisabled}
          >
            <Icon
              name="mic"
              size={24}
              color={isListening ? COLORS.error : COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.sendButton, canActuallySend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canActuallySend || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.textMuted} />
          ) : (
            <Icon
              name="send"
              size={20}
              color={canActuallySend ? COLORS.surface : COLORS.textMuted}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* 이미지 첨부 모달 */}
      <ImagePickerModal
        visible={isModalVisible}
        onClose={hideImageOptions}
        onCamera={takePhoto}
        onGallery={pickImage}
      />
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
  // 이미지 미리보기
  imagePreviewContainer: {
    marginBottom: SPACING.sm,
  },
  imagePreviewWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.lg,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageHint: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
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
    borderRadius: 20,
  },
  iconButtonActive: {
    backgroundColor: `${COLORS.error}15`,
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
