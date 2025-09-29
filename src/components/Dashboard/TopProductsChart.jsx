import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { BarChart3, TrendingUp, Package, Award, ShoppingBag } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function TopProductsChart() {
  const { sales, products } = useData();

  // Calculate sales by product
  const productSales = sales.reduce((acc, sale) => {
    const productId = sale.productId;
    if (!acc[productId]) {
      acc[productId] = {
        productId,
        productName: sale.productName,
        totalQuantity: 0,
        totalRevenue: 0,
        totalProfit: 0,
        salesCount: 0
      };
    }
    
    acc[productId].totalQuantity += sale.quantity || 0;
    acc[productId].totalRevenue += sale.totalAmount || 0;
    acc[productId].totalProfit += sale.profit || 0;
    acc[productId].salesCount += 1;
    
    return acc;
  }, {});

  // Convert to array and sort by quantity sold
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10); // Top 10 products

  // Add current stock information
  const chartData = topProducts.map(productSale => {
    const product = products.find(p => p.id === productSale.productId);
    return {
      ...productSale,
      currentStock: product?.currentStock || 0,
      category: product?.category || 'Unknown'
    };
  });

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  // Professional gradient colors
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#f97316', // orange
    '#ef4444', // red
    '#84cc16', // lime
    '#6b7280'  // gray
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#2a2a2a', border: '1px solid #404040' }} className="p-3 rounded-lg shadow-lg">
          <p style={{ color: '#ebebeb' }} className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span style={{ color: '#b3b3b3' }} className="text-xs">Units Sold:</span>
              <span style={{ color: '#ebebeb' }} className="text-xs font-semibold">{data.totalQuantity}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#b3b3b3' }} className="text-xs">Revenue:</span>
              <span style={{ color: '#b3b3b3' }} className="text-xs font-semibold">{formatCurrency(data.totalRevenue)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#b3b3b3' }} className="text-xs">Profit:</span>
              <span style={{ color: '#b3b3b3' }} className="text-xs font-semibold">{formatCurrency(data.totalProfit)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#b3b3b3' }} className="text-xs">Stock Left:</span>
              <span style={{ color: '#ebebeb' }} className="text-xs font-semibold">{data.currentStock} bags</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for bars
  const renderCustomLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#808080"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-medium"
      >
        {value}
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
                <Award style={{ color: '#ebebeb', opacity: 0.7 }} className="h-4 w-4" />
              </div>
              <h3 style={{ color: '#b3b3b3' }} className="text-sm font-medium uppercase tracking-wider">Top Performers</h3>
            </div>
            <p style={{ color: '#808080' }} className="text-xs ml-8">Best selling products by volume</p>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ color: '#808080' }} className="flex items-center text-xs">
              <Package style={{ color: '#ebebeb', opacity: 0.7 }} className="h-3 w-3 mr-1" />
              <span>{chartData.length} Products</span>
            </div>
          </div>
        </div>

      {chartData.length > 0 ? (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 30, right: 30, left: 20, bottom: 100 }}
              >
                <defs>
                  {chartData.map((entry, index) => (
                    <linearGradient key={`gradient-${index}`} id={`gradient-prod-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.3}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                <XAxis
                  dataKey="productName"
                  stroke="#808080"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#808080"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar dataKey="totalQuantity" radius={[8, 8, 0, 0]} animationDuration={1000}>
                  <LabelList dataKey="totalQuantity" position="top" content={renderCustomLabel} />
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#gradient-prod-${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product Details Table */}
          <div style={{ borderTop: '1px solid #404040' }} className="mt-6 overflow-x-auto pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag style={{ color: '#ebebeb', opacity: 0.7 }} className="h-4 w-4" />
              <h4 style={{ color: '#b3b3b3' }} className="text-sm font-medium uppercase tracking-wider">Performance Details</h4>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <tr>
                  <th style={{ color: '#808080' }} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Rank
                  </th>
                  <th style={{ color: '#808080' }} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Product
                  </th>
                  <th style={{ color: '#808080' }} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Units
                  </th>
                  <th style={{ color: '#808080' }} className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Revenue
                  </th>
                  <th style={{ color: '#808080' }} className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Profit
                  </th>
                  <th style={{ color: '#808080' }} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'transparent' }} className="divide-y divide-gray-600">
                {chartData.map((product, index) => (
                  <tr key={product.productId} className="hover:bg-white/5 transition-colors duration-150 cursor-default group">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2 ring-2 ring-white shadow-sm"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span style={{ color: '#ebebeb' }} className="text-sm font-medium transition-colors">
                          {index + 1 === 1 && '🥇'}
                          {index + 1 === 2 && '🥈'}
                          {index + 1 === 3 && '🥉'}
                          {index + 1 > 3 && `#${index + 1}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div style={{ color: '#ebebeb' }} className="text-sm font-medium transition-colors">{product.productName}</div>
                        <div style={{ color: '#808080' }} className="text-xs">{product.category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span style={{ color: '#ebebeb' }} className="text-sm font-medium">{product.totalQuantity}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span style={{ color: '#b3b3b3' }} className="text-sm font-medium transition-colors">
                        {formatCurrency(product.totalRevenue)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span style={{ color: '#b3b3b3' }} className="text-sm font-medium transition-colors">
                        {formatCurrency(product.totalProfit)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.currentStock > 10
                          ? 'text-green-400'
                          : product.currentStock > 0
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        {product.currentStock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#808080' }} className="mx-auto h-16 w-16 mb-4 rounded-full flex items-center justify-center">
              <Award className="h-8 w-8" />
            </div>
            <h3 style={{ color: '#ebebeb' }} className="text-lg font-medium mb-2">No Sales Data</h3>
            <p style={{ color: '#808080' }} className="text-sm">Start making sales to see your top performers</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}