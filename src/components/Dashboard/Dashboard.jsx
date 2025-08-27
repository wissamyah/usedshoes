import { AlertTriangle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import KPICards from './KPICards';
import SalesChart from './SalesChart';
import ExpenseChart from './ExpenseChart';
import TopProductsChart from './TopProductsChart';

export default function Dashboard() {
  const { products, sales, expenses, containers } = useData();

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

  // Recent activity (last 5 transactions)
  const recentSales = sales
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`))
    .slice(0, 5);

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Low stock alerts (products with less than 10 bags)
  const lowStockProducts = products.filter(product => product.currentStock < 10);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Summary</h3>
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
              <span className="text-gray-600">Total Expenses:</span>
              <span className="font-semibold">{expenses.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All-Time Performance</h3>
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
              <span className="text-gray-600">Gross Profit:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(totalProfit)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-900 font-medium">Net Profit:</span>
              <span className={`font-bold ${totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalNetProfit)}
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
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-orange-900">Low Stock Alert</h3>
          </div>
          <p className="text-orange-700 mb-4 text-sm sm:text-base">The following products have low stock (less than 10 bags):</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {lowStockProducts.map(product => (
              <div key={product.id} className="bg-white p-3 rounded border border-orange-200">
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600">{product.category}</div>
                <div className="text-sm font-semibold text-orange-600">
                  Stock: {product.currentStock} bags
                </div>
              </div>
            ))}
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