import { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useGitHub } from '../context/GitHubContext';

export default function DataSync() {
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
    api
  } = useGitHub();

  const dataLoadedRef = useRef(false);
  const lastSaveRef = useRef(null);

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
            
          loadData({
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
          });
          
          console.log('Data loaded from GitHub successfully');
        }
      } catch (error) {
        console.error('Failed to load data from GitHub:', error);
        
        // If 404, initialize the repository with empty data and save it to GitHub
        if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.log('No existing data file found, creating initial data.json in repository...');
          
          // Create empty data structure
          const initialData = {
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
          
          // Load the empty data first
          loadData(initialData);
          
          // Try to create the file in GitHub
          try {
            console.log('Attempting to create data.json in GitHub repository...');
            const result = await saveData(initialData, 'Initialize repository with empty data structure');
            if (result.success) {
              console.log('Successfully created data.json in GitHub repository');
            } else {
              console.error('Failed to create data.json - GitHub API returned:', result);
              setError(`Failed to create data.json: ${result.error}`);
            }
          } catch (initError) {
            console.error('Failed to create initial data.json:', initError);
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
  }, [isConnected]); // Remove other dependencies to prevent infinite loop

  // Auto-save when data changes
  useEffect(() => {
    if (!isConnected || !unsavedChanges || !dataLoadedRef.current) return;
    
    // Prevent frequent saves - wait 3 seconds after last change
    const currentTime = Date.now();
    lastSaveRef.current = currentTime;
    
    const saveTimer = setTimeout(async () => {
      // Only save if this is still the latest change
      if (lastSaveRef.current !== currentTime) return;
      
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

        const result = await saveData(dataToSave, 'Auto-save: Update business data');
        if (result.success) {
          markSaved();
          console.log('Data auto-saved to GitHub successfully');
        } else {
          console.error('Auto-save failed:', result.error);
          setError(`Auto-save failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Failed to auto-save data to GitHub:', error);
        setError(`Auto-save failed: ${error.message}`);
      }
    }, 3000); // 3 second delay
    
    return () => clearTimeout(saveTimer);
  }, [isConnected, unsavedChanges, products, containers, sales, expenses, partners, withdrawals, cashFlows, cashInjections]); // Remove metadata and function dependencies

  // Manual save function that can be triggered
  const forceSave = async () => {
    if (!isConnected) return;
    
    try {
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

      await saveData(dataToSave, 'Manual save: Update business data');
      markSaved();
      console.log('Data manually saved to GitHub successfully');
    } catch (error) {
      console.error('Failed to manually save data to GitHub:', error);
      setError(`Manual save failed: ${error.message}`);
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
}