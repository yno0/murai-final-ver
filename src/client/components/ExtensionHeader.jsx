import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const ExtensionHeader = ({ 
  onSync, 
  isLoading, 
  syncStatus, 
  lastSync,
  hasUnsavedChanges 
}) => {
  const [showSyncMessage, setShowSyncMessage] = useState(false);

  const handleSync = async () => {
    setShowSyncMessage(false);
    try {
      await onSync();
      setShowSyncMessage(true);
      setTimeout(() => setShowSyncMessage(false), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

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
            disabled={isLoading}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              ${isLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#015763] text-white hover:bg-[#014a54] active:bg-[#013d47]'
              }
            `}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Sync Settings'}
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
