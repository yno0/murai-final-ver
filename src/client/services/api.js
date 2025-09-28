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
      
      // Handle 401 - redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?from=extension';
        throw new Error('Authentication required');
      }
      
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



  // Detection endpoints
  async getDetections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/detections?${queryString}` : '/detections';
    return this.request(endpoint);
  }

  async getDetectionById(id) {
    return this.request(`/detections/${id}`);
  }

  async getDetectionStats() {
    return this.request('/detections/stats');
  }

  async updateDetectionStatus(id, status) {
    return this.request(`/detections/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteDetection(id) {
    return this.request(`/detections/${id}`, {
      method: 'DELETE',
    });
  }

  async createDetection(detectionData) {
    return this.request('/detections', {
      method: 'POST',
      body: JSON.stringify(detectionData),
    });
  }

  // Report endpoints
  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/reports?${queryString}` : '/reports';
    return this.request(endpoint);
  }

  async getReportById(id) {
    return this.request(`/reports/${id}`);
  }

  async getReportStats() {
    return this.request('/reports/stats');
  }

  async createReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReportStatus(id, status) {
    return this.request(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async resolveReport(id, resolution) {
    return this.request(`/reports/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(resolution),
    });
  }

  // Flagged Content endpoints
  async getFlaggedContent(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/flagged-content?${queryString}` : '/flagged-content';
    return this.request(endpoint);
  }

  async getFlaggedContentById(id) {
    return this.request(`/flagged-content/${id}`);
  }

  async getFlaggedContentStats() {
    return this.request('/flagged-content/stats');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;


