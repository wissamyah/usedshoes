import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { formatDate as formatDateUtil } from '../../utils/dateFormatter';
import { Pencil, Trash2, Search, ClipboardX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Calendar, TrendingUp, TrendingDown, X, SlidersHorizontal } from 'lucide-react';

export default function SalesHistory({ onEditSale }) {
  const { sales, deleteSale } = useData();
  const { showSuccessMessage, showErrorMessage, showConfirmDialog } = useUI();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount, profit
  const [sortOrder, setSortOrder] = useState('desc'); // desc, asc
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and sort sales
  const filteredSales = sales
    .filter(sale => {
      const matchesSearch = !searchTerm || 
        sale.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filtering logic - support both single date and date range
      let matchesDate = true;
      
      if (dateFilter) {
        // Single date filter
        matchesDate = sale.date === dateFilter;
      } else if (startDate || endDate) {
        // Date range filter
        const saleDate = new Date(sale.date);
        
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          matchesDate = saleDate >= start && saleDate <= end;
        } else if (startDate) {
          const start = new Date(startDate);
          matchesDate = saleDate >= start;
        } else if (endDate) {
          const end = new Date(endDate);
          matchesDate = saleDate <= end;
        }
      }
      
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
  
  // Pagination logic
  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, endIndex);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Reset to page 1 when filters change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setCurrentPage(1);
  };
  
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

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
    return formatDateUtil(dateString);
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
  
  // Calculate totals for current page
  const pageRevenue = paginatedSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const pageProfit = paginatedSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Sales History</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredSales.length} total sales • {formatCurrency(totalRevenue)} total revenue • {formatCurrency(totalProfit)} total profit
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              Page {currentPage}: {paginatedSales.length} sales • {formatCurrency(pageRevenue)} revenue • {formatCurrency(pageProfit)} profit
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Sales Filters</h3>
            </div>
            {(searchTerm || dateFilter || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                  setStartDate('');
                  setEndDate('');
                  setCurrentPage(1);
                }}
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                <X className="h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Search and Sort Section */}
          <div className="space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div>
              <div className="flex items-center mb-2">
                <Search className="h-4 w-4 text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700">Search</label>
              </div>
              <div className="relative">
                <Search className="h-4 sm:h-5 w-4 sm:w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products or notes..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <div className="flex items-center mb-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-500 mr-2" />
                <label className="text-sm font-medium text-gray-700">Sort Options</label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="profit">Sort by Profit</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className={`px-4 py-2 sm:py-2.5 border rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    sortOrder === 'desc'
                      ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                      : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                  }`}
                  title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                >
                  {sortOrder === 'desc' ? (
                    <><TrendingDown className="h-4 w-4" /><span>Descending</span></>
                  ) : (
                    <><TrendingUp className="h-4 w-4" /><span>Ascending</span></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Date Range Section */}
          <div>
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <label className="text-sm font-medium text-gray-700">Date Range</label>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1.5">From</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setDateFilter('');
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1.5">To</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setDateFilter('');
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Date Range */}
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setCurrentPage(1);
                  }}
                  className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear date range
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchTerm || startDate || endDate) && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-xs sm:text-sm font-medium text-gray-700">
                  Active Filters:
                  {searchTerm && (
                    <span className="ml-2 px-2 py-1 bg-white rounded-md text-green-700 border border-green-300">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {(startDate || endDate) && (
                    <span className="ml-2 px-2 py-1 bg-white rounded-md text-green-700 border border-green-300">
                      {startDate && endDate ? `${startDate} to ${endDate}` : startDate ? `From ${startDate}` : `Until ${endDate}`}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {filteredSales.length} results
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Table */}
      {filteredSales.length > 0 ? (
        <>
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
              {paginatedSales.map((sale) => (
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            {/* Mobile Pagination */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="5">5/page</option>
                  <option value="10">10/page</option>
                  <option value="20">20/page</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`px-2 py-1 text-sm rounded ${currentPage === 1 ? 'bg-green-600 text-white' : 'text-gray-700'}`}
                  >
                    1
                  </button>
                  {currentPage > 3 && <span className="px-1 text-gray-500">...</span>}
                  {currentPage > 2 && currentPage < totalPages - 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage)}
                      className="px-2 py-1 text-sm bg-green-600 text-white rounded"
                    >
                      {currentPage}
                    </button>
                  )}
                  {currentPage < totalPages - 2 && <span className="px-1 text-gray-500">...</span>}
                  {totalPages > 1 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-2 py-1 text-sm rounded ${currentPage === totalPages ? 'bg-green-600 text-white' : 'text-gray-700'}`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
              </div>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden sm:flex sm:items-center sm:justify-between">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-700">per page</span>
              </div>
              
              {/* Pagination info and controls */}
              <div className="flex items-center space-x-1">
                {/* First page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4 text-gray-600" />
                </button>
                
                {/* Previous page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1 mx-2">
                  {getPageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                      <span key={`dots-${index}`} className="px-2 py-1 text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>
                
                {/* Next page */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
                
                {/* Last page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronsRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              {/* Results info */}
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
              </div>
            </div>
          </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <ClipboardX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sales Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || dateFilter
              ? 'No sales match your current filters.'
              : 'No sales recorded.'}
          </p>
          {(searchTerm || dateFilter || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
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