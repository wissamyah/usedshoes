import { useState, useRef, useEffect } from 'react';
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
import { Github, Check, X, AlertCircle, Settings, Link2, Unlink, ChevronDown, Eye, EyeOff } from 'lucide-react';

export default function GitHubDropdown() {
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
  const dropdownRef = useRef(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const getButtonColor = () => {
    if (isConnected) return 'bg-green-600 hover:bg-green-700';
    if (connectionStatus === 'error') return 'bg-red-600 hover:bg-red-700';
    return 'bg-gray-600 hover:bg-gray-700';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* GitHub Status Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white transition-colors ${getButtonColor()}`}
      >
        <Github className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">
          {isConnected ? `${owner}/${repo}` : 'GitHub'}
        </span>
        <span className="ml-1 sm:ml-2">
          {getStatusIcon()}
        </span>
        <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 sm:right-0 left-1/2 sm:left-auto transform -translate-x-1/2 sm:translate-x-0 mt-2 w-[90vw] sm:w-80 md:w-96 max-w-md bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Github className="h-5 w-5 mr-2" />
                GitHub Integration
              </h3>
              {isConnected && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </span>
              )}
            </div>
          </div>

          <div className="p-4">
            {isConnected ? (
              <>
                {/* Connected State */}
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 mb-1">Connected Repository</p>
                    <p className="text-sm text-green-700 font-mono">{owner}/{repo}</p>
                  </div>

                  <div className="border-t pt-4">
                    <DataFileSelector />
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Disconnected State - Connection Form */}
                <form onSubmit={handleConnect} className="space-y-3">
                  <div>
                    <label htmlFor="owner" className="block text-xs font-medium text-gray-700 mb-1">
                      Repository Owner
                    </label>
                    <input
                      type="text"
                      id="owner"
                      name="owner"
                      value={formData.owner}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="repo" className="block text-xs font-medium text-gray-700 mb-1">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      id="repo"
                      name="repo"
                      value={formData.repo}
                      onChange={handleInputChange}
                      placeholder="repository-name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="token" className="block text-xs font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <p className="mt-1 text-xs text-gray-500">
                      Token needs 'repo' permissions
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Connect to GitHub
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Generate GitHub Token
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}