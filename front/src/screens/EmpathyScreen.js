import { useState, useRef } from 'react';
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
  const flatListRef = useRef(null);

  const handleSend = async (text) => {
    const now = new Date();
    const newMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: getCurrentTime(),
      createdAt: now,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(text, 'empathy');
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

  const handlePerspectivePress = () => {
    navigation.navigate('Perspective');
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
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

        {/* Perspective Button */}
        <View style={styles.perspectiveButtonContainer}>
          <TouchableOpacity style={styles.perspectiveButton} onPress={handlePerspectivePress}>
            <Icon name="visibility" size={20} color={COLORS.primary} />
            <Text style={styles.perspectiveButtonText}>상대방 관점 보기</Text>
          </TouchableOpacity>
        </View>

        {/* Input Area */}
        <ChatInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
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
