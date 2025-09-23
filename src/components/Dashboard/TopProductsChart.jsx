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
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-600">Units Sold:</span>
              <span className="text-xs font-semibold text-gray-900">{data.totalQuantity}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-600">Revenue:</span>
              <span className="text-xs font-semibold text-green-600">{formatCurrency(data.totalRevenue)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-600">Profit:</span>
              <span className="text-xs font-semibold text-blue-600">{formatCurrency(data.totalProfit)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-600">Stock Left:</span>
              <span className="text-xs font-semibold text-gray-900">{data.currentStock} bags</span>
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
        fill="#6b7280"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-medium"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Top Performers</h3>
            </div>
            <p className="text-xs text-gray-500 ml-8">Best selling products by volume</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-gray-400">
              <Package className="h-3 w-3 mr-1" />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="productName"
                  stroke="#9ca3af"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} />
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
          <div className="mt-6 overflow-x-auto border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-4 w-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Performance Details</h4>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((product, index) => (
                  <tr key={product.productId} className="hover:bg-gray-50 transition-colors duration-150 cursor-default group">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2 ring-2 ring-white shadow-sm"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {index + 1 === 1 && '🥇'}
                          {index + 1 === 2 && '🥈'}
                          {index + 1 === 3 && '🥉'}
                          {index + 1 > 3 && `#${index + 1}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{product.productName}</div>
                        <div className="text-xs text-gray-500">{product.category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-900">{product.totalQuantity}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-green-600 group-hover:text-green-700 transition-colors">
                        {formatCurrency(product.totalRevenue)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                        {formatCurrency(product.totalProfit)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.currentStock > 10
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                          : product.currentStock > 0
                          ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20'
                          : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                      }`}>
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
            <div className="mx-auto h-16 w-16 text-gray-300 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Data</h3>
            <p className="text-sm text-gray-500">Start making sales to see your top performers</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}