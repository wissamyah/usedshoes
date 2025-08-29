import { useState, useEffect } from 'react';
import { useGitHub } from '../context/GitHubContext';
import { useData } from '../context/DataContext';
import { ChevronDown, Plus, Database, Check, AlertCircle } from 'lucide-react';

export default function DataFileSelector() {
  const { 
    isConnected, 
    currentDataFile, 
    setDataFile, 
    listDataFiles,
    createDataFile,
    api 
  } = useGitHub();
  
  const { clearData } = useData();
  
  const [isOpen, setIsOpen] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [creating, setCreating] = useState(false);

  // Load available data files
  useEffect(() => {
    if (isConnected && isOpen) {
      loadAvailableFiles();
    }
  }, [isConnected, isOpen]);

  const loadAvailableFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const files = await listDataFiles();
      setAvailableFiles(files);
    } catch (err) {
      setError('Failed to load data files');
      console.error('Error loading data files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = async (fileName) => {
    if (fileName === currentDataFile) {
      setIsOpen(false);
      return;
    }

    try {
      // Clear current data before switching
      clearData();
      
      // Switch to new file
      await setDataFile(fileName);
      
      setIsOpen(false);
      
      // Reload the page to fetch new data
      window.location.reload();
    } catch (err) {
      setError('Failed to switch data file');
      console.error('Error switching data file:', err);
    }
  };

  const handleCreateNewFile = async () => {
    if (!newFileName.trim()) {
      setError('Please enter a file name');
      return;
    }

    // Ensure the file name ends with .json
    const fileName = newFileName.endsWith('.json') 
      ? newFileName 
      : `${newFileName}.json`;

    // Validate file name
    if (!/^[a-zA-Z0-9-_]+\.json$/.test(fileName)) {
      setError('Invalid file name. Use only letters, numbers, hyphens, and underscores.');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const result = await createDataFile(fileName);
      
      if (result.success) {
        // Switch to the new file
        await setDataFile(fileName);
        setShowNewFileDialog(false);
        setNewFileName('');
        
        // Reload to fetch the new empty data
        window.location.reload();
      } else {
        setError(result.error || 'Failed to create new data file');
      }
    } catch (err) {
      setError('Failed to create new data file');
      console.error('Error creating data file:', err);
    } finally {
      setCreating(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Database className="h-4 w-4" />
        <span>{currentDataFile || 'data.json'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-2">
            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Data Files
            </div>
            
            {loading ? (
              <div className="px-2 py-3 text-sm text-gray-500">Loading...</div>
            ) : error ? (
              <div className="px-2 py-3 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            ) : (
              <div className="mt-1 max-h-60 overflow-y-auto">
                {availableFiles.map((file) => (
                  <button
                    key={file}
                    onClick={() => handleSelectFile(file)}
                    className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between group"
                  >
                    <span>{file}</span>
                    {file === currentDataFile && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setShowNewFileDialog(true)}
                className="w-full text-left px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Data File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Data File</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Name
              </label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g., data-2 or inventory-2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={creating}
              />
              <p className="mt-1 text-xs text-gray-500">
                .json will be added automatically if not provided
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewFileDialog(false);
                  setNewFileName('');
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={creating || !newFileName.trim()}
              >
                {creating ? 'Creating...' : 'Create File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}