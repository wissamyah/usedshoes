import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGitHub } from '../../context/GitHubContext';
import { useUI } from '../../context/UIContext';
import DataFileSelector from '../DataFileSelector';
import { testGitHubConnection } from '../../services/githubApi';
import {
  encryptToken,
  storeEncryptedToken,
  getEncryptedToken,
  removeEncryptedToken,
  isValidGitHubToken
} from '../../utils/encryption';
import { Github, Check, X, AlertCircle, Settings, Link2, Unlink, ChevronDown, Eye, EyeOff, CloudUpload, CloudDownload, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export default function GitHubDropdown({ onSyncData, syncStatus, lastSyncTime }) {
  const {
    isConnected,
    connectionStatus,
    owner,
    repo,
    connect,
    disconnect
  } = useGitHub();

  const { showSuccessMessage, showErrorMessage, showInfoMessage } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const [formData, setFormData] = useState({
    owner: owner || '',
    repo: repo || '',
    token: ''
  });

  // Load stored settings on mount
  useEffect(() => {
    const storedOwner = localStorage.getItem('github_owner');
    const storedRepo = localStorage.getItem('github_repo');

    if (storedOwner || storedRepo) {
      setFormData(prev => ({
        ...prev,
        owner: storedOwner || prev.owner,
        repo: storedRepo || prev.repo
      }));
    }
  }, [owner, repo]);

  // Calculate button position for portal dropdown
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320;
      const viewportWidth = window.innerWidth;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // Calculate optimal left position (right-aligned to button by default)
      let left = rect.right + scrollX - dropdownWidth;

      // Ensure dropdown doesn't go off the left edge
      if (left < 8) {
        left = 8;
      }

      // Ensure dropdown doesn't go off the right edge
      if (left + dropdownWidth > viewportWidth - 8) {
        left = viewportWidth - dropdownWidth - 8;
      }

      setButtonPosition({
        top: rect.bottom + scrollY + 8,
        left: left,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 320;
        const viewportWidth = window.innerWidth;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let left = rect.right + scrollX - dropdownWidth;

        if (left < 8) {
          left = 8;
        }

        if (left + dropdownWidth > viewportWidth - 8) {
          left = viewportWidth - dropdownWidth - 8;
        }

        setButtonPosition({
          top: rect.bottom + scrollY + 8,
          left: left,
          width: rect.width
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConnect = async (e) => {
    e.preventDefault();

    if (!formData.owner.trim() || !formData.repo.trim() || !formData.token.trim()) {
      showErrorMessage('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (!isValidGitHubToken(formData.token)) {
      showErrorMessage('Invalid Token', 'Invalid GitHub token format');
      return;
    }

    setIsLoading(true);

    try {
      // Test connection first
      const testResult = await testGitHubConnection(
        formData.owner.trim(),
        formData.repo.trim(),
        formData.token.trim()
      );

      if (!testResult.success) {
        showErrorMessage('Connection Failed', testResult.error);
        setIsLoading(false);
        return;
      }

      // Encrypt and store the token
      const encryptedToken = await encryptToken(formData.token.trim());
      storeEncryptedToken('default', encryptedToken);

      // Store owner and repo
      localStorage.setItem('github_owner', formData.owner.trim());
      localStorage.setItem('github_repo', formData.repo.trim());

      // Connect using the context
      await connect(formData.owner.trim(), formData.repo.trim(), formData.token.trim());

      showSuccessMessage('Connected', 'Successfully connected to GitHub!');
      setFormData(prev => ({ ...prev, token: '' })); // Clear token from form
      setIsOpen(false);

    } catch (error) {
      showErrorMessage('Connection Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    // Remove stored credentials
    removeEncryptedToken('default');
    localStorage.removeItem('github_owner');
    localStorage.removeItem('github_repo');

    disconnect();
    setFormData({ owner: '', repo: '', token: '' });
    showInfoMessage('Disconnected', 'Disconnected from GitHub');
    setIsOpen(false);
  };

  const getStatusIcon = () => {
    if (connectionStatus === 'connecting' || isLoading) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />;
    }
    if (isConnected) {
      return <Check className="h-4 w-4" />;
    }
    if (connectionStatus === 'error') {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <Unlink className="h-4 w-4" />;
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
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CloudDownload className="h-4 w-4" />;
    }
  };


  return (
    <div className="relative">
      {/* GitHub Status Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '8px 12px',
          border: 'none',
          fontSize: '14px',
          lineHeight: '1.25',
          fontWeight: '500',
          borderRadius: '8px',
          color: '#ebebeb',
          backgroundColor: isConnected
            ? 'rgba(34, 197, 94, 0.1)'
            : connectionStatus === 'error'
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(107, 114, 128, 0.1)',
          border: isConnected
            ? '1px solid rgba(34, 197, 94, 0.3)'
            : connectionStatus === 'error'
              ? '1px solid rgba(239, 68, 68, 0.3)'
              : '1px solid rgba(107, 114, 128, 0.3)',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (isConnected) {
            e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
            e.target.style.borderColor = 'rgba(34, 197, 94, 0.4)';
          } else if (connectionStatus === 'error') {
            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          } else {
            e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.15)';
            e.target.style.borderColor = 'rgba(107, 114, 128, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (isConnected) {
            e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
            e.target.style.borderColor = 'rgba(34, 197, 94, 0.3)';
          } else if (connectionStatus === 'error') {
            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          } else {
            e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
            e.target.style.borderColor = 'rgba(107, 114, 128, 0.3)';
          }
        }}
      >
        <Github style={{ height: '16px', width: '16px', color: isConnected ? '#22c55e' : connectionStatus === 'error' ? '#ef4444' : '#9ca3af' }} />
        <span className="ml-2 hidden sm:inline">
          {isConnected ? `${owner}/${repo}` : 'GitHub'}
        </span>
        <span className="ml-1 sm:ml-2">
          {getStatusIcon()}
        </span>
        <ChevronDown style={{ marginLeft: '4px', height: '16px', width: '16px', color: '#b3b3b3', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {/* Dropdown Menu - Rendered as Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: buttonPosition.top,
            left: buttonPosition.left,
            width: '320px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            border: '1px solid #404040',
            zIndex: 999999,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #404040' }}>
            <div className="flex items-center justify-between">
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb', display: 'flex', alignItems: 'center' }}>
                <Github style={{ height: '20px', width: '20px', marginRight: '8px', color: '#b3b3b3' }} />
                GitHub Integration
              </h3>
              {isConnected && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <Check style={{ height: '12px', width: '12px', marginRight: '4px' }} />
                  Connected
                </span>
              )}
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            {isConnected ? (
              <>
                {/* Connected State */}
                <div className="space-y-4">
                  <div style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#22c55e', marginBottom: '4px' }}>Connected Repository</p>
                    <p style={{ fontSize: '14px', color: '#16a34a', fontFamily: 'monospace' }}>{owner}/{repo}</p>
                  </div>

                  {/* Sync Status Section */}
                  <div style={{
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>Sync Status</p>
                      <div className={`flex items-center gap-1 ${getSyncStatusColor()}`}>
                        {getSyncStatusIcon()}
                        <span className="text-xs font-medium">
                          {syncStatus === 'syncing' ? 'Syncing...' :
                           syncStatus === 'success' ? 'Synced' :
                           syncStatus === 'error' ? 'Error' : 'Ready'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between" style={{ fontSize: '12px', color: '#b3b3b3' }}>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last sync: {formatLastSync(lastSyncTime)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onSyncData();
                      }}
                      disabled={syncStatus === 'syncing'}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px 12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '6px',
                        border: '1px solid #3b82f6',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                        opacity: syncStatus === 'syncing' ? '0.5' : '1',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (syncStatus !== 'syncing') {
                          e.target.style.backgroundColor = '#2563eb';
                          e.target.style.borderColor = '#2563eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (syncStatus !== 'syncing') {
                          e.target.style.backgroundColor = '#3b82f6';
                          e.target.style.borderColor = '#3b82f6';
                        }
                      }}
                      onFocus={(e) => {
                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <CloudUpload style={{ height: '16px', width: '16px', marginRight: '6px' }} />
                      {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid #404040', paddingTop: '16px' }}>
                    <DataFileSelector />
                  </div>

                  <button
                    onClick={handleDisconnect}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      border: '1px solid #ef4444',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      e.target.style.borderColor = '#dc2626';
                      e.target.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#ef4444';
                      e.target.style.color = '#ef4444';
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <Unlink style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Disconnected State - Connection Form */}
                <form onSubmit={handleConnect} className="space-y-3">
                  <div>
                    <label htmlFor="owner" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', marginBottom: '4px' }}>
                      Repository Owner
                    </label>
                    <input
                      type="text"
                      id="owner"
                      name="owner"
                      value={formData.owner}
                      onChange={handleInputChange}
                      placeholder="username"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        backgroundColor: '#1c1c1c',
                        color: '#ebebeb',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#404040';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="repo" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', marginBottom: '4px' }}>
                      Repository Name
                    </label>
                    <input
                      type="text"
                      id="repo"
                      name="repo"
                      value={formData.repo}
                      onChange={handleInputChange}
                      placeholder="repository-name"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        backgroundColor: '#1c1c1c',
                        color: '#ebebeb',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#404040';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="token" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', marginBottom: '4px' }}>
                      Personal Access Token
                    </label>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        id="token"
                        name="token"
                        value={formData.token}
                        onChange={handleInputChange}
                        placeholder="ghp_xxxxxxxxxxxx"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          paddingRight: '40px',
                          fontSize: '14px',
                          border: '1px solid #404040',
                          borderRadius: '6px',
                          backgroundColor: '#1c1c1c',
                          color: '#ebebeb',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#404040';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showToken ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    <p style={{ marginTop: '4px', fontSize: '12px', color: '#808080' }}>
                      Token needs 'repo' permissions
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      borderRadius: '6px',
                      border: '1px solid #3b82f6',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? '0.5' : '1',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.borderColor = '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.backgroundColor = '#3b82f6';
                        e.target.style.borderColor = '#3b82f6';
                      }
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          marginRight: '8px',
                          border: '2px solid transparent',
                          borderTop: '2px solid #ffffff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                        Connect to GitHub
                      </>
                    )}
                  </button>
                </form>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #404040' }}>
                  <a
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                  >
                    <Settings style={{ height: '12px', width: '12px', marginRight: '4px' }} />
                    Generate GitHub Token
                  </a>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}