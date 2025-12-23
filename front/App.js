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
    'NotoSansKR': require('./src/assets/fonts/Noto_Sans_KR/NotoSansKR-VariableFont_wght.ttf'),
    'GamjaFlower': require('./src/assets/fonts/Noto_Sans/Gamja_Flower/GamjaFlower-Regular.ttf'),
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
