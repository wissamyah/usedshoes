import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import ProductCard from './ProductCard';
import ProductMovementModal from './ProductMovementModal';
import DestroyProductModal from './DestroyProductModal';

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
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Value
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${totalValue.toLocaleString()}
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      lowStockCount > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}>
                      <span className="text-white font-semibold text-sm">{lowStockCount}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Low Stock
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {lowStockCount} items
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      outOfStockCount > 0 ? 'bg-red-500' : 'bg-gray-300'
                    }`}>
                      <span className="text-white font-semibold text-sm">{outOfStockCount}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Out of Stock
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {outOfStockCount} items
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Products
                  </label>
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-end space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showLowStock}
                      onChange={(e) => setShowLowStock(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Low Stock Only</span>
                  </label>
                </div>
              </div>

              {/* View Controls */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Showing {filteredProducts.length} of {totalProducts} products
                  </span>
                  {(searchQuery || selectedCategory || showLowStock) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">View:</span>
                  <div className="flex rounded-md shadow-sm">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1 text-sm font-medium rounded-l-md border ${
                        viewMode === 'list'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 text-sm font-medium rounded-r-md border-l-0 border ${
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