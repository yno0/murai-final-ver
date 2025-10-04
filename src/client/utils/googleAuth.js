// Google OAuth utility functions

/**
 * Get the Google OAuth URL
 * @returns {string} The Google OAuth URL
 */
export const getGoogleAuthUrl = () => {
  // In production, use relative URLs. In development, use localhost
  if (import.meta.env.PROD) {
    return '/api/auth/google';
  } else {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}/api/auth/google`;
  }
};

/**
 * Redirect to Google OAuth
 */
export const redirectToGoogleAuth = () => {
  const url = getGoogleAuthUrl();
  window.location.href = url;
};

/**
 * Check if we're in a Google OAuth callback
 * @returns {boolean} True if in OAuth callback
 */
export const isGoogleCallback = () => {
  return window.location.pathname === '/auth/callback';
};

/**
 * Get Google OAuth callback parameters
 * @returns {object} Callback parameters
 */
export const getGoogleCallbackParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    token: urlParams.get('token'),
    success: urlParams.get('success'),
    error: urlParams.get('error')
  };
};
