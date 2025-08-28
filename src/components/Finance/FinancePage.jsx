import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { Wallet, Users, TrendingUp, DollarSign, Plus, Calculator, ClipboardCheck, RefreshCw } from 'lucide-react';
import CashFlowDashboard from './CashFlow/CashFlowDashboard';
import WithdrawalHistory from './Withdrawals/WithdrawalHistory';
import PartnerList from './Partners/PartnerList';
import DistributionCalculator from './Distribution/DistributionCalculator';
import { syncFinanceData } from '../../utils/financeSync';

export default function FinancePage() {
  const { partners, withdrawals, cashFlows, sales, expenses, containers, syncFinanceData: syncData } = useData();
  const { showSuccessMessage, showInfoMessage, showErrorMessage } = useUI();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasInitialSync, setHasInitialSync] = useState(false);
  
  // Auto-sync on first load if no finance data exists
  useEffect(() => {
    // Only auto-sync if we have transaction data but no cash flows
    // Don't auto-sync if partners exist (user has already set them up)
    if (!hasInitialSync && cashFlows.length === 0 && (containers.length > 0 || sales.length > 0 || expenses.length > 0)) {
      // Only sync cash flows, not partners
      if (partners.length === 0) {
        // Only sync if truly no partners exist
        handleSync(true);
      }
      setHasInitialSync(true);
    }
  }, [hasInitialSync, cashFlows.length, containers.length, sales.length, expenses.length, partners.length]);
  
  const handleSync = async (isAutoSync = false) => {
    setIsSyncing(true);
    
    try {
      // Get synced data from utility
      const syncedData = syncFinanceData({
        containers,
        sales,
        expenses,
        partners,
        withdrawals
      });
      
      // Update the context with synced data
      await syncData(syncedData);
      
      if (!isAutoSync) {
        showSuccessMessage(
          'Finance Data Synced',
          `Successfully synced ${syncedData.cashFlows.length} cash flow records from existing transactions`
        );
      } else {
        showInfoMessage(
          'Initial Setup Complete',
          'Finance module has been initialized with your existing data'
        );
      }
    } catch (error) {
      console.error('Sync error:', error);
      showErrorMessage('Sync Failed', error.message);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Calculate today's cash position
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales.filter(s => s.date === today);
  const todaysExpenses = expenses.filter(e => e.date === today);
  const todaysWithdrawals = withdrawals.filter(w => w.date === today);
  
  const todaysCashIn = todaysSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const todaysCashOut = todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
                        todaysWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  
  // Get opening balance - check for yesterday's closing balance or use latest cash flow
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const yesterdayCashFlow = cashFlows.find(cf => cf.date === yesterdayStr);
  const latestCashFlowBeforeToday = cashFlows
    .filter(cf => cf.date < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  
  // Use yesterday's balance if available, otherwise latest cash flow before today
  const openingBalance = yesterdayCashFlow?.theoreticalBalance || 
                         latestCashFlowBeforeToday?.theoreticalBalance || 
                         0;
  const currentCashPosition = openingBalance + todaysCashIn - todaysCashOut;
  
  // Calculate total partner equity
  const totalEquity = partners.reduce((sum, partner) => {
    const capitalAccount = partner.capitalAccount || {};
    return sum + (capitalAccount.initialInvestment || 0) + 
           (capitalAccount.profitShare || 0) - 
           (capitalAccount.totalWithdrawn || 0);
  }, 0);
  
  // Calculate available for distribution (simplified - should consider reserves)
  const minReserve = 2000; // Minimum cash to keep for operations
  const availableForDistribution = Math.max(0, currentCashPosition - minReserve);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  const tabs = [
    { id: 'dashboard', name: 'Cash Flow', icon: TrendingUp },
    { id: 'withdrawals', name: 'Withdrawals', icon: Wallet },
    { id: 'partners', name: 'Partners', icon: Users },
    { id: 'distribution', name: 'Distribution', icon: Calculator },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Finance Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage cash flow, partner withdrawals, and equity distributions
              </p>
            </div>
            <button
              onClick={() => handleSync(false)}
              disabled={isSyncing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              title="Sync financial data from existing transactions"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
          
          {/* Initial Sync Notice */}
          {cashFlows.length === 0 && !isSyncing && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <RefreshCw className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">No Financial Data Found</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>It looks like you haven't synced your financial data yet. Click the "Sync Data" button above to import your existing transactions (containers, sales, expenses) into the finance module.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Cash Position */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Cash Position
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {formatCurrency(currentCashPosition)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {todaysCashIn > 0 && (
                            <span className="text-green-600">+{formatCurrency(todaysCashIn)} in</span>
                          )}
                          {todaysCashOut > 0 && (
                            <span className="text-red-600 ml-2">-{formatCurrency(todaysCashOut)} out</span>
                          )}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Available for Distribution */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calculator className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Available Distribution
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {formatCurrency(availableForDistribution)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Reserve: {formatCurrency(minReserve)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Partners Equity */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Equity
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {formatCurrency(totalEquity)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {partners.length} partner{partners.length !== 1 ? 's' : ''}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Today's Withdrawals */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Wallet className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Today's Withdrawals
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {formatCurrency(todaysWithdrawals.reduce((sum, w) => sum + w.amount, 0))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {todaysWithdrawals.length} transaction{todaysWithdrawals.length !== 1 ? 's' : ''}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setActiveTab('withdrawals')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Withdrawal
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Reconcile Cash
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Distribution
            </button>
          </div>
          
          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'dashboard' && (
                <CashFlowDashboard 
                  currentCashPosition={currentCashPosition}
                  openingBalance={openingBalance}
                />
              )}
              {activeTab === 'withdrawals' && (
                <WithdrawalHistory 
                  availableCash={availableForDistribution}
                />
              )}
              {activeTab === 'partners' && (
                <PartnerList />
              )}
              {activeTab === 'distribution' && (
                <DistributionCalculator 
                  availableCash={availableForDistribution}
                  currentCashPosition={currentCashPosition}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}