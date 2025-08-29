import { useState, useEffect } from 'react';
import { useGitHub } from '../../context/GitHubContext';
import { useUI } from '../../context/UIContext';
import { testGitHubConnection } from '../../services/githubApi';
import { 
  encryptToken, 
  storeEncryptedToken, 
  getEncryptedToken, 
  removeEncryptedToken,
  isValidGitHubToken,
  getTokenHash 
} from '../../utils/encryption';

export default function GitHubSettings() {
  const { 
    isConnected, 
    connectionStatus, 
    owner, 
    repo, 
    connect, 
    disconnect 
  } = useGitHub();
  
  const { showSuccessMessage, showErrorMessage, showInfoMessage } = useUI();

  const [formData, setFormData] = useState({
    owner: owner || '',
    repo: repo || '',
    token: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(false);

  useEffect(() => {
    // Check if there's a stored token
    const storedToken = getEncryptedToken('default');
    setHasStoredToken(!!storedToken);
    
    // Load stored owner/repo if available
    const storedOwner = localStorage.getItem('github_owner');
    const storedRepo = localStorage.getItem('github_repo');
    
    if (storedOwner || storedRepo) {
      setFormData(prev => ({
        ...prev,
        owner: storedOwner || prev.owner,
        repo: storedRepo || prev.repo
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestConnection = async (e) => {
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
      const result = await testGitHubConnection(
        formData.owner.trim(),
        formData.repo.trim(),
        formData.token.trim()
      );

      if (result.success) {
        showSuccessMessage('Connection Successful', 'Successfully connected to GitHub repository');
        console.log('Repository info:', result.repository);
      } else {
        showErrorMessage('Connection Failed', result.error);
      }
    } catch (error) {
      showErrorMessage('Test Failed', error.message);
    } finally {
      setIsLoading(false);
    }
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
      setHasStoredToken(true);
      setFormData(prev => ({ ...prev, token: '' })); // Clear token from form

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
    setHasStoredToken(false);
    setFormData({ owner: '', repo: '', token: '' });
    showInfoMessage('Disconnected', 'Disconnected from GitHub and cleared local data');
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Not Connected';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">GitHub Settings</h2>
          <div className={`text-sm font-medium ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </div>
        </div>

        {isConnected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Connected Repository
            </h3>
            <p className="text-sm text-green-700">
              {owner}/{repo}
            </p>
          </div>
        )}

        <form onSubmit={isConnected ? handleDisconnect : handleConnect}>
          <div className="space-y-4">
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                Repository Owner
              </label>
              <input
                type="text"
                id="owner"
                name="owner"
                value={formData.owner}
                onChange={handleInputChange}
                disabled={isConnected}
                placeholder="your-username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="repo" className="block text-sm font-medium text-gray-700 mb-1">
                Repository Name
              </label>
              <input
                type="text"
                id="repo"
                name="repo"
                value={formData.repo}
                onChange={handleInputChange}
                disabled={isConnected}
                placeholder="your-repo-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            {!isConnected && (
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Generate a Personal Access Token with 'repo' permissions at GitHub Settings → Developer settings → Personal access tokens
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {!isConnected && (
              <>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connecting...' : 'Connect'}
                </button>
              </>
            )}

            {isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Disconnect
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Instructions</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800">Step 1: Create a GitHub Repository</h4>
              <p>Create a private repository on GitHub where your data will be stored.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Step 2: Generate Personal Access Token</h4>
              <p>
                Go to GitHub Settings → Developer settings → Personal access tokens → 
                Generate new token (classic) with 'repo' permissions.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Step 3: Connect</h4>
              <p>
                Enter your repository details and token above, test the connection, 
                then click Connect to start syncing your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}