import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApiService from '../services/adminApi.js';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session on mount
    const checkAdminAuth = async () => {
      try {
        // Check if we have stored auth data
        const storedAdmin = adminApiService.getStoredAdmin();
        const token = adminApiService.getToken();

        if (!token || !storedAdmin) {
          setIsLoading(false);
          return;
        }

        // Verify token with server
        try {
          const response = await adminApiService.getCurrentAdmin();
          if (response.success && response.data.admin) {
            setAdminUser(response.data.admin);
          } else {
            // Invalid session, clear storage
            adminApiService.clearAuth();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token is invalid, clear storage
          adminApiService.clearAuth();
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        adminApiService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await adminApiService.login({ email, password });

      if (response.success && response.data.admin) {
        setAdminUser(response.data.admin);
        return response.data.admin;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await adminApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdminUser(null);
    }
  };

  const isAuthenticated = () => {
    return adminUser !== null && adminApiService.isAuthenticated();
  };

  const value = {
    adminUser,
    isLoading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
