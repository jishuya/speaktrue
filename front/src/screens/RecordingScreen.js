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
import { readAsStringAsync, deleteAsync } from 'expo-file-system/legacy';
import { Icon, AlertModal, ConfirmModal, SessionFeedbackModal } from '../components/ui';
import { Header, EmotionBadge } from '../components/common';
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { API_URL } from '../constants/config';
import { api } from '../services';
import { useAuth } from '../store/AuthContext';

export default function RecordingScreen({ navigation }) {
  const { user } = useAuth();
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // Refs
  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const timerRef = useRef(null);
  const recordedUriRef = useRef(null);
  const sessionIdRef = useRef(null);

  // recordedUri와 sessionId를 ref에 동기화
  useEffect(() => {
    recordedUriRef.current = recordedUri;
  }, [recordedUri]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      // 업로드하지 않은 녹음 파일 삭제
      if (recordedUriRef.current && !sessionIdRef.current) {
        deleteAsync(recordedUriRef.current, { idempotent: true }).catch(() => {});
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

  // 업로드 + STT + AI 분석을 한 번에 처리
  const uploadAndAnalyze = async () => {
    if (!recordedUri) return;

    setIsUploading(true);

    try {
      // 1단계: 업로드 및 STT 변환
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
          userId: user?.id,
        }),
      });

      const uploadResult = await response.json();

      if (!uploadResult.success) {
        setAlertModal({ visible: true, title: '오류', message: uploadResult.error || '업로드에 실패했습니다.', type: 'error' });
        return;
      }

      // STT 결과 저장
      setTranscripts(uploadResult.transcripts || []);
      setSessionId(uploadResult.sessionId);

      // 대화 내용이 없으면 분석 불가
      if (!uploadResult.transcripts || uploadResult.transcripts.length === 0) {
        setAlertModal({ visible: true, title: '알림', message: '인식된 대화 내용이 없습니다.', type: 'info' });
        return;
      }

      // 2단계: AI 분석
      setIsUploading(false);
      setIsAnalyzing(true);

      const analysisResult = await api.analyzeRecording(uploadResult.sessionId);

      if (analysisResult.success && analysisResult.analysis) {
        const analysis = analysisResult.analysis;

        // AI 인사이트 객체로 저장
        setAiInsight({
          rootCause: analysis.rootCause,
          summary: analysis.summary,
          myUnmetNeed: analysis.myUnmetNeed,
          partnerUnmetNeed: analysis.partnerUnmetNeed,
          conflictPattern: analysis.conflictPattern,
          suggestedApproach: analysis.suggestedApproach,
          actionItems: analysis.actionItems || [],
        });

        // 감정 태그 설정
        const detectedEmotions = analysis.myEmotions?.slice(0, 4) || [];
        if (detectedEmotions.length === 0) detectedEmotions.push('분석 완료');
        setEmotions(detectedEmotions);
      } else {
        setAlertModal({ visible: true, title: '오류', message: analysisResult.error || 'AI 분석에 실패했습니다.', type: 'error' });
      }
    } catch (error) {
      console.error('분석 오류:', error);
      setAlertModal({ visible: true, title: '오류', message: '분석 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  // 세션 종료 함수
  const endCurrentSession = async (currentSessionId, isResolved = false) => {
    if (!currentSessionId) return;

    try {
      await api.endSession(currentSessionId, isResolved);
    } catch {
      // 세션 종료 실패해도 진행
    }
  };

  // 피드백 후 해결됨 선택
  const handleFeedbackResolve = async () => {
    setIsFeedbackLoading(true);
    try {
      await endCurrentSession(sessionId, true);
      setShowFeedbackModal(false);
      navigation.goBack();
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  // 피드백 후 미해결 선택
  const handleFeedbackUnresolve = async () => {
    setIsFeedbackLoading(true);
    try {
      await endCurrentSession(sessionId, false);
      setShowFeedbackModal(false);
      navigation.goBack();
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleBack = () => {
    // 녹음 중이면 녹음 중지 확인
    if (isRecording) {
      setConfirmModal({
        visible: true,
        title: '나가기',
        message: '녹음 중입니다. 녹음을 중단하고 나가시겠습니까?',
        confirmType: 'danger',
        onConfirm: () => navigation.goBack(),
      });
      return;
    }

    // 세션이 있고 대화 내용이 있으면 피드백 모달 표시
    if (sessionId && transcripts.length > 0) {
      setShowFeedbackModal(true);
      return;
    }

    // 녹음만 있고 아직 업로드 안 했으면 확인
    if (recordedUri) {
      setConfirmModal({
        visible: true,
        title: '나가기',
        message: '녹음 내용이 저장되지 않습니다. 나가시겠습니까?',
        confirmType: 'danger',
        onConfirm: () => navigation.goBack(),
      });
      return;
    }

    navigation.goBack();
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

          {/* 분석하기 버튼 - 녹음 완료 후, 아직 분석 안 했을 때 */}
          {recordedUri && !aiInsight && !isRecording && (
            <TouchableOpacity
              style={[styles.analyzeButton, (isUploading || isAnalyzing) && styles.buttonDisabled]}
              onPress={uploadAndAnalyze}
              disabled={isUploading || isAnalyzing}
            >
              {isUploading ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.surface} />
                  <Text style={styles.analyzeButtonText}>음성 변환 중...</Text>
                </>
              ) : isAnalyzing ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.surface} />
                  <Text style={styles.analyzeButtonText}>AI 분석 중...</Text>
                </>
              ) : (
                <>
                  <Icon name="auto-awesome" size={20} color={COLORS.surface} />
                  <Text style={styles.analyzeButtonText}>분석하기</Text>
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

            {/* AI 인사이트 헤더 */}
            <View style={styles.insightTitleRow}>
              <Icon name="auto-awesome" size={20} color={COLORS.primary} />
              <Text style={styles.insightTitle}>AI 인사이트</Text>
            </View>

            {isAnalyzing ? (
              <View style={styles.insightLoadingCard}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.insightLoadingText}>대화를 분석하고 있습니다...</Text>
                <Text style={styles.insightLoadingSubtext}>잠시만 기다려주세요</Text>
              </View>
            ) : (
              <View style={styles.insightContainer}>
                {/* 핵심 갈등 */}
                {aiInsight.rootCause && (
                  <View style={[styles.insightCard, styles.keyInsightCard]}>
                    <View style={styles.insightCardHeader}>
                      <Icon name="alert-circle" size={18} color={COLORS.warning} />
                      <Text style={styles.insightCardTitle}>핵심 갈등</Text>
                    </View>
                    <Text style={styles.keyInsightText}>{aiInsight.rootCause}</Text>
                  </View>
                )}

                {/* 대화 요약 */}
                {aiInsight.summary && (
                  <View style={styles.insightCard}>
                    <View style={styles.insightCardHeader}>
                      <Icon name="description" size={18} color={COLORS.primary} />
                      <Text style={styles.insightCardTitle}>대화 요약</Text>
                    </View>
                    <Text style={styles.insightCardText}>{aiInsight.summary}</Text>
                  </View>
                )}

                {/* 나의 욕구 */}
                {aiInsight.myUnmetNeed && (
                  <View style={styles.insightCard}>
                    <View style={styles.insightCardHeader}>
                      <Icon name="favorite" size={18} color={COLORS.primary} />
                      <Text style={styles.insightCardTitle}>나의 충족되지 못한 욕구</Text>
                    </View>
                    <Text style={styles.insightCardText}>{aiInsight.myUnmetNeed}</Text>
                  </View>
                )}

                {/* 상대방의 욕구 */}
                {aiInsight.partnerUnmetNeed && (
                  <View style={styles.insightCard}>
                    <View style={styles.insightCardHeader}>
                      <Icon name="person" size={18} color={COLORS.primary} />
                      <Text style={styles.insightCardTitle}>상대방의 충족되지 못한 욕구</Text>
                    </View>
                    <Text style={styles.insightCardText}>{aiInsight.partnerUnmetNeed}</Text>
                  </View>
                )}

                {/* 갈등 패턴 */}
                {aiInsight.conflictPattern && (
                  <View style={styles.insightCard}>
                    <View style={styles.insightCardHeader}>
                      <Icon name="infinite" size={18} color={COLORS.primary} />
                      <Text style={styles.insightCardTitle}>갈등 패턴</Text>
                    </View>
                    <Text style={styles.insightCardText}>{aiInsight.conflictPattern}</Text>
                  </View>
                )}

                {/* 제안 */}
                {aiInsight.suggestedApproach && (
                  <View style={[styles.insightCard, styles.suggestionCard]}>
                    <View style={styles.insightCardHeader}>
                      <Icon name="lightbulb" size={18} color={COLORS.success} />
                      <Text style={styles.insightCardTitle}>제안</Text>
                    </View>
                    <Text style={styles.suggestionText}>{aiInsight.suggestedApproach}</Text>
                  </View>
                )}

                {/* 실천 항목 */}
                {aiInsight.actionItems?.length > 0 && (
                  <View style={styles.insightCard}>
                    <View style={styles.insightCardHeader}>
                      <Icon name="check-circle" size={18} color={COLORS.success} />
                      <Text style={styles.insightCardTitle}>실천 항목</Text>
                    </View>
                    {aiInsight.actionItems.map((item, index) => (
                      <View key={index} style={styles.actionItem}>
                        <Text style={styles.actionNumber}>{index + 1}</Text>
                        <Text style={styles.actionText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
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
        confirmText={confirmModal.confirmType === 'danger' ? '예' : '확인'}
        cancelText={confirmModal.confirmType === 'danger' ? '아니오' : '취소'}
        confirmType={confirmModal.confirmType}
      />

      {/* Session Feedback Modal */}
      <SessionFeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onResolve={handleFeedbackResolve}
        onUnresolve={handleFeedbackUnresolve}
        isLoading={isFeedbackLoading}
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
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
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
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },
  audioMeta: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZE.lg,
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
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  countText: {
    fontFamily: FONT_FAMILY.regular,
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
    fontFamily: FONT_FAMILY.regular,
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
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.sm,
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
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  messageTime: {
    fontFamily: FONT_FAMILY.regular,
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
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
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
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
  },
  myMessageTime: {
    fontFamily: FONT_FAMILY.regular,
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
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.base,
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

  // Insight Styles
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  insightTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
  },
  insightLoadingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  insightLoadingText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  insightLoadingSubtext: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  insightContainer: {
    gap: SPACING.md,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  keyInsightCard: {
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  suggestionCard: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  insightCardTitle: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  insightCardText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  keyInsightText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  suggestionText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBg,
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionText: {
    flex: 1,
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
