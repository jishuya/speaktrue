import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '../components/ui';
import { Header, HeaderWithAvatar } from '../components/common';
import { ChatBubble, EmotionTagList, ChatInput, DateSeparator } from '../components/chat';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { api } from '../services';
import { getCurrentTime, shouldShowDateSeparator } from '../utils';

const INITIAL_MESSAGES = [
  {
    id: '1',
    text: '안녕하세요.\n오늘 어떤 일이 있으셨나요? 마음속에 있는 이야기, 편하게 털어놓으셔도 괜찮아요. 저는 언제나 경청하고 있을게요.',
    isUser: false,
    createdAt: new Date(),
  },
];

export default function EmpathyScreen({ navigation }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const flatListRef = useRef(null);

  // 화면 진입 시 새 세션 생성
  useEffect(() => {
    const initSession = async () => {
      try {
        const { sessionId: newSessionId } = await api.createSession();
        setSessionId(newSessionId);
        console.log('New session created:', newSessionId);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    initSession();

    // 화면 나갈 때 세션 종료
    return () => {
      if (sessionId) {
        api.endSession(sessionId).catch(console.error);
      }
    };
  }, []);

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

  // 관점 전환 버튼 표시 조건 계산
  const canShowPerspectiveButton = (() => {
    const userMessages = messages.filter(m => m.isUser);
    const aiMessages = messages.filter(m => !m.isUser);
    const totalUserChars = userMessages.reduce((sum, m) => sum + (m.text?.length || 0), 0);

    // 조건: 사용자 메시지 2개 이상 + AI 응답 1개 이상 + 총 150자 이상
    return userMessages.length >= 2 && aiMessages.length >= 1 && totalUserChars >= 150;
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
    } catch (error) {
      console.error('Chat error:', error);
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
          isRead={item.isRead}
          coachLabel={item.coachLabel}
        />
        {item.emotions && (
          <View style={styles.emotionContainer}>
            <EmotionTagList emotions={item.emotions} />
          </View>
        )}
      </View>
    );
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
          <HeaderWithAvatar
            avatarText="AI"
            title="부부코칭 전문가"
            subtitle="항상 경청 중"
            showOnlineDot
          />
        }
      />

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
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

        {/* Perspective Button - 조건 충족 시에만 표시 */}
        {canShowPerspectiveButton && (
          <View style={styles.perspectiveButtonContainer}>
            <TouchableOpacity
              style={styles.perspectiveButton}
              onPress={handlePerspectivePress}
            >
              <Icon name="visibility" size={20} color={COLORS.primary} />
              <Text style={styles.perspectiveButtonText}>상대방 관점 보기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Area */}
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
      </KeyboardAvoidingView>
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
    paddingBottom: 120,
  },
  emotionContainer: {
    marginLeft: 48,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
  },
  perspectiveButtonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  perspectiveButton: {
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
  perspectiveButtonText: {
    fontSize: FONT_SIZE.base,  // 16px - 터치 가능 텍스트 권장 크기
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
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
