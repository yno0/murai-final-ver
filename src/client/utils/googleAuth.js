// Google OAuth utility functions

/**
 * Get the Google OAuth URL
 * @returns {string} The Google OAuth URL
 */
export const getGoogleAuthUrl = () => {
  // In production, use relative URLs. In development, use localhost
  const isProd = import.meta.env.PROD;
  console.log('🔍 Environment check - PROD:', isProd);

  if (isProd) {
    const url = '/api/auth/google';
    console.log('✅ Production Google OAuth URL:', url);
    return url;
  } else {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    const url = `${baseUrl}/api/auth/google`;
    console.log('🔧 Development Google OAuth URL:', url);
    return url;
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
