import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
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

  // Colors for bars
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#ec4899', // pink
    '#6b7280'  // gray
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
          <p className="text-sm text-gray-600">Best selling products by quantity sold</p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  type="category"
                  dataKey="productName"
                  stroke="#6b7280"
                  fontSize={12}
                  width={120}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'totalQuantity') return [value, 'Units Sold'];
                    if (name === 'totalRevenue') return [formatCurrency(value), 'Revenue'];
                    if (name === 'totalProfit') return [formatCurrency(value), 'Profit'];
                    return [value, name];
                  }}
                  labelFormatter={(productName) => `Product: ${productName}`}
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="totalQuantity" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Product Details Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Left
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((product, index) => (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.totalQuantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatCurrency(product.totalProfit)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.currentStock > 10 
                          ? 'bg-green-100 text-green-800'
                          : product.currentStock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.currentStock} bags
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
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Data</h3>
            <p className="text-gray-600">No sales recorded yet to show top products.</p>
          </div>
        </div>
      )}
    </div>
  );
}