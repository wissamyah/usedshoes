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
        <div style={{ backgroundColor: '#2a2a2a', border: '1px solid #404040' }} className="p-3 rounded-lg shadow-lg">
          <p style={{ color: '#ebebeb' }} className="text-sm font-medium">{payload[0].name || payload[0].payload.category}</p>
          <p style={{ color: '#b3b3b3' }} className="text-sm font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
          <p style={{ color: '#808080' }} className="text-xs">
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
    <div style={{ backgroundColor: '#2a2a2a', border: '1px solid #404040' }} className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }} className="p-1.5 rounded-lg">
                <TrendingDown style={{ color: '#ebebeb', opacity: 0.7 }} className="h-4 w-4" />
              </div>
              <h3 style={{ color: '#b3b3b3' }} className="text-sm font-medium uppercase tracking-wider">Expense Analysis</h3>
            </div>
            <p style={{ color: '#808080' }} className="text-xs ml-8">Current month breakdown</p>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }} className="flex gap-1 p-1 rounded-lg">
            <button
              onClick={() => setViewType('pie')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1`}
              style={{
                backgroundColor: viewType === 'pie' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: viewType === 'pie' ? '#ebebeb' : '#b3b3b3',
                border: viewType === 'pie' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent'
              }}
            >
              <PieChartIcon className="h-3 w-3" />
              Pie
            </button>
            <button
              onClick={() => setViewType('bar')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-1`}
              style={{
                backgroundColor: viewType === 'bar' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: viewType === 'bar' ? '#ebebeb' : '#b3b3b3',
                border: viewType === 'bar' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent'
              }}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                  <XAxis
                    dataKey="category"
                    stroke="#808080"
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#808080"
                    fontSize={11}
                    tickFormatter={formatCurrency}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
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
          <div style={{ borderTop: '1px solid #404040' }} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PieChartIcon style={{ color: '#ebebeb', opacity: 0.7 }} className="h-4 w-4" />
                <h4 style={{ color: '#b3b3b3' }} className="text-sm font-medium uppercase tracking-wider">Top Categories</h4>
              </div>
              <div className="space-y-2">
                {chartData.slice(0, 4).map((item, index) => (
                  <div key={item.category} style={{ borderRadius: '0.5rem' }} className="group flex items-center justify-between p-2 hover:bg-white/5 transition-all duration-200 cursor-default">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3 ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <span style={{ color: '#b3b3b3' }} className="text-sm transition-colors">{item.category}</span>
                    </div>
                    <div style={{ color: '#ebebeb' }} className="text-sm font-medium">
                      <span className="font-light">{formatCurrency(item.amount)}</span>
                      <span style={{ color: '#808080' }} className="ml-2 text-xs">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign style={{ color: '#ebebeb', opacity: 0.7 }} className="h-4 w-4" />
                <h4 style={{ color: '#b3b3b3' }} className="text-sm font-medium uppercase tracking-wider">Statistics</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center group cursor-default">
                  <span style={{ color: '#808080' }} className="text-sm">Total Categories</span>
                  <span style={{ color: '#ebebeb' }} className="text-sm font-medium transition-colors">{chartData.length}</span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span style={{ color: '#808080' }} className="text-sm">Total Expenses</span>
                  <span style={{ color: '#b3b3b3' }} className="text-sm font-medium transition-colors">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span style={{ color: '#808080' }} className="text-sm">Largest Category</span>
                  <span style={{ color: '#ebebeb' }} className="text-sm font-medium transition-colors">
                    {chartData[0]?.category}
                  </span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span style={{ color: '#808080' }} className="text-sm">Average/Category</span>
                  <span style={{ color: '#ebebeb' }} className="text-sm font-medium transition-colors">
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
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#808080' }} className="mx-auto h-16 w-16 mb-4 rounded-full flex items-center justify-center">
              <TrendingDown className="h-8 w-8" />
            </div>
            <h3 style={{ color: '#ebebeb' }} className="text-lg font-medium mb-2">No Expense Data</h3>
            <p style={{ color: '#808080' }} className="text-sm">No expenses recorded for this month</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}