import { useState } from 'react';
import { Plus, Package, DollarSign, AlertTriangle, Archive } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import ProductCard from './ProductCard';
import ProductMovementModal from './ProductMovementModal';
import DestroyProductModal from './DestroyProductModal';
import StatCard from '../UI/StatCard';

export default function ProductsPage() {
  const { products, containers, addProduct, updateProduct, deleteProduct } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingMovement, setViewingMovement] = useState(null);
  const [destroyingProduct, setDestroyingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  
  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesStock = !showLowStock || product.currentStock <= 5;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate summary stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => {
    const costPerKg = p.costPerKg || p.costPerUnit || 0;
    const bagWeight = p.bagWeight || 25;
    const totalKg = p.currentStock * bagWeight;
    return sum + (totalKg * costPerKg);
  }, 0);
  const lowStockCount = products.filter(p => p.currentStock <= 5).length;
  const totalBagsAvailable = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const { showConfirmDialog } = useUI();

  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    const confirmed = await showConfirmDialog(
      'Delete Product',
      `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`,
      'danger'
    );
    
    if (confirmed) {
      await deleteProduct(productId);
    }
  };

  const handleViewMovement = (product) => {
    setViewingMovement(product);
  };
  
  const handleDestroyProduct = (product) => {
    setDestroyingProduct(product);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await addProduct(formData);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      // Error is handled by useData hook
      console.error('Form submission error:', error);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setShowLowStock(false);
  };

  return (
    <div className="min-h-screen">
      <div className="py-6">
        <div className="sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ebebeb'
              }}>Products & Inventory</h2>
              <p style={{
                fontSize: '14px',
                color: '#b3b3b3',
                marginTop: '4px'
              }}>
                Manage your product catalog and track inventory levels
              </p>
            </div>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2 border border-transparent rounded-lg sm:rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 touch-manipulation"
            >
              <Plus className="h-6 w-6 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Products"
              value={`${totalProducts}`}
              subtitle="Active items in catalog"
              icon={Archive}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />

            <StatCard
              title="Total Value"
              value={`$${totalValue.toLocaleString()}`}
              subtitle="Inventory worth"
              icon={DollarSign}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />

            <StatCard
              title="Low Stock"
              value={`${lowStockCount}`}
              subtitle={lowStockCount > 0 ? "Items need restocking" : "All items stocked"}
              icon={AlertTriangle}
              iconBgColor={lowStockCount > 0 ? "bg-yellow-100" : "bg-gray-100"}
              iconColor={lowStockCount > 0 ? "text-yellow-600" : "text-gray-600"}
            />

            <StatCard
              title="Bags Available"
              value={`${totalBagsAvailable}`}
              subtitle="Total bags in stock"
              icon={Package}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>

          {/* Filters and Search */}
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #404040' }} className="mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb' }}>Filter Products</h3>
                  <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '4px' }}>
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>

              {/* Filters Section */}
              <div style={{ backgroundColor: '#333333', borderRadius: '8px' }} className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
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
                        placeholder="Search by name or description..."
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

                  {/* Category Filter */}
                  <div className="col-span-1">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
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
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="col-span-1 flex gap-2">
                    <div className="flex rounded-md shadow-sm flex-1">
                      <button
                        onClick={() => setViewMode('list')}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          fontSize: '14px',
                          fontWeight: '500',
                          borderTopLeftRadius: '6px',
                          borderBottomLeftRadius: '6px',
                          border: '1px solid #404040',
                          backgroundColor: viewMode === 'list' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          color: viewMode === 'list' ? '#60a5fa' : '#b3b3b3',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (viewMode !== 'list') {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (viewMode !== 'list') {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        List
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          fontSize: '14px',
                          fontWeight: '500',
                          borderTopRightRadius: '6px',
                          borderBottomRightRadius: '6px',
                          borderLeft: '0',
                          border: '1px solid #404040',
                          backgroundColor: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          color: viewMode === 'grid' ? '#60a5fa' : '#b3b3b3',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (viewMode !== 'grid') {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (viewMode !== 'grid') {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        Grid
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Filters and Actions */}
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Quick Filter Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        fontSize: '14px',
                        backgroundColor: showLowStock ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: showLowStock ? '#60a5fa' : '#b3b3b3',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!showLowStock) {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!showLowStock) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={showLowStock}
                        onChange={(e) => setShowLowStock(e.target.checked)}
                        style={{
                          marginRight: '8px',
                          accentColor: '#60a5fa'
                        }}
                      />
                      <span>Low Stock Only</span>
                    </label>
                  </div>

                  {/* Clear All Filters */}
                  {(searchQuery || selectedCategory || showLowStock) && (
                    <button
                      onClick={clearFilters}
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
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Results Summary */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #404040' }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '14px', color: '#b3b3b3' }}>
                    Showing {filteredProducts.length} of {totalProducts} products
                  </span>
                  {filteredProducts.length > 0 && (
                    <span style={{ fontSize: '14px', color: '#808080' }}>
                      Total Value: ${totalValue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12" style={{ backgroundColor: '#2a2a2a', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium" style={{ color: '#ebebeb' }}>No products found</h3>
              <p className="mt-1 text-sm" style={{ color: '#b3b3b3' }}>
                {totalProducts === 0
                  ? "No products added."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <ProductList
                  products={filteredProducts}
                  containers={containers}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onViewMovement={handleViewMovement}
                  onDestroy={handleDestroyProduct}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      onViewMovement={handleViewMovement}
                      onDestroy={handleDestroyProduct}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          containers={containers}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Product Movement Modal */}
      {viewingMovement && (
        <ProductMovementModal
          product={viewingMovement}
          onClose={() => setViewingMovement(null)}
        />
      )}
      
      {/* Destroy Product Modal */}
      {destroyingProduct && (
        <DestroyProductModal
          product={destroyingProduct}
          onClose={() => setDestroyingProduct(null)}
        />
      )}
    </div>
  );
}