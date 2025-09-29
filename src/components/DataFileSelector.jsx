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
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '6px',
          border: '1px solid #404040',
          backgroundColor: '#1c1c1c',
          color: '#ebebeb',
          cursor: 'pointer',
          transition: 'all 0.2s',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2a2a2a';
          e.currentTarget.style.borderColor = '#555555';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1c1c1c';
          e.currentTarget.style.borderColor = '#404040';
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
          e.currentTarget.style.borderColor = '#3b82f6';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = '#404040';
        }}
      >
        <Database style={{
          height: '16px',
          width: '16px',
          color: '#b3b3b3',
          pointerEvents: 'none'
        }} />
        <span style={{ pointerEvents: 'none' }}>{currentDataFile || 'data.json'}</span>
        <ChevronDown style={{
          height: '16px',
          width: '16px',
          color: '#b3b3b3',
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          pointerEvents: 'none'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          marginBottom: '8px',
          width: '256px',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          border: '1px solid #404040',
          zIndex: 999999
        }}>
          <div style={{ padding: '8px' }}>
            <div style={{
              padding: '8px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#808080',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Data Files
            </div>
            
            {loading ? (
              <div style={{ padding: '8px 12px', fontSize: '14px', color: '#b3b3b3' }}>Loading...</div>
            ) : error ? (
              <div style={{
                padding: '8px 12px',
                fontSize: '14px',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle style={{ height: '16px', width: '16px' }} />
                {error}
              </div>
            ) : (
              <div style={{ marginTop: '4px', maxHeight: '240px', overflowY: 'auto' }}>
                {availableFiles.map((file) => (
                  <button
                    key={file}
                    onClick={() => handleSelectFile(file)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: '#ebebeb',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>{file}</span>
                    {file === currentDataFile && (
                      <Check style={{ height: '16px', width: '16px', color: '#22c55e' }} />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #404040' }}>
              <button
                onClick={() => setShowNewFileDialog(true)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: '14px',
                  color: '#3b82f6',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <Plus style={{ height: '16px', width: '16px' }} />
                Create New Data File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            padding: '24px',
            width: '384px',
            border: '1px solid #404040'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#ebebeb' }}>
              Create New Data File
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#b3b3b3',
                marginBottom: '8px'
              }}>
                File Name
              </label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g., data-2 or inventory-2025"
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
                disabled={creating}
              />
              <p style={{ marginTop: '4px', fontSize: '12px', color: '#808080' }}>
                .json will be added automatically if not provided
              </p>
            </div>

            {error && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#ef4444'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowNewFileDialog(false);
                  setNewFileName('');
                  setError(null);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#b3b3b3',
                  backgroundColor: 'transparent',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? '0.5' : '1',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!creating) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.borderColor = '#555555';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!creating) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#404040';
                  }
                }}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#3b82f6',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  cursor: (creating || !newFileName.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (creating || !newFileName.trim()) ? '0.5' : '1',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!creating && newFileName.trim()) {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.borderColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!creating && newFileName.trim()) {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
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