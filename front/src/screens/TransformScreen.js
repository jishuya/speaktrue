import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
} from 'react-native';
import { Icon } from '../components/ui';
import { Header, Button } from '../components/common';
import { NvcResultBubble } from '../components/chat';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function TransformScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleTransform = () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    // API 호출 시뮬레이션
    setTimeout(() => {
      setResult({
        converted: '[관찰]제가 보기에 설거지가 아직 싱크대에 남아있는 것을 보면, [감정]마음이 좀 답답해요. 왜냐하면 [욕구]저는 우리가 함께 쓰는 공간이 잘 정돈되길 바라거든요. [부탁]혹시 잠자리에 들기 전에 설거지를 정리해 주실 수 있을까요?',
        analysis: {
          observation: '설거지가 싱크대에 남아있음',
          feeling: '답답함',
          need: '공간의 정돈, 협력',
          request: '잠자리 전 설거지 정리',
        },
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleCopy = () => {
    if (result) {
      const cleanText = result.converted.replace(/\[.*?\]/g, '');
      Clipboard.setString(cleanText);
      Alert.alert('복사 완료', '메시지가 클립보드에 복사되었습니다.');
    }
  };

  const handleKakaoShare = () => {
    Alert.alert('카카오톡 공유', '카카오톡 공유 기능은 준비 중입니다.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="TrueSpeak"
        showBack
        centerTitle
        darkBackground
        rightIcon="history"
        onBackPress={() => navigation.goBack()}
        onRightPress={() => navigation.navigate('History')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>지금 마음이 어떠신가요?</Text>
          <Text style={styles.subtitle}>갈등을 따뜻한 연결로 변화시켜 드려요</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputGlow} />
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="여기에 하고 싶은 말을 자유롭게 적어보세요. 아직 예의를 갖추지 않아도 괜찮습니다. 그저 솔직한 감정을 털어놓으세요."
            placeholderTextColor={COLORS.textMuted}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{inputText.length}/500</Text>
        </View>

        {/* Transform Button */}
        <TouchableOpacity
          style={[styles.transformButton, isLoading && styles.transformButtonDisabled]}
          onPress={handleTransform}
          disabled={isLoading || !inputText.trim()}
          activeOpacity={0.9}
        >
          <View style={styles.buttonShine} />
          <Icon name="auto-awesome" size={24} color={COLORS.surface} />
          <Text style={styles.transformButtonText}>
            {isLoading ? '변환 중...' : '부드럽게 변환하기'}
          </Text>
        </TouchableOpacity>

        {/* Result Section */}
        {result && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>NVC 제안 (비폭력 대화)</Text>
              <Icon name="psychology" size={18} color={`${COLORS.primary}60`} />
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultText}>
                <Text style={styles.textObservation}>제가 보기에</Text> 설거지가 아직 싱크대에 남아있는 것을 보면,{' '}
                <Text style={styles.textFeeling}>마음이 좀 답답해요.</Text> 왜냐하면{' '}
                <Text style={styles.textNeed}>저는 우리가 함께 쓰는 공간이</Text> 잘 정돈되길 바라거든요.{' '}
                <Text style={styles.textRequest}>혹시 잠자리에 들기 전에</Text> 설거지를 정리해 주실 수 있을까요?
              </Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
                <Icon name="content-copy" size={20} color={COLORS.textSecondary} />
                <Text style={styles.actionButtonText}>복사</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoShare}>
                <Icon name="chat-bubble" size={20} color={COLORS.kakaoText} />
                <Text style={styles.kakaoButtonText}>카카오톡 공유</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Explanation Accordion */}
        {result && (
          <TouchableOpacity
            style={styles.accordion}
            onPress={() => setShowExplanation(!showExplanation)}
            activeOpacity={0.8}
          >
            <View style={styles.accordionHeader}>
              <View style={styles.accordionLeft}>
                <View style={styles.accordionIcon}>
                  <Icon name="lightbulb" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.accordionTitle}>어떻게 바뀐 건가요?</Text>
              </View>
              <Icon
                name={showExplanation ? 'expand-less' : 'expand-more'}
                size={24}
                color={COLORS.textMuted}
              />
            </View>
            {showExplanation && (
              <View style={styles.accordionContent}>
                <Text style={styles.explanationText}>
                  작성하신 메시지에 <Text style={{ fontWeight: '700' }}>NVC(비폭력 대화) 모델</Text>을 적용했습니다:
                </Text>
                <View style={styles.explanationList}>
                  <ExplanationItem color="#5B8DEF" label="관찰 (Observation)" text="판단 없이 사실 그대로 말하기" />
                  <ExplanationItem color="#9B59B6" label="느낌 (Feeling)" text="비난이 아닌 내 감정을 표현하기" />
                  <ExplanationItem color="#2ECC71" label="욕구 (Need)" text="내가 진정으로 원하는 가치를 찾기" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function ExplanationItem({ color, label, text }) {
  return (
    <View style={styles.explanationItem}>
      <View style={[styles.explanationDot, { backgroundColor: color }]} />
      <Text style={styles.explanationItemText}>
        <Text style={{ fontWeight: '600' }}>{label}:</Text> {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  inputSection: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  inputGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BORDER_RADIUS.lg + 2,
    backgroundColor: `${COLORS.primary}20`,
    opacity: 0,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 160,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    lineHeight: 24,
    ...SHADOWS.sm,
  },
  charCount: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.md,
    fontSize: 11,  // 최소 라벨 크기
    color: COLORS.textMuted,
  },
  transformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  transformButtonDisabled: {
    opacity: 0.6,
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ skewX: '-20deg' }],
  },
  transformButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
    marginLeft: SPACING.sm,
  },
  resultSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
    marginBottom: SPACING.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  resultLabel: {
    fontSize: 11,  // 최소 라벨 크기
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultContent: {
    padding: SPACING.lg,
  },
  resultText: {
    fontSize: FONT_SIZE.lg,
    lineHeight: 28,
    color: COLORS.textPrimary,
  },
  textObservation: {
    color: '#1565C0',
    fontWeight: FONT_WEIGHT.medium,
  },
  textFeeling: {
    color: '#7B1FA2',
    fontWeight: FONT_WEIGHT.medium,
  },
  textNeed: {
    color: '#2E7D32',
    fontWeight: FONT_WEIGHT.medium,
  },
  textRequest: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  resultDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.lg,
  },
  resultActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.borderLight,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.md,  // 14px - 터치 가능 텍스트
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  kakaoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.kakao,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  kakaoButtonText: {
    fontSize: FONT_SIZE.md,  // 14px - 터치 가능 텍스트
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.kakaoText,
    marginLeft: SPACING.sm,
  },
  accordion: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  accordionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textSecondary,
  },
  accordionContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  explanationText: {
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  explanationList: {
    gap: SPACING.sm,
  },
  explanationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  explanationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  explanationItemText: {
    flex: 1,
    fontSize: FONT_SIZE.md,  // 14px - 본문 최소 크기
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
