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

  // Chat
  async sendChatMessage(message, mode = 'empathy') {
    return this.request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, mode }),
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
  async getHistory() {
    return this.request('/api/history');
  }

  async getHistoryDetail(id) {
    return this.request(`/api/history/${id}`);
  }

  async getStats() {
    return this.request('/api/history/stats/summary');
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
