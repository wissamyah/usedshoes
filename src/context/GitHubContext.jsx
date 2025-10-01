import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GitHubAPI } from '../services/githubApi';
import { 
  decryptToken, 
  getEncryptedToken, 
  removeEncryptedToken 
} from '../utils/encryption';

// GitHub API configuration
const DEFAULT_DATA_FILE = 'data.json';

// Initial GitHub state
const initialState = {
  isConnected: false,
  owner: '',
  repo: '',
  currentDataFile: DEFAULT_DATA_FILE,
  connectionStatus: null, // null, 'connecting', 'connected', 'error'
  lastSync: null,
  syncStatus: null, // null, 'syncing', 'success', 'error'
  error: null,
  api: null, // GitHubAPI instance
};

const GitHubContext = createContext(null);

export function GitHubProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [currentDataFile, setCurrentDataFile] = useState(DEFAULT_DATA_FILE);
  const [fileShas, setFileShas] = useState({}); // Track SHA for each file
  const [disconnectCallbacks, setDisconnectCallbacks] = useState([]); // Track disconnect callbacks

  // Load GitHub settings from localStorage on mount
  useEffect(() => {
    const loadStoredSettings = async () => {
      try {
        const owner = localStorage.getItem('github_owner');
        const repo = localStorage.getItem('github_repo');
        const encryptedToken = getEncryptedToken('default');
        const lastSync = localStorage.getItem('github_last_sync');
        const savedDataFile = localStorage.getItem('github_data_file') || DEFAULT_DATA_FILE;

        if (owner && repo && encryptedToken) {
          try {
            const token = await decryptToken(encryptedToken);
            const api = new GitHubAPI(owner, repo, token);
            
            setState(prev => ({
              ...prev,
              owner,
              repo,
              isConnected: true,
              currentDataFile: savedDataFile,
              lastSync: lastSync || null,
              api,
            }));
            setCurrentDataFile(savedDataFile);
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
      const result = await state.api.fetchData(currentDataFile);
      
      if (result.success) {
        const lastSync = new Date().toISOString();
        setState(prev => ({ 
          ...prev, 
          syncStatus: 'success',
          lastSync,
          error: null,
        }));
        
        localStorage.setItem('github_last_sync', lastSync);
        
        // Store the SHA for this file
        if (result.sha) {
          setFileShas(prev => ({ ...prev, [currentDataFile]: result.sha }));
        }
        
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
      // First, get the latest SHA for this file to avoid conflicts
      let currentSha = fileShas[currentDataFile];
      
      // If we don't have a SHA, fetch the current file to get it
      if (!currentSha) {
        try {
          const currentFile = await state.api.fetchData(currentDataFile);
          if (currentFile.success && currentFile.sha) {
            currentSha = currentFile.sha;
            setFileShas(prev => ({ ...prev, [currentDataFile]: currentSha }));
          }
        } catch (error) {
          // File might not exist yet, that's ok
          console.log('File might not exist yet, will create new');
        }
      }
      
      const result = await state.api.updateData(
        currentDataFile, 
        data, 
        `${commitMessage}\n\n🤖 Generated with Friperie`,
        currentSha
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
        
        // Update the SHA for this file after successful save
        if (result.commit && result.commit.sha) {
          setFileShas(prev => ({ ...prev, [currentDataFile]: result.commit.sha }));
        }
        
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

  // Force save data to GitHub (overwrites corrupted files)
  const forceSaveData = async (data, commitMessage = 'Force overwrite data file') => {
    if (!state.isConnected || !state.api) {
      throw new Error('GitHub not configured');
    }

    setState(prev => ({ ...prev, syncStatus: 'syncing', error: null }));

    try {
      // Force overwrite - the API will handle fetching the SHA for us
      const result = await state.api.updateData(
        currentDataFile,
        data,
        `${commitMessage}\n\n🤖 Force overwrite with Claude Code`,
        null, // No SHA needed initially
        true // Force overwrite flag
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

        // Update the SHA for this file after successful save
        if (result.commit && result.commit.sha) {
          setFileShas(prev => ({ ...prev, [currentDataFile]: result.commit.sha }));
        }

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

  // Set data file
  const setDataFile = async (fileName) => {
    setCurrentDataFile(fileName);
    setState(prev => ({ ...prev, currentDataFile: fileName }));
    localStorage.setItem('github_data_file', fileName);
    // Clear the SHA for the new file to force a fresh fetch
    setFileShas(prev => ({ ...prev, [fileName]: null }));
  };

  // List available data files
  const listDataFiles = async () => {
    if (!state.isConnected || !state.api) {
      throw new Error('GitHub not configured');
    }

    try {
      const encryptedToken = getEncryptedToken('default');
      if (!encryptedToken) {
        console.error('No GitHub token found');
        return [DEFAULT_DATA_FILE];
      }

      const token = await decryptToken(encryptedToken);
      const response = await fetch(
        `https://api.github.com/repos/${state.owner}/${state.repo}/contents/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to list files');
      }

      const files = await response.json();
      return files
        .filter(file => file.name.endsWith('.json') && file.name.includes('data'))
        .map(file => file.name);
    } catch (error) {
      console.error('Error listing data files:', error);
      return [DEFAULT_DATA_FILE];
    }
  };

  // Create new data file
  const createDataFile = async (fileName) => {
    if (!state.isConnected || !state.api) {
      throw new Error('GitHub not configured');
    }

    return await state.api.createFile(fileName, {}, `Create new data file: ${fileName}`);
  };

  // Register a callback to be called on disconnect
  const onDisconnect = useCallback((callback) => {
    setDisconnectCallbacks(prev => [...prev, callback]);
    // Return cleanup function
    return () => {
      setDisconnectCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  // Disconnect GitHub
  const disconnect = () => {
    // Execute all disconnect callbacks
    disconnectCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error executing disconnect callback:', error);
      }
    });
    
    removeEncryptedToken('default');
    localStorage.removeItem('github_owner');
    localStorage.removeItem('github_repo');
    localStorage.removeItem('github_last_sync');
    localStorage.removeItem('github_data_file');
    setState(initialState);
    setFileShas({});
  };

  const value = {
    ...state,
    currentDataFile,
    connect,
    testConnection,
    fetchData,
    saveData,
    forceSaveData,
    disconnect,
    onDisconnect,
    setDataFile,
    listDataFiles,
    createDataFile,

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