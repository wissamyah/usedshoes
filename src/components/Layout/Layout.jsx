import { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Notifications from '../UI/Notifications';
import ConfirmModal from '../UI/ConfirmModal';
import { 
  LazyDashboard,
  LazyProductsPage,
  LazyContainersPage,
  LazySalesPage,
  LazyExpensesPage,
  LazyFinancePage,
  LazyReportsPage,
  LazySettingsPage,
  preloadCriticalComponents,
  usePreloadOnHover
} from '../LazyComponents';
import { useData } from '../../context/DataContext';
import { useGitHub } from '../../context/GitHubContext';
import { useUI } from '../../context/UIContext';

const components = {
  dashboard: LazyDashboard,
  products: LazyProductsPage,
  containers: LazyContainersPage,
  sales: LazySalesPage,
  expenses: LazyExpensesPage,
  finance: LazyFinancePage,
  reports: LazyReportsPage,
  settings: LazySettingsPage,
};

function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use contexts
  const { containers, products, sales, expenses, loadData, markSaved } = useData();
  const { syncStatus, lastSync, saveData, fetchData, isConnected } = useGitHub();
  const { showSuccessMessage, showErrorMessage, confirmModal } = useUI();

  // Preload critical components on mount
  useEffect(() => {
    preloadCriticalComponents();
  }, []);

  const handleSyncData = async () => {
    try {
      if (!isConnected) {
        showErrorMessage('GitHub Not Connected', 'Please configure GitHub settings first');
        setActiveTab('settings');
        return;
      }

      // First try to fetch latest data from GitHub
      const result = await fetchData();
      if (result?.data) {
        loadData(result.data);
        showSuccessMessage('Data Synced', 'Successfully loaded latest data from GitHub');
      }
      
      // Then save current data to GitHub
      const dataToSave = {
        metadata: {
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          nextIds: {
            product: Math.max(...products.map(p => p.id), 0) + 1,
            container: containers.length + 1,
            sale: Math.max(...sales.map(s => s.id), 0) + 1,
            expense: Math.max(...expenses.map(e => e.id), 0) + 1,
          },
        },
        containers,
        products,
        sales,
        expenses,
      };
      
      await saveData(dataToSave);
      markSaved();
      showSuccessMessage('Sync Complete', 'Data successfully saved to GitHub');
      
    } catch (error) {
      console.error('Sync failed:', error);
      showErrorMessage('Sync Failed', error.message || 'Failed to sync with GitHub');
    }
  };

  const ActiveComponent = components[activeTab];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1c1c1c' }}>
      <Header
        onSyncData={handleSyncData}
        syncStatus={syncStatus}
        lastSyncTime={lastSync}
        onTitleClick={() => setActiveTab('dashboard')}
      />

      {/* Navigation - Outside of padding on mobile */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="mt-6">
          <ActiveComponent />
        </main>
      </div>
      
      <Notifications />
      
      {/* Global Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}

export default Layout;