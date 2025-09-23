import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingDown, DollarSign } from 'lucide-react';
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

  // Professional color palette
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#f97316'  // orange
  ];

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{payload[0].name || payload[0].payload.category}</p>
          <p className="text-sm font-semibold text-gray-700">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-gray-500">
            {payload[0].payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart - properly centered
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    // Position label in the center of the arc (between inner and outer radius)
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (parseFloat(percentage) < 5) return null; // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-semibold"
        style={{ pointerEvents: 'none' }}
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-red-50 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Expense Analysis</h3>
            </div>
            <p className="text-xs text-gray-500 ml-8">Current month breakdown</p>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewType('pie')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1 ${
                viewType === 'pie'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PieChartIcon className="h-3 w-3" />
              Pie
            </button>
            <button
              onClick={() => setViewType('bar')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1 ${
                viewType === 'bar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-3 w-3" />
              Bar
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
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    label={renderCustomLabel}
                    labelLine={false}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{
                      paddingLeft: '20px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    {chartData.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.3}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="category"
                    stroke="#9ca3af"
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickFormatter={formatCurrency}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} animationDuration={1000}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Category Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PieChartIcon className="h-4 w-4 text-gray-400" />
                <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Top Categories</h4>
              </div>
              <div className="space-y-2">
                {chartData.slice(0, 4).map((item, index) => (
                  <div key={item.category} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-default">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3 ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{item.category}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      <span className="font-light">{formatCurrency(item.amount)}</span>
                      <span className="ml-2 text-xs text-gray-500">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Statistics</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center group cursor-default">
                  <span className="text-sm text-gray-500">Total Categories</span>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{chartData.length}</span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span className="text-sm text-gray-500">Total Expenses</span>
                  <span className="text-sm font-medium text-red-600 group-hover:text-red-700 transition-colors">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span className="text-sm text-gray-500">Largest Category</span>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {chartData[0]?.category}
                  </span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span className="text-sm text-gray-500">Average/Category</span>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
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
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <TrendingDown className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Expense Data</h3>
            <p className="text-sm text-gray-500">No expenses recorded for this month</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}