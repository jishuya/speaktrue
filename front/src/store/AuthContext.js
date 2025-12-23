import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

const AUTH_TOKEN_KEY = '@speaktrue_auth_token';
const USER_DATA_KEY = '@speaktrue_user_data';
const OAUTH_TOKEN_KEY = '@speaktrue_oauth_token';
const OAUTH_PROVIDER_KEY = '@speaktrue_oauth_provider';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 앱 시작 시 저장된 인증 정보 로드
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        api.setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 처리 (OAuth 또는 이메일)
  const login = async (provider, accessToken, credentials = null) => {
    try {
      let response;

      if (provider === 'email' && credentials) {
        // 이메일 로그인
        response = await api.emailLogin(credentials.email, credentials.password);
      } else {
        // OAuth 로그인
        response = await api.oauthLogin(provider, accessToken);
      }

      if (response.token && response.user) {
        const storagePromises = [
          AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token),
          AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user)),
        ];

        // OAuth 로그인인 경우 OAuth 토큰과 provider 저장
        if (provider !== 'email' && accessToken) {
          storagePromises.push(
            AsyncStorage.setItem(OAUTH_TOKEN_KEY, accessToken),
            AsyncStorage.setItem(OAUTH_PROVIDER_KEY, provider)
          );
        }

        await Promise.all(storagePromises);

        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        api.setAuthToken(response.token);

        return { success: true, user: response.user };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    console.log('=== LOGOUT START ===');
    try {
      // 저장된 OAuth 정보 가져오기
      console.log('1. Getting stored OAuth info...');
      const [oauthToken, oauthProvider] = await Promise.all([
        AsyncStorage.getItem(OAUTH_TOKEN_KEY),
        AsyncStorage.getItem(OAUTH_PROVIDER_KEY),
      ]);
      console.log('2. OAuth Provider:', oauthProvider);
      console.log('3. OAuth Token exists:', !!oauthToken);

      // 소셜 로그아웃 처리 (OAuth 토큰 무효화)
      if (oauthToken && oauthProvider) {
        console.log('4. Revoking OAuth token...');
        await revokeOAuthToken(oauthProvider, oauthToken);
        console.log('5. OAuth token revoked');
      } else {
        console.log('4. Skipping OAuth revoke (no token or provider)');
      }

      // 서버 로그아웃 API 호출 (네이버는 서버에서 토큰 무효화)
      console.log('6. Calling server logout API...');
      await api.logout(oauthToken, oauthProvider);
      console.log('7. Server logout API called');
    } catch (error) {
      console.error('Logout error:', error);
      console.error('Error details:', error.message);
    }

    // 로컬 스토리지 정리
    console.log('8. Clearing local storage...');
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_DATA_KEY),
      AsyncStorage.removeItem(OAUTH_TOKEN_KEY),
      AsyncStorage.removeItem(OAUTH_PROVIDER_KEY),
    ]);
    console.log('9. Local storage cleared');

    console.log('10. Resetting state...');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    api.setAuthToken(null);
    console.log('=== LOGOUT COMPLETE ===');
  };

  // OAuth 토큰 무효화 (소셜 로그아웃)
  const revokeOAuthToken = async (provider, accessToken) => {
    console.log(`=== REVOKE OAuth TOKEN (${provider}) ===`);
    try {
      switch (provider) {
        case 'kakao':
          // 카카오 로그아웃 API
          console.log('Revoking Kakao token...');
          const kakaoResponse = await fetch('https://kapi.kakao.com/v1/user/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          console.log('Kakao revoke response status:', kakaoResponse.status);
          break;

        case 'naver':
          // 네이버는 서버에서 처리 (client_secret 필요)
          console.log('Naver revoke - handled by server');
          break;

        case 'google':
          // 구글 토큰 무효화
          console.log('Revoking Google token...');
          const googleResponse = await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
            method: 'POST',
          });
          console.log('Google revoke response status:', googleResponse.status);
          break;

        default:
          console.log('Unknown provider:', provider);
      }
      console.log(`=== REVOKE OAuth TOKEN (${provider}) COMPLETE ===`);
    } catch (error) {
      console.error(`${provider} OAuth revoke error:`, error);
      console.error('Error details:', error.message);
    }
  };

  // 사용자 정보 갱신
  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.user) {
        setUser(response.user);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // 토큰이 만료되었을 수 있음 - 로그아웃 처리
      if (error.message.includes('401') || error.message.includes('인증')) {
        await logout();
      }
    }
  };

  // 사용자 프로필 업데이트
  const updateProfile = async (profileData) => {
    try {
      const response = await api.updateProfile(user.id, profileData);
      if (response.user) {
        setUser(response.user);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error: error.message };
    }
  };

  // 회원 탈퇴
  const withdraw = async () => {
    try {
      await api.withdraw();
      await logout();
      return { success: true };
    } catch (error) {
      console.error('Withdraw error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    updateProfile,
    withdraw,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
