import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '../components/ui';
import { Header } from '../components/common';
import { ChatBubble, EmotionTagList, ChatInput } from '../components/chat';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const INITIAL_MESSAGES = [
  {
    id: '1',
    text: '부엌이 엉망이라 답답함을 느끼고 계시군요. 질서와 책임을 함께 나누고 싶은 마음이신 것 같은데, 맞나요?',
    isUser: false,
    emotions: [
      { type: 'frustrated', label: '답답함' },
      { type: 'order', label: '질서의 욕구' },
      { type: 'responsibility', label: '책임 분담' },
    ],
  },
  {
    id: '2',
    text: '네, 맞아요. 저만 신경 쓰는 것 같아서 너무 속상해요.',
    isUser: true,
    timestamp: '오후 8:45',
    isRead: true,
  },
  {
    id: '3',
    text: '마음이 많이 무거우시겠어요. 혼자만 노력하는 것 같아 외로움도 느끼시는 것 같아요.\n\n상대방이 내 마음을 더 잘 들을 수 있도록, 비난하는 말 대신 다르게 표현해 볼까요?',
    isUser: false,
    coachLabel: 'NVC 코치',
  },
];

export default function EmpathyScreen({ navigation }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const handleSend = (text) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
    setInputText('');

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: '그 감정을 느끼시는 게 당연해요. 더 이야기해 주시겠어요?',
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handlePerspectivePress = () => {
    navigation.navigate('Perspective');
  };

  const renderMessage = ({ item, index }) => {
    const showAvatar = !item.isUser && (index === 0 || messages[index - 1]?.isUser);

    return (
      <View>
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
    <View style={styles.container}>
      {/* Header */}
      <Header
        showBack
        // showProfile
        borderBottom
        darkBackground
        onBackPress={() => navigation.goBack()}
        leftComponent={
          <View style={styles.headerCenter}>
            <View style={styles.aiAvatarSmall}>
              <Text style={styles.aiAvatarText}>AI</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>SpeakTrue AI</Text>
              <Text style={styles.headerSubtitle}>항상 경청 중</Text>
            </View>
          </View>
        }
      />

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListHeaderComponent={
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>오늘, 오후 8:42</Text>
            </View>
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
          placeholder="감정을 입력해 주세요..."
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  aiAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${COLORS.primary}20`,
    position: 'relative',
  },
  aiAvatarText: {
    fontSize: FONT_SIZE.md,  // 14px - 아바타 내 텍스트
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
  },
  headerInfo: {
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,  // 12px
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 120,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,  // 12px - 캡션/보조 텍스트
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textMuted,
    backgroundColor: `${COLORS.textPrimary}08`,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
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
});
