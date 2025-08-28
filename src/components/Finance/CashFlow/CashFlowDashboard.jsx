import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { formatDate } from '../../../utils/dateFormatter';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Check } from 'lucide-react';
import CashReconciliation from './CashReconciliation';

export default function CashFlowDashboard({ currentCashPosition, openingBalance }) {
  const { sales, expenses, withdrawals, cashFlows, addCashFlow } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  const [showReconciliation, setShowReconciliation] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  
  // Today's transactions
  const todaysSales = sales.filter(s => s.date === today);
  const todaysExpenses = expenses.filter(e => e.date === today);
  const todaysWithdrawals = withdrawals.filter(w => w.date === today);
  
  // Calculate flows
  const cashInflows = todaysSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const cashOutflows = todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
                       todaysWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  
  const netCashFlow = cashInflows - cashOutflows;
  const expectedBalance = openingBalance + netCashFlow;
  
  // Check if today's cash has been reconciled
  const todaysReconciliation = cashFlows.find(cf => cf.date === today);
  const isReconciled = !!todaysReconciliation;
  
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
        openingBalance,
        cashSales: cashInflows,
        cashExpenses: cashOutflows - todaysWithdrawals.reduce((sum, w) => sum + w.amount, 0),
        withdrawals: todaysWithdrawals.map(w => w.id),
        theoreticalBalance: expectedBalance,
        actualCount: reconciledData.actualCount,
        discrepancy: reconciledData.actualCount - expectedBalance,
        availableForDistribution: reconciledData.availableForDistribution,
        reservedAmount: reconciledData.reservedAmount,
        notes: reconciledData.notes,
        reconciledBy: 'Current User' // Should get from auth context
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
        {/* Opening Balance */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Opening Balance</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(openingBalance)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        {/* Cash Inflows */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cash Inflows</p>
              <p className="text-xl font-semibold text-green-600">+{formatCurrency(cashInflows)}</p>
              <p className="text-xs text-gray-500">{todaysSales.length} sales</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        {/* Cash Outflows */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cash Outflows</p>
              <p className="text-xl font-semibold text-red-600">-{formatCurrency(cashOutflows)}</p>
              <p className="text-xs text-gray-500">
                {todaysExpenses.length} expenses, {todaysWithdrawals.length} withdrawals
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        {/* Expected Balance */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expected Balance</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(expectedBalance)}</p>
              <p className="text-xs text-gray-500">
                Net: {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>
      
      {/* Transaction Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflow Details */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Cash Inflows</h4>
          </div>
          <div className="p-4">
            {todaysSales.length === 0 ? (
              <p className="text-sm text-gray-500">No cash sales today</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {todaysSales.map(sale => (
                  <div key={sale.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sale.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {sale.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      +{formatCurrency(sale.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Outflow Details */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Cash Outflows</h4>
          </div>
          <div className="p-4">
            {todaysExpenses.length === 0 && todaysWithdrawals.length === 0 ? (
              <p className="text-sm text-gray-500">No cash outflows today</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {todaysExpenses.map(expense => (
                  <div key={expense.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.category}</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
                {todaysWithdrawals.map(withdrawal => (
                  <div key={withdrawal.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{withdrawal.partnerName} - Withdrawal</p>
                      <p className="text-xs text-gray-500">{withdrawal.type}</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      -{formatCurrency(withdrawal.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
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