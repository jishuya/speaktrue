import { useState } from 'react';
import { Alert, ActionSheetIOS, Platform } from 'react-native';

// expo-image-picker 패키지가 설치되어 있는지 동적으로 확인
let ImagePicker = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  // 패키지가 설치되지 않은 경우
}

export default function useImagePicker({ onImageSelected, onError } = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const requestPermission = async (type) => {
    if (!ImagePicker) return false;

    try {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  const pickImage = async () => {
    if (!ImagePicker) {
      Alert.alert(
        '기능 불가',
        '이미지 선택 기능을 사용하려면 패키지 설치가 필요합니다.\n\nnpx expo install expo-image-picker',
        [{ text: '확인' }]
      );
      return null;
    }

    const hasPermission = await requestPermission('library');
    if (!hasPermission) {
      Alert.alert(
        '권한 필요',
        '사진 라이브러리에 접근하려면 권한이 필요합니다.',
        [{ text: '확인' }]
      );
      return null;
    }

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        setSelectedImage(image);
        onImageSelected?.(image);
        return image;
      }
      return null;
    } catch (error) {
      console.error('Image pick failed:', error);
      onError?.(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!ImagePicker) {
      Alert.alert(
        '기능 불가',
        '카메라 기능을 사용하려면 패키지 설치가 필요합니다.\n\nnpx expo install expo-image-picker',
        [{ text: '확인' }]
      );
      return null;
    }

    const hasPermission = await requestPermission('camera');
    if (!hasPermission) {
      Alert.alert(
        '권한 필요',
        '카메라를 사용하려면 권한이 필요합니다.',
        [{ text: '확인' }]
      );
      return null;
    }

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        setSelectedImage(image);
        onImageSelected?.(image);
        return image;
      }
      return null;
    } catch (error) {
      console.error('Camera failed:', error);
      onError?.(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '사진 촬영', '앨범에서 선택'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      // Android - 간단한 Alert 사용
      Alert.alert(
        '이미지 첨부',
        '어떻게 이미지를 추가할까요?',
        [
          { text: '취소', style: 'cancel' },
          { text: '사진 촬영', onPress: takePhoto },
          { text: '앨범에서 선택', onPress: pickImage },
        ]
      );
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return {
    isLoading,
    selectedImage,
    pickImage,
    takePhoto,
    showImageOptions,
    clearImage,
  };
}
