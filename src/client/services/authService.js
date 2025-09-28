import apiService from './api.js';

class AuthService {
  // Register a new user
  async register(userData) {
    try {
      const response = await apiService.register(userData);
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await apiService.login(credentials);
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiService.getCurrentUser();
      
      // Update stored user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.updateProfile(profileData);
      
      // Update stored user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiService.changePassword(passwordData);
      return response;
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      await apiService.logout();
      
      // Clear stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear stored data even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get stored user data
  getStoredUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is subscriber
  isSubscriber() {
    const user = this.getStoredUser();
    return user ? user.isSubscriber : false;
  }


}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;

