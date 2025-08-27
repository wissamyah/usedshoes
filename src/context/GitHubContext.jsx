import { createContext, useContext, useState, useEffect } from 'react';
import { GitHubAPI } from '../services/githubApi';
import { 
  decryptToken, 
  getEncryptedToken, 
  removeEncryptedToken 
} from '../utils/encryption';

// GitHub API configuration
const DATA_FILE_NAME = 'data.json';

// Initial GitHub state
const initialState = {
  isConnected: false,
  owner: '',
  repo: '',
  connectionStatus: null, // null, 'connecting', 'connected', 'error'
  lastSync: null,
  syncStatus: null, // null, 'syncing', 'success', 'error'
  error: null,
  api: null, // GitHubAPI instance
};

const GitHubContext = createContext(null);

export function GitHubProvider({ children }) {
  const [state, setState] = useState(initialState);

  // Load GitHub settings from localStorage on mount
  useEffect(() => {
    const loadStoredSettings = async () => {
      try {
        const owner = localStorage.getItem('github_owner');
        const repo = localStorage.getItem('github_repo');
        const encryptedToken = getEncryptedToken('default');
        const lastSync = localStorage.getItem('github_last_sync');

        if (owner && repo && encryptedToken) {
          try {
            const token = await decryptToken(encryptedToken);
            const api = new GitHubAPI(owner, repo, token);
            
            setState(prev => ({
              ...prev,
              owner,
              repo,
              isConnected: true,
              lastSync: lastSync || null,
              api,
            }));
          } catch (error) {
            console.warn('Failed to decrypt stored token, clearing stored credentials:', error.message);
            // Clear invalid stored data - this is normal after the encryption method change
            removeEncryptedToken('default');
            localStorage.removeItem('github_owner');
            localStorage.removeItem('github_repo');
            localStorage.removeItem('github_last_sync');
            
            setState(prev => ({
              ...prev,
              connectionStatus: null,
              error: null,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load GitHub settings:', error);
      }
    };

    loadStoredSettings();
  }, []);

  // Connect to GitHub with new credentials
  const connect = async (owner, repo, token) => {
    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));
    
    try {
      const api = new GitHubAPI(owner, repo, token);
      const testResult = await api.testConnection();
      
      if (testResult.success) {
        setState(prev => ({
          ...prev,
          owner,
          repo,
          isConnected: true,
          connectionStatus: 'connected',
          error: null,
          api,
        }));

        // Save last sync time
        localStorage.setItem('github_last_sync', new Date().toISOString());
        
        return { success: true };
      } else {
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'error', 
          error: testResult.error 
        }));
        return testResult;
      }
    } catch (error) {
      const errorMessage = `Connection failed: ${error.message}`;
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'error', 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Test GitHub connection (for testing purposes)
  const testConnection = async (owner, repo, token) => {
    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));
    
    try {
      const api = new GitHubAPI(owner, repo, token);
      const result = await api.testConnection();
      
      setState(prev => ({ 
        ...prev, 
        connectionStatus: result.success ? 'connected' : 'error',
        error: result.success ? null : result.error 
      }));
      
      return result;
    } catch (error) {
      const errorMessage = `Connection failed: ${error.message}`;
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'error', 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Fetch data from GitHub
  const fetchData = async () => {
    if (!state.isConnected || !state.api) {
      throw new Error('GitHub not configured');
    }

    setState(prev => ({ ...prev, syncStatus: 'syncing', error: null }));

    try {
      const result = await state.api.fetchData(DATA_FILE_NAME);
      
      if (result.success) {
        const lastSync = new Date().toISOString();
        setState(prev => ({ 
          ...prev, 
          syncStatus: 'success',
          lastSync,
          error: null,
        }));
        
        localStorage.setItem('github_last_sync', lastSync);
        
        return { data: result.data, sha: result.sha };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        syncStatus: 'error',
        error: error.message,
      }));
      throw error;
    }
  };

  // Save data to GitHub
  const saveData = async (data, commitMessage = 'Update business data') => {
    if (!state.isConnected || !state.api) {
      throw new Error('GitHub not configured');
    }

    setState(prev => ({ ...prev, syncStatus: 'syncing', error: null }));

    try {
      const result = await state.api.updateData(
        DATA_FILE_NAME, 
        data, 
        `${commitMessage}\n\n🤖 Generated with Used Shoes Tracker`
      );
      
      if (result.success) {
        const lastSync = new Date().toISOString();
        setState(prev => ({ 
          ...prev, 
          syncStatus: 'success',
          lastSync,
          error: null,
        }));
        
        localStorage.setItem('github_last_sync', lastSync);
        
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        syncStatus: 'error',
        error: error.message,
      }));
      throw error;
    }
  };

  // Disconnect GitHub
  const disconnect = () => {
    removeEncryptedToken('default');
    localStorage.removeItem('github_owner');
    localStorage.removeItem('github_repo');
    localStorage.removeItem('github_last_sync');
    setState(initialState);
  };

  const value = {
    ...state,
    connect,
    testConnection,
    fetchData,
    saveData,
    disconnect,
    
    // Helper to clear sync status after a delay
    clearSyncStatus: () => {
      setTimeout(() => {
        setState(prev => ({ ...prev, syncStatus: null }));
      }, 3000);
    },
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
}

export function useGitHub() {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
}

export default GitHubContext;