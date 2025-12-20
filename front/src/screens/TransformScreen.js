import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Icon } from '../components/ui';
import { Header, HeaderWithIcon } from '../components/common';
import { COLORS, NVC_COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import api from '../services/api';

export default function TransformScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // 반짝이 애니메이션
  const shimmerAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isLoading) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      shimmerAnim.setValue(0.4);
    }
  }, [isLoading, shimmerAnim]);

  const handleTransform = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.convertToNvc(inputText);
      setResult({
        converted: response.converted,
        analysis: response.analysis,
        tip: response.tip,
      });
    } catch (error) {
      console.error('NVC 변환 오류:', error);
      Alert.alert('변환 실패', '메시지 변환 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await Clipboard.setStringAsync(result.converted);
      Alert.alert('복사 완료', '메시지가 클립보드에 복사되었습니다.');
    }
  };

  const handleKakaoShare = () => {
    Alert.alert('카카오톡 공유', '카카오톡 공유 기능은 준비 중입니다.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <Header
        showBack
        borderBottom
        darkBackground
        onBackPress={() => navigation.goBack()}
        leftComponent={
          <HeaderWithIcon
            icon="psychology"
            title="진심 전달"
            subtitle="NVC 변환"
          />
        }
        rightIcon="help-outline"
        onRightPress={() => setShowHelpModal(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>상대방에게 어떤 말을 하고 싶으신가요?</Text>
          <Text style={styles.subtitle}>갈등을 따뜻한 연결로 변화시켜 드려요</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputGlow} pointerEvents="none" />
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="여기에 하고 싶은 말을 자유롭게 적어보세요. 아직 예의를 갖추지 않아도 괜찮습니다. 그저 솔직한 감정을 털어놓으세요."
            placeholderTextColor={COLORS.textMuted}
            multiline
            textAlignVertical="top"
            maxLength={500}
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
          {isLoading ? (
            <Animated.Text style={[styles.transformButtonText, { opacity: shimmerAnim }]}>
              ✨ 변환 중...
            </Animated.Text>
          ) : (
            <>
              <Icon name="auto-awesome" size={24} color={COLORS.surface} />
              <Text style={styles.transformButtonText}>부드럽게 변환하기</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Arrow Indicator */}
        {result && (
          <View style={styles.arrowContainer}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 4v12m0 0l-5-5m5 5l5-5"
                stroke={COLORS.primary}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        )}

        {/* Result Section */}
        {result && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>NVC 제안 (비폭력 대화)</Text>
              <Icon name="psychology" size={18} color={`${COLORS.primary}60`} />
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultText}>{result.converted}</Text>
            </View>
            {result.tip && (
              <View style={styles.tipContainer}>
                <Icon name="favorite" size={16} color={COLORS.primary} />
                <Text style={styles.tipText}>{result.tip}</Text>
              </View>
            )}
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
                  <ExplanationItem
                    color={NVC_COLORS.observation}
                    label="관찰"
                    text={result.analysis?.observation || '판단 없이 사실 그대로 말하기'}
                  />
                  <ExplanationItem
                    color={NVC_COLORS.feeling}
                    label="감정"
                    text={result.analysis?.feeling || '비난이 아닌 내 감정을 표현하기'}
                  />
                  <ExplanationItem
                    color={NVC_COLORS.need}
                    label="욕구"
                    text={result.analysis?.need || '내가 진정으로 원하는 가치를 찾기'}
                  />
                  <ExplanationItem
                    color={NVC_COLORS.request}
                    label="부탁"
                    text={result.analysis?.request || '구체적이고 실행 가능한 요청하기'}
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* NVC 도움말 모달 */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>NVC란 무엇인가요?</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Icon name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>
                <Text style={styles.modalBold}>NVC(Nonviolent Communication, 비폭력 대화)</Text>는
                마셜 로젠버그 박사가 개발한 대화 방식으로, 서로를 비난하거나 상처 주지 않으면서
                진심을 전달할 수 있도록 도와줍니다.
              </Text>

              <Text style={styles.modalSectionTitle}>NVC의 4단계</Text>

              <View style={styles.nvcStep}>
                <View style={[styles.nvcStepDot, { backgroundColor: NVC_COLORS.observation }]} />
                <View style={styles.nvcStepContent}>
                  <Text style={styles.nvcStepTitle}>1. 관찰 (Observation)</Text>
                  <Text style={styles.nvcStepText}>
                    판단 없이 있는 그대로의 상황을 말해요.{'\n'}
                    ❌ "넌 맨날 늦어"{'\n'}
                    ✅ "오늘 약속 시간보다 30분 늦게 왔어"
                  </Text>
                </View>
              </View>

              <View style={styles.nvcStep}>
                <View style={[styles.nvcStepDot, { backgroundColor: NVC_COLORS.feeling }]} />
                <View style={styles.nvcStepContent}>
                  <Text style={styles.nvcStepTitle}>2. 감정 (Feeling)</Text>
                  <Text style={styles.nvcStepText}>
                    상대방을 비난하지 않고 내 감정을 표현해요.{'\n'}
                    ❌ "너 때문에 짜증나"{'\n'}
                    ✅ "기다리면서 걱정이 됐어"
                  </Text>
                </View>
              </View>

              <View style={styles.nvcStep}>
                <View style={[styles.nvcStepDot, { backgroundColor: NVC_COLORS.need }]} />
                <View style={styles.nvcStepContent}>
                  <Text style={styles.nvcStepTitle}>3. 욕구 (Need)</Text>
                  <Text style={styles.nvcStepText}>
                    그 감정 뒤에 있는 진짜 원하는 것을 찾아요.{'\n'}
                    예: "나는 우리 시간이 소중하게 여겨지길 바라"
                  </Text>
                </View>
              </View>

              <View style={styles.nvcStep}>
                <View style={[styles.nvcStepDot, { backgroundColor: NVC_COLORS.request }]} />
                <View style={styles.nvcStepContent}>
                  <Text style={styles.nvcStepTitle}>4. 부탁 (Request)</Text>
                  <Text style={styles.nvcStepText}>
                    구체적이고 실행 가능한 요청을 해요.{'\n'}
                    ❌ "제발 좀 신경 써"{'\n'}
                    ✅ "다음엔 늦을 것 같으면 미리 연락해줄 수 있을까?"
                  </Text>
                </View>
              </View>

              <View style={styles.modalFooterNote}>
                <Icon name="favorite" size={16} color={COLORS.primary} />
                <Text style={styles.modalFooterText}>
                  NVC는 상대방을 바꾸려는 게 아니라, 서로의 마음을 연결하는 방법이에요.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    paddingBottom: 120,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.lg,
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
    fontSize: FONT_SIZE.xs,
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
    marginBottom: SPACING.md,
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
    fontSize: FONT_SIZE.xs,
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
    fontFamily: 'GamjaFlower',
    fontWeight: FONT_WEIGHT.bold,
  },
  arrowContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: SPACING.sm,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    color: COLORS.primary,
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
