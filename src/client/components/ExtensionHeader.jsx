import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const ExtensionHeader = ({
  onSync,
  isLoading,
  syncStatus,
  lastSync,
  hasUnsavedChanges
}) => {
  const [showSyncMessage, setShowSyncMessage] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState(0);

  const handleSync = async () => {
    // Rate limit check - prevent sync if called within last 10 seconds
    const now = Date.now();
    if (now - lastSyncAttempt < 10000) {
      return; // Silently ignore rapid clicks
    }

    setShowSyncMessage(false);
    setLastSyncAttempt(now);

    try {
      await onSync();
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Check if sync button should be disabled due to rate limiting
  const isSyncDisabled = () => {
    const now = Date.now();
    return isLoading || (now - lastSyncAttempt < 10000);
  };

  // Get remaining cooldown time
  const getCooldownTime = () => {
    const now = Date.now();
    const remaining = Math.max(0, 10000 - (now - lastSyncAttempt));
    return Math.ceil(remaining / 1000);
  };

  // Update cooldown timer every second
  useEffect(() => {
    let interval;
    if (lastSyncAttempt > 0) {
      interval = setInterval(() => {
        const remaining = getCooldownTime();
        setCooldownTimer(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lastSyncAttempt]);

  const getSyncStatusIcon = () => {
    switch (syncStatus.status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSyncStatusText = () => {
    if (hasUnsavedChanges) {
      return 'Unsaved changes';
    }
    
    switch (syncStatus.status) {
      case 'synced':
        return lastSync ? `Last synced: ${new Date(lastSync).toLocaleString()}` : 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync failed';
      default:
        return 'Not synced';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Extension Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your browser extension preferences and sync across devices
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sync Status */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {getSyncStatusIcon()}
            <span>{getSyncStatusText()}</span>
          </div>
          
          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncDisabled()}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              ${isSyncDisabled()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#015763] text-white hover:bg-[#014a54] active:bg-[#013d47]'
              }
            `}
            title={isSyncDisabled() && !isLoading ? `Please wait ${getCooldownTime()}s before syncing again` : ''}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' :
             (getCooldownTime() > 0 && !isLoading) ? `Wait ${getCooldownTime()}s` :
             'Sync Settings'}
          </button>
        </div>
      </div>
      
      {/* Success Message */}
      {showSyncMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Settings synced successfully!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtensionHeader;
