class AdminApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.adminBaseURL = `${this.baseURL}/admin`;
  }

  // Helper method to make API requests
  async request(endpoint, options = {}) {
    const url = `${this.adminBaseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 - redirect to admin login
      if (response.status === 401) {
        this.clearAuth();
        window.location.href = '/admin/login';
        throw new Error('Authentication required');
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Admin API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data.token) {
      this.setAuth(response.data.token, response.data.admin);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentAdmin() {
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

  // Token management
  getToken() {
    return localStorage.getItem('adminToken');
  }

  getStoredAdmin() {
    const adminData = localStorage.getItem('adminUser');
    return adminData ? JSON.parse(adminData) : null;
  }

  setAuth(token, admin) {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(admin));
  }

  clearAuth() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminAuth'); // Remove old auth format
  }

  isAuthenticated() {
    const token = this.getToken();
    const admin = this.getStoredAdmin();
    return !!(token && admin);
  }

  // Dictionary API methods
  async getDictionaryWords(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/dictionary/words?${queryString}` : '/dictionary/words';
    return this.request(endpoint);
  }

  async addDictionaryWord(wordData) {
    return this.request('/dictionary/words', {
      method: 'POST',
      body: JSON.stringify(wordData),
    });
  }

  async updateDictionaryWord(id, wordData) {
    return this.request(`/dictionary/words/${id}`, {
      method: 'PUT',
      body: JSON.stringify(wordData),
    });
  }

  async deleteDictionaryWord(id) {
    return this.request(`/dictionary/words/${id}`, {
      method: 'DELETE',
    });
  }

  async getDictionaryCategories() {
    return this.request('/dictionary/categories');
  }

  async addDictionaryCategory(categoryData) {
    return this.request('/dictionary/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async exportDictionary(filters = {}) {
    return this.request('/dictionary/export', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async importDictionary(words, options = {}) {
    return this.request('/dictionary/import', {
      method: 'POST',
      body: JSON.stringify({ words, options }),
    });
  }

  async getWordsWithVariations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/dictionary/words-with-variations?${queryString}` : '/dictionary/words-with-variations';
    return this.request(endpoint);
  }

  async updateWordVariations(id, variations) {
    return this.request(`/dictionary/words/${id}/variations`, {
      method: 'PUT',
      body: JSON.stringify({ variations }),
    });
  }

  // Analytics API methods
  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics?${queryString}` : '/analytics';
    return this.request(endpoint);
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getDashboardAnalytics(period = '7d') {
    return this.request(`/dashboard/analytics?period=${period}`);
  }



  // Moderation API methods
  async getFlaggedContent(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/moderation/flagged?${queryString}` : '/moderation/flagged';
    return this.request(endpoint);
  }

  async updateFlaggedContent(id, updateData) {
    return this.request(`/moderation/flagged/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Reports API methods
  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/reports?${queryString}` : '/reports';
    return this.request(endpoint);
  }

  async getReportById(id) {
    return this.request(`/reports/${id}`);
  }

  // Logs API methods
  async getLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/logs?${queryString}` : '/logs';
    return this.request(endpoint);
  }

  // Settings API methods
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settingsData) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // ===== USER MANAGEMENT API METHODS =====

  // End Users Management
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return this.request(endpoint);
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUserStatus(userId, status) {
    return this.request(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // Admin Account Management
  async getAdmins(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admins?${queryString}` : '/admins';
    return this.request(endpoint);
  }

  async createAdmin(adminData) {
    return this.request('/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async updateAdmin(adminId, adminData) {
    return this.request(`/admins/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(adminData),
    });
  }

  async deleteAdmin(adminId) {
    return this.request(`/admins/${adminId}`, {
      method: 'DELETE',
    });
  }

  async changeAdminPassword(adminId, passwordData) {
    return this.request(`/admins/${adminId}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Role and Permission Management
  async getRoles() {
    return this.request('/roles');
  }

  async createRole(roleData) {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(roleId, roleData) {
    return this.request(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(roleId) {
    return this.request(`/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  async getPermissions() {
    return this.request('/permissions');
  }

  async assignRoleToAdmin(adminId, roleId) {
    return this.request(`/admins/${adminId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleId }),
    });
  }

  async updateAdminPermissions(adminId, permissions) {
    return this.request(`/admins/${adminId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  }

  // ===== SECURITY & SESSION MANAGEMENT =====

  // Get active sessions
  async getActiveSessions() {
    return this.request('/auth/sessions');
  }

  // Terminate a specific session
  async terminateSession(sessionId) {
    return this.request(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Terminate all sessions except current
  async terminateAllSessions() {
    return this.request('/auth/sessions/terminate-all', {
      method: 'POST',
    });
  }

  // Get login history
  async getLoginHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/auth/login-history?${queryString}` : '/auth/login-history';
    return this.request(endpoint);
  }

  // Get security settings
  async getSecuritySettings() {
    return this.request('/auth/security-settings');
  }

  // Update security settings
  async updateSecuritySettings(settings) {
    return this.request('/auth/security-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

// Create and export a singleton instance
const adminApiService = new AdminApiService();
export default adminApiService;
