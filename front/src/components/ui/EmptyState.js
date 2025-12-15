import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS } from '../../constants/theme';
import Button from './Button';

export default function EmptyState({
  icon = 'inbox',
  title = '데이터가 없습니다',
  description,
  actionLabel,
  onAction,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={48} color={COLORS.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          variant="secondary"
          size="sm"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

// 검색 결과 없음
export function NoSearchResult({ searchTerm, onClear }) {
  return (
    <EmptyState
      icon="search-off"
      title="검색 결과가 없습니다"
      description={searchTerm ? `'${searchTerm}'에 대한 결과를 찾을 수 없습니다.` : undefined}
      actionLabel={onClear ? '검색어 지우기' : undefined}
      onAction={onClear}
    />
  );
}

// 에러 상태
export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon="error-outline"
      title="오류가 발생했습니다"
      description={message || '잠시 후 다시 시도해주세요.'}
      actionLabel={onRetry ? '다시 시도' : undefined}
      onAction={onRetry}
    />
  );
}

// 네트워크 오류
export function NetworkError({ onRetry }) {
  return (
    <EmptyState
      icon="wifi-off"
      title="네트워크 연결 오류"
      description="인터넷 연결을 확인해주세요."
      actionLabel="다시 시도"
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  button: {
    marginTop: SPACING.sm,
  },
});
