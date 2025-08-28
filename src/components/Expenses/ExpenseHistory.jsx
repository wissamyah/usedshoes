import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { formatDate } from '../../utils/dateFormatter';
import { Pencil, Trash2, Search, Filter, FileX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function ExpenseHistory({ onEditExpense }) {
  const { expenses, deleteExpense } = useData();
  const { showSuccessMessage, showErrorMessage, showConfirmDialog } = useUI();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, amount, category
  const [sortOrder, setSortOrder] = useState('desc'); // desc, asc
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get unique categories from expenses
  const uniqueCategories = [...new Set(expenses.map(expense => expense.category))].sort();

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = !searchTerm || 
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.containerId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || expense.category === categoryFilter;
      
      const matchesDateFrom = !dateFromFilter || expense.date >= dateFromFilter;
      const matchesDateTo = !dateToFilter || expense.date <= dateToFilter;
      
      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'date':
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);
  
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of the table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleDeleteExpense = async (expense) => {
    const confirmed = await showConfirmDialog(
      'Delete Expense',
      `Are you sure you want to delete this ${expense.category} expense for ${formatCurrency(expense.amount)}?`
    );

    if (confirmed) {
      try {
        await deleteExpense(expense.id);
        showSuccessMessage('Expense Deleted', 'Expense has been deleted successfully');
      } catch (error) {
        console.error('Delete expense error:', error);
        showErrorMessage('Delete Failed', error.message || 'Failed to delete expense');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };


  // Calculate totals for filtered expenses
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  
  // Calculate totals for current page
  const pageAmount = paginatedExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  // Calculate date range for quick filters
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().substring(0, 7);
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0];

  const handleQuickFilter = (filter) => {
    setCurrentPage(1); // Reset to first page when applying quick filters
    switch (filter) {
      case 'today':
        setDateFromFilter(today);
        setDateToFilter(today);
        break;
      case 'thisMonth':
        setDateFromFilter(thisMonth + '-01');
        setDateToFilter(today);
        break;
      case 'lastMonth':
        setDateFromFilter(lastMonth);
        setDateToFilter(lastMonthEnd);
        break;
      case 'clear':
        setDateFromFilter('');
        setDateToFilter('');
        break;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Expense History</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} • {formatCurrency(totalAmount)} total
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              Page {currentPage}: {paginatedExpenses.length} expense{paginatedExpenses.length !== 1 ? 's' : ''} • {formatCurrency(pageAmount)}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search description, notes, or container ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => {
                setDateFromFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => {
                setDateToFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Quick Filter Buttons */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => handleQuickFilter('today')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickFilter('thisMonth')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              This Month
            </button>
            <button
              onClick={() => handleQuickFilter('lastMonth')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Last Month
            </button>
            <button
              onClick={() => handleQuickFilter('clear')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear Dates
            </button>
          </div>

          {/* Clear All Filters */}
          {(searchTerm || categoryFilter || dateFromFilter || dateToFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setDateFromFilter('');
                setDateToFilter('');
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 underline ml-auto"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length > 0 ? (
        <div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Container
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                    {expense.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs" title={expense.notes}>
                        {expense.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.containerId || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="Edit expense"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 px-6 py-4 border-t">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <label className="text-sm text-gray-700">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value={filteredExpenses.length}>All ({filteredExpenses.length})</option>
                </select>
                <span className="text-sm text-gray-700">per page</span>
              </div>
              
              {/* Page navigation */}
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
                            ? 'bg-blue-600 text-white'
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
              
              {/* Page info */}
              <div className="text-sm text-gray-700 mt-4 sm:mt-0">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} expense{totalItems !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Expenses Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter || dateFromFilter || dateToFilter
              ? 'No expenses match your current filters.'
              : 'No expenses recorded.'}
          </p>
          {(searchTerm || categoryFilter || dateFromFilter || dateToFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setDateFromFilter('');
                setDateToFilter('');
              }}
              className="text-blue-600 hover:text-blue-500"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}