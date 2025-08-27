import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useState } from 'react';

export default function ExpenseChart() {
  const { expenses } = useData();
  const [viewType, setViewType] = useState('pie'); // 'pie' or 'bar'

  // Get current month expenses
  const currentMonth = new Date().toISOString().substring(0, 7);
  const thisMonthsExpenses = expenses.filter(expense => 
    expense.date && expense.date.startsWith(currentMonth)
  );

  // Calculate category breakdown
  const categoryTotals = thisMonthsExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Miscellaneous';
    acc[category] = (acc[category] || 0) + (expense.amount || 0);
    return acc;
  }, {});

  // Convert to array format for charts
  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: ((amount / Object.values(categoryTotals).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
  })).sort((a, b) => b.amount - a.amount);

  // Colors for different categories
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316'  // orange
  ];

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
          <p className="text-sm text-gray-600">This month's expenses by category</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('pie')}
            className={`px-3 py-1 text-sm rounded ${
              viewType === 'pie' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1 text-sm rounded ${
              viewType === 'bar' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Bar Chart
          </button>
        </div>
      </div>

      {chartData.length > 0 ? (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {viewType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Category Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Category Breakdown</h4>
              <div className="space-y-2">
                {chartData.slice(0, 4).map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.category}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)} ({item.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Categories:</span>
                  <span className="text-sm font-medium text-gray-900">{chartData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Expenses:</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Largest Category:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {chartData[0]?.category} ({chartData[0]?.percentage}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average per Category:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(totalExpenses / chartData.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Expense Data</h3>
            <p className="text-gray-600">No expenses recorded for this month.</p>
          </div>
        </div>
      )}
    </div>
  );
}