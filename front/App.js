import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { AuthProvider } from './src/store/AuthContext';

// 폰트 로딩 전 스플래시 화면 유지
SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨진 경우 무시
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 필요한 초기화 작업이 있다면 여기서 수행
        // 폰트는 시스템 폰트 사용 (커스텀 폰트 로딩 제거)
      } catch (e) {
        console.warn('App preparation error:', e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <AppNavigator />
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
