import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Wallet, TrendingUp, TrendingDown, DollarSign, ChevronDown, ChevronUp, Activity, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
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

  // Recent activity by day (last 7 days)
  const recentSalesByDay = (() => {
    const salesByDate = {};
    sales.forEach(sale => {
      if (!salesByDate[sale.date]) {
        salesByDate[sale.date] = { amount: 0, count: 0, profit: 0 };
      }
      salesByDate[sale.date].amount += sale.totalAmount || 0;
      salesByDate[sale.date].count += 1;
      salesByDate[sale.date].profit += sale.profit || 0;
    });
    return Object.entries(salesByDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7)
      .map(([date, data]) => ({ date, ...data }));
  })();

  const recentExpensesByDay = (() => {
    const expensesByDate = {};
    expenses.forEach(expense => {
      if (!expensesByDate[expense.date]) {
        expensesByDate[expense.date] = { amount: 0, count: 0 };
      }
      expensesByDate[expense.date].amount += expense.amount || 0;
      expensesByDate[expense.date].count += 1;
    });
    return Object.entries(expensesByDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7)
      .map(([date, data]) => ({ date, ...data }));
  })();

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
    <div className="py-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Overview of your business performance</p>
      </div>

      {/* KPI Cards */}
      <KPICards
        todaysRevenue={todaysRevenue}
        monthlyRevenue={monthlyRevenue}
        inventoryValue={inventoryValue}
        netProfit={netProfit}
      />

      {/* Cash Position Card - Professional Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Cash Position</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-light text-gray-900 transition-all duration-500">
                {formatCurrency(currentCashPosition)}
              </span>
              {currentCashPosition >= 0 ? (
                <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Positive
                </span>
              ) : (
                <span className="flex items-center text-sm text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  Negative
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-gray-500">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="group">
            <div className="text-xs text-gray-500 mb-1">Revenue</div>
            <div className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          <div className="group">
            <div className="text-xs text-gray-500 mb-1">Investments</div>
            <div className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {formatCurrency(totalPurchases)}
            </div>
          </div>
          <div className="group">
            <div className="text-xs text-gray-500 mb-1">Expenses</div>
            <div className="text-lg font-medium text-gray-900 group-hover:text-red-600 transition-colors">
              {formatCurrency(totalExpenses)}
            </div>
          </div>
          <div className="group">
            <div className="text-xs text-gray-500 mb-1">Withdrawals</div>
            <div className="text-lg font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
              {formatCurrency(totalWithdrawals)}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4 relative">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Operations</h3>
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Products</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{products.length}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Containers</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{containers.length}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Total Sales</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{sales.length}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Active Stock</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">{products.filter(p => p.currentStock > 0).length}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Low Stock Alert</span>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                lowStockProducts.length > 0
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-100 text-green-600'
              }`}>
                {lowStockProducts.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4 relative">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Financials</h3>
            <div className="p-1.5 bg-green-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Revenue</span>
              <span className="text-sm font-medium text-green-600 group-hover:text-green-700 transition-colors">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Expenses</span>
              <span className="text-sm font-medium text-red-600 group-hover:text-red-700 transition-colors">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Gross Profit</span>
              <span className={`text-sm font-medium transition-colors ${
                totalNetProfit >= 0
                  ? 'text-green-600 group-hover:text-green-700'
                  : 'text-red-600 group-hover:text-red-700'
              }`}>
                {formatCurrency(totalNetProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Profit Margin</span>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                totalRevenue > 0 && (totalNetProfit / totalRevenue) * 100 > 0
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {totalRevenue > 0 ? `${((totalNetProfit / totalRevenue) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4 relative">
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">This Month</h3>
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Sales</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">{thisMonthsSales.length}</span>
            </div>
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Avg Sale</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                {thisMonthsSales.length > 0
                  ? formatCurrency(monthlyRevenue / thisMonthsSales.length)
                  : formatCurrency(0)
                }
              </span>
            </div>
            <div className="flex justify-between items-center group cursor-default">
              <span className="text-sm text-gray-500">Expenses</span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">{thisMonthsExpenses.length}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Net Cash Flow</span>
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                monthlyRevenue - monthlyExpenses > 0
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                {formatCurrency(monthlyRevenue - monthlyExpenses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 mb-8 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 via-orange-50/20 to-orange-50/0 pointer-events-none"></div>
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setIsLowStockExpanded(!isLowStockExpanded)}
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg mr-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Low Stock Alert</h3>
                <p className="text-xs text-gray-500 mt-0.5">{lowStockProducts.length} items need restocking</p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ease-in-out ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockProducts.map(product => (
                  <div
                    key={product.id}
                    className="group bg-gray-50 hover:bg-orange-50 p-3 rounded-lg border border-gray-100 hover:border-orange-200 transition-all duration-200 cursor-default"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{product.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-orange-600">{product.currentStock}</div>
                        <div className="text-xs text-gray-500">bags left</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Daily Sales</h3>
              <div className="p-1.5 bg-green-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
            {recentSalesByDay.length > 0 ? (
              <div className="space-y-3">
                {recentSalesByDay.map(day => (
                  <div key={day.date} className="group flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-default">
                    <div>
                      <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{formatDate(day.date)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {day.count} sale{day.count !== 1 ? 's' : ''} • Profit: {formatCurrency(day.profit)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600 text-sm">{formatCurrency(day.amount)}</div>
                      <div className="text-xs text-gray-500">Daily Total</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <TrendingUp className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">No sales recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Daily Expenses</h3>
              <div className="p-1.5 bg-red-50 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </div>
            {recentExpensesByDay.length > 0 ? (
              <div className="space-y-3">
                {recentExpensesByDay.map(day => (
                  <div key={day.date} className="group flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-default">
                    <div>
                      <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{formatDate(day.date)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {day.count} expense{day.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="font-semibold text-red-600 text-sm">
                      -{formatCurrency(day.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <TrendingDown className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">No expenses recorded yet</p>
              </div>
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