import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS, SHADOWS, Z_INDEX } from '../../constants/theme';

// Toast Context
const ToastContext = createContext(null);

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback(({ type = 'info', message, duration = 3000 }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const hide = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    show,
    success: (message, duration) => show({ type: 'success', message, duration }),
    error: (message, duration) => show({ type: 'error', message, duration }),
    warning: (message, duration) => show({ type: 'warning', message, duration }),
    info: (message, duration) => show({ type: 'info', message, duration }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onHide={() => hide(t.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// Toast Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Toast Item
function ToastItem({ type, message, duration, onHide }) {
  const translateY = useState(new Animated.Value(-100))[0];
  const opacity = useState(new Animated.Value(0))[0];

  const config = {
    success: { icon: 'check-circle', bg: COLORS.success, color: '#FFFFFF' },
    error: { icon: 'error', bg: COLORS.error, color: '#FFFFFF' },
    warning: { icon: 'warning', bg: COLORS.warning, color: '#000000' },
    info: { icon: 'info', bg: COLORS.info, color: '#FFFFFF' },
  }[type];

  useEffect(() => {
    // 들어오는 애니메이션
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 자동 숨김
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: config.bg },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <MaterialIcons name={config.icon} size={20} color={config.color} />
      <Text style={[styles.message, { color: config.color }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: Z_INDEX.toast,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.lg,
    maxWidth: '90%',
  },
  message: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    marginLeft: SPACING.sm,
    flexShrink: 1,
  },
});
