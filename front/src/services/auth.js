import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

// WebBrowser dismiss 처리
WebBrowser.maybeCompleteAuthSession();

// OAuth 클라이언트 ID (환경변수에서 가져오기)
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID;
const KAKAO_CLIENT_SECRET = process.env.EXPO_PUBLIC_KAKAO_CLIENT_SECRET;
const NAVER_CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.EXPO_PUBLIC_NAVER_CLIENT_SECRET;

class AuthService {
  // Google OAuth 설정 hook 사용
  useGoogleAuth() {
    const redirectUri = makeRedirectUri({
      scheme: 'speaktrue',
      path: 'auth/google',
    });

    const [request, response, promptAsync] = Google.useAuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      scopes: ['profile', 'email'],
      redirectUri,
    });

    return { request, response, promptAsync };
  }

  // Google 로그인 처리
  async handleGoogleLogin(response) {
    if (response?.type === 'success') {
      const { authentication } = response;
      return {
        success: true,
        accessToken: authentication.accessToken,
      };
    }
    return { success: false, error: 'Google login cancelled or failed' };
  }

  // Kakao OAuth 로그인 (WebBrowser 사용)
  async loginWithKakao() {
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'speaktrue',
        path: 'auth/kakao',
      });

      const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile_nickname,profile_image,account_email`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          // 인증 코드를 액세스 토큰으로 교환
          const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: KAKAO_CLIENT_ID,
              client_secret: KAKAO_CLIENT_SECRET,
              redirect_uri: redirectUri,
              code,
            }).toString(),
          });

          const tokenData = await tokenResponse.json();

          if (tokenData.access_token) {
            return {
              success: true,
              accessToken: tokenData.access_token,
            };
          }
        }
      }

      return { success: false, error: 'Kakao login cancelled or failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Naver OAuth 로그인 (WebBrowser 사용)
  async loginWithNaver() {
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'speaktrue',
        path: 'auth/naver',
      });

      const state = Math.random().toString(36).substring(7);
      const authUrl = `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          // 인증 코드를 액세스 토큰으로 교환
          const tokenResponse = await fetch(
            `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${NAVER_CLIENT_ID}&client_secret=${NAVER_CLIENT_SECRET}&code=${code}&state=${state}`,
            { method: 'POST' }
          );

          const tokenData = await tokenResponse.json();

          if (tokenData.access_token) {
            return {
              success: true,
              accessToken: tokenData.access_token,
            };
          }
        }
      }

      return { success: false, error: 'Naver login cancelled or failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();
