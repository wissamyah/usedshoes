import { useEffect, useRef, memo } from 'react';
import { useData } from '../context/DataContext';
import { useGitHub } from '../context/GitHubContext';
import { validateFinanceData, sanitizeFinanceData, logDataState } from '../utils/dataIntegrity';
import { createLocalBackup, getLocalBackup, hasLocalBackup, getBackupAge } from '../utils/localBackup';

// Memoize DataSync to prevent unnecessary re-renders
const DataSync = memo(function DataSync() {
  const { 
    products, 
    containers, 
    sales, 
    expenses,
    partners,
    withdrawals,
    cashFlows,
    cashInjections, 
    metadata,
    loadData, 
    clearData,
    setLoading, 
    setError,
    unsavedChanges,
    markSaved,
    registerSaveCallback 
  } = useData();
  
  const { 
    isConnected, 
    fetchData, 
    saveData,
    syncStatus,
    owner,
    repo,
    api,
    currentDataFile,
    onDisconnect
  } = useGitHub();

  const dataLoadedRef = useRef(false);
  const lastSaveRef = useRef(null);

  // Reset dataLoadedRef when currentDataFile changes
  useEffect(() => {
    dataLoadedRef.current = false;
  }, [currentDataFile]);

  // Register callback to clear data when GitHub disconnects
  useEffect(() => {
    if (onDisconnect) {
      const cleanup = onDisconnect(() => {
        console.log('GitHub disconnected, clearing local data...');
        clearData();
        dataLoadedRef.current = false;
      });
      
      return cleanup;
    }
  }, [onDisconnect, clearData]);

  // REMOVED: Don't clear data when disconnected to prevent data loss
  // Data will remain available locally, user can reconnect to sync
  // useEffect(() => {
  //   if (!isConnected && dataLoadedRef.current) {
  //     console.log('GitHub disconnected, clearing data...');
  //     clearData();
  //     dataLoadedRef.current = false;
  //   }
  // }, [isConnected, clearData]);

  // Load data on mount if connected to GitHub
  useEffect(() => {
    const loadDataFromGitHub = async () => {
      if (!isConnected || dataLoadedRef.current) return;

      try {
        setLoading(true);
        const result = await fetchData();
        
        if (result?.data) {
          // Validate and load the data structure
          const githubData = typeof result.data === 'string' 
            ? JSON.parse(result.data) 
            : result.data;
            
          const loadedData = {
            products: githubData.products || [],
            containers: githubData.containers || [],
            sales: githubData.sales || [],
            expenses: githubData.expenses || [],
            partners: githubData.partners || [],
            withdrawals: githubData.withdrawals || [],
            cashFlows: githubData.cashFlows || [],
            cashInjections: githubData.cashInjections || [],
            metadata: githubData.metadata || {
              version: '1.0.0',
              lastUpdated: new Date().toISOString(),
              nextIds: {
                product: 1,
                container: 1,
                sale: 1,
                expense: 1,
                partner: 1,
                withdrawal: 1,
                cashFlow: 1,
                cashInjection: 1,
              },
            }
          };

          // Validate loaded data
          const validation = validateFinanceData(loadedData);
          if (!validation.isValid) {
            console.error('❌ Loaded data validation failed:', validation.errors);
            setError(`Loaded data validation failed: ${validation.errors.join(', ')}`);
          }

          if (validation.warnings.length > 0) {
            console.warn('⚠️ Loaded data validation warnings:', validation.warnings);
          }

          // Sanitize and load the data
          const sanitizedData = sanitizeFinanceData(loadedData);
          logDataState(sanitizedData, `Load from GitHub (${currentDataFile})`);

          loadData(sanitizedData);

          console.log(`✅ Data loaded from GitHub (${currentDataFile}) successfully`);
        }
      } catch (error) {
        console.error('Failed to load data from GitHub:', error);
        
        // If 404, check for local backup first before creating empty data
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.log(`No existing data file found, checking for local backup...`);

          let initialData;

          // Try to restore from local backup
          if (hasLocalBackup()) {
            const backupAge = getBackupAge();
            console.log(`📂 Found local backup (${backupAge?.minutes || 0} minutes old)`);

            const localBackup = getLocalBackup();
            if (localBackup) {
              console.log('🔄 Restoring from local backup...');
              initialData = {
                products: [],
                containers: [],
                sales: [],
                expenses: [],
                partners: localBackup.partners || [],
                withdrawals: localBackup.withdrawals || [],
                cashFlows: localBackup.cashFlows || [],
                cashInjections: localBackup.cashInjections || [],
                metadata: localBackup.metadata || {
                  version: '1.0.0',
                  lastUpdated: new Date().toISOString(),
                  nextIds: {
                    product: 1,
                    container: 1,
                    sale: 1,
                    expense: 1,
                    partner: 1,
                    withdrawal: 1,
                    cashFlow: 1,
                    cashInjection: 1,
                  },
                }
              };
              console.log('✅ Finance data restored from local backup');
            }
          }

          // If no backup or backup failed, create empty data structure
          if (!initialData) {
            console.log(`Creating initial empty ${currentDataFile} in repository...`);
            initialData = {
              products: [],
              containers: [],
              sales: [],
              expenses: [],
              partners: [],
              withdrawals: [],
              cashFlows: [],
              cashInjections: [],
              metadata: {
                version: '1.0.0',
                lastUpdated: new Date().toISOString(),
                nextIds: {
                  product: 1,
                  container: 1,
                  sale: 1,
                  expense: 1,
                  partner: 1,
                  withdrawal: 1,
                  cashFlow: 1,
                  cashInjection: 1,
                },
              }
            };
          }
          
          // Load the empty data first
          loadData(initialData);
          
          // Try to create the file in GitHub
          try {
            console.log(`Attempting to create ${currentDataFile} in GitHub repository...`);
            const result = await saveData(initialData, `Initialize repository with empty data structure (${currentDataFile})`);
            if (result.success) {
              console.log(`Successfully created ${currentDataFile} in GitHub repository`);
            } else {
              console.error(`Failed to create ${currentDataFile} - GitHub API returned:`, result);
              setError(`Failed to create ${currentDataFile}: ${result.error}`);
            }
          } catch (initError) {
            console.error(`Failed to create initial ${currentDataFile}:`, initError);
            setError(`Failed to initialize repository: ${initError.message}`);
          }
        } else {
          // Load empty data locally and show error
          setError(`Failed to load data: ${error.message}`);
          
          loadData({
            products: [],
            containers: [],
            sales: [],
            expenses: [],
            partners: [],
            withdrawals: [],
            cashFlows: [],
            cashInjections: [],
            metadata: {
              version: '1.0.0',
              lastUpdated: new Date().toISOString(),
              nextIds: {
                product: 1,
                container: 1,
                sale: 1,
                expense: 1,
                partner: 1,
                withdrawal: 1,
                cashFlow: 1,
                cashInjection: 1,
              },
            }
          });
        }
      } finally {
        dataLoadedRef.current = true;
        setLoading(false);
      }
    };

    loadDataFromGitHub();
  }, [isConnected, currentDataFile]); // Re-load when data file changes

  // Auto-save when data changes (with improved timing and error handling)
  useEffect(() => {
    if (!isConnected || !unsavedChanges || !dataLoadedRef.current) return;

    // Reduced delay to 5 seconds for better data safety
    const saveTimer = setTimeout(async () => {
      try {
        const dataToSave = {
          products,
          containers,
          sales,
          expenses,
          partners,
          withdrawals,
          cashFlows,
          cashInjections,
          metadata: {
            ...metadata,
            lastUpdated: new Date().toISOString()
          }
        };

        // Validate and sanitize data before saving
        const validation = validateFinanceData(dataToSave);
        if (!validation.isValid) {
          console.error('❌ Data validation failed:', validation.errors);
          setError(`Data validation failed: ${validation.errors.join(', ')}`);
          return;
        }

        if (validation.warnings.length > 0) {
          console.warn('⚠️ Data validation warnings:', validation.warnings);
        }

        const sanitizedData = sanitizeFinanceData(dataToSave);
        logDataState(sanitizedData, 'Auto-save');

        console.log('Auto-saving data to GitHub...');
        const result = await saveData(sanitizedData, 'Auto-save: Update business data');
        if (result.success) {
          markSaved();
          // Create local backup after successful save
          createLocalBackup(sanitizedData);
          console.log('✅ Data auto-saved to GitHub successfully');
        } else {
          console.error('❌ Auto-save failed:', result.error);
          // Don't show error for auto-save failures, just log them
          // User will see the unsaved changes indicator
        }
      } catch (error) {
        console.error('❌ Failed to auto-save data to GitHub:', error);
        // Silent auto-save failures to avoid interrupting user workflow
      }
    }, 5000); // 5 second delay for better data safety

    return () => clearTimeout(saveTimer);
  }, [isConnected, unsavedChanges, products, containers, sales, expenses, partners, withdrawals, cashFlows, cashInjections, metadata]); // Include metadata for consistency

  // Manual save function that can be triggered (enhanced with better error handling)
  const forceSave = async () => {
    if (!isConnected) {
      console.warn('Cannot save: GitHub not connected');
      return { success: false, error: 'GitHub not connected' };
    }

    try {
      console.log('🚀 Initiating manual save to GitHub...');
      setLoading(true);

      const dataToSave = {
        products,
        containers,
        sales,
        expenses,
        partners,
        withdrawals,
        cashFlows,
        cashInjections,
        metadata: {
          ...metadata,
          lastUpdated: new Date().toISOString()
        }
      };

      // Validate and sanitize data before saving
      const validation = validateFinanceData(dataToSave);
      if (!validation.isValid) {
        console.error('❌ Data validation failed:', validation.errors);
        setError(`Data validation failed: ${validation.errors.join(', ')}`);
        return { success: false, error: validation.errors.join(', ') };
      }

      if (validation.warnings.length > 0) {
        console.warn('⚠️ Data validation warnings:', validation.warnings);
      }

      const sanitizedData = sanitizeFinanceData(dataToSave);
      logDataState(sanitizedData, 'Manual save');

      const result = await saveData(sanitizedData, 'Manual save: Update business data');

      if (result.success) {
        markSaved();
        // Create local backup after successful save
        createLocalBackup(sanitizedData);
        console.log('✅ Data manually saved to GitHub successfully');
        return { success: true };
      } else {
        console.error('❌ Manual save failed:', result.error);
        setError(`Save failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Failed to manually save data to GitHub:', error);
      setError(`Save failed: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Expose forceSave to window for debugging and register with DataContext
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.forceSave = forceSave;
    }
    // Register the save callback with DataContext
    if (registerSaveCallback) {
      registerSaveCallback(forceSave);
    }
  }, [forceSave, registerSaveCallback]);

  return null; // This component doesn't render anything
});

export default DataSync;