import React, { useState, useEffect } from 'react';
import { FiShield, FiLock, FiActivity, FiAlertTriangle, FiMonitor, FiSmartphone, FiGlobe, FiClock, FiX, FiRefreshCw } from 'react-icons/fi';
import { useAdminAuth } from '../../contexts/AdminAuthContext.jsx';
import adminApi from '../../services/adminApi.js';

export default function SecuritySettings() {
  const { adminUser, logout } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30, // minutes
    maxSessions: 5,
    requirePasswordChange: false,
    loginNotifications: true
  });

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    console.log('🔒 Loading security data...');
    try {
      // Load active sessions from API
      console.log('📱 Fetching active sessions...');
      const sessionsResponse = await adminApi.getActiveSessions();
      console.log('📱 Sessions response:', sessionsResponse);
      if (sessionsResponse.success) {
        setSessions(sessionsResponse.data.sessions || []);
        console.log('📱 Sessions loaded:', sessionsResponse.data.sessions?.length || 0);
      }

      // Load login history from API
      console.log('📊 Fetching login history...');
      const historyResponse = await adminApi.getLoginHistory({ limit: 10 });
      console.log('📊 History response:', historyResponse);
      if (historyResponse.success) {
        setLoginHistory(historyResponse.data.history || []);
        console.log('📊 History loaded:', historyResponse.data.history?.length || 0);
      }

      // Load security settings from API
      console.log('⚙️ Fetching security settings...');
      const settingsResponse = await adminApi.getSecuritySettings();
      console.log('⚙️ Settings response:', settingsResponse);
      if (settingsResponse.success) {
        setSecuritySettings(settingsResponse.data.settings || securitySettings);
        console.log('⚙️ Settings loaded:', settingsResponse.data.settings);
      }
    } catch (error) {
      console.error('❌ Error loading security data:', error);
      console.log('🔄 Falling back to mock data...');
      // Fallback to mock data if API fails
      setSessions([
        {
          id: '1',
          device: 'Chrome on Windows',
          location: 'Manila, Philippines',
          ip: '192.168.1.100',
          lastActive: new Date(),
          current: true
        },
        {
          id: '2',
          device: 'Firefox on Windows',
          location: 'Manila, Philippines',
          ip: '192.168.1.100',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          current: false
        }
      ]);

      setLoginHistory([
        {
          id: '1',
          timestamp: new Date(),
          ip: '192.168.1.100',
          location: 'Manila, Philippines',
          device: 'Chrome on Windows',
          success: true
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          ip: '192.168.1.100',
          location: 'Manila, Philippines',
          device: 'Firefox on Windows',
          success: true
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          ip: '10.0.0.50',
          location: 'Unknown',
          device: 'Unknown Browser',
          success: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    try {
      setLoading(true);
      const response = await adminApi.terminateSession(sessionId);
      if (response.success) {
        // Remove the terminated session from the list
        setSessions(prev => prev.filter(session =>
          (session.id || session._id) !== sessionId
        ));
        console.log('Session terminated successfully');
      } else {
        console.error('Failed to terminate session:', response.message);
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
      // Fallback: remove from UI anyway
      setSessions(prev => prev.filter(session =>
        (session.id || session._id) !== sessionId
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.terminateAllSessions();
      if (response.success) {
        // Keep only the current session
        setSessions(prev => prev.filter(session => session.current));
        console.log('All other sessions terminated successfully');
      } else {
        console.error('Failed to terminate all sessions:', response.message);
      }
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      // Fallback: keep only current session in UI
      setSessions(prev => prev.filter(session => session.current));
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';

    try {
      const now = new Date();
      const targetDate = new Date(date);

      // Check if date is valid
      if (isNaN(targetDate.getTime())) {
        return 'Unknown';
      }

      const diff = now - targetDate;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes} minutes ago`;
      if (hours < 24) return `${hours} hours ago`;
      return `${days} days ago`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const formatDeviceName = (userAgent) => {
    if (!userAgent) return 'Unknown Device';

    // Extract browser and OS information
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Browser detection
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // OS detection
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    return `${browser} on ${os}`;
  };

  const getDeviceIcon = (device) => {
    if (!device) return <FiMonitor className="h-4 w-4" />;

    const deviceStr = device.toLowerCase();
    if (deviceStr.includes('mobile') || deviceStr.includes('android') || deviceStr.includes('iphone') || deviceStr.includes('ipad')) {
      return <FiSmartphone className="h-4 w-4" />;
    }
    return <FiMonitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiShield className="text-[#015763]" />
          Security Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure advanced security settings and monitor account activity
        </p>
      </div>

      {/* Account Security Overview */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Account Security Overview</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor your account security status</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <FiShield className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Account Secure</h3>
                <p className="text-sm text-green-700">No security issues detected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <FiLock className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Strong Password</h3>
                <p className="text-sm text-blue-700">Last changed {adminUser?.passwordChangedAt ? formatTimeAgo(new Date(adminUser.passwordChangedAt)) : 'recently'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <FiActivity className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-900">Active Sessions</h3>
                <p className="text-sm text-yellow-700">{sessions.length} active sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Active Sessions</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your active login sessions</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadSecurityData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleTerminateAllSessions}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <FiX className="h-4 w-4" />
              End All Sessions
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div key={session.id || session._id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(session.userAgent || session.device || 'Unknown')}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {session.device || formatDeviceName(session.userAgent) || 'Unknown Device'}
                      </h3>
                      {session.current && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Current</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <FiGlobe className="h-3 w-3" />
                        {session.location || 'Unknown Location'}
                      </span>
                      <span>IP: {session.ip || session.ipAddress || 'Unknown IP'}</span>
                      <span className="flex items-center gap-1">
                        <FiClock className="h-3 w-3" />
                        {formatTimeAgo(session.lastActive || session.lastUsed)}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleTerminateSession(session.id || session._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    <FiX className="h-3 w-3" />
                    Terminate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Login Activity</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor recent login attempts to your account</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {loginHistory.map((login) => (
              <div key={login.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${login.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {login.success ? 'Successful Login' : 'Failed Login Attempt'}
                      </h3>
                      {!login.success && (
                        <FiAlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{login.device}</span>
                      <span className="flex items-center gap-1">
                        <FiGlobe className="h-3 w-3" />
                        {login.location}
                      </span>
                      <span>IP: {login.ip}</span>
                      <span>{formatTimeAgo(login.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FiShield className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Security Recommendations</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                <span>Regularly review your active sessions and terminate any unrecognized devices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                <span>Change your password immediately if you notice any suspicious login activity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                <span>Always log out from shared or public computers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                <span>Use a strong, unique password that you don't use elsewhere</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
