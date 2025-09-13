import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton.jsx';
import { getGoogleCallbackParams, isGoogleCallback } from '../utils/googleAuth.js';
import authService from '../services/authService.js';

export default function TestGoogleAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      addLog('User already logged in from localStorage');
    }

    // Check if this is a Google callback
    if (isGoogleCallback()) {
      addLog('Detected Google OAuth callback');
      handleGoogleCallback();
    }
  }, []);

  const handleGoogleCallback = async () => {
    try {
      setIsLoading(true);
      addLog('Processing Google OAuth callback...');
      
      const { token, success, error } = getGoogleCallbackParams();
      
      if (error) {
        addLog(`Error: ${error}`);
        setError('Authentication failed. Please try again.');
        return;
      }

      if (success === 'true' && token) {
        addLog('Token received, storing in localStorage');
        localStorage.setItem('token', token);
        
        addLog('Fetching user data...');
        const response = await authService.getCurrentUser();
        
        if (response.success) {
          setUser(response.data.user);
          addLog('User data loaded successfully');
          addLog(`User: ${response.data.user.name} (${response.data.user.email})`);
          addLog(`Role: ${response.data.user.role}`);
        } else {
          throw new Error('Failed to get user data');
        }
      } else {
        addLog('Invalid callback parameters');
        setError('Invalid authentication response.');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setError('');
    setLogs([]);
    addLog('User logged out');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Google OAuth Test</h1>
          
          {user ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Authentication Successful!</h3>
                <div className="text-sm text-green-700 space-y-2">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <div className="flex items-center gap-2">
                    <strong>Role:</strong>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <p><strong>Subscriber:</strong> {user.isSubscriber ? 'Yes' : 'No'}</p>
                  <p><strong>Group ID:</strong> {user.groupId || 'None'}</p>
                  <p><strong>Status:</strong> {user.status}</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/client/dashboard')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Test Google Authentication</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Click the button below to test Google OAuth integration. This will redirect you to Google's consent screen.
                </p>
                <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                  <strong>Available Roles:</strong> User, Admin
                </div>
              </div>
              
              <GoogleAuthButton 
                text="Test Google OAuth" 
                loading={isLoading}
                disabled={isLoading}
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Debug Logs</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Setup Instructions</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>1. Make sure your server is running: <code className="bg-yellow-100 px-1 rounded">cd server && npm run dev</code></p>
            <p>2. Configure Google OAuth in your <code className="bg-yellow-100 px-1 rounded">.env</code> file</p>
            <p>3. Add redirect URI in Google Console: <code className="bg-yellow-100 px-1 rounded">http://localhost:3000/api/auth/google/callback</code></p>
            <p>4. Test the authentication flow above</p>
            <p>5. <strong>Role System:</strong> Users will be assigned 'user' or 'admin' roles based on your business logic</p>
          </div>
        </div>
      </div>
    </div>
  );
}
