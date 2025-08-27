import { useState } from 'react';
import { useData } from '../../context/DataContext';
import ExpenseForm from './ExpenseForm';
import ExpenseHistory from './ExpenseHistory';
import { Plus, DollarSign, PieChart, Receipt } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses } = useData();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Calculate today's expenses
  const today = new Date().toISOString().split('T')[0];
  const todaysExpenses = expenses.filter(expense => expense.date === today);
  const todaysTotal = todaysExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  // Calculate this month's expenses
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const thisMonthsExpenses = expenses.filter(expense => expense.date && expense.date.startsWith(currentMonth));
  const monthlyTotal = thisMonthsExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  // Calculate category breakdown for this month
  const categoryTotals = thisMonthsExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Miscellaneous';
    acc[category] = (acc[category] || 0) + (expense.amount || 0);
    return acc;
  }, {});

  const topCategory = Object.keys(categoryTotals).length > 0 
    ? Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0]
    : ['No expenses', 0];

  // Calculate total expenses for all time
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(todaysTotal)}</p>
              <p className="text-sm text-gray-600">{todaysExpenses.length} transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyTotal)}</p>
              <p className="text-sm text-gray-600">{thisMonthsExpenses.length} transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PieChart className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Top Category</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(topCategory[1])}</p>
              <p className="text-sm text-gray-600">{topCategory[0]}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
              <p className="text-sm text-gray-600">All time</p>
            </div>
          </div>
        </div>
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