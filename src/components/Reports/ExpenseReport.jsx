import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateFormatter';
import { DollarSign, TrendingDown, Calendar, Tag, FileText, AlertCircle } from 'lucide-react';
import StatCard from '../UI/StatCard';

export default function ExpenseReport({ startDate, endDate }) {
  const { expenses } = useData();

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (!expense.date) return false;
      
      const expenseDate = new Date(expense.date);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return expenseDate >= start && expenseDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        return expenseDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        return expenseDate <= end;
      }
      
      // If no date filter, show all
      return true;
    });
  }, [expenses, startDate, endDate]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
    
    // Find largest expense
    const largestExpense = filteredExpenses.reduce((max, expense) => {
      return (expense.amount || 0) > (max.amount || 0) ? expense : max;
    }, filteredExpenses[0] || { amount: 0 });

    return {
      totalExpenses,
      totalTransactions: filteredExpenses.length,
      averageExpense,
      largestExpense
    };
  }, [filteredExpenses]);

  // Expenses by category
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map();

    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      const existing = categoryMap.get(category) || {
        category,
        amount: 0,
        count: 0,
        percentage: 0
      };

      categoryMap.set(category, {
        ...existing,
        amount: existing.amount + (expense.amount || 0),
        count: existing.count + 1
      });
    });

    // Calculate percentages
    const total = metrics.totalExpenses;
    const categories = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0
    }));

    return categories.sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, metrics.totalExpenses]);

  // Expenses by date
  const expensesByDate = useMemo(() => {
    const dateMap = new Map();

    filteredExpenses.forEach(expense => {
      const date = expense.date || 'unknown';
      const existing = dateMap.get(date) || {
        date,
        amount: 0,
        count: 0
      };

      dateMap.set(date, {
        ...existing,
        amount: existing.amount + (expense.amount || 0),
        count: existing.count + 1
      });
    });

    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredExpenses]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const monthMap = new Map();

    filteredExpenses.forEach(expense => {
      if (expense.date) {
        const monthKey = expense.date.substring(0, 7); // YYYY-MM
        const existing = monthMap.get(monthKey) || {
          month: monthKey,
          amount: 0,
          count: 0
        };

        monthMap.set(monthKey, {
          ...existing,
          amount: existing.amount + (expense.amount || 0),
          count: existing.count + 1
        });
      }
    });

    return Array.from(monthMap.values())
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredExpenses]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDateOrUnknown = (dateString) => {
    if (!dateString || dateString === 'unknown') return 'Unknown';
    return formatDate(dateString);
  };

  const formatMonth = (monthString) => {
    if (!monthString) return 'Unknown';
    const [year, month] = monthString.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  // Get date range display
  const dateRangeDisplay = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `From ${formatDate(startDate)}`;
    } else if (endDate) {
      return `Until ${formatDate(endDate)}`;
    } else {
      return 'All Time';
    }
  };

  // Category colors for visual distinction
  const getCategoryColor = (category) => {
    const colors = {
      'Shipping': 'bg-blue-100 text-blue-800',
      'Container': 'bg-purple-100 text-purple-800',
      'Customs': 'bg-green-100 text-green-800',
      'Transportation': 'bg-yellow-100 text-yellow-800',
      'Storage': 'bg-orange-100 text-orange-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Loss/Damage': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800',
      'Uncategorized': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Expense Report</h3>
          <span className="text-sm text-gray-500">{dateRangeDisplay()}</span>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(metrics.totalExpenses)}
            subtitle="Period total"
            icon={DollarSign}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
          />

          <StatCard
            title="Transactions"
            value={`${metrics.totalTransactions}`}
            subtitle="Expense entries"
            icon={FileText}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />

          <StatCard
            title="Average Expense"
            value={formatCurrency(metrics.averageExpense)}
            subtitle="Per transaction"
            icon={Calendar}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />

          <StatCard
            title="Largest Expense"
            value={formatCurrency(metrics.largestExpense?.amount || 0)}
            subtitle={metrics.largestExpense?.description ? metrics.largestExpense.description.slice(0, 30) + (metrics.largestExpense.description.length > 30 ? '...' : '') : 'No expenses'}
            icon={AlertCircle}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Expenses by Category</h4>
        {expensesByCategory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No expense data available for the selected period</p>
        ) : (
          <div>
            {/* Category breakdown */}
            <div className="space-y-3 mb-6">
              {expensesByCategory.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(category.category)}`}>
                      {category.category}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(category.amount)}</p>
                    <p className="text-xs text-gray-500">{category.count} items • {category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Category table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expensesByCategory.map((category) => (
                    <tr key={category.category} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(category.category)}`}>
                          {category.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {category.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(category.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(category.amount / category.count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {category.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      {monthlyTrend.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Monthly Expense Trend</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyTrend.map((month) => (
                  <tr key={month.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatMonth(month.month)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {month.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(month.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(month.amount / month.count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Expenses</h4>
        {filteredExpenses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No expenses found for the selected period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateOrUnknown(expense.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                          {expense.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}