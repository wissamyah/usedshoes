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

  // Category colors for visual distinction (dark theme)
  const getCategoryColor = (category) => {
    const colors = {
      'Shipping': { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
      'Container': { bg: 'rgba(147, 51, 234, 0.1)', text: '#a855f7', border: 'rgba(147, 51, 234, 0.3)' },
      'Customs': { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
      'Transportation': { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
      'Storage': { bg: 'rgba(249, 115, 22, 0.1)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
      'Marketing': { bg: 'rgba(236, 72, 153, 0.1)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
      'Loss/Damage': { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
      'Other': { bg: 'rgba(107, 114, 128, 0.1)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' },
      'Uncategorized': { bg: 'rgba(107, 114, 128, 0.1)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' }
    };
    return colors[category] || { bg: 'rgba(107, 114, 128, 0.1)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.3)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Report Header */}
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #404040',
        padding: '24px'
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb' }}>Expense Report</h3>
          <span style={{
            fontSize: '14px',
            color: '#b3b3b3',
            backgroundColor: '#1c1c1c',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #404040'
          }}>{dateRangeDisplay()}</span>
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
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #404040',
        padding: '24px'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ebebeb', marginBottom: '16px' }}>Expenses by Category</h4>
        {expensesByCategory.length === 0 ? (
          <p style={{ color: '#808080', textAlign: 'center', padding: '16px 0' }}>No expense data available for the selected period</p>
        ) : (
          <div>
            {/* Category table */}
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #404040' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead style={{ backgroundColor: '#333333' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Category
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Transactions
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Amount
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Average
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#1c1c1c' }}>
                  {expensesByCategory.map((category, index) => {
                    const colors = getCategoryColor(category.category);
                    return (
                      <tr
                        key={category.category}
                        style={{
                          borderBottom: index < expensesByCategory.length - 1 ? '1px solid #404040' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#333333';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '9999px',
                            backgroundColor: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`
                          }}>
                            {category.category}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb', textAlign: 'right' }}>
                          {category.count}
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb', textAlign: 'right', fontWeight: '500' }}>
                          {formatCurrency(category.amount)}
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb', textAlign: 'right' }}>
                          {formatCurrency(category.amount / category.count)}
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb', textAlign: 'right' }}>
                          {category.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      {monthlyTrend.length > 0 && (
        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          border: '1px solid #404040',
          padding: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ebebeb', marginBottom: '16px' }}>Monthly Expense Trend</h4>
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #404040' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ backgroundColor: '#333333' }}>
                <tr>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Month
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Transactions
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Amount
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Average
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#1c1c1c' }}>
                {monthlyTrend.map((month, index) => (
                  <tr
                    key={month.month}
                    style={{
                      borderBottom: index < monthlyTrend.length - 1 ? '1px solid #404040' : 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#333333';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>
                      {formatMonth(month.month)}
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb', textAlign: 'right' }}>
                      {month.count}
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb', textAlign: 'right', fontWeight: '500' }}>
                      {formatCurrency(month.amount)}
                    </td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb', textAlign: 'right' }}>
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
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #404040',
        padding: '24px'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ebebeb', marginBottom: '16px' }}>Recent Expenses</h4>
        {filteredExpenses.length === 0 ? (
          <p style={{ color: '#808080', textAlign: 'center', padding: '16px 0' }}>No expenses found for the selected period</p>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #404040' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ backgroundColor: '#333333' }}>
                <tr>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Date
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Description
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Category
                  </th>
                  <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#1c1c1c' }}>
                {filteredExpenses
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map((expense, index) => {
                    const colors = getCategoryColor(expense.category);
                    return (
                      <tr
                        key={expense.id}
                        style={{
                          borderBottom: index < 9 ? '1px solid #404040' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#333333';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb' }}>
                          {formatDateOrUnknown(expense.date)}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#ebebeb' }}>
                          {expense.description || 'No description'}
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '9999px',
                            backgroundColor: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`
                          }}>
                            {expense.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb', textAlign: 'right', fontWeight: '500' }}>
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}