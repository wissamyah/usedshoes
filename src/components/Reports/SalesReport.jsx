import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { TrendingUp, Package, DollarSign, Calendar, Users } from 'lucide-react';

export default function SalesReport({ startDate, endDate }) {
  const { sales, products } = useData();

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      if (!sale.date) return false;
      
      const saleDate = new Date(sale.date);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return saleDate >= start && saleDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        return saleDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        return saleDate <= end;
      }
      
      // If no date filter, show all
      return true;
    });
  }, [sales, startDate, endDate]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
    const averageSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalProfit,
      totalQuantity,
      totalSales: filteredSales.length,
      averageSaleValue,
      profitMargin
    };
  }, [filteredSales]);

  // Sales by product
  const salesByProduct = useMemo(() => {
    const productMap = new Map();

    filteredSales.forEach(sale => {
      const key = sale.productId || 'unknown';
      const existing = productMap.get(key) || {
        productId: key,
        productName: sale.productName || 'Unknown Product',
        quantity: 0,
        revenue: 0,
        profit: 0,
        salesCount: 0
      };

      productMap.set(key, {
        ...existing,
        quantity: existing.quantity + (sale.quantity || 0),
        revenue: existing.revenue + (sale.totalAmount || 0),
        profit: existing.profit + (sale.profit || 0),
        salesCount: existing.salesCount + 1
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // Sales by date
  const salesByDate = useMemo(() => {
    const dateMap = new Map();

    filteredSales.forEach(sale => {
      const date = sale.date || 'unknown';
      const existing = dateMap.get(date) || {
        date,
        revenue: 0,
        profit: 0,
        salesCount: 0
      };

      dateMap.set(date, {
        ...existing,
        revenue: existing.revenue + (sale.totalAmount || 0),
        profit: existing.profit + (sale.profit || 0),
        salesCount: existing.salesCount + 1
      });
    });

    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredSales]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'unknown') return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get date range display
  const dateRangeDisplay = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `From ${formatDate(startDate)}`;
    } else if (endDate) {
      return `Until ${formatDate(endDate)}`;
    } else {
      return 'All Time';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sales Report</h3>
          <span className="text-sm text-gray-500">{dateRangeDisplay()}</span>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">Total Revenue</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">Total Profit</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(metrics.totalProfit)}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">Units Sold</p>
            <p className="text-lg font-bold text-gray-900">{metrics.totalQuantity}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-xs text-gray-600">Total Sales</p>
            <p className="text-lg font-bold text-gray-900">{metrics.totalSales}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-xs text-gray-600">Avg Sale Value</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(metrics.averageSaleValue)}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
            </div>
            <p className="text-xs text-gray-600">Profit Margin</p>
            <p className="text-lg font-bold text-gray-900">{metrics.profitMargin.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Sales by Product */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Sales by Product</h4>
        {salesByProduct.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sales data available for the selected period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesByProduct.slice(0, 10).map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(product.profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {product.salesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Sales Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Daily Sales Trend</h4>
        {salesByDate.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No sales data available for the selected period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesByDate.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(day.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {day.salesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(day.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(day.profit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {day.revenue > 0 ? ((day.profit / day.revenue) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}