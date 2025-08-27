import { X, Pencil } from 'lucide-react';
import Modal from '../UI/Modal';

export default function ContainerDetails({ container, onClose, onEdit }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate container totals
  const totalBags = container.products?.reduce((sum, p) => sum + (p.bagQuantity || 0), 0) || 0;
  const totalKg = container.products?.reduce((sum, p) => sum + ((p.bagQuantity || 0) * (p.bagWeight || 25)), 0) || 0;
  const productsCost = container.products?.reduce((sum, p) => sum + ((p.bagQuantity || 0) * (p.costPerKg || 0) * (p.bagWeight || 25)), 0) || 0;
  const shippingCost = parseFloat(container.shippingCost) || 0;
  const totalCost = productsCost + shippingCost;

  return (
    <Modal isOpen={true} onClose={onClose} size="large">
      <div className="bg-white rounded-lg shadow-xl p-5 max-h-[80vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-gray-900">
              Container Details: {container.id}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                title="Edit container"
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Container Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Supplier</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">{container.supplier}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Purchase Date</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">{formatDate(container.purchaseDate)}</p>
              </div>
              
              {container.invoiceNumber && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Invoice Number</h4>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{container.invoiceNumber}</p>
                </div>
              )}
            </div>

            {container.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-gray-900">{container.description}</p>
              </div>
            )}
          </div>

          {/* Container Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{totalBags}</p>
                <p className="text-sm text-gray-500">Total Bags</p>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{totalKg.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Kg</p>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(productsCost)}</p>
                <p className="text-sm text-gray-500">Products Cost</p>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
                <p className="text-sm text-gray-500">Total Investment</p>
              </div>
            </div>
          </div>

          {/* Products in Container */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Products Purchased</h4>
            
            {container.products && container.products.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {container.products.map((product, index) => {
                    const productTotalKg = (product.bagQuantity || 0) * (product.bagWeight || 25);
                    const productTotalCost = (product.bagQuantity || 0) * (product.costPerKg || 0) * (product.bagWeight || 25);
                    
                    return (
                      <li key={index} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-lg font-medium text-gray-900">{product.productName}</h5>
                              <p className="text-lg font-semibold text-gray-900">{formatCurrency(productTotalCost)}</p>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-500">Quantity:</span>
                                <p className="text-gray-900">{product.bagQuantity} bags</p>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-500">Weight:</span>
                                <p className="text-gray-900">{productTotalKg} kg ({product.bagWeight}kg/bag)</p>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-500">Cost per Kg:</span>
                                <p className="text-gray-900">{formatCurrency(product.costPerKg)}</p>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-500">Cost per Bag:</span>
                                <p className="text-gray-900">{formatCurrency((product.costPerKg || 0) * (product.bagWeight || 25))}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border">
                <p className="text-gray-500">No products found in this container</p>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Products Total:</span>
                <span className="font-medium text-gray-900">{formatCurrency(productsCost)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Cost:</span>
                <span className="font-medium text-gray-900">{formatCurrency(shippingCost)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total Container Cost:</span>
                  <span className="text-gray-900">{formatCurrency(totalCost)}</span>
                </div>
              </div>
            </div>

            {totalKg > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Cost per Kg (including shipping):</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalCost / totalKg)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Container
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}