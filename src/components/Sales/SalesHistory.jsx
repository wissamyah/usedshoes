import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { Pencil, Trash2, Search, ClipboardX } from 'lucide-react';

export default function SalesHistory({ onEditSale }) {
  const { sales, deleteSale } = useData();
  const { showSuccessMessage, showErrorMessage, showConfirmDialog } = useUI();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount, profit
  const [sortOrder, setSortOrder] = useState('desc'); // desc, asc

  // Filter and sort sales
  const filteredSales = sales
    .filter(sale => {
      const matchesSearch = !searchTerm || 
        sale.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || sale.date === dateFilter;
      
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'profit':
          aValue = a.profit || 0;
          bValue = b.profit || 0;
          break;
        case 'date':
        default:
          // Sort by date and time combined
          aValue = new Date(`${a.date}T${a.time || '00:00'}`);
          bValue = new Date(`${b.date}T${b.time || '00:00'}`);
          break;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

  const handleDeleteSale = async (sale) => {
    const confirmed = await showConfirmDialog(
      'Delete Sale',
      `Are you sure you want to delete this sale for ${sale.productName}? This will restore ${sale.quantity} units to inventory.`
    );

    if (confirmed) {
      try {
        await deleteSale(sale.id);
        showSuccessMessage('Sale Deleted', 'Sale has been deleted and stock restored');
      } catch (error) {
        console.error('Delete sale error:', error);
        showErrorMessage('Delete Failed', error.message || 'Failed to delete sale');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Calculate totals for filtered sales
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Sales History</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredSales.length} sales • {formatCurrency(totalRevenue)} revenue • {formatCurrency(totalProfit)} profit
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Sort Options */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="profit">Sort by Profit</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>

        {/* Clear Filters */}
        {(searchTerm || dateFilter) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFilter('');
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear
          </button>
        )}
      </div>

      {/* Sales Table */}
      {filteredSales.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{formatDate(sale.date)}</div>
                      <div className="text-gray-500">{formatTime(sale.time)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.productName}</div>
                    {sale.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs" title={sale.notes}>
                        {sale.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(sale.pricePerUnit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`${sale.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(sale.profit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditSale(sale)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="Edit sale"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title="Delete sale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || dateFilter
              ? 'No sales match your current filters.'
              : 'No sales have been recorded yet. Start by recording your first sale!'}
          </p>
          {(searchTerm || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
              }}
              className="text-green-600 hover:text-green-500"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}