import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Wallet, TrendingUp, TrendingDown, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateFormatter';
import KPICards from './KPICards';
import SalesChart from './SalesChart';
import ExpenseChart from './ExpenseChart';
import TopProductsChart from './TopProductsChart';

export default function Dashboard() {
  const { products, sales, expenses, containers, cashInjections = [], withdrawals = [] } = useData();
  const [isLowStockExpanded, setIsLowStockExpanded] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Calculate inventory value (using same logic as Products page)
  const inventoryValue = products.reduce((total, product) => {
    const costPerKg = product.costPerKg || product.costPerUnit || 0;
    const bagWeight = product.bagWeight || 25;
    const totalKg = product.currentStock * bagWeight;
    return total + (totalKg * costPerKg);
  }, 0);

  // Get current date info
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().substring(0, 7);

  // Calculate today's sales
  const todaysSales = sales.filter(sale => sale.date === today);
  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  // Calculate this month's data
  const thisMonthsSales = sales.filter(sale => sale.date && sale.date.startsWith(currentMonth));
  const monthlyRevenue = thisMonthsSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const monthlyProfit = thisMonthsSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  
  const thisMonthsExpenses = expenses.filter(expense => expense.date && expense.date.startsWith(currentMonth));
  const monthlyExpenses = thisMonthsExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  // Calculate net profit (monthly profit - monthly expenses)
  const netProfit = monthlyProfit - monthlyExpenses;

  // Calculate total metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const totalNetProfit = totalProfit - totalExpenses;
  const totalPurchases = containers.reduce((sum, container) => sum + (container.totalCost || 0), 0);
  
  // Calculate cash position (same as Finance page)
  const totalInjections = cashInjections.reduce((sum, injection) => sum + (injection.amount || 0), 0);
  const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);
  const currentCashPosition = totalRevenue + totalInjections - totalExpenses - totalWithdrawals;

  // Recent activity (last 5 transactions)
  const recentSales = sales
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`))
    .slice(0, 5);

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Low stock alerts (products with less than 10 bags)
  const lowStockProducts = products.filter(product => product.currentStock < 10);

  // Update content height when low stock products change
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [lowStockProducts.length]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };


  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Overview of your used shoes business performance</p>
      </div>

      {/* KPI Cards */}
      <KPICards
        todaysRevenue={todaysRevenue}
        monthlyRevenue={monthlyRevenue}
        inventoryValue={inventoryValue}
        netProfit={netProfit}
      />

      {/* Cash Position Card - Prominent Display */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center mb-2">
          <Wallet className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-semibold">Current Cash Position</h3>
          {currentCashPosition >= 0 ? (
            <TrendingUp className="h-5 w-5 ml-auto opacity-90" />
          ) : (
            <TrendingDown className="h-5 w-5 ml-auto opacity-90" />
          )}
        </div>
        <div className="text-3xl font-bold mb-3">
          {formatCurrency(currentCashPosition)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="opacity-90">Sales Revenue</div>
            <div className="font-semibold">{formatCurrency(totalRevenue)}</div>
          </div>
          <div>
            <div className="opacity-90">Total Purchases</div>
            <div className="font-semibold">{formatCurrency(totalPurchases)}</div>
          </div>
          <div>
            <div className="opacity-90">Expenses</div>
            <div className="font-semibold">{formatCurrency(totalExpenses)}</div>
          </div>
          <div>
            <div className="opacity-90">Withdrawals</div>
            <div className="font-semibold">{formatCurrency(totalWithdrawals)}</div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Products:</span>
              <span className="font-semibold">{products.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Containers:</span>
              <span className="font-semibold">{containers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Sales:</span>
              <span className="font-semibold">{sales.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Inventory:</span>
              <span className="font-semibold">{products.filter(p => p.currentStock > 0).length} items</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Low Stock Items:</span>
              <span className={`font-semibold ${lowStockProducts.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {lowStockProducts.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses:</span>
              <span className="font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Profit:</span>
              <span className={`font-semibold ${totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalNetProfit)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-medium">Cash Position:</span>
              <span className={`font-bold text-lg ${currentCashPosition >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(currentCashPosition)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sales Count:</span>
              <span className="font-semibold">{thisMonthsSales.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Sale:</span>
              <span className="font-semibold">
                {thisMonthsSales.length > 0 
                  ? formatCurrency(monthlyRevenue / thisMonthsSales.length)
                  : formatCurrency(0)
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expense Count:</span>
              <span className="font-semibold">{thisMonthsExpenses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Expense:</span>
              <span className="font-semibold">
                {thisMonthsExpenses.length > 0 
                  ? formatCurrency(monthlyExpenses / thisMonthsExpenses.length)
                  : formatCurrency(0)
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setIsLowStockExpanded(!isLowStockExpanded)}
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-orange-900">Low Stock Alert</h3>
              <span className="ml-2 text-sm text-orange-700">({lowStockProducts.length} items)</span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-orange-600 transform transition-transform duration-300 ease-in-out ${
                isLowStockExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>

          <div
            style={{
              height: isLowStockExpanded ? contentHeight : 0,
              transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}
          >
            <div ref={contentRef} className="pt-4">
              <p className="text-orange-700 mb-4 text-sm sm:text-base">The following products have low stock (less than 10 bags):</p>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                  {lowStockProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-white p-3 rounded border border-orange-200 min-w-[250px] sm:min-w-0 flex-shrink-0 sm:flex-shrink"
                    >
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.category}</div>
                      <div className="text-sm font-semibold text-orange-600">
                        Stock: {product.currentStock} bags
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
            {recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.map(sale => (
                  <div key={sale.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{sale.productName}</div>
                      <div className="text-sm text-gray-600">
                        {sale.quantity} units • {formatDate(sale.date)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{formatCurrency(sale.totalAmount)}</div>
                      <div className="text-sm text-gray-500">+{formatCurrency(sale.profit)} profit</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No sales recorded yet</p>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map(expense => (
                  <div key={expense.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{expense.description}</div>
                      <div className="text-sm text-gray-600">
                        {expense.category} • {formatDate(expense.date)}
                      </div>
                    </div>
                    <div className="font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No expenses recorded yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        {/* Sales Trend Chart */}
        <SalesChart />
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Expense Breakdown Chart */}
          <ExpenseChart />
          
          {/* Top Products Chart */}
          <TopProductsChart />
        </div>
      </div>
    </div>
  );
}