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
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900">Products & Inventory</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your product catalog and track inventory levels
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Filter Products</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>

              {/* Filters Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {/* Search - full width on mobile, spans 2 columns on desktop */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                    <div className="relative">
                      <svg className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="col-span-1">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border ${
                          viewMode === 'list'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        List
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                          viewMode === 'grid'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
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
                    <label className="flex items-center px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLowStock}
                        onChange={(e) => setShowLowStock(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-gray-700">Low Stock Only</span>
                    </label>
                  </div>

                  {/* Clear All Filters */}
                  {(searchQuery || selectedCategory || showLowStock) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 underline sm:ml-auto"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Showing {filteredProducts.length} of {totalProducts} products
                  </span>
                  {filteredProducts.length > 0 && (
                    <span className="text-sm text-gray-500">
                      Total Value: ${totalValue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
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