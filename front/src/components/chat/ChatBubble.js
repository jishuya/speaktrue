import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AIAvatar } from '../common/Avatar';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

export default function ChatBubble({
  message,
  isUser = false,
  showAvatar = true,
  timestamp,
  isRead = false,
  coachLabel,
}) {
  if (isUser) {
    return (
      <View style={styles.userContainer}>
        <View style={styles.userBubbleWrapper}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{message}</Text>
          </View>
          {timestamp && (
            <Text style={styles.timestamp}>
              {isRead ? `읽음 ${timestamp}` : timestamp}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiContainer}>
      {showAvatar && (
        <View style={styles.avatarWrapper}>
          <AIAvatar size="sm" />
        </View>
      )}
      <View style={[styles.aiBubbleWrapper, !showAvatar && styles.noAvatarOffset]}>
        {coachLabel && (
          <View style={styles.coachLabelContainer}>
            <Text style={styles.coachLabel}>{coachLabel}</Text>
          </View>
        )}
        <View style={styles.aiBubble}>
          <Text style={styles.aiText}>{message}</Text>
        </View>
      </View>
    </View>
  );
}

// NVC 분석 결과를 보여주는 특수 버블
export function NvcResultBubble({ original, converted, analysis }) {
  return (
    <View style={styles.nvcContainer}>
      <View style={styles.nvcHeader}>
        <Text style={styles.nvcLabel}>NVC 제안 (비폭력 대화)</Text>
      </View>
      <View style={styles.nvcContent}>
        <Text style={styles.nvcText}>
          {converted.split(/(\[.*?\])/).map((part, index) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              const colorMap = {
                '[관찰]': COLORS.info,
                '[감정]': '#9B59B6',
                '[욕구]': COLORS.success,
                '[부탁]': COLORS.primary,
              };
              return (
                <Text key={index} style={{ color: colorMap[part] || COLORS.primary, fontWeight: '500' }}>
                  {part}
                </Text>
              );
            }
            return part;
          })}
        </Text>
      </View>
      {analysis && (
        <View style={styles.nvcAnalysis}>
          <View style={styles.nvcDivider} />
          {analysis.observation && (
            <AnalysisItem color="#5B8DEF" label="관찰" text={analysis.observation} />
          )}
          {analysis.feeling && (
            <AnalysisItem color="#9B59B6" label="감정" text={analysis.feeling} />
          )}
          {analysis.need && (
            <AnalysisItem color="#2ECC71" label="욕구" text={analysis.need} />
          )}
          {analysis.request && (
            <AnalysisItem color={COLORS.primary} label="부탁" text={analysis.request} />
          )}
        </View>
      )}
    </View>
  );
}

function AnalysisItem({ color, label, text }) {
  return (
    <View style={styles.analysisItem}>
      <View style={[styles.analysisDot, { backgroundColor: color }]} />
      <Text style={styles.analysisText}>
        <Text style={{ fontWeight: '600' }}>{label}:</Text> {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // User Bubble
  userContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  userBubbleWrapper: {
    maxWidth: '80%',
    alignItems: 'flex-end',
  },
  userBubble: {
    backgroundColor: COLORS.bubbleUser,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: 4,
    ...SHADOWS.md,
  },
  userText: {
    color: COLORS.surface,
    fontSize: FONT_SIZE.base,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,  // 최소 라벨 크기
    color: COLORS.textMuted,
    marginTop: 4,
    marginRight: 4,
  },

  // AI Bubble
  aiContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  avatarWrapper: {
    marginRight: SPACING.sm,
    marginBottom: 4,
  },
  aiBubbleWrapper: {
    maxWidth: '85%',
  },
  noAvatarOffset: {
    marginLeft: 48, // avatar width + margin
  },
  coachLabelContainer: {
    marginBottom: 4,
    marginLeft: 4,
  },
  coachLabel: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  aiBubble: {
    backgroundColor: COLORS.bubbleAi,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 4,
    ...SHADOWS.sm,
  },
  aiText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.base,
    lineHeight: 22,
  },

  // NVC Result Bubble
  nvcContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
    marginVertical: SPACING.md,
  },
  nvcHeader: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  nvcLabel: {
    fontSize: 11,  // 최소 라벨 크기
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nvcContent: {
    padding: SPACING.lg,
  },
  nvcText: {
    fontSize: FONT_SIZE.lg,
    lineHeight: 28,
    color: COLORS.textPrimary,
  },
  nvcAnalysis: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  nvcDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  analysisDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  analysisText: {
    flex: 1,
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
