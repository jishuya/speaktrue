import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS } from '../../constants/theme';

// 기본 텍스트 입력
export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  disabled = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  style,
  inputStyle,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const borderColor = error
    ? COLORS.error
    : isFocused
    ? COLORS.primary
    : COLORS.borderLight;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          { borderColor },
          disabled && styles.disabled,
          multiline && { height: 'auto', minHeight: numberOfLines * 24 + SPACING.md * 2 },
        ]}
      >
        {leftIcon && (
          <Icon name={leftIcon} size={20} color={COLORS.textMuted} style={styles.leftIcon} />
        )}
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          editable={!disabled}
          secureTextEntry={isSecure}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.rightIcon}>
            <Icon
              name={isSecure ? 'visibility-off' : 'visibility'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Icon name={rightIcon} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {(error || helper) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
}

// 체크박스
export function Checkbox({ checked, onChange, label, disabled = false }) {
  return (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
        ]}
      >
        {checked && <Icon name="check" size={16} color={COLORS.surface} />}
      </View>
      {label && (
        <Text style={[styles.checkboxLabel, disabled && styles.labelDisabled]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// 라디오 버튼
export function Radio({ selected, onChange, label, disabled = false }) {
  return (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={() => !disabled && onChange?.()}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.radio, disabled && styles.radioDisabled]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      {label && (
        <Text style={[styles.radioLabel, disabled && styles.labelDisabled]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// 라디오 그룹
export function RadioGroup({ options, value, onChange, disabled = false }) {
  return (
    <View style={styles.radioGroup}>
      {options.map((option) => (
        <Radio
          key={option.value}
          selected={value === option.value}
          onChange={() => onChange?.(option.value)}
          label={option.label}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Input
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
  },
  disabled: {
    backgroundColor: COLORS.borderLight,
    opacity: 0.7,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  helperText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxDisabled: {
    backgroundColor: COLORS.borderLight,
    borderColor: COLORS.border,
  },
  checkboxLabel: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },

  // Radio
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  radioDisabled: {
    borderColor: COLORS.border,
  },
  radioLabel: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  radioGroup: {
    gap: SPACING.sm,
  },
  labelDisabled: {
    color: COLORS.textMuted,
  },
});
