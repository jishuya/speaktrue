import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function ImagePickerModal({
  visible,
  onClose,
  onCamera,
  onGallery,
}) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.alertContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.alertTitle}>이미지 첨부</Text>
          <Text style={styles.alertMessage}>어떻게 이미지를 추가할까요?</Text>
          <View style={styles.confirmButtons}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                onClose();
                onCamera?.();
              }}
            >
              <Icon name="camera" size={18} color={COLORS.surface} style={styles.buttonIcon} />
              <Text style={styles.optionButtonText}>사진 촬영</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, styles.galleryButton]}
              onPress={() => {
                onClose();
                onGallery?.();
              }}
            >
              <Icon name="image" size={18} color={COLORS.surface} style={styles.buttonIcon} />
              <Text style={styles.optionButtonText}>앨범 선택</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
    zIndex: 1,
  },
  alertTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertMessage: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  confirmButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  galleryButton: {
    backgroundColor: COLORS.info,
  },
  buttonIcon: {
    marginRight: 2,
  },
  optionButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },
});
