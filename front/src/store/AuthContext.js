import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

const AUTH_TOKEN_KEY = '@speaktrue_auth_token';
const USER_DATA_KEY = '@speaktrue_user_data';

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
        await Promise.all([
          AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token),
          AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user)),
        ]);

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
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }

    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_DATA_KEY),
    ]);

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    api.setAuthToken(null);
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
