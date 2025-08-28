import { useState } from 'react';
import {
  CloudUpload,
  CloudDownload,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

function Header({ onSyncData, syncStatus, lastSyncTime }) {
  const [showSyncDetails, setShowSyncDetails] = useState(false);

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <CloudUpload className="h-5 w-5 animate-pulse" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <CloudDownload className="h-5 w-5" />;
    }
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const sync = new Date(timestamp);
    const diffMs = now - sync;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Used Shoes Tracker
              </h1>
            </div>
            <div className="hidden sm:block ml-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Sync status and actions */}
          <div className="flex items-center space-x-4">
            {/* Sync status indicator */}
            <div className="relative">
              <button
                onClick={() => setShowSyncDetails(!showSyncDetails)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 ${getSyncStatusColor()}`}
              >
                {getSyncStatusIcon()}
                <span className="hidden sm:inline">
                  {syncStatus === 'syncing' ? 'Syncing...' : 
                   syncStatus === 'success' ? 'Synced' :
                   syncStatus === 'error' ? 'Sync Error' : 'Not Synced'}
                </span>
              </button>

              {/* Sync details dropdown */}
              {showSyncDetails && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="p-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Sync Status
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Last sync: {formatLastSync(lastSyncTime)}</div>
                      <div>Status: {syncStatus || 'Idle'}</div>
                      {syncStatus === 'error' && (
                        <div className="text-red-600 mt-2">
                          Failed to sync with GitHub. Check your connection and token.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Manual sync button */}
            <button
              onClick={onSyncData}
              disabled={syncStatus === 'syncing'}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CloudUpload className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;