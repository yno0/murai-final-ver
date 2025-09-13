import { API_CONFIG } from '../config/api.js';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Group endpoints
  async getGroupMembers(groupId) {
    return this.request(`/groups/${groupId}/members`);
  }

  async inviteMember(groupId, invitationData) {
    return this.request(`/groups/${groupId}/invite`, {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
  }

  async updateMemberRole(groupId, memberId, role) {
    return this.request(`/groups/${groupId}/members/${memberId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeMember(groupId, memberId) {
    return this.request(`/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    });
  }

  async getInvitationDetails(token) {
    return this.request(`/groups/invite/${token}`);
  }

  async acceptInvitation(token, userData) {
    return this.request(`/groups/invite/${token}/accept`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Extension Settings endpoints
  async getExtensionSettings() {
    return this.request('/extension-settings');
  }

  async updateExtensionSettings(settings) {
    return this.request('/extension-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async syncExtensionSettings(lastSyncTimestamp = null) {
    const endpoint = lastSyncTimestamp 
      ? `/extension-settings/sync?lastSyncTimestamp=${lastSyncTimestamp}`
      : '/extension-settings/sync';
    return this.request(endpoint);
  }

  async resetExtensionSettings() {
    return this.request('/extension-settings/reset', {
      method: 'POST',
    });
  }

  async getGroupExtensionSettings() {
    return this.request('/extension-settings/group');
  }

  async updateGroupExtensionSettings(settings) {
    return this.request('/extension-settings/group', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
