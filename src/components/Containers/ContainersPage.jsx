import { useState, useEffect } from 'react';
import { Archive, Plus, Eye, Pencil, Trash2, DollarSign, Package, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { formatDate } from '../../utils/dateFormatter';
import ContainerForm from './ContainerForm';
import ContainerDetails from './ContainerDetails';
import StatCard from '../UI/StatCard';

export default function ContainersPage() {
  const { containers, products, addContainer, updateContainer, deleteContainer, error, setError } = useData();
  const { showSuccessMessage, showErrorMessage, showConfirmDialog } = useUI();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('purchaseDate'); // 'purchaseDate', 'supplier', 'totalCost'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Handle errors from DataContext
  useEffect(() => {
    if (error) {
      showErrorMessage('Operation Failed', error);
      setError(null); // Clear the error after showing it
    }
  }, [error, showErrorMessage, setError]);

  // Filter and sort containers
  const filteredContainers = containers
    .filter(container => {
      const matchesSearch = 
        container.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        container.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        container.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'purchaseDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy === 'totalCost') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Calculate summary stats
  const totalContainers = containers.length;
  const totalValue = containers.reduce((sum, c) => sum + (parseFloat(c.totalCost) || 0), 0);
  const totalProducts = containers.reduce((sum, c) => sum + (c.products?.length || 0), 0);
  const avgContainerValue = totalContainers > 0 ? totalValue / totalContainers : 0;

  // Get container stats from container products data
  const getContainerStats = (container) => {
    const containerProducts = container.products || [];
    const productCount = containerProducts.length;
    const totalStock = containerProducts.reduce((sum, p) => sum + (p.bagQuantity || 0), 0);
    const totalKg = containerProducts.reduce((sum, p) => sum + ((p.bagQuantity || 0) * (p.bagWeight || 25)), 0);
    const productsCost = containerProducts.reduce((sum, p) => sum + ((p.bagQuantity || 0) * (p.costPerKg || 0) * (p.bagWeight || 25)), 0);
    const totalValue = productsCost + (parseFloat(container.shippingCost) || 0) + (parseFloat(container.customsCost) || 0);
    return { productCount, totalStock, totalKg, totalValue };
  };

  const handleAddContainer = () => {
    setEditingContainer(null);
    setIsFormOpen(true);
  };

  const handleEditContainer = (container) => {
    setEditingContainer(container);
    setIsFormOpen(true);
  };

  const handleDeleteContainer = async (containerId) => {
    // Find the container to get more details for the confirmation
    const container = containers.find(c => c.id === containerId);
    const containerName = container ? `${container.id} (${container.supplier})` : containerId;

    const confirmed = await showConfirmDialog(
      `Delete Container ${containerName}`,
      `Are you sure you want to delete this container? This will revert ALL stock that was added from this container. This action cannot be undone and may affect your inventory levels.`,
      'danger'
    );

    if (confirmed) {
      deleteContainer(containerId);
      // If no error occurs (handled by useEffect), show success message
      // Note: This will show immediately, but if there's an error, the error effect will override it
      showSuccessMessage('Container Deleted', `Container ${containerName} has been deleted and stock has been reverted.`);
    }
  };

  const handleViewContainer = (container) => {
    setSelectedContainer(container);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingContainer) {
        await updateContainer(editingContainer.id, formData);
      } else {
        await addContainer(formData);
      }
      setIsFormOpen(false);
      setEditingContainer(null);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingContainer(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };


  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    
    return (
      <svg className={`w-4 h-4 ml-1 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="py-6">
        <div className="sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ebebeb' }}>Container Management</h2>
              <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '4px' }}>
                Track and manage your import containers and their contents
              </p>
            </div>
            <button
              onClick={handleAddContainer}
              className="inline-flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2 border border-transparent rounded-lg sm:rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation"
            >
              <Plus className="h-6 w-6 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Container</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Containers"
              value={`${totalContainers}`}
              subtitle="Import shipments"
              icon={Archive}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />

            <StatCard
              title="Total Investment"
              value={formatCurrency(totalValue)}
              subtitle="Container costs"
              icon={DollarSign}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />

            <StatCard
              title="Total Products"
              value={`${totalProducts}`}
              subtitle="Items imported"
              icon={Package}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />

            <StatCard
              title="Avg Container Value"
              value={formatCurrency(avgContainerValue)}
              subtitle="Per container"
              icon={TrendingUp}
              iconBgColor="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>

          {/* Filters and Search */}
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #404040' }} className="mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb' }}>Filter Containers</h3>
                  <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '4px' }}>
                    {filteredContainers.length} container{filteredContainers.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>

              {/* Filters Section */}
              <div style={{ backgroundColor: '#333333', borderRadius: '8px' }} className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {/* Search - full width on mobile, spans 2 columns on desktop */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                    <div className="relative">
                      <svg className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#808080' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by ID, supplier, or invoice number..."
                        style={{
                          width: '100%',
                          paddingLeft: '2.5rem',
                          paddingRight: '1rem',
                          paddingTop: '0.5rem',
                          paddingBottom: '0.5rem',
                          border: '1px solid #404040',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#1c1c1c',
                          color: '#ebebeb',
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#60a5fa';
                          e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#404040';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="col-span-1">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#1c1c1c',
                        color: '#ebebeb',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#60a5fa';
                        e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#404040';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="purchaseDate-desc">Date (Newest)</option>
                      <option value="purchaseDate-asc">Date (Oldest)</option>
                      <option value="supplier-asc">Supplier (A-Z)</option>
                      <option value="supplier-desc">Supplier (Z-A)</option>
                      <option value="totalCost-desc">Cost (High-Low)</option>
                      <option value="totalCost-asc">Cost (Low-High)</option>
                    </select>
                  </div>
                </div>

                {/* Clear All Filters */}
                {searchQuery && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '14px',
                        color: '#808080',
                        textDecoration: 'underline',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        marginLeft: 'auto'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#ebebeb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#808080';
                      }}
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>

              {/* Results Summary */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #404040' }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '14px', color: '#b3b3b3' }}>
                    Showing {filteredContainers.length} of {totalContainers} containers
                  </span>
                  {filteredContainers.length > 0 && (
                    <span style={{ fontSize: '14px', color: '#808080' }}>
                      Total Value: {formatCurrency(totalValue)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Containers List */}
          {filteredContainers.length === 0 ? (
            <div className="text-center py-12" style={{ backgroundColor: '#2a2a2a', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <Archive className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium" style={{ color: '#ebebeb' }}>No containers found</h3>
              <p className="mt-1 text-sm" style={{ color: '#b3b3b3' }}>
                {totalContainers === 0
                  ? "No containers added."
                  : "Try adjusting your search criteria."
                }
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#2a2a2a', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #404040' }} className="overflow-hidden sm:rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#333333', borderBottom: '1px solid #404040' }}>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" style={{ color: '#b3b3b3' }}
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          Container ID
                          {getSortIcon('id')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" style={{ color: '#b3b3b3' }}
                        onClick={() => handleSort('supplier')}
                      >
                        <div className="flex items-center">
                          Supplier
                          {getSortIcon('supplier')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" style={{ color: '#b3b3b3' }}
                        onClick={() => handleSort('purchaseDate')}
                      >
                        <div className="flex items-center">
                          Purchase Date
                          {getSortIcon('purchaseDate')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b3b3b3' }}>
                        Products
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" style={{ color: '#b3b3b3' }}
                        onClick={() => handleSort('totalCost')}
                      >
                        <div className="flex items-center">
                          Total Cost
                          {getSortIcon('totalCost')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#b3b3b3' }}>
                        Total Value
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContainers.map((container) => {
                      const stats = getContainerStats(container);
                      return (
                        <tr key={container.id} style={{ borderTop: '1px solid #404040' }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium" style={{ color: '#ebebeb' }}>
                                {container.id}
                              </div>
                              {container.invoiceNumber && (
                                <div className="text-sm" style={{ color: '#b3b3b3' }}>
                                  Invoice: {container.invoiceNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#ebebeb' }}>
                            {container.supplier}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#ebebeb' }}>
                            {formatDate(container.purchaseDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm" style={{ color: '#ebebeb' }}>
                              {stats.productCount} {stats.productCount === 1 ? 'product' : 'products'}
                            </div>
                            <div className="text-sm" style={{ color: '#b3b3b3' }}>
                              {stats.totalStock} bags ({stats.totalKg}kg)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#ebebeb' }}>
                            {formatCurrency(container.totalCost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#ebebeb' }}>
                            {formatCurrency(stats.totalValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewContainer(container)}
                                style={{
                                  color: '#22c55e',
                                  padding: '4px',
                                  borderRadius: '6px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                                  e.target.style.color = '#16a34a';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#22c55e';
                                }}
                                title="View details"
                              >
                                <Eye style={{ height: '16px', width: '16px' }} />
                              </button>
                              <button
                                onClick={() => handleEditContainer(container)}
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
                                title="Edit container"
                              >
                                <Pencil style={{ height: '16px', width: '16px' }} />
                              </button>
                              <button
                                onClick={() => handleDeleteContainer(container.id)}
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
                                title="Delete container"
                              >
                                <Trash2 style={{ height: '16px', width: '16px' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Container Form Modal */}
      {isFormOpen && (
        <ContainerForm
          container={editingContainer}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Container Details Modal */}
      {selectedContainer && (
        <ContainerDetails
          container={selectedContainer}
          onClose={() => setSelectedContainer(null)}
          onEdit={() => {
            setSelectedContainer(null);
            handleEditContainer(selectedContainer);
          }}
        />
      )}
    </div>
  );
}