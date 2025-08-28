import { Package, BarChart3, Pencil, Trash2, PackageX, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ProductList({ products, containers, onEdit, onDelete, onViewMovement, onDestroy }) {
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


  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock (bags)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost/kg
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Selling Price
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
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-500">
                            {product.description.length > 50 
                              ? `${product.description.substring(0, 50)}...` 
                              : product.description
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {product.currentStock} bags
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(product.currentStock)}`}>
                        {getStockStatusText(product.currentStock)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(product.costPerKg || product.costPerUnit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.avgSellingPrice ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.avgSellingPrice)}
                        </span>
                        {product.avgSellingPrice > (product.costPerKg || product.costPerUnit || 0) ? (
                          <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500 ml-1 transform rotate-180" />
                        )}
                        {product.totalSold > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({product.totalSold} sold)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">No sales yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(product.currentStock * (product.bagWeight || 25) * (product.costPerKg || product.costPerUnit || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewMovement(product)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                        title="View product movement"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {product.currentStock > 0 && (
                        <button
                          onClick={() => onDestroy(product)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded-md hover:bg-orange-50"
                          title="Destroy/damage product"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title="Delete product"
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

        {products.length === 0 && (
          <div className="text-center py-12">
            <PackageX className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">
              No products match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}