import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { formatDate } from '../../../utils/dateFormatter';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Check, Wallet } from 'lucide-react';
import CashReconciliation from './CashReconciliation';
import StatCard from '../../UI/StatCard';

export default function CashFlowDashboard({ currentCashPosition, openingBalance }) {
  const { sales, expenses, withdrawals, cashInjections = [], cashFlows, addCashFlow } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  const [showReconciliation, setShowReconciliation] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate previous transactions (before today) for opening balance
  const previousSales = sales.filter(s => s.date < today).reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const previousInjections = cashInjections.filter(i => i.date < today).reduce((sum, i) => sum + i.amount, 0);
  const previousExpenses = expenses.filter(e => e.date < today).reduce((sum, e) => sum + e.amount, 0);
  const previousWithdrawals = withdrawals.filter(w => w.date < today).reduce((sum, w) => sum + w.amount, 0);

  // Today's opening balance = Previous Sales + Previous Injections - Previous Expenses - Previous Withdrawals
  // This represents the cash position at the START of today (before any of today's transactions)
  const todaysOpeningBalance = previousSales + previousInjections - previousExpenses - previousWithdrawals;
  
  // Today's transactions
  const todaysSales = sales.filter(s => s.date === today);
  const todaysExpenses = expenses.filter(e => e.date === today);
  const todaysWithdrawals = withdrawals.filter(w => w.date === today);
  const todaysInjections = cashInjections.filter(i => i.date === today);
  
  // Calculate today's flows
  const salesInflows = todaysSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const injectionInflows = todaysInjections.reduce((sum, injection) => sum + (injection.amount || 0), 0);
  const cashInflows = salesInflows + injectionInflows;
  const expenseOutflows = todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const withdrawalOutflows = todaysWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  const cashOutflows = expenseOutflows + withdrawalOutflows;
  
  const netCashFlow = cashInflows - cashOutflows;
  const expectedBalance = todaysOpeningBalance + netCashFlow;
  
  // Check if today's cash has been reconciled
  const todaysReconciliation = cashFlows.find(cf => cf.date === today);
  const isReconciled = todaysReconciliation?.reconciled === true;
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  const handleReconcile = async (reconciledData) => {
    try {
      await addCashFlow({
        date: today,
        openingBalance: todaysOpeningBalance,
        cashSales: cashInflows,
        cashExpenses: expenseOutflows,
        withdrawals: todaysWithdrawals.map(w => w.id),
        theoreticalBalance: expectedBalance,
        actualCount: reconciledData.actualCount,
        actualBalance: reconciledData.actualCount,
        discrepancy: reconciledData.actualCount - expectedBalance,
        availableForDistribution: reconciledData.availableForDistribution,
        reservedAmount: reconciledData.reservedAmount,
        notes: reconciledData.notes,
        reconciled: true,
        reconciledBy: 'Current User', // Should get from auth context
        reconciledAt: new Date().toISOString()
      });
      
      showSuccessMessage('Cash Reconciled', 'Daily cash flow has been reconciled successfully');
      setShowReconciliation(false);
    } catch (error) {
      showErrorMessage('Reconciliation Failed', error.message);
    }
  };
  
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Today's Cash Flow</h3>
          <p className="text-sm text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!isReconciled && (
          <button
            onClick={() => setShowReconciliation(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Reconcile Cash
          </button>
        )}
      </div>
      
      {/* Reconciliation Status */}
      {isReconciled ? (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-green-900">Cash Reconciled</p>
            <p className="text-sm text-green-700">
              Today's cash has been reconciled. Actual: {formatCurrency(todaysReconciliation.actualCount)} | 
              Discrepancy: {formatCurrency(todaysReconciliation.discrepancy)}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Pending Reconciliation</p>
            <p className="text-sm text-yellow-700">
              Please reconcile today's cash before closing
            </p>
          </div>
        </div>
      )}
      
      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Opening Balance"
          value={formatCurrency(todaysOpeningBalance)}
          subtitle="Balance at start of today"
          icon={Wallet}
          iconBgColor="bg-gray-100"
          iconColor="text-gray-600"
        />

        <StatCard
          title="Cash Inflows"
          value={`+${formatCurrency(cashInflows)}`}
          subtitle={`Sales: ${formatCurrency(salesInflows)} • Injections: ${formatCurrency(injectionInflows)}`}
          icon={TrendingUp}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          trend={cashInflows > 0 ? 'up' : null}
        />

        <StatCard
          title="Cash Outflows"
          value={`-${formatCurrency(cashOutflows)}`}
          subtitle={`Expenses: ${formatCurrency(expenseOutflows)} • Withdrawals: ${formatCurrency(withdrawalOutflows)}`}
          icon={TrendingDown}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          trend={cashOutflows > 0 ? 'down' : null}
        />

        <StatCard
          title="Expected Balance"
          value={formatCurrency(expectedBalance)}
          subtitle={`Net: ${netCashFlow >= 0 ? '+' : ''}${formatCurrency(netCashFlow)}`}
          icon={DollarSign}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          trend={netCashFlow > 0 ? 'up' : netCashFlow < 0 ? 'down' : null}
        />
      </div>
      
      {/* Transaction Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflow Details - Grouped by Date */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Cash Inflows by Date</h4>
          </div>
          <div className="p-4">
            {(() => {
              // Group all sales and injections by date
              const inflowsByDate = {};

              // Process sales
              sales.forEach(sale => {
                if (!inflowsByDate[sale.date]) {
                  inflowsByDate[sale.date] = { sales: 0, injections: 0, count: 0 };
                }
                inflowsByDate[sale.date].sales += sale.totalAmount || 0;
                inflowsByDate[sale.date].count += 1;
              });

              // Process cash injections
              cashInjections.forEach(injection => {
                if (!inflowsByDate[injection.date]) {
                  inflowsByDate[injection.date] = { sales: 0, injections: 0, count: 0 };
                }
                inflowsByDate[injection.date].injections += injection.amount || 0;
                inflowsByDate[injection.date].count += 1;
              });

              // Sort dates in descending order (most recent first)
              const sortedDates = Object.keys(inflowsByDate).sort((a, b) => b.localeCompare(a));

              // Take only the last 10 dates for display
              const recentDates = sortedDates.slice(0, 10);

              if (recentDates.length === 0) {
                return <p className="text-sm text-gray-500">No cash inflows recorded</p>;
              }

              return (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {recentDates.map(date => {
                    const inflow = inflowsByDate[date];
                    const total = inflow.sales + inflow.injections;
                    const isToday = date === today;

                    return (
                      <div key={date} className={`flex justify-between items-center ${isToday ? 'bg-blue-50 p-2 rounded' : ''}`}>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(date)} {isToday && <span className="text-xs text-blue-600 ml-1">(Today)</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inflow.count} transaction{inflow.count !== 1 ? 's' : ''}
                            {inflow.sales > 0 && ` • Sales: ${formatCurrency(inflow.sales)}`}
                            {inflow.injections > 0 && ` • Injections: ${formatCurrency(inflow.injections)}`}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          +{formatCurrency(total)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
        
        {/* Outflow Details - Grouped by Date */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Cash Outflows by Date</h4>
          </div>
          <div className="p-4">
            {(() => {
              // Group all expenses and withdrawals by date
              const outflowsByDate = {};

              // Process expenses
              expenses.forEach(expense => {
                if (!outflowsByDate[expense.date]) {
                  outflowsByDate[expense.date] = { expenses: 0, withdrawals: 0, count: 0 };
                }
                outflowsByDate[expense.date].expenses += expense.amount || 0;
                outflowsByDate[expense.date].count += 1;
              });

              // Process withdrawals
              withdrawals.forEach(withdrawal => {
                if (!outflowsByDate[withdrawal.date]) {
                  outflowsByDate[withdrawal.date] = { expenses: 0, withdrawals: 0, count: 0 };
                }
                outflowsByDate[withdrawal.date].withdrawals += withdrawal.amount || 0;
                outflowsByDate[withdrawal.date].count += 1;
              });

              // Sort dates in descending order (most recent first)
              const sortedDates = Object.keys(outflowsByDate).sort((a, b) => b.localeCompare(a));

              // Take only the last 10 dates for display
              const recentDates = sortedDates.slice(0, 10);

              if (recentDates.length === 0) {
                return <p className="text-sm text-gray-500">No cash outflows recorded</p>;
              }

              return (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {recentDates.map(date => {
                    const outflow = outflowsByDate[date];
                    const total = outflow.expenses + outflow.withdrawals;
                    const isToday = date === today;

                    return (
                      <div key={date} className={`flex justify-between items-center ${isToday ? 'bg-red-50 p-2 rounded' : ''}`}>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(date)} {isToday && <span className="text-xs text-red-600 ml-1">(Today)</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            {outflow.count} transaction{outflow.count !== 1 ? 's' : ''}
                            {outflow.expenses > 0 && ` • Expenses: ${formatCurrency(outflow.expenses)}`}
                            {outflow.withdrawals > 0 && ` • Withdrawals: ${formatCurrency(outflow.withdrawals)}`}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          -{formatCurrency(total)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      
      {/* Reconciliation Modal */}
      {showReconciliation && (
        <CashReconciliation
          expectedBalance={expectedBalance}
          onReconcile={handleReconcile}
          onClose={() => setShowReconciliation(false)}
        />
      )}
    </div>
  );
}