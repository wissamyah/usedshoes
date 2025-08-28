import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import SalesForm from './SalesForm';
import SalesHistory from './SalesHistory';
import { Plus, BarChart3, DollarSign } from 'lucide-react';

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
  const displayDate = todaysSales.length > 0 ? 'Today' : `Latest (${new Date(recentDateStr).toLocaleDateString()})`;
  
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
    displayMonth = new Date(recentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
          <p className="text-sm text-gray-600 mt-1">Record sales, track revenue and manage transactions</p>
        </div>
        <button
          onClick={handleAddSale}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Sale
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{displayDate}'s Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(todaysRevenue)}</p>
              <p className="text-sm text-gray-600">{recentSales.length} transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{displayDate}'s Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(todaysProfit)}</p>
              <p className="text-sm text-gray-600">
                {todaysRevenue > 0 ? `${((todaysProfit / todaysRevenue) * 100).toFixed(1)}% margin` : '0% margin'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{displayMonth} Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyRevenue)}</p>
              <p className="text-sm text-gray-600">{thisMonthsSales.length} transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{displayMonth} Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyProfit)}</p>
              <p className="text-sm text-gray-600">
                {monthlyRevenue > 0 ? `${((monthlyProfit / monthlyRevenue) * 100).toFixed(1)}% margin` : '0% margin'}
              </p>
            </div>
          </div>
        </div>
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