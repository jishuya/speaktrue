const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:9502';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Session - 새 세션 생성
  async createSession() {
    return this.request('/api/chat/session', {
      method: 'POST',
    });
  }

  // Session - 세션 종료
  async endSession(sessionId, isResolved = false) {
    return this.request(`/api/chat/session/${sessionId}/end`, {
      method: 'PATCH',
      body: JSON.stringify({ isResolved }),
    });
  }

  // Session - 세션 조회
  async getSession(sessionId) {
    return this.request(`/api/chat/session/${sessionId}`);
  }

  // Chat
  async sendChatMessage(message, mode = 'empathy', sessionId) {
    return this.request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, mode, sessionId }),
    });
  }

  // Chat with Image
  async sendChatMessageWithImage(message, image, mode = 'empathy', sessionId) {
    // 이미지를 base64로 변환
    const base64Image = await this.imageToBase64(image.uri);

    return this.request('/api/chat/message-with-image', {
      method: 'POST',
      body: JSON.stringify({
        message,
        mode,
        sessionId,
        image: {
          data: base64Image,
          mediaType: this.getMediaType(image.uri),
        },
      }),
    });
  }

  // 이미지 URI를 base64로 변환
  async imageToBase64(uri) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // data:image/jpeg;base64, 부분 제거
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Image to base64 failed:', error);
      throw error;
    }
  }

  // 파일 확장자로 미디어 타입 결정
  getMediaType(uri) {
    const extension = uri.split('.').pop()?.toLowerCase();
    const mediaTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mediaTypes[extension] || 'image/jpeg';
  }

  // Perspective Analysis - 대화 히스토리 기반 관점 전환
  async getPerspectiveAnalysis(conversationHistory, sessionId) {
    return this.request('/api/chat/perspective', {
      method: 'POST',
      body: JSON.stringify({ conversationHistory, sessionId }),
    });
  }

  // NVC
  async convertToNvc(message) {
    return this.request('/api/nvc/convert', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // History
  async getHistory(userId) {
    return this.request(`/api/history?userId=${userId}`);
  }

  async getHistorySummary(userId) {
    return this.request(`/api/history/summary?userId=${userId}`);
  }

  async getHistoryDetail(id, userId) {
    return this.request(`/api/history/${id}?userId=${userId}`);
  }

  async deleteHistory(id, userId) {
    return this.request(`/api/history/${id}?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  async updateSessionResolved(sessionId, isResolved) {
    return this.request(`/api/history/${sessionId}/resolved`, {
      method: 'PATCH',
      body: JSON.stringify({ isResolved }),
    });
  }

  // User Profile
  async getProfile(userId) {
    return this.request(`/api/user/profile?userId=${userId}`);
  }

  async updateProfile(userId, profileData) {
    return this.request('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({ userId, ...profileData }),
    });
  }

  // Auth
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }
}

export default new ApiService();
