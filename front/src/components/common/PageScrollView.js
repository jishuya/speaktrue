import React from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

export default function PageScrollView({
  children,
  style,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
  showsVerticalScrollIndicator = true,
  keyboardShouldPersistTaps = 'handled',
  bottomPadding = 100,
  horizontalPadding = true,
  ...props
}) {
  return (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={[
        styles.contentContainer,
        horizontalPadding && styles.horizontalPadding,
        { paddingBottom: bottomPadding },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        ) : undefined
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  horizontalPadding: {
    paddingHorizontal: SPACING.lg,
  },
});
