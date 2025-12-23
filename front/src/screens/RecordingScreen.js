import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Icon, AlertModal, ConfirmModal } from '../components/ui';
import { Header, EmotionBadge } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, FONT_FAMILY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { API_URL } from '../constants/config';
import { api } from '../services';

export default function RecordingScreen({ navigation }) {
  // 녹음 상태
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // 재생 상태
  const [recordedUri, setRecordedUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // 변환/분석 상태
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [emotions, setEmotions] = useState([]);

  // 모달 상태
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ visible: false, title: '', message: '', onConfirm: null, confirmType: 'primary' });

  // Refs
  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 날짜 포맷팅
  const formatDate = () => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  };

  // 녹음 시작
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setAlertModal({ visible: true, title: '권한 필요', message: '녹음을 위해 마이크 권한이 필요합니다.', type: 'warning' });
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);
      setRecordedUri(null);
      setTranscripts([]);
      setAiInsight(null);
      setEmotions([]);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('녹음 시작 오류:', error);
      setAlertModal({ visible: true, title: '오류', message: '녹음을 시작할 수 없습니다.', type: 'error' });
    }
  };

  // 녹음 일시정지/재개
  const togglePauseRecording = async () => {
    try {
      if (!recordingRef.current) return;

      if (isPaused) {
        await recordingRef.current.startAsync();
        timerRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
      } else {
        await recordingRef.current.pauseAsync();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    } catch (error) {
      console.error('일시정지 오류:', error);
    }
  };

  // 녹음 중지
  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      if (timerRef.current) clearInterval(timerRef.current);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      setRecordedUri(uri);
      setIsRecording(false);
      setIsPaused(false);
      setPlaybackDuration(recordingDuration);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      recordingRef.current = null;
    } catch (error) {
      console.error('녹음 중지 오류:', error);
    }
  };

  // 재생
  const togglePlayback = async () => {
    try {
      if (!recordedUri) return;

      if (isPlaying) {
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
        }
        setIsPlaying(false);
      } else {
        if (soundRef.current) {
          await soundRef.current.playAsync();
        } else {
          const { sound } = await Audio.Sound.createAsync(
            { uri: recordedUri },
            { shouldPlay: true },
            onPlaybackStatusUpdate
          );
          soundRef.current = sound;
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('재생 오류:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackPosition(Math.floor(status.positionMillis / 1000));
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  };

  // 녹음 삭제 (초기화)
  const resetRecording = () => {
    setConfirmModal({
      visible: true,
      title: '녹음 삭제',
      message: '현재 녹음을 삭제하고 새로 시작하시겠습니까?',
      confirmType: 'danger',
      onConfirm: async () => {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        setRecordedUri(null);
        setPlaybackPosition(0);
        setPlaybackDuration(0);
        setRecordingDuration(0);
        setTranscripts([]);
        setSessionId(null);
        setAiInsight(null);
        setEmotions([]);
      },
    });
  };

  // 서버에 업로드 및 STT 변환
  const uploadAndTranscribe = async () => {
    if (!recordedUri) return;

    setIsUploading(true);

    try {
      const base64Audio = await readAsStringAsync(recordedUri, {
        encoding: 'base64',
      });

      const response = await fetch(`${API_URL}/api/recording/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Audio,
          filename: 'recording.m4a',
          duration: playbackDuration,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTranscripts(result.transcripts || []);
        setSessionId(result.sessionId);
        setAlertModal({ visible: true, title: '변환 완료', message: '음성이 텍스트로 변환되었습니다.', type: 'success' });
      } else {
        setAlertModal({ visible: true, title: '오류', message: result.error || '변환에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      setAlertModal({ visible: true, title: '오류', message: '서버 연결에 실패했습니다.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // AI 분석
  const analyzeConversation = async () => {
    if (transcripts.length === 0) {
      setAlertModal({ visible: true, title: '알림', message: '먼저 녹음을 업로드하여 대화 내용을 변환해주세요.', type: 'info' });
      return;
    }

    if (!sessionId) {
      setAlertModal({ visible: true, title: '오류', message: '세션 정보가 없습니다. 다시 업로드해주세요.', type: 'error' });
      return;
    }

    setIsAnalyzing(true);

    try {
      // api.analyzeRecording 사용 (sessions, session_summaries, session_tags에 저장)
      const result = await api.analyzeRecording(sessionId);

      if (result.success && result.analysis) {
        const analysis = result.analysis;

        // AI 인사이트 텍스트 구성
        const insightText = [
          `📌 핵심 갈등: ${analysis.rootCause}`,
          '',
          `📝 요약: ${analysis.summary}`,
          '',
          `💭 나의 충족되지 못한 욕구: ${analysis.myUnmetNeed}`,
          '',
          `👤 상대방의 충족되지 못한 욕구: ${analysis.partnerUnmetNeed}`,
          '',
          `🔄 갈등 패턴: ${analysis.conflictPattern}`,
          '',
          `💡 제안: ${analysis.suggestedApproach}`,
          '',
          analysis.actionItems?.length > 0 ? `✅ 실천 항목:\n${analysis.actionItems.map(item => `• ${item}`).join('\n')}` : '',
        ].filter(Boolean).join('\n');

        setAiInsight(insightText);

        // 감정 태그 설정 (분석 결과에서 가져옴)
        const detectedEmotions = analysis.myEmotions?.slice(0, 4) || [];
        if (detectedEmotions.length === 0) detectedEmotions.push('분석 완료');
        setEmotions(detectedEmotions);
      } else {
        setAlertModal({ visible: true, title: '오류', message: result.error || 'AI 분석에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      console.error('분석 오류:', error);
      setAlertModal({ visible: true, title: '오류', message: 'AI 분석에 실패했습니다.', type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    if (isRecording || recordedUri) {
      setConfirmModal({
        visible: true,
        title: '나가기',
        message: '현재 녹음 내용이 저장되지 않습니다. 나가시겠습니까?',
        confirmType: 'danger',
        onConfirm: () => navigation.goBack(),
      });
    } else {
      navigation.goBack();
    }
  };

  // 대화 데이터 변환
  const conversationData = transcripts.map((item, index) => ({
    id: item.id || index,
    speaker: item.speaker,
    name: item.speaker === 'me' ? '나' : 'A',
    message: item.content,
    time: formatTime(item.startTime || 0),
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header
        title="대화 녹음"
        showBack
        centerTitle
        darkBackground
        onBackPress={handleBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* 날짜 */}
        <Text style={styles.dateText}>
          {formatDate()} • {formatTime(recordedUri ? playbackDuration : recordingDuration)}
        </Text>

        {/* 녹음/재생 카드 */}
        <View style={styles.audioCard}>
          <View style={styles.audioHeader}>
            {/* 메인 버튼 */}
            {!isRecording && !recordedUri ? (
              // 초기 상태 - 녹음 시작
              <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                <Icon name="mic" size={28} color={COLORS.surface} />
              </TouchableOpacity>
            ) : isRecording ? (
              // 녹음 중 - 정지 버튼
              <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                <Icon name="stop" size={28} color={COLORS.surface} />
              </TouchableOpacity>
            ) : (
              // 녹음 완료 - 재생 버튼
              <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
                <Icon name={isPlaying ? 'pause' : 'play-arrow'} size={28} color={COLORS.surface} />
              </TouchableOpacity>
            )}

            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>
                {!isRecording && !recordedUri
                  ? '녹음을 시작하세요'
                  : isRecording
                  ? (isPaused ? '일시정지됨' : '녹음 중...')
                  : '녹음 완료'}
              </Text>
              <Text style={styles.audioMeta}>
                {isRecording && !isPaused && '🔴 '}
                {formatTime(isRecording ? recordingDuration : (isPlaying ? playbackPosition : playbackDuration))}
              </Text>
            </View>

            {/* 보조 버튼 */}
            {isRecording && (
              <TouchableOpacity style={styles.auxButton} onPress={togglePauseRecording}>
                <Icon name={isPaused ? 'play-arrow' : 'pause'} size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {recordedUri && !isRecording && (
              <TouchableOpacity style={styles.auxButton} onPress={resetRecording}>
                <Icon name="delete" size={24} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>

          {/* 파형 */}
          <View style={styles.waveformContainer}>
            <View style={styles.waveform}>
              {[3, 5, 3, 4, 6, 4, 5, 8, 6, 4, 3, 5, 2, 4, 3, 5, 2, 4].map((height, index) => {
                const isActive = isRecording && !isPaused;
                const progress = playbackDuration > 0 ? playbackPosition / playbackDuration : 0;
                const barProgress = index / 18;
                const showProgress = recordedUri && barProgress <= progress;
                return (
                  <View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        height: isActive ? Math.random() * 40 + 10 : height * 4,
                        backgroundColor: isActive || showProgress ? COLORS.primary : COLORS.borderLight,
                        opacity: isActive ? 0.5 + Math.random() * 0.5 : (showProgress ? 0.8 : 0.4),
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* 업로드 버튼 */}
          {recordedUri && transcripts.length === 0 && (
            <TouchableOpacity
              style={[styles.uploadButton, isUploading && styles.buttonDisabled]}
              onPress={uploadAndTranscribe}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={COLORS.surface} />
              ) : (
                <>
                  <Icon name="upload" size={18} color={COLORS.surface} />
                  <Text style={styles.uploadButtonText}>텍스트로 변환</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 대화 내용 섹션 */}
        {(transcripts.length > 0 || isUploading) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>대화 내용</Text>
              {transcripts.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{transcripts.length}개 발화</Text>
                </View>
              )}
            </View>

            {isUploading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>음성을 분석하고 있습니다...</Text>
              </View>
            ) : (
              <View style={styles.conversation}>
                {conversationData.map((item) => (
                  <View key={item.id}>
                    {item.speaker === 'partner' ? (
                      <View style={styles.partnerMessage}>
                        <View style={styles.partnerAvatar}>
                          <Text style={styles.avatarText}>{item.name}</Text>
                        </View>
                        <View style={styles.messageContent}>
                          <View style={styles.partnerBubble}>
                            <Text style={styles.messageText}>{item.message}</Text>
                          </View>
                          <Text style={styles.messageTime}>{item.time}</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.myMessageContainer}>
                        <View style={styles.myMessage}>
                          <View style={styles.myMessageContent}>
                            <View style={styles.myBubble}>
                              <Text style={styles.myMessageText}>{item.message}</Text>
                            </View>
                          </View>
                          <View style={styles.myAvatar}>
                            <Text style={styles.myAvatarText}>{item.name}</Text>
                          </View>
                        </View>
                        <Text style={styles.myMessageTime}>{item.time}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* AI 분석 버튼 */}
        {transcripts.length > 0 && !aiInsight && (
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.buttonDisabled]}
            onPress={analyzeConversation}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color={COLORS.surface} />
            ) : (
              <>
                <Icon name="auto-awesome" size={20} color={COLORS.surface} />
                <Text style={styles.analyzeButtonText}>AI 분석하기</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* AI 인사이트 섹션 */}
        {(aiInsight || isAnalyzing) && (
          <View style={styles.section}>
            {/* 감정 태그 */}
            {emotions.length > 0 && (
              <View style={styles.emotionSection}>
                <Text style={styles.sectionTitle}>감정 분석</Text>
                <View style={styles.emotionTags}>
                  {emotions.map((emotion, index) => (
                    <EmotionBadge
                      key={`${emotion}-${index}`}
                      emotion={emotion}
                      size="md"
                    />
                  ))}
                </View>
              </View>
            )}

            {/* AI 인사이트 카드 */}
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Icon name="auto-awesome" size={14} color={COLORS.primary} />
                <Text style={styles.insightLabel}>AI 인사이트</Text>
              </View>
              {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingText}>대화를 분석하고 있습니다...</Text>
                </View>
              ) : (
                <Text style={styles.insightContent}>{aiInsight}</Text>
              )}
            </View>
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        onClose={() => setAlertModal({ ...alertModal, visible: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        visible={confirmModal.visible}
        onClose={() => setConfirmModal({ ...confirmModal, visible: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmType === 'danger' ? '삭제' : '확인'}
        cancelText="취소"
        confirmType={confirmModal.confirmType}
      />
    </SafeAreaView>
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },

  // Date
  dateText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    opacity: 0.8,
  },

  // Audio Card
  audioCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}10`,
    ...SHADOWS.sm,
  },
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  stopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  audioInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  audioTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  audioMeta: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semiBold,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  auxButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Waveform
  waveformContainer: {
    marginTop: SPACING.md,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    gap: 4,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },

  // Upload Button
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  uploadButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Section
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  countText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
  },
  loadingText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
  },

  // Conversation
  conversation: {
    gap: SPACING.md,
  },
  partnerMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  partnerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
  },
  messageContent: {
    flex: 1,
    maxWidth: '80%',
  },
  partnerBubble: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  messageText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  messageTime: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  myMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    width: '100%',
  },
  myMessageContent: {
    maxWidth: '80%',
  },
  myBubble: {
    backgroundColor: `${COLORS.primary}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: `${COLORS.primary}10`,
  },
  myMessageText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  myAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myAvatarText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  myMessageTime: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginRight: 44,
  },

  // Analyze Button
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  analyzeButtonText: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.surface,
  },

  // Emotion Tags
  emotionSection: {
    marginBottom: SPACING.md,
  },
  emotionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },

  // Insight Card
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.primary}10`,
    ...SHADOWS.sm,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  insightLabel: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightContent: {
    fontFamily: FONT_FAMILY.base,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});
