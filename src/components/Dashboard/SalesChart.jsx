import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useData } from '../../context/DataContext';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#2a2a2a', border: '1px solid #404040' }} className="p-3 rounded-lg shadow-lg">
          <p style={{ color: '#ebebeb' }} className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: '#b3b3b3' }} className="text-xs">{entry.name}:</span>
              <span className="text-xs font-semibold" style={{ color: entry.color }}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom dot for active points
  const CustomDot = (props) => {
    const { cx, cy, fill, payload, dataKey } = props;
    if (payload[dataKey] > 0) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={fill}
          className="animate-pulse"
        />
      );
    }
    return null;
  };

  return (
    <div style={{ backgroundColor: '#2a2a2a', border: '1px solid #404040' }} className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }} className="p-1.5 rounded-lg">
                <TrendingUp style={{ color: '#ebebeb', opacity: 0.7 }} className="h-4 w-4" />
              </div>
              <h3 style={{ color: '#b3b3b3' }} className="text-sm font-medium uppercase tracking-wider">Sales Performance</h3>
            </div>
            <p style={{ color: '#808080' }} className="text-xs ml-8">Last 30 days trend analysis</p>
          </div>
          <div style={{ color: '#808080' }} className="flex items-center text-xs">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
            </span>
            <span>Live</span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30Days} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#666666" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#666666" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#888888" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#888888" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#808080"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#808080"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="rect"
                wrapperStyle={{
                  fontSize: '12px',
                  paddingBottom: '10px'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#666666"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                name="Revenue"
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#888888"
                strokeWidth={2}
                fill="url(#colorProfit)"
                name="Profit"
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div style={{ borderTop: '1px solid #404040' }} className="mt-6 grid grid-cols-3 gap-4 pt-4">
          <div className="group cursor-default">
            <div className="flex items-center justify-center mb-1">
              <Calendar style={{ color: '#ebebeb', opacity: 0.7 }} className="h-4 w-4 transition-colors" />
            </div>
            <div style={{ color: '#ebebeb' }} className="text-2xl font-light text-center transition-colors">
              {last30Days.reduce((sum, day) => sum + day.salesCount, 0)}
            </div>
            <div style={{ color: '#808080' }} className="text-xs text-center">Total Sales</div>
          </div>
          <div className="group cursor-default">
            <div className="flex items-center justify-center mb-1">
              <DollarSign style={{ color: '#ebebeb', opacity: 0.7 }} className="h-4 w-4 transition-colors" />
            </div>
            <div style={{ color: '#b3b3b3' }} className="text-2xl font-light text-center transition-colors">
              {formatCurrency(last30Days.reduce((sum, day) => sum + day.revenue, 0))}
            </div>
            <div style={{ color: '#808080' }} className="text-xs text-center">Total Revenue</div>
          </div>
          <div className="group cursor-default">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp style={{ color: '#ebebeb', opacity: 0.7 }} className="h-4 w-4 transition-colors" />
            </div>
            <div style={{ color: '#b3b3b3' }} className="text-2xl font-light text-center transition-colors">
              {formatCurrency(last30Days.reduce((sum, day) => sum + day.profit, 0))}
            </div>
            <div style={{ color: '#808080' }} className="text-xs text-center">Total Profit</div>
          </div>
        </div>
      </div>
    </div>
  );
}