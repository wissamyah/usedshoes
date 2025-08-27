import { useProfitLoss } from '../../hooks/useProfitLoss';
import { TrendingUp, TrendingDown, DollarSign, Package, Receipt } from 'lucide-react';

export default function ProfitLoss({ startDate, endDate }) {
  const { 
    report, 
    formatCurrency, 
    formatPercentage, 
    formatDate, 
    getPerformanceIndicators 
  } = useProfitLoss(startDate, endDate);

  const performanceIndicators = getPerformanceIndicators();

  const formatDateRange = () => {
    if (!startDate && !endDate) return 'All Time';
    if (startDate && endDate) {
      if (startDate === endDate) return formatDate(startDate);
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    if (startDate) return `From ${formatDate(startDate)}`;
    if (endDate) return `Until ${formatDate(endDate)}`;
    return 'All Time';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Profit & Loss Statement</h2>
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
            {formatDateRange()}
          </span>
        </div>
        
        {/* Performance Indicators */}
        {performanceIndicators.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {performanceIndicators.map((indicator, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  indicator.type === 'success' ? 'bg-green-100 text-green-800' :
                  indicator.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  indicator.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {indicator.message}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Professional Income Statement */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Statement Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">Income Statement</h3>
              <p className="text-gray-300 text-sm mt-1">For the period: {formatDateRange()}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-2">
                {report.netProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
                <span className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(report.netProfit)}
                </span>
              </div>
              <p className="text-gray-300 text-xs mt-1">Net Income</p>
            </div>
          </div>
        </div>
        
        {/* Statement Body */}
        <div className="p-6">
          <table className="w-full">
            <tbody>
              {/* Revenue Section */}
              <tr className="border-b border-gray-100">
                <td className="py-3" colSpan="3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-gray-900 uppercase text-sm tracking-wide">Revenue</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 pl-8 text-gray-700">Sales Revenue</td>
                <td className="text-right text-gray-600 text-sm">{report.salesCount} transactions</td>
                <td className="text-right font-medium text-gray-900 w-32">{formatCurrency(report.revenue)}</td>
              </tr>
              <tr className="border-b-2 border-gray-200">
                <td className="pt-2 pb-3 font-semibold text-gray-900" colSpan="2">Total Revenue</td>
                <td className="pt-2 pb-3 text-right font-bold text-gray-900">{formatCurrency(report.revenue)}</td>
              </tr>

              {/* Cost of Goods Sold */}
              <tr className="border-b border-gray-100">
                <td className="py-3" colSpan="3">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-gray-900 uppercase text-sm tracking-wide">Cost of Goods Sold</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 pl-8 text-gray-700">Product Costs</td>
                <td className="text-right text-gray-600 text-sm">{report.salesCount} units</td>
                <td className="text-right font-medium text-red-700 w-32">({formatCurrency(report.cogs)})</td>
              </tr>
              <tr className="border-b-2 border-gray-200">
                <td className="pt-2 pb-3 font-semibold text-gray-900" colSpan="2">Total COGS</td>
                <td className="pt-2 pb-3 text-right font-bold text-red-700">({formatCurrency(report.cogs)})</td>
              </tr>

              {/* Gross Profit */}
              <tr className="bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-900" colSpan="2">
                  GROSS PROFIT
                  <span className="ml-2 text-sm font-normal text-gray-600">({formatPercentage(report.grossMargin)} margin)</span>
                </td>
                <td className={`py-3 px-4 text-right font-bold text-lg ${report.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(report.grossProfit)}
                </td>
              </tr>

              {/* Operating Expenses */}
              <tr className="border-b border-gray-100">
                <td className="py-3" colSpan="3">
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-gray-900 uppercase text-sm tracking-wide">Operating Expenses</span>
                  </div>
                </td>
              </tr>
              {Object.entries(report.expensesByCategory).length > 0 ? (
                Object.entries(report.expensesByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => (
                    <tr key={category} className="hover:bg-gray-50">
                      <td className="py-2 pl-8 text-gray-700">{category}</td>
                      <td className="text-right text-gray-600 text-sm">
                        {formatPercentage((amount / report.totalExpenses) * 100)} of expenses
                      </td>
                      <td className="text-right font-medium text-red-700 w-32">({formatCurrency(amount)})</td>
                    </tr>
                  ))
              ) : (
                <tr className="hover:bg-gray-50">
                  <td className="py-2 pl-8 text-gray-700">No expenses recorded</td>
                  <td className="text-right text-gray-600 text-sm">-</td>
                  <td className="text-right font-medium text-gray-900 w-32">$0.00</td>
                </tr>
              )}
              <tr className="border-b-2 border-gray-200">
                <td className="pt-2 pb-3 font-semibold text-gray-900" colSpan="2">
                  Total Operating Expenses
                  <span className="ml-2 text-sm font-normal text-gray-600">({report.expensesCount} expenses)</span>
                </td>
                <td className="pt-2 pb-3 text-right font-bold text-red-700">({formatCurrency(report.totalExpenses)})</td>
              </tr>

              {/* Operating Income */}
              <tr className="bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-900" colSpan="2">OPERATING INCOME</td>
                <td className={`py-3 px-4 text-right font-bold text-lg ${(report.grossProfit - report.totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(report.grossProfit - report.totalExpenses)}
                </td>
              </tr>

              {/* Net Income */}
              <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                <td className="py-4 px-4 font-bold text-lg" colSpan="2">
                  NET INCOME
                  <span className="ml-2 text-sm font-normal text-gray-300">({formatPercentage(report.netMargin)} margin)</span>
                </td>
                <td className={`py-4 px-4 text-right font-bold text-xl`}>
                  {formatCurrency(report.netProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(report.revenue)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-xs text-gray-500 mt-1">{report.salesCount} transactions</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(report.totalExpenses)}</div>
            <div className="text-sm text-gray-600">Total Expenses</div>
            <div className="text-xs text-gray-500 mt-1">{report.expensesCount} expenses</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <div className={`text-2xl font-bold ${report.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(report.grossMargin)}
            </div>
            <div className="text-sm text-gray-600">Gross Margin</div>
            <div className="text-xs text-gray-500 mt-1">{formatCurrency(report.grossProfit)} profit</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <div className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(report.netMargin)}
            </div>
            <div className="text-sm text-gray-600">Net Margin</div>
            <div className="text-xs text-gray-500 mt-1">{formatCurrency(report.netProfit)} net</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        {Object.keys(report.expensesByCategory).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
            <div className="space-y-3">
              {Object.entries(report.expensesByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-700">{category}</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
                      <div className="text-xs text-gray-500">
                        {formatPercentage((amount / report.totalExpenses) * 100)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Top Products by Revenue */}
        {report.salesByProduct.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
            <div className="space-y-3">
              {report.salesByProduct.slice(0, 5).map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-900 font-medium">{product.productName}</span>
                    <div className="text-xs text-gray-500">{product.quantity} units sold</div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-green-600">{formatCurrency(product.revenue)}</span>
                    <div className="text-xs text-gray-500">+{formatCurrency(product.profit)} profit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current Assets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(report.inventoryValue)}</div>
            <div className="text-sm text-gray-600">Inventory Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{formatCurrency(report.netProfit)}</div>
            <div className="text-sm text-gray-600">Retained Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(report.inventoryValue + Math.max(0, report.netProfit))}
            </div>
            <div className="text-sm text-gray-600">Total Assets</div>
          </div>
        </div>
      </div>
    </div>
  );
}