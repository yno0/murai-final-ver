import React, { useState, useEffect } from 'react';
import { FiShield, FiRefreshCw } from 'react-icons/fi';
import adminApi from '../../services/adminApi.js';

export default function SecuritySettingsTest() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState({});

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    const results = {};

    try {
      // Test 1: Get Active Sessions
      console.log('🧪 Testing getActiveSessions...');
      try {
        const sessionsResponse = await adminApi.getActiveSessions();
        console.log('📱 Sessions Response:', sessionsResponse);
        results.sessions = {
          success: sessionsResponse.success,
          data: sessionsResponse.data,
          error: sessionsResponse.error
        };
        if (sessionsResponse.success) {
          setSessions(sessionsResponse.data.sessions || []);
        }
      } catch (err) {
        console.error('❌ Sessions API Error:', err);
        results.sessions = { success: false, error: err.message };
      }

      // Test 2: Get Login History
      console.log('🧪 Testing getLoginHistory...');
      try {
        const historyResponse = await adminApi.getLoginHistory({ limit: 5 });
        console.log('📊 History Response:', historyResponse);
        results.history = {
          success: historyResponse.success,
          data: historyResponse.data,
          error: historyResponse.error
        };
      } catch (err) {
        console.error('❌ History API Error:', err);
        results.history = { success: false, error: err.message };
      }

      // Test 3: Get Security Settings
      console.log('🧪 Testing getSecuritySettings...');
      try {
        const settingsResponse = await adminApi.getSecuritySettings();
        console.log('⚙️ Settings Response:', settingsResponse);
        results.settings = {
          success: settingsResponse.success,
          data: settingsResponse.data,
          error: settingsResponse.error
        };
      } catch (err) {
        console.error('❌ Settings API Error:', err);
        results.settings = { success: false, error: err.message };
      }

      setTestResults(results);
      console.log('✅ All API tests completed!', results);

    } catch (error) {
      console.error('❌ General Test Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiShield className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Session API Test</h1>
            </div>
            <button
              onClick={testAPI}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Test APIs</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">API Test Results</h2>
            
            {Object.entries(testResults).map(([key, result]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 capitalize">{key} API</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {/* Active Sessions Display */}
          {sessions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
              <div className="space-y-3">
                {sessions.map((session, index) => (
                  <div key={session.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.device || session.userAgent || 'Unknown Device'}
                        </p>
                        <p className="text-sm text-gray-600">
                          IP: {session.ip || session.ipAddress || 'Unknown'} • 
                          Location: {session.location || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last Active: {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                      {session.current && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
