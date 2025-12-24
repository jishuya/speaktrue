import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import Icon from './Icon';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS, SHADOWS, Z_INDEX } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 기본 모달
export default function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  scrollable = false,
  maxHeight = SCREEN_HEIGHT * 0.7,
}) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, scrollable && { maxHeight }]}>
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                  {showCloseButton && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Icon name="close" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {scrollable ? (
                <ScrollView
                  style={styles.scrollContent}
                  contentContainerStyle={styles.scrollContentContainer}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
              ) : (
                <View style={styles.content}>{children}</View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

// Alert 모달
export function AlertModal({
  visible,
  onClose,
  title = '알림',
  message,
  confirmText = '확인',
  type = 'info', // 'info' | 'success' | 'warning' | 'error'
}) {
  const iconMap = {
    info: { name: 'info', color: COLORS.info },
    success: { name: 'check-circle', color: COLORS.success },
    warning: { name: 'warning', color: COLORS.warning },
    error: { name: 'error', color: COLORS.error },
  };
  const icon = iconMap[type];

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.alertContainer}>
          <View style={[styles.iconCircle, { backgroundColor: `${icon.color}15` }]}>
            <Icon name={icon.name} size={26} color={icon.color} />
          </View>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity style={styles.alertButton} onPress={onClose}>
            <Text style={styles.alertButtonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RNModal>
  );
}

// Confirm 모달
export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmType = 'primary', // 'primary' | 'danger'
}) {
  const confirmColor = confirmType === 'danger' ? COLORS.error : COLORS.primary;

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <View style={styles.confirmButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: confirmColor }]}
              onPress={() => {
                onConfirm?.();
                onClose();
              }}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}

// Session Feedback 모달 (세션 종료 시 해결/미해결 피드백)
export function SessionFeedbackModal({
  visible,
  onClose,
  onResolve,
  onUnresolve,
  isLoading = false,
  title = '오늘 대화가 도움이 되셨나요?',
  resolveText = '마음이 정리됐어요',
  unresolveText = '아직 복잡해요',
}) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.feedbackContainer}>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[styles.feedbackTitle, { marginTop: SPACING.md }]}>준비 중...</Text>
            </>
          ) : (
            <>
              <View style={[styles.iconCircle, { backgroundColor: `${COLORS.primary}15` }]}>
                <Icon name="favorite" size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.feedbackTitle}>{title}</Text>
              <Text style={styles.feedbackSubtitle}>
                다음 대화에 도움이 될 수 있어요
              </Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  style={styles.feedbackButton}
                  onPress={onResolve}
                >
                  <Icon name="sentiment-satisfied" size={24} color={COLORS.success} />
                  <Text style={styles.feedbackButtonText}>{resolveText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.feedbackButton}
                  onPress={onUnresolve}
                >
                  <Icon name="sentiment-dissatisfied" size={24} color={COLORS.warning} />
                  <Text style={styles.feedbackButtonText}>{unresolveText}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  container: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  scrollContent: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },

  // Alert & Confirm
  alertContainer: {
    width: '85%',
    maxWidth: 280,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  alertTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  alertMessage: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  alertButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  alertButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },

  // Confirm buttons
  confirmButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.xs,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.borderLight,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },

  // Session Feedback styles
  feedbackContainer: {
    width: '85%',
    maxWidth: 280,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  feedbackTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  feedbackSubtitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  feedbackButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  feedbackButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});
