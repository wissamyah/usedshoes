import { createContext, useContext, useState, useEffect } from 'react';

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const DATA_FILE_NAME = 'data.json';

// Initial GitHub state
const initialState = {
  isConnected: false,
  owner: '',
  repo: '',
  token: '',
  connectionStatus: null, // null, 'connecting', 'connected', 'error'
  lastSync: null,
  syncStatus: null, // null, 'syncing', 'success', 'error'
  error: null,
};

const GitHubContext = createContext(null);

export function GitHubProvider({ children }) {
  const [state, setState] = useState(initialState);

  // Load GitHub settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('github-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setState(prev => ({
          ...prev,
          owner: settings.owner || '',
          repo: settings.repo || '',
          token: settings.token || '',
          isConnected: !!(settings.owner && settings.repo && settings.token),
          lastSync: settings.lastSync || null,
        }));
      } catch (error) {
        console.error('Failed to load GitHub settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = (newSettings) => {
    const settingsToSave = {
      owner: newSettings.owner,
      repo: newSettings.repo,
      token: newSettings.token,
      lastSync: newSettings.lastSync,
    };
    
    localStorage.setItem('github-settings', JSON.stringify(settingsToSave));
    
    setState(prev => ({
      ...prev,
      ...newSettings,
      isConnected: !!(newSettings.owner && newSettings.repo && newSettings.token),
    }));
  };

  // Test GitHub connection
  const testConnection = async (owner, repo, token) => {
    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));
    
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.ok) {
        setState(prev => ({ ...prev, connectionStatus: 'connected', error: null }));
        return { success: true };
      } else {
        const errorData = await response.json();
        const error = `GitHub API Error: ${errorData.message || response.statusText}`;
        setState(prev => ({ ...prev, connectionStatus: 'error', error }));
        return { success: false, error };
      }
    } catch (error) {
      const errorMessage = `Connection failed: ${error.message}`;
      setState(prev => ({ ...prev, connectionStatus: 'error', error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  // Fetch data from GitHub
  const fetchData = async () => {
    if (!state.isConnected) {
      throw new Error('GitHub not configured');
    }

    setState(prev => ({ ...prev, syncStatus: 'syncing', error: null }));

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${state.owner}/${state.repo}/contents/${DATA_FILE_NAME}`,
        {
          headers: {
            'Authorization': `token ${state.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (response.status === 404) {
        // File doesn't exist, return initial data structure
        setState(prev => ({ 
          ...prev, 
          syncStatus: 'success',
          lastSync: new Date().toISOString(),
        }));
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
      }

      const fileData = await response.json();
      const content = JSON.parse(atob(fileData.content));
      
      setState(prev => ({ 
        ...prev, 
        syncStatus: 'success',
        lastSync: new Date().toISOString(),
      }));
      
      // Update saved settings with last sync time
      saveSettings({ 
        ...state, 
        lastSync: new Date().toISOString() 
      });

      return { data: content, sha: fileData.sha };
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
    if (!state.isConnected) {
      throw new Error('GitHub not configured');
    }

    setState(prev => ({ ...prev, syncStatus: 'syncing', error: null }));

    try {
      // First, get the current file to get its SHA
      let fileSha = null;
      const existingFileResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${state.owner}/${state.repo}/contents/${DATA_FILE_NAME}`,
        {
          headers: {
            'Authorization': `token ${state.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (existingFileResponse.ok) {
        const existingFile = await existingFileResponse.json();
        fileSha = existingFile.sha;
      }

      // Prepare the content
      const content = btoa(JSON.stringify(data, null, 2));
      
      const payload = {
        message: `${commitMessage}\n\n🤖 Generated with Used Shoes Tracker`,
        content: content,
        ...(fileSha && { sha: fileSha }),
      };

      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${state.owner}/${state.repo}/contents/${DATA_FILE_NAME}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${state.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      
      setState(prev => ({ 
        ...prev, 
        syncStatus: 'success',
        lastSync: new Date().toISOString(),
      }));
      
      // Update saved settings with last sync time
      saveSettings({ 
        ...state, 
        lastSync: new Date().toISOString() 
      });

      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        syncStatus: 'error',
        error: error.message,
      }));
      throw error;
    }
  };

  // Update GitHub settings
  const updateSettings = async (newSettings) => {
    const { owner, repo, token } = newSettings;
    
    if (owner && repo && token) {
      // Test connection with new settings
      const result = await testConnection(owner, repo, token);
      if (result.success) {
        saveSettings(newSettings);
        return { success: true };
      } else {
        return result;
      }
    } else {
      // Just save the settings without testing
      saveSettings(newSettings);
      return { success: true };
    }
  };

  // Disconnect GitHub
  const disconnect = () => {
    localStorage.removeItem('github-settings');
    setState(initialState);
  };

  const value = {
    ...state,
    testConnection,
    fetchData,
    saveData,
    updateSettings,
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