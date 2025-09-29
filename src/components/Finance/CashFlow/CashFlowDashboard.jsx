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
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#ebebeb' }}>Today's Cash Flow</h3>
          <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '4px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!isReconciled && (
          <button
            onClick={() => setShowReconciliation(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              color: 'white',
              backgroundColor: '#3b82f6',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
            }}
          >
            Reconcile Cash
          </button>
        )}
      </div>
      
      {/* Reconciliation Status */}
      {isReconciled ? (
        <div style={{ marginBottom: '24px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center' }}>
          <Check style={{ height: '20px', width: '20px', color: '#22c55e', marginRight: '12px' }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#22c55e' }}>Cash Reconciled</p>
            <p style={{ fontSize: '14px', color: '#16a34a' }}>
              Today's cash has been reconciled. Actual: {formatCurrency(todaysReconciliation.actualCount)} |
              Discrepancy: {formatCurrency(todaysReconciliation.discrepancy)}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '24px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center' }}>
          <AlertTriangle style={{ height: '20px', width: '20px', color: '#f59e0b', marginRight: '12px' }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#f59e0b' }}>Pending Reconciliation</p>
            <p style={{ fontSize: '14px', color: '#d97706' }}>
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
        <div style={{ backgroundColor: '#2a2a2a', borderRadius: '8px', border: '1px solid #404040' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #404040' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>Cash Inflows by Date</h4>
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
                return <p style={{ fontSize: '14px', color: '#808080' }}>No cash inflows recorded</p>;
              }

              return (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {recentDates.map(date => {
                    const inflow = inflowsByDate[date];
                    const total = inflow.sales + inflow.injections;
                    const isToday = date === today;

                    return (
                      <div key={date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...(isToday ? { backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '4px' } : {}) }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>
                            {formatDate(date)} {isToday && <span style={{ fontSize: '12px', color: '#60a5fa', marginLeft: '4px' }}>(Today)</span>}
                          </p>
                          <p style={{ fontSize: '12px', color: '#b3b3b3' }}>
                            {inflow.count} transaction{inflow.count !== 1 ? 's' : ''}
                            {inflow.sales > 0 && ` • Sales: ${formatCurrency(inflow.sales)}`}
                            {inflow.injections > 0 && ` • Injections: ${formatCurrency(inflow.injections)}`}
                          </p>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#22c55e' }}>
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
        <div style={{ backgroundColor: '#2a2a2a', borderRadius: '8px', border: '1px solid #404040' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #404040' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>Cash Outflows by Date</h4>
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
                return <p style={{ fontSize: '14px', color: '#808080' }}>No cash outflows recorded</p>;
              }

              return (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {recentDates.map(date => {
                    const outflow = outflowsByDate[date];
                    const total = outflow.expenses + outflow.withdrawals;
                    const isToday = date === today;

                    return (
                      <div key={date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...(isToday ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' } : {}) }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>
                            {formatDate(date)} {isToday && <span style={{ fontSize: '12px', color: '#ef4444', marginLeft: '4px' }}>(Today)</span>}
                          </p>
                          <p style={{ fontSize: '12px', color: '#b3b3b3' }}>
                            {outflow.count} transaction{outflow.count !== 1 ? 's' : ''}
                            {outflow.expenses > 0 && ` • Expenses: ${formatCurrency(outflow.expenses)}`}
                            {outflow.withdrawals > 0 && ` • Withdrawals: ${formatCurrency(outflow.withdrawals)}`}
                          </p>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#ef4444' }}>
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