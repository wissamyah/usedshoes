import { useState } from 'react';
import { useData } from '../../context/DataContext';
import ExpenseForm from './ExpenseForm';
import ExpenseHistory from './ExpenseHistory';
import StatCard from '../UI/StatCard';
import { Plus, DollarSign, PieChart, Receipt, CreditCard } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses } = useData();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Calculate today's expenses
  const today = new Date().toISOString().split('T')[0];
  const todaysExpenses = expenses.filter(expense => {
    // Ensure date exists and matches today
    return expense.date && expense.date === today;
  });
  const todaysTotal = todaysExpenses.reduce((sum, expense) => {
    const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;
    return sum + amount;
  }, 0);

  // Calculate this month's expenses
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const thisMonthsExpenses = expenses.filter(expense => {
    // Ensure date exists and matches current month
    return expense.date && expense.date.startsWith(currentMonth);
  });
  const monthlyTotal = thisMonthsExpenses.reduce((sum, expense) => {
    const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;
    return sum + amount;
  }, 0);

  // Calculate category breakdown for this month
  const categoryTotals = thisMonthsExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Miscellaneous';
    const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  const topCategory = Object.keys(categoryTotals).length > 0 
    ? Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0]
    : ['No expenses', 0];

  // Calculate total expenses for all time
  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;
    return sum + amount;
  }, 0);

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCloseExpenseForm = () => {
    setShowExpenseForm(false);
    setSelectedExpense(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Expense Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track business expenses and monitor spending by category</p>
        </div>
        <button
          onClick={handleAddExpense}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Today's Expenses"
          value={formatCurrency(todaysTotal || 0)}
          subtitle={`${todaysExpenses.length || 0} transaction${todaysExpenses.length !== 1 ? 's' : ''}`}
          icon={CreditCard}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          trend={todaysTotal > 0 ? 'up' : null}
        />

        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyTotal || 0)}
          subtitle={`${thisMonthsExpenses.length || 0} transaction${thisMonthsExpenses.length !== 1 ? 's' : ''}`}
          icon={Receipt}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />

        <StatCard
          title="Top Category"
          value={formatCurrency(topCategory[1] || 0)}
          subtitle={topCategory[0] || 'No expenses'}
          icon={PieChart}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses || 0)}
          subtitle={`${expenses.length || 0} all time`}
          icon={DollarSign}
          iconBgColor="bg-gray-100"
          iconColor="text-gray-600"
        />
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">This Month by Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{category}</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ExpenseHistory onEditExpense={handleEditExpense} />
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          expense={selectedExpense}
          onClose={handleCloseExpenseForm}
        />
      )}
    </div>
  );
}