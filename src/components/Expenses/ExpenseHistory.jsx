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
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#ebebeb' }}>Expense History</h3>
          <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '4px' }}>
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} • {formatCurrency(totalAmount)} total
          </p>
          {totalPages > 1 && (
            <p style={{ fontSize: '12px', color: '#808080', marginTop: '4px' }}>
              Page {currentPage}: {paginatedExpenses.length} expense{paginatedExpenses.length !== 1 ? 's' : ''} • {formatCurrency(pageAmount)}
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #404040',
        marginBottom: '24px',
        overflow: 'hidden'
      }}>
        {/* Filter Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #404040',
          backgroundColor: '#333333'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter style={{ height: '18px', width: '18px', color: '#3b82f6' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#ebebeb', margin: 0 }}>
                Filter Expenses
              </h4>
            </div>
            {(searchTerm || categoryFilter || dateFromFilter || dateToFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setDateFromFilter('');
                  setDateToFilter('');
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Content */}
        <div style={{ padding: '20px' }}>
          {/* Top Row - Search and Category */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#b3b3b3',
                marginBottom: '6px'
              }}>
                Search
              </label>
              <div className="relative">
                <Search style={{
                  height: '18px',
                  width: '18px',
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#808080'
                }} />
                <input
                  type="text"
                  placeholder="Search by description, notes, or container ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    paddingLeft: '2.75rem',
                    paddingRight: '12px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#b3b3b3',
                marginBottom: '6px'
              }}>
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  backgroundColor: '#1c1c1c',
                  color: '#ebebeb',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#404040';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Middle Row - Date Range */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#b3b3b3',
              marginBottom: '8px'
            }}>
              Date Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#808080',
                  marginBottom: '4px'
                }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => {
                    setDateFromFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#808080',
                  marginBottom: '4px'
                }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => {
                    setDateToFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Quick Date Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Today', value: 'today' },
                { label: 'This Month', value: 'thisMonth' },
                { label: 'Last Month', value: 'lastMonth' },
                { label: 'Clear Dates', value: 'clear' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleQuickFilter(filter.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    backgroundColor: filter.value === 'clear' ? 'rgba(107, 114, 128, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid ${filter.value === 'clear' ? 'rgba(107, 114, 128, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                    color: filter.value === 'clear' ? '#9ca3af' : '#60a5fa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (filter.value === 'clear') {
                      e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.2)';
                      e.target.style.borderColor = 'rgba(107, 114, 128, 0.5)';
                    } else {
                      e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter.value === 'clear') {
                      e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                      e.target.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                    } else {
                      e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    }
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Row - Sort Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#b3b3b3',
                marginBottom: '6px'
              }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  backgroundColor: '#1c1c1c',
                  color: '#ebebeb',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#404040';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
                color: '#b3b3b3',
                marginBottom: '6px'
              }}>
                Sort Order
              </label>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  backgroundColor: '#1c1c1c',
                  color: '#ebebeb',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#333333';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1c1c1c';
                  e.target.style.borderColor = '#404040';
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#404040';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                <span style={{ fontSize: '16px' }}>{sortOrder === 'desc' ? '↓' : '↑'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table Container */}
      {filteredExpenses.length > 0 ? (
        <>
          {/* Table with horizontal scroll */}
          <div style={{ overflowX: 'auto', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', border: '1px solid #404040', borderBottom: 0 }}>
            <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ backgroundColor: '#333333' }}>
              <tr>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Date
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Category
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Description
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Amount
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Container
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: '#2a2a2a' }}>
              {paginatedExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  style={{
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb' }}>
                    {formatDate(expense.date)}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      color: '#60a5fa'
                    }}>
                      {expense.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>{expense.description}</div>
                    {expense.notes && (
                      <div style={{ fontSize: '14px', color: '#b3b3b3', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '20rem' }} title={expense.notes}>
                        {expense.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>
                    {formatCurrency(expense.amount)}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#b3b3b3' }}>
                    {expense.containerId || '—'}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500' }}>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditExpense(expense)}
                        style={{
                          color: '#3b82f6',
                          padding: '4px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.target.style.color = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#3b82f6';
                        }}
                        title="Edit expense"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense)}
                        style={{
                          color: '#ef4444',
                          padding: '4px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.target.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#ef4444';
                        }}
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
        </div>

        {/* Pagination Controls - Outside scrollable area */}
        {totalPages > 1 && (
          <div style={{ backgroundColor: '#1c1c1c', padding: '12px 16px', borderTop: '1px solid #404040', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
              {/* Mobile Pagination */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-3">
                  <div style={{ fontSize: '14px', color: '#ebebeb' }}>
                    Page {currentPage} of {totalPages}
                  </div>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '14px',
                      border: '1px solid #404040',
                      borderRadius: '4px',
                      backgroundColor: '#2a2a2a',
                      color: '#ebebeb'
                    }}
                  >
                    <option value="10">10/page</option>
                    <option value="25">25/page</option>
                    <option value="50">50/page</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: currentPage === 1 ? '#808080' : '#ebebeb',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #404040',
                      borderRadius: '6px',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '14px',
                        borderRadius: '4px',
                        backgroundColor: currentPage === 1 ? '#3b82f6' : 'transparent',
                        color: currentPage === 1 ? 'white' : '#ebebeb',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      1
                    </button>
                    {currentPage > 3 && <span style={{ padding: '4px', color: '#b3b3b3' }}>...</span>}
                    {currentPage > 2 && currentPage < totalPages - 1 && (
                      <button
                        onClick={() => handlePageChange(currentPage)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '14px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {currentPage}
                      </button>
                    )}
                    {currentPage < totalPages - 2 && <span style={{ padding: '4px', color: '#b3b3b3' }}>...</span>}
                    {totalPages > 1 && (
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '14px',
                          borderRadius: '4px',
                          backgroundColor: currentPage === totalPages ? '#3b82f6' : 'transparent',
                          color: currentPage === totalPages ? 'white' : '#ebebeb',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: currentPage === totalPages ? '#808080' : '#ebebeb',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #404040',
                      borderRadius: '6px',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#b3b3b3', marginTop: '8px' }}>
                  {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                </div>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex sm:justify-between sm:items-center">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <label style={{ fontSize: '14px', color: '#ebebeb' }}>Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '14px',
                      border: '1px solid #404040',
                      borderRadius: '4px',
                      backgroundColor: '#2a2a2a',
                      color: '#ebebeb',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#404040';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value={filteredExpenses.length}>All ({filteredExpenses.length})</option>
                  </select>
                  <span style={{ fontSize: '14px', color: '#ebebeb' }}>per page</span>
                </div>
                
                {/* Page navigation */}
                <div className="flex items-center space-x-1">
                  {/* First page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.backgroundColor = '#333333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                    title="First page"
                  >
                    <ChevronsLeft style={{ height: '16px', width: '16px', color: '#b3b3b3' }} />
                  </button>

                  {/* Previous page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.backgroundColor = '#333333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                    title="Previous page"
                  >
                    <ChevronLeft style={{ height: '16px', width: '16px', color: '#b3b3b3' }} />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1 mx-2">
                    {getPageNumbers().map((pageNum, index) => (
                      pageNum === '...' ? (
                        <span key={`dots-${index}`} style={{ padding: '8px', fontSize: '14px', color: '#b3b3b3' }}>...</span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            padding: '8px 12px',
                            fontSize: '14px',
                            borderRadius: '4px',
                            backgroundColor: currentPage === pageNum ? '#3b82f6' : 'transparent',
                            color: currentPage === pageNum ? 'white' : '#ebebeb',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== pageNum) {
                              e.target.style.backgroundColor = '#333333';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== pageNum) {
                              e.target.style.backgroundColor = 'transparent';
                            }
                          }}
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
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.backgroundColor = '#333333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                    title="Next page"
                  >
                    <ChevronRight style={{ height: '16px', width: '16px', color: '#b3b3b3' }} />
                  </button>

                  {/* Last page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '6px',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.target.style.backgroundColor = '#333333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                    title="Last page"
                  >
                    <ChevronsRight style={{ height: '16px', width: '16px', color: '#b3b3b3' }} />
                  </button>
                </div>
                
                {/* Page info */}
                <div style={{ fontSize: '14px', color: '#ebebeb' }}>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} expense{totalItems !== 1 ? 's' : ''}
                </div>
              </div>
          </div>
        )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <FileX style={{ margin: '0 auto 16px', height: '48px', width: '48px', color: '#808080' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#ebebeb', marginBottom: '8px' }}>No Expenses Found</h3>
          <p style={{ color: '#b3b3b3', marginBottom: '16px' }}>
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
              style={{
                color: '#3b82f6',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#3b82f6';
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}