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
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#ebebeb' }}>Sales History</h3>
          <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '4px' }}>
            {filteredSales.length} total sales • {formatCurrency(totalRevenue)} total revenue • {formatCurrency(totalProfit)} total profit
          </p>
          {totalPages > 1 && (
            <p style={{ fontSize: '12px', color: '#808080', marginTop: '4px' }}>
              Page {currentPage}: {paginatedSales.length} sales • {formatCurrency(pageRevenue)} revenue • {formatCurrency(pageProfit)} profit
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div style={{ backgroundColor: '#333333', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #404040' }} className="overflow-hidden mb-6">
        {/* Header */}
        <div style={{ backgroundColor: '#2a2a2a', borderBottom: '1px solid #404040' }} className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter style={{ height: '16px', width: '16px', color: '#b3b3b3' }} className="sm:h-5 sm:w-5" />
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#ebebeb' }} className="sm:text-base">Sales Filters</h3>
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
                style={{
                  fontSize: '12px',
                  color: '#808080',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                className="sm:text-sm flex items-center gap-1"
                onMouseEnter={(e) => {
                  e.target.style.color = '#ebebeb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#808080';
                }}
              >
                <X style={{ height: '12px', width: '12px' }} className="sm:h-4 sm:w-4" />
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
                <Search style={{ height: '16px', width: '16px', color: '#808080', marginRight: '8px' }} />
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#b3b3b3' }}>Search</label>
              </div>
              <div className="relative">
                <Search style={{ height: '16px', width: '16px', color: '#808080' }} className="sm:h-5 sm:w-5 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products or notes..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.25rem',
                    paddingRight: '1rem',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  className="sm:py-2.5 sm:pl-10"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#22c55e';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <div className="flex items-center mb-2">
                <SlidersHorizontal style={{ height: '16px', width: '16px', color: '#808080', marginRight: '8px' }} />
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#b3b3b3' }}>Sort Options</label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  className="sm:py-2.5"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#22c55e';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="profit">Sort by Profit</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    fontWeight: '500',
                    fontSize: '14px',
                    backgroundColor: sortOrder === 'desc' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: sortOrder === 'desc' ? '#22c55e' : '#3b82f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  className="sm:py-2.5"
                  title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = sortOrder === 'desc' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = sortOrder === 'desc' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  {sortOrder === 'desc' ? (
                    <><TrendingDown style={{ height: '16px', width: '16px' }} /><span>Descending</span></>
                  ) : (
                    <><TrendingUp style={{ height: '16px', width: '16px' }} /><span>Ascending</span></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Date Range Section */}
          <div>
            <div className="flex items-center mb-2">
              <Calendar style={{ height: '16px', width: '16px', color: '#808080', marginRight: '8px' }} />
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#b3b3b3' }}>Date Range</label>
            </div>
            <div style={{ backgroundColor: '#1c1c1c', borderRadius: '8px', padding: '12px 16px' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <label htmlFor="startDate" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', marginBottom: '6px' }}>From</label>
                  <div className="relative">
                    <Calendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: '#808080' }} />
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setDateFilter('');
                        setCurrentPage(1);
                      }}
                      style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                        paddingRight: '12px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        border: '1px solid #404040',
                        borderRadius: '8px',
                        backgroundColor: '#2a2a2a',
                        color: '#ebebeb',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#22c55e';
                        e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#404040';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label htmlFor="endDate" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', marginBottom: '6px' }}>To</label>
                  <div className="relative">
                    <Calendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: '#808080' }} />
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setDateFilter('');
                        setCurrentPage(1);
                      }}
                      style={{
                        width: '100%',
                        paddingLeft: '2.5rem',
                        paddingRight: '12px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        border: '1px solid #404040',
                        borderRadius: '8px',
                        backgroundColor: '#2a2a2a',
                        color: '#ebebeb',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#22c55e';
                        e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#404040';
                        e.target.style.boxShadow = 'none';
                      }}
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
                  style={{
                    marginTop: '12px',
                    fontSize: '14px',
                    color: '#22c55e',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#22c55e';
                  }}
                >
                  <X style={{ height: '12px', width: '12px' }} />
                  Clear date range
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchTerm || startDate || endDate) && (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', padding: '12px 16px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#b3b3b3' }} className="sm:text-sm">
                  Active Filters:
                  {searchTerm && (
                    <span style={{ marginLeft: '8px', padding: '4px 8px', backgroundColor: '#2a2a2a', borderRadius: '6px', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {(startDate || endDate) && (
                    <span style={{ marginLeft: '8px', padding: '4px 8px', backgroundColor: '#2a2a2a', borderRadius: '6px', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                      {startDate && endDate ? `${startDate} to ${endDate}` : startDate ? `From ${startDate}` : `Until ${endDate}`}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#808080' }} className="sm:text-sm">
                  {filteredSales.length} results
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sales Table Container */}
      {filteredSales.length > 0 ? (
        <>
          {/* Table with horizontal scroll */}
          <div style={{ overflowX: 'auto', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', border: '1px solid #404040', borderBottom: 0 }}>
            <table style={{ minWidth: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ backgroundColor: '#333333' }}>
              <tr>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Date & Time
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Product
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quantity
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Price/Unit
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Profit
                </th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: '#2a2a2a' }}>
              {paginatedSales.map((sale) => (
                <tr
                  key={sale.id}
                  style={{
                    borderBottom: '1px solid #404040',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{formatDate(sale.date)}</div>
                      <div style={{ color: '#b3b3b3' }}>{formatTime(sale.time)}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>{sale.productName}</div>
                    {sale.notes && (
                      <div style={{ fontSize: '14px', color: '#b3b3b3', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '300px' }} title={sale.notes}>
                        {sale.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb' }}>
                    {sale.quantity}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb' }}>
                    {formatCurrency(sale.pricePerUnit)}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500' }}>
                    <span style={{ color: sale.profit > 0 ? '#22c55e' : '#ef4444' }}>
                      {formatCurrency(sale.profit)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500' }}>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditSale(sale)}
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
                        title="Edit sale"
                      >
                        <Pencil style={{ height: '16px', width: '16px' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale)}
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
                        title="Delete sale"
                      >
                        <Trash2 style={{ height: '16px', width: '16px' }} />
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
          <div style={{ backgroundColor: '#1c1c1c', padding: '12px 16px', borderTop: '1px solid #404040', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
            {/* Mobile Pagination */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-3">
                <div style={{ fontSize: '14px', color: '#b3b3b3' }}>
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
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb'
                  }}
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
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.target.style.backgroundColor = 'transparent';
                      }
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
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== totalPages) {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== totalPages) {
                          e.target.style.backgroundColor = 'transparent';
                        }
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
            <div className="hidden sm:flex sm:items-center sm:justify-between">
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
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span style={{ fontSize: '14px', color: '#ebebeb' }}>per page</span>
              </div>
              
              {/* Pagination info and controls */}
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
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
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
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
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
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
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
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
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
              
              {/* Results info */}
              <div style={{ fontSize: '14px', color: '#ebebeb' }}>
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