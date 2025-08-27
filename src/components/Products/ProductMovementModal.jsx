import { useMemo } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import Modal from '../UI/Modal';

export default function ProductMovementModal({ product, onClose }) {
  const { containers, sales } = useData();

  // Calculate product movements
  const movements = useMemo(() => {
    if (!product) return [];

    const movementList = [];

    // Add container purchases (IN)
    containers.forEach(container => {
      if (container.products) {
        const containerProduct = container.products.find(p => 
          p.productId == product.id || 
          p.productId === parseInt(product.id) || 
          p.productId === product.id.toString()
        );
        
        if (containerProduct) {
          movementList.push({
            date: container.purchaseDate || container.createdAt,
            type: 'IN',
            description: `Container Purchase - ${container.id}`,
            supplier: container.supplier,
            quantity: containerProduct.bagQuantity,
            costPerKg: containerProduct.costPerKg,
            bagWeight: containerProduct.bagWeight || 25,
            reference: container.id
          });
        }
      }
    });

    // Add sales (OUT) - when sales are implemented
    sales.forEach(sale => {
      if (sale.productId == product.id || 
          sale.productId === parseInt(product.id) || 
          sale.productId === product.id.toString()) {
        movementList.push({
          date: sale.saleDate || sale.createdAt,
          type: 'OUT',
          description: 'Product Sale',
          supplier: sale.customerName || 'Customer',
          quantity: -sale.quantity, // negative for outgoing
          costPerKg: sale.pricePerUnit || sale.pricePerKg,
          bagWeight: product.bagWeight || 25,
          reference: sale.id
        });
      }
    });

    // Sort by date (newest first)
    return movementList.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [product, containers, sales]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const runningBalance = useMemo(() => {
    let balance = 0;
    return movements.map(movement => {
      balance += movement.quantity;
      return { ...movement, balance };
    }).reverse(); // Show oldest first for running balance calculation
  }, [movements]);

  return (
    <Modal isOpen={true} onClose={onClose} size="xlarge">
      <div className="bg-white rounded-lg shadow-xl p-5 max-h-[80vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-medium text-gray-900">
                Product Movement History
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {product.name} - Current Stock: {product.currentStock} bags
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Total Purchased</p>
                  <p className="text-2xl font-semibold text-green-900">
                    {runningBalance.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0)} bags
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-600">Total Sold</p>
                  <p className="text-2xl font-semibold text-red-900">
                    {Math.abs(runningBalance.filter(m => m.quantity < 0).reduce((sum, m) => sum + m.quantity, 0))} bags
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Movements</p>
                  <p className="text-2xl font-semibold text-blue-900">
                    {movements.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Movements Table */}
          {movements.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost/Kg
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {movements.map((movement, index) => (
                      <tr key={index} className={`hover:bg-gray-50 ${movement.type === 'OUT' ? 'bg-red-50' : 'bg-green-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(movement.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            movement.type === 'IN' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {movement.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{movement.description}</div>
                          <div className="text-sm text-gray-500">{movement.supplier}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {movement.type === 'IN' ? '+' : ''}{movement.quantity} bags
                          </div>
                          <div className="text-xs text-gray-500">
                            ({Math.abs(movement.quantity) * movement.bagWeight}kg)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(movement.costPerKg)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(Math.abs(movement.quantity) * movement.bagWeight * movement.costPerKg)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {movement.reference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l7-7 7 7M9 20h6" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No movements found</h3>
              <p className="mt-1 text-sm text-gray-500">
                This product has no purchase or sales history yet.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}