import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

export default function SalesChart() {
  const { sales } = useData();

  // Get last 30 days of sales data
  const last30Days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const daySales = sales.filter(sale => sale.date === dateString);
    const dayRevenue = daySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const dayProfit = daySales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    
    last30Days.push({
      date: dateString,
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: dayRevenue,
      profit: dayProfit,
      salesCount: daySales.length
    });
  }

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
          <p className="text-sm text-gray-600">Revenue and profit over the last 30 days</p>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={last30Days} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#6b7280"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Profit']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#059669" 
              strokeWidth={3}
              dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
              name="Revenue"
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              name="Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {last30Days.reduce((sum, day) => sum + day.salesCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Sales</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(last30Days.reduce((sum, day) => sum + day.revenue, 0))}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(last30Days.reduce((sum, day) => sum + day.profit, 0))}
          </div>
          <div className="text-sm text-gray-600">Total Profit</div>
        </div>
      </div>
    </div>
  );
}