import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon, SessionFeedbackModal } from '../components/ui';
import { Header, HeaderWithAvatar } from '../components/common';
import { ChatBubble, ChatInput, DateSeparator } from '../components/chat';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { api } from '../services';
import { getCurrentTime, shouldShowDateSeparator } from '../utils';
import { useAuth } from '../store/AuthContext';

const INITIAL_MESSAGES = [
  {
    id: '1',
    text: '안녕하세요.\n오늘 어떤 일이 있으셨나요? 마음속에 있는 이야기, 편하게 털어놓으셔도 괜찮아요. 저는 언제나 경청하고 있을게요.',
    isUser: false,
    createdAt: new Date(),
  },
];

export default function EmpathyScreen({ navigation }) {
  const { user } = useAuth();
  const partnerName = user?.partnerName || '상대';
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAction, setFeedbackAction] = useState('back'); // 'back' | 'transform'
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);
  const sessionIdRef = useRef(null);
  const keyboardAnim = useRef(new Animated.Value(0)).current;

  // 세션 종료 함수 (안정적인 종료 처리)
  const endCurrentSession = useCallback(async (currentSessionId, isResolved = false) => {
    if (!currentSessionId) return;

    try {
      await api.endSession(currentSessionId, isResolved);
    } catch {
      // 세션 종료 실패해도 진행
    }
  }, []);

  // 화면 진입 시 새 세션 생성
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await api.createSession(user?.id);
        const { sessionId: newSessionId } = result;
        sessionIdRef.current = newSessionId;
        setSessionId(newSessionId);
      } catch {
        // 세션 생성 실패
      }
    };
    initSession();
  }, [user?.id]);

  // 뒤로가기 핸들러 - 피드백 모달 표시
  const handleBackPress = useCallback(() => {
    // 대화가 진행되지 않았으면 (초기 메시지만 있으면) 바로 나가기
    const userMessages = messages.filter(m => m.isUser);
    if (userMessages.length === 0) {
      navigation.goBack();
      return;
    }
    // 대화가 있으면 피드백 모달 표시
    setFeedbackAction('back');
    setShowFeedbackModal(true);
  }, [messages, navigation]);

  // 메세지 보내기 핸들러 - 피드백 모달 표시
  const handleTransformPress = useCallback(() => {
    setFeedbackAction('transform');
    setShowFeedbackModal(true);
  }, []);

  // 피드백 선택 후 세션 종료 및 네비게이션
  const handleFeedbackResolve = useCallback(async () => {
    setIsFeedbackLoading(true);
    try {
      await endCurrentSession(sessionIdRef.current, true);
      setShowFeedbackModal(false);
      if (feedbackAction === 'transform') {
        navigation.navigate('Transform', { sessionId: sessionIdRef.current });
      } else {
        navigation.goBack();
      }
    } finally {
      setIsFeedbackLoading(false);
    }
  }, [endCurrentSession, navigation, feedbackAction]);

  const handleFeedbackUnresolve = useCallback(async () => {
    setIsFeedbackLoading(true);
    try {
      await endCurrentSession(sessionIdRef.current, false);
      setShowFeedbackModal(false);
      if (feedbackAction === 'transform') {
        navigation.navigate('Transform', { sessionId: sessionIdRef.current });
      } else {
        navigation.goBack();
      }
    } finally {
      setIsFeedbackLoading(false);
    }
  }, [endCurrentSession, navigation, feedbackAction]);

  // 화면 포커스 시 스크롤 최하단으로 이동 (PerspectiveScreen에서 돌아올 때)
  useFocusEffect(
    useCallback(() => {
      // 약간의 딜레이를 줘서 레이아웃이 완료된 후 스크롤
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

  // 키보드 높이 감지 및 스크롤 처리
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates.height;
      setKeyboardHeight(height);
      Animated.timing(keyboardAnim, {
        toValue: height,
        duration: Platform.OS === 'ios' ? 250 : 100,
        useNativeDriver: false,
      }).start();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
      Animated.timing(keyboardAnim, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? 250 : 100,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [keyboardAnim]);

  // 관점 전환 버튼 표시 조건 계산
  // 백엔드에서 세션 저장 조건이 사용자 메시지 4개 이상이므로 맞춤
  const canShowPerspectiveButton = (() => {
    const userMessages = messages.filter(m => m.isUser);
    const aiMessages = messages.filter(m => !m.isUser);

    // 조건: 사용자 메시지 4개 이상 + AI 응답 3개 이상
    return userMessages.length >= 4 && aiMessages.length >= 3;
  })();

  // 이미지 첨부 핸들러
  const handleAttach = (image) => {
    setAttachedImage(image);
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setAttachedImage(null);
  };

  const handleSend = async (text) => {
    const now = new Date();
    const hasImage = !!attachedImage;

    const newMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: getCurrentTime(),
      createdAt: now,
      image: hasImage ? attachedImage.uri : null,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setAttachedImage(null); // 전송 후 이미지 초기화
    setIsLoading(true);

    try {
      // 이미지가 있으면 이미지와 함께 전송
      const response = hasImage
        ? await api.sendChatMessageWithImage(text, attachedImage, 'empathy', sessionId)
        : await api.sendChatMessage(text, 'empathy', sessionId);

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isUser: false,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch {
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        text: '죄송합니다. 잠시 문제가 발생했어요. 다시 말씀해 주시겠어요?',
        isUser: false,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // 관점 전환 버튼 클릭 핸들러
  const handlePerspectivePress = () => {
    // 대화 히스토리를 Claude API 형식으로 변환
    const conversationHistory = messages
      .filter(m => m.id !== '1') // 초기 AI 인사 메시지 제외
      .map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text,
      }));

    // PerspectiveScreen으로 대화 기록과 세션 ID 전달
    navigation.navigate('Perspective', { conversationHistory, sessionId });
  };

  const renderMessage = ({ item, index }) => {
    const showAvatar = !item.isUser && (index === 0 || messages[index - 1]?.isUser);
    const prevMessage = messages[index - 1];
    const showDateSeparator = shouldShowDateSeparator(item.createdAt, prevMessage?.createdAt);

    return (
      <View>
        {showDateSeparator && <DateSeparator date={item.createdAt} />}
        <ChatBubble
          message={item.text}
          isUser={item.isUser}
          showAvatar={showAvatar}
          timestamp={item.timestamp}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Header
        showBack
        borderBottom
        darkBackground
        onBackPress={handleBackPress}
        leftComponent={
          <HeaderWithAvatar
            avatarText="AI"
            title="부부코칭 전문가"
            subtitle="항상 경청 중"
            showOnlineDot
          />
        }
      />

      {/* Perspective Button - 채팅창 상단에 표시 */}
      {canShowPerspectiveButton && (
        <View style={styles.topButtonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePerspectivePress}
          >
            <Icon name="visibility" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>{partnerName} 관점 보기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat Area */}
      <Animated.View style={[styles.chatContainer, { paddingBottom: keyboardAnim }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={
            isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>응답 작성 중...</Text>
              </View>
            )
          }
        />

        {/* Send Message Button - 채팅창 하단에 표시 (상대방 관점 보기와 같은 시점에) */}
        {canShowPerspectiveButton && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTransformPress}
            >
              <Icon name="send" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>메세지 보내기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Area */}
        <View style={{ paddingBottom: keyboardHeight > 0 ? 0 : insets.bottom }}>
          <ChatInput
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            onAttach={handleAttach}
            attachedImage={attachedImage}
            onRemoveImage={handleRemoveImage}
            isLoading={isLoading}
            placeholder="감정을 입력해 주세요..."
          />
        </View>
      </Animated.View>

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
  chatContainer: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  topButtonContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
  },
  bottomButtonContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 48,
    marginBottom: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
});
