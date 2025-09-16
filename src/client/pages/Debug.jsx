import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import apiService from '../services/api.js';
import extensionSettingsService from '../services/extensionSettingsService.js';

export default function Debug() {
  const [authStatus, setAuthStatus] = useState(null);
  const [apiTests, setApiTests] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const checkAuth = async () => {
    addLog('Checking authentication status...', 'info');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    addLog(`Token exists: ${!!token}`, token ? 'success' : 'error');
    addLog(`User data exists: ${!!user}`, user ? 'success' : 'error');
    
    if (token) {
      addLog(`Token preview: ${token.substring(0, 20)}...`, 'info');
    }
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        addLog(`User: ${userData.email} (${userData.name})`, 'success');
      } catch (e) {
        addLog('Error parsing user data', 'error');
      }
    }
    
    setAuthStatus({ token: !!token, user: !!user });
  };

  const testApiEndpoints = async () => {
    setIsLoading(true);
    addLog('Starting API tests...', 'info');
    
    const tests = {};
    
    // Test 1: Get current user
    try {
      addLog('Testing GET /auth/me...', 'info');
      const userResponse = await apiService.getCurrentUser();
      tests.getCurrentUser = { success: true, data: userResponse };
      addLog('✅ GET /auth/me - Success', 'success');
    } catch (error) {
      tests.getCurrentUser = { success: false, error: error.message };
      addLog(`❌ GET /auth/me - Failed: ${error.message}`, 'error');
    }
    
    // Test 2: Get extension settings
    try {
      addLog('Testing GET /extension-settings...', 'info');
      const settingsResponse = await extensionSettingsService.getSettings();
      tests.getSettings = { success: true, data: settingsResponse };
      addLog('✅ GET /extension-settings - Success', 'success');
    } catch (error) {
      tests.getSettings = { success: false, error: error.message };
      addLog(`❌ GET /extension-settings - Failed: ${error.message}`, 'error');
    }
    
    // Test 3: Update extension settings
    try {
      addLog('Testing PUT /extension-settings...', 'info');
      const testSettings = {
        enabled: true,
        language: 'Both',
        sensitivity: 'medium',
        flaggingStyle: 'highlight',
        highlightColor: '#374151',
        whitelist: {
          websites: ['debug-test.com'],
          terms: ['debug-test']
        },
        dictionary: ['debug-word']
      };
      
      const updateResponse = await extensionSettingsService.updateSettings(testSettings);
      tests.updateSettings = { success: true, data: updateResponse };
      addLog('✅ PUT /extension-settings - Success', 'success');
    } catch (error) {
      tests.updateSettings = { success: false, error: error.message };
      addLog(`❌ PUT /extension-settings - Failed: ${error.message}`, 'error');
    }
    
    // Test 4: Sync settings
    try {
      addLog('Testing GET /extension-settings/sync...', 'info');
      const syncResponse = await extensionSettingsService.syncSettings();
      tests.syncSettings = { success: true, data: syncResponse };
      addLog('✅ GET /extension-settings/sync - Success', 'success');
    } catch (error) {
      tests.syncSettings = { success: false, error: error.message };
      addLog(`❌ GET /extension-settings/sync - Failed: ${error.message}`, 'error');
    }
    
    setApiTests(tests);
    setIsLoading(false);
    addLog('API tests completed', 'info');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addLog('Authentication data cleared', 'info');
    checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const getStatusIcon = (success) => {
    if (success === null) return <AlertCircle className="w-4 h-4 text-gray-400" />;
    return success ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">🔧 Debug Dashboard</h1>
          <p className="text-gray-600 mb-6">
            This page helps debug authentication and API issues with the extension settings.
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={checkAuth}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Check Auth
            </button>
            <button
              onClick={testApiEndpoints}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              Test API
            </button>
            <button
              onClick={clearAuth}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear Auth
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(authStatus?.token)}
              <span>JWT Token</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(authStatus?.user)}
              <span>User Data</span>
            </div>
          </div>
        </div>

        {/* API Test Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Test Results</h2>
          <div className="space-y-3">
            {Object.entries(apiTests).map(([testName, result]) => (
              <div key={testName} className="flex items-center gap-2">
                {getStatusIcon(result.success)}
                <span className="font-medium">{testName}</span>
                {!result.success && (
                  <span className="text-red-600 text-sm">- {result.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
