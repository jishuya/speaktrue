import { useState, useCallback } from 'react';

// expo-image-picker 패키지가 설치되어 있는지 동적으로 확인
let ImagePicker = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  // 패키지가 설치되지 않은 경우
}

export default function useImagePicker({ onImageSelected, onError, onAlert } = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showAlert = (title, message, type = 'info') => {
    if (onAlert) {
      onAlert({ title, message, type });
    }
  };

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
    } catch {
      return false;
    }
  };

  const pickImage = async () => {
    if (!ImagePicker) {
      showAlert(
        '기능 불가',
        '이미지 선택 기능을 사용하려면 패키지 설치가 필요합니다.\n\nnpx expo install expo-image-picker',
        'warning'
      );
      return null;
    }

    const hasPermission = await requestPermission('library');
    if (!hasPermission) {
      showAlert(
        '권한 필요',
        '사진 라이브러리에 접근하려면 권한이 필요합니다.',
        'warning'
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
      onError?.(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!ImagePicker) {
      showAlert(
        '기능 불가',
        '카메라 기능을 사용하려면 패키지 설치가 필요합니다.\n\nnpx expo install expo-image-picker',
        'warning'
      );
      return null;
    }

    const hasPermission = await requestPermission('camera');
    if (!hasPermission) {
      showAlert(
        '권한 필요',
        '카메라를 사용하려면 권한이 필요합니다.',
        'warning'
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
      onError?.(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 커스텀 모달 열기
  const showImageOptions = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  // 커스텀 모달 닫기
  const hideImageOptions = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const clearImage = () => {
    setSelectedImage(null);
  };

  return {
    isLoading,
    selectedImage,
    pickImage,
    takePhoto,
    showImageOptions,
    hideImageOptions,
    isModalVisible,
    clearImage,
  };
}
