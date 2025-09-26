import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { Wallet, Users, TrendingUp, DollarSign, Plus, Calculator, ClipboardCheck, PiggyBank } from 'lucide-react';
import CashFlowDashboard from './CashFlow/CashFlowDashboard';
import WithdrawalHistory from './Withdrawals/WithdrawalHistory';
import PartnerList from './Partners/PartnerList';
import CashInjectionHistory from './CashInjections/CashInjectionHistory';
import { syncFinanceData } from '../../utils/financeSync';
import StatCard from '../UI/StatCard';

export default function FinancePage() {
  const { partners, withdrawals, cashFlows, cashInjections = [], sales, expenses, containers, syncFinanceData: syncData } = useData();
  const { showSuccessMessage, showInfoMessage, showErrorMessage } = useUI();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Calculate today's cash position
  const today = new Date().toISOString().split('T')[0];
  const todaysSales = sales.filter(s => s.date === today);
  const todaysExpenses = expenses.filter(e => e.date === today);
  const todaysWithdrawals = withdrawals.filter(w => w.date === today);
  
  const todaysCashIn = todaysSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const todaysCashOut = todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
                        todaysWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  
  // Calculate total revenue from all sales
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  
  // Calculate total cash injections
  const totalInjections = cashInjections.reduce((sum, injection) => sum + (injection.amount || 0), 0);
  
  // Calculate total expenses and withdrawals up to today
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  
  // Opening balance should be total revenue + cash injections
  const openingBalance = totalRevenue + totalInjections;
  
  // Current cash position = Total Revenue + Cash Injections - Total Expenses - Total Withdrawals
  const currentCashPosition = totalRevenue + totalInjections - totalExpenses - totalWithdrawals;
  
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
    { id: 'injections', name: 'Cash Injections', icon: Plus },
    { id: 'withdrawals', name: 'Withdrawals', icon: Wallet },
    { id: 'partners', name: 'Partners', icon: Users },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Finance Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage cash flow, partner withdrawals, and equity distributions
              </p>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Cash Position"
              value={formatCurrency(currentCashPosition)}
              subtitle={`${todaysCashIn > 0 ? `+${formatCurrency(todaysCashIn)} in` : ''}${todaysCashIn > 0 && todaysCashOut > 0 ? ' • ' : ''}${todaysCashOut > 0 ? `-${formatCurrency(todaysCashOut)} out` : ''}`.trim() || 'Current balance'}
              icon={DollarSign}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              trend={todaysCashIn - todaysCashOut > 0 ? 'up' : todaysCashIn - todaysCashOut < 0 ? 'down' : null}
            />

            <StatCard
              title="Available Distribution"
              value={formatCurrency(availableForDistribution)}
              subtitle={`Reserve: ${formatCurrency(minReserve)}`}
              icon={PiggyBank}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />

            <StatCard
              title="Total Equity"
              value={formatCurrency(totalEquity)}
              subtitle={`${partners.length} partner${partners.length !== 1 ? 's' : ''}`}
              icon={Users}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />

            <StatCard
              title="Today's Withdrawals"
              value={formatCurrency(todaysWithdrawals.reduce((sum, w) => sum + w.amount, 0))}
              subtitle={`${todaysWithdrawals.length} transaction${todaysWithdrawals.length !== 1 ? 's' : ''}`}
              icon={Wallet}
              iconBgColor={todaysWithdrawals.length > 0 ? "bg-orange-100" : "bg-gray-100"}
              iconColor={todaysWithdrawals.length > 0 ? "text-orange-600" : "text-gray-600"}
            />
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
                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center justify-center sm:justify-start
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                      title={tab.name}
                    >
                      <Icon className="h-5 w-5 sm:mr-2" />
                      <span className="hidden sm:inline">{tab.name}</span>
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
              {activeTab === 'injections' && (
                <CashInjectionHistory />
              )}
              {activeTab === 'withdrawals' && (
                <WithdrawalHistory 
                  availableCash={availableForDistribution}
                />
              )}
              {activeTab === 'partners' && (
                <PartnerList />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}