import { useState, useEffect } from 'react';
import { Archive, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import ContainerForm from './ContainerForm';
import ContainerDetails from './ContainerDetails';

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
    }
    // If no error occurs (handled by useEffect), show success message
    // Note: This will show immediately, but if there's an error, the error effect will override it
    showSuccessMessage('Container Deleted', `Container ${containerName} has been deleted and stock has been reverted.`);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900">Container Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Track and manage your import containers and their contents
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <button
                onClick={handleAddContainer}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Container
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{totalContainers}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Containers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {totalContainers} containers
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Investment
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(totalValue)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{totalProducts}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Products
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {totalProducts} items
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">Avg</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg Container Value
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(avgContainerValue)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 max-w-lg">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Containers
                  </label>
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, supplier, or invoice number..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Showing {filteredContainers.length} of {totalContainers} containers
                  </span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Containers List */}
          {filteredContainers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Archive className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No containers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {totalContainers === 0 
                  ? "Get started by adding your first container."
                  : "Try adjusting your search criteria."
                }
              </p>
              {totalContainers === 0 && (
                <div className="mt-6">
                  <button
                    onClick={handleAddContainer}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Container
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          Container ID
                          {getSortIcon('id')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('supplier')}
                      >
                        <div className="flex items-center">
                          Supplier
                          {getSortIcon('supplier')}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('purchaseDate')}
                      >
                        <div className="flex items-center">
                          Purchase Date
                          {getSortIcon('purchaseDate')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('totalCost')}
                      >
                        <div className="flex items-center">
                          Total Cost
                          {getSortIcon('totalCost')}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Value
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContainers.map((container) => {
                      const stats = getContainerStats(container);
                      return (
                        <tr key={container.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {container.id}
                              </div>
                              {container.invoiceNumber && (
                                <div className="text-sm text-gray-500">
                                  Invoice: {container.invoiceNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {container.supplier}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(container.purchaseDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {stats.productCount} {stats.productCount === 1 ? 'product' : 'products'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {stats.totalStock} bags ({stats.totalKg}kg)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(container.totalCost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(stats.totalValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewContainer(container)}
                                className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditContainer(container)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                                title="Edit container"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteContainer(container.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                                title="Delete container"
                              >
                                <Trash2 className="h-4 w-4" />
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