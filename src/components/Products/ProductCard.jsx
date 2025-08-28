import { formatDate } from '../../utils/dateFormatter';

export default function ProductCard({ product, onEdit, onDelete, onViewMovement, onDestroy }) {
  const getStockStatusColor = (stock) => {
    if (stock === 0) return 'text-red-600 bg-red-100';
    if (stock <= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStockStatusText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'In Stock';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalValue = product.currentStock * (product.bagWeight || 25) * (product.costPerKg || product.costPerUnit || 0);

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-12 w-12">
              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg className="h-7 w-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">
                ID: {product.id}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewMovement(product)}
              className="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-50"
              title="View product movement"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(product)}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
              title="Edit product"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {product.currentStock > 0 && onDestroy && (
              <button
                onClick={() => onDestroy(product)}
                className="text-orange-600 hover:text-orange-800 p-1 rounded-md hover:bg-orange-50"
                title="Destroy/damage product"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
              title="Delete product"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {product.category}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Stock Status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Stock Level</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-lg font-bold text-gray-900">
                {product.currentStock} bags
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product.currentStock)}`}>
                {getStockStatusText(product.currentStock)}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Cost/kg</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(product.costPerUnit)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Value</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>
        
        {/* Average Selling Price */}
        {product.avgSellingPrice !== undefined && (
          <div className="border-t pt-3 mb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Avg. Selling Price</p>
              {product.avgSellingPrice ? (
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(product.avgSellingPrice)}
                  </p>
                  <span className="text-xs text-gray-500">
                    ({product.totalSold} sold)
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No sales yet</p>
              )}
            </div>
          </div>
        )}

        {/* Creation Date */}
        {product.createdAt && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Added {formatDate(product.createdAt)}
            </p>
          </div>
        )}
      </div>

      {/* Stock Alert Footer */}
      {product.currentStock <= 5 && (
        <div className={`px-6 py-3 ${product.currentStock === 0 ? 'bg-red-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center">
            <svg 
              className={`h-4 w-4 mr-2 ${product.currentStock === 0 ? 'text-red-400' : 'text-yellow-400'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className={`text-sm font-medium ${product.currentStock === 0 ? 'text-red-800' : 'text-yellow-800'}`}>
              {product.currentStock === 0 ? 'Out of stock - reorder needed' : 'Low stock - consider reordering'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}