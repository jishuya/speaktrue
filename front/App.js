import { useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { AuthProvider } from './src/store/AuthContext';

// 폰트 로딩 전 스플래시 화면 유지
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    // NotoSansKR Static 폰트 (각 weight별)
    'NotoSansKR-Regular': require('./src/assets/fonts/Noto_Sans_KR/static/NotoSansKR-Regular.ttf'),
    'NotoSansKR-Medium': require('./src/assets/fonts/Noto_Sans_KR/static/NotoSansKR-Medium.ttf'),
    'NotoSansKR-SemiBold': require('./src/assets/fonts/Noto_Sans_KR/static/NotoSansKR-SemiBold.ttf'),
    'NotoSansKR-Bold': require('./src/assets/fonts/Noto_Sans_KR/static/NotoSansKR-Bold.ttf'),
    // 기타 폰트
    'GamjaFlower': require('./src/assets/fonts/Gamja_Flower/GamjaFlower-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <StatusBar style="auto" />
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
