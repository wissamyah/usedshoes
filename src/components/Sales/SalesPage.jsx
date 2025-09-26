import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { formatDate } from '../../utils/dateFormatter';
import SalesForm from './SalesForm';
import SalesHistory from './SalesHistory';
import StatCard from '../UI/StatCard';
import { Plus, BarChart3, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function SalesPage() {
  const { sales, products } = useData();
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  // Get the most recent sales date (or today if no sales)
  const mostRecentSaleDate = sales.length > 0 
    ? sales.reduce((latest, sale) => {
        const saleDate = new Date(sale.date);
        return saleDate > latest ? saleDate : latest;
      }, new Date(sales[0].date))
    : new Date();
  
  const today = new Date().toISOString().split('T')[0];
  const recentDateStr = mostRecentSaleDate.toISOString().split('T')[0];
  
  // Show today's sales if there are any, otherwise show most recent date's sales
  const todaysSales = sales.filter(sale => sale.date === today);
  const recentSales = todaysSales.length > 0 ? todaysSales : sales.filter(sale => sale.date === recentDateStr);
  const displayDate = todaysSales.length > 0 ? 'Today' : `Latest (${formatDate(recentDateStr)})`;
  
  const todaysRevenue = recentSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const todaysProfit = recentSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);

  // Calculate this month's sales (or most recent month with sales)
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  let thisMonthsSales = sales.filter(sale => sale.date && sale.date.startsWith(currentMonth));
  
  // If no sales this month, show most recent month with sales
  let displayMonth = 'This Month';
  if (thisMonthsSales.length === 0 && sales.length > 0) {
    const recentMonth = mostRecentSaleDate.toISOString().substring(0, 7);
    thisMonthsSales = sales.filter(sale => sale.date && sale.date.startsWith(recentMonth));
    const monthDate = new Date(recentMonth + '-01');
    displayMonth = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  const monthlyRevenue = thisMonthsSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const monthlyProfit = thisMonthsSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);

  const handleAddSale = () => {
    setSelectedSale(null);
    setShowSalesForm(true);
  };

  const handleEditSale = (sale) => {
    setSelectedSale(sale);
    setShowSalesForm(true);
  };

  const handleCloseSalesForm = () => {
    setShowSalesForm(false);
    setSelectedSale(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <div className="py-6 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
          <p className="text-sm text-gray-600 mt-1">Record sales, track revenue and manage transactions</p>
        </div>
        <button
          onClick={handleAddSale}
          className="inline-flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-green-600 text-white text-sm font-medium rounded-lg sm:rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 touch-manipulation"
        >
          <Plus className="h-6 w-6 sm:h-4 sm:w-4 sm:mr-2" />
          <span className="hidden sm:inline">Record Sale</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={`${displayDate}'s Revenue`}
          value={formatCurrency(todaysRevenue)}
          subtitle={`${recentSales.length} transactions`}
          icon={DollarSign}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          trend={todaysRevenue > 0 ? 'up' : null}
        />

        <StatCard
          title={`${displayDate}'s Profit`}
          value={formatCurrency(todaysProfit)}
          subtitle={todaysRevenue > 0 ? `${((todaysProfit / todaysRevenue) * 100).toFixed(1)}% margin` : '0% margin'}
          icon={TrendingUp}
          iconBgColor={todaysProfit >= 0 ? "bg-blue-100" : "bg-red-100"}
          iconColor={todaysProfit >= 0 ? "text-blue-600" : "text-red-600"}
          trend={todaysProfit > 0 ? 'up' : todaysProfit < 0 ? 'down' : null}
        />

        <StatCard
          title={`${displayMonth} Revenue`}
          value={formatCurrency(monthlyRevenue)}
          subtitle={`${thisMonthsSales.length} transactions`}
          icon={BarChart3}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title={`${displayMonth} Profit`}
          value={formatCurrency(monthlyProfit)}
          subtitle={monthlyRevenue > 0 ? `${((monthlyProfit / monthlyRevenue) * 100).toFixed(1)}% margin` : '0% margin'}
          icon={TrendingUp}
          iconBgColor={monthlyProfit >= 0 ? "bg-orange-100" : "bg-red-100"}
          iconColor={monthlyProfit >= 0 ? "text-orange-600" : "text-red-600"}
          trend={monthlyProfit > 0 ? 'up' : monthlyProfit < 0 ? 'down' : null}
        />
      </div>

      {/* Sales History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <SalesHistory onEditSale={handleEditSale} />
      </div>

      {/* Sales Form Modal */}
      {showSalesForm && (
        <SalesForm
          sale={selectedSale}
          onClose={handleCloseSalesForm}
        />
      )}
    </div>
  );
}