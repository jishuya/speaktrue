import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../constants/theme';

export default function StatusBadge({ status = 'resolved', label }) {
  const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.resolved;
  const defaultLabels = {
    resolved: '해결',
    unresolved: '미해결',
    danger: '위험',
  };

  return (
    <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
      <Text style={[styles.text, { color: statusConfig.text }]}>
        {label || defaultLabels[status] || status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  text: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
});
