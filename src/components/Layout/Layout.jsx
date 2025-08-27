import { useState } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Notifications from '../UI/Notifications';
import { useData } from '../../context/DataContext';
import { useGitHub } from '../../context/GitHubContext';
import { useUI } from '../../context/UIContext';

// Placeholder components for different sections
const Dashboard = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Today's Sales</h3>
        <p className="text-2xl font-bold text-gray-900">$0</p>
        <p className="text-sm text-gray-600">No sales today</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">This Month</h3>
        <p className="text-2xl font-bold text-gray-900">$0</p>
        <p className="text-sm text-gray-600">Monthly revenue</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Inventory Value</h3>
        <p className="text-2xl font-bold text-gray-900">$0</p>
        <p className="text-sm text-gray-600">Total stock value</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
        <p className="text-2xl font-bold text-gray-900">$0</p>
        <p className="text-sm text-gray-600">This month</p>
      </div>
    </div>
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <p className="text-gray-500">Dashboard charts and analytics will appear here</p>
    </div>
  </div>
);

const Products = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Products & Inventory</h2>
      <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
        Add Product
      </button>
    </div>
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <p className="text-gray-500">Product management interface coming soon</p>
    </div>
  </div>
);

const Containers = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Containers</h2>
      <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
        Add Container
      </button>
    </div>
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <p className="text-gray-500">Container management interface coming soon</p>
    </div>
  </div>
);

const Sales = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
      <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
        Record Sale
      </button>
    </div>
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <p className="text-gray-500">Sales management interface coming soon</p>
    </div>
  </div>
);

const Expenses = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
      <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
        Add Expense
      </button>
    </div>
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <p className="text-gray-500">Expense tracking interface coming soon</p>
    </div>
  </div>
);

const Reports = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
      <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
        Export Excel
      </button>
    </div>
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <p className="text-gray-500">P&L reports and analytics coming soon</p>
    </div>
  </div>
);

const Settings = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
    <div className="max-w-2xl">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">GitHub Integration</h3>
        <p className="text-gray-600 mb-4">
          Configure your GitHub repository for data persistence.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repository Owner
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="your-username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repository Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="your-repo-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Access Token
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="ghp_xxxxxxxxxxxx"
            />
          </div>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
            Test Connection
          </button>
        </div>
      </div>
    </div>
  </div>
);

const components = {
  dashboard: Dashboard,
  products: Products,
  containers: Containers,
  sales: Sales,
  expenses: Expenses,
  reports: Reports,
  settings: Settings,
};

function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use contexts
  const { containers, products, sales, expenses, loadData, markSaved } = useData();
  const { syncStatus, lastSync, saveData, fetchData, isConnected } = useGitHub();
  const { showSuccessMessage, showErrorMessage } = useUI();

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
    <div className="min-h-screen bg-gray-50">
      <Header
        onSyncData={handleSyncData}
        syncStatus={syncStatus}
        lastSyncTime={lastSync}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="mt-6">
            <ActiveComponent />
          </main>
        </div>
      </div>
      
      <Notifications />
    </div>
  );
}

export default Layout;