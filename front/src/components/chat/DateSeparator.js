import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../constants/theme';
import { formatDateTimeRelative } from '../../utils';

/**
 * 채팅 날짜 구분선 컴포넌트
 * @param {Date|string|number} date - 표시할 날짜
 */
export default function DateSeparator({ date }) {
  const formattedDate = formatDateTimeRelative(date || new Date());

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{formattedDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    backgroundColor: `${COLORS.textPrimary}08`,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
});
