import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';

// expo-speech-recognition 패키지가 설치되어 있는지 동적으로 확인
let ExpoSpeechRecognition = null;
try {
  ExpoSpeechRecognition = require('expo-speech-recognition');
} catch (e) {
  // 패키지가 설치되지 않은 경우
}

export default function useSpeechRecognition({ onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    if (!ExpoSpeechRecognition) {
      setIsAvailable(false);
      return;
    }

    try {
      const available = await ExpoSpeechRecognition.isAvailableAsync();
      setIsAvailable(available);
    } catch (error) {
      console.log('Speech recognition not available:', error);
      setIsAvailable(false);
    }
  };

  const requestPermission = async () => {
    if (!ExpoSpeechRecognition) {
      return false;
    }

    try {
      const { status } = await ExpoSpeechRecognition.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  const startListening = useCallback(async () => {
    if (!isAvailable) {
      Alert.alert(
        '음성 인식 불가',
        '이 기기에서는 음성 인식을 사용할 수 없습니다.\n\n패키지 설치가 필요합니다:\nnpx expo install expo-speech-recognition',
        [{ text: '확인' }]
      );
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert(
        '권한 필요',
        '음성 인식을 사용하려면 마이크 권한이 필요합니다.',
        [{ text: '확인' }]
      );
      return;
    }

    try {
      setIsListening(true);
      setTranscript('');

      await ExpoSpeechRecognition.startAsync({
        language: 'ko-KR',
        interimResults: true,
        maxAlternatives: 1,
      });

      // 결과 이벤트 리스너
      const subscription = ExpoSpeechRecognition.addOnResultListener((event) => {
        const result = event.results[0];
        if (result) {
          const text = result.transcript;
          setTranscript(text);

          if (result.isFinal) {
            onResult?.(text);
            setIsListening(false);
          }
        }
      });

      // 에러 이벤트 리스너
      const errorSubscription = ExpoSpeechRecognition.addOnErrorListener((event) => {
        console.error('Speech recognition error:', event.error);
        onError?.(event.error);
        setIsListening(false);
      });

      // 종료 이벤트 리스너
      const endSubscription = ExpoSpeechRecognition.addOnEndListener(() => {
        setIsListening(false);
      });

      return () => {
        subscription?.remove();
        errorSubscription?.remove();
        endSubscription?.remove();
      };
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError?.(error.message);
      setIsListening(false);
    }
  }, [isAvailable, onResult, onError]);

  const stopListening = useCallback(async () => {
    if (!ExpoSpeechRecognition) return;

    try {
      await ExpoSpeechRecognition.stopAsync();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isAvailable,
    transcript,
    startListening,
    stopListening,
    toggleListening,
  };
}
