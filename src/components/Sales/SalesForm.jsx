import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import Modal from '../UI/Modal';

export default function SalesForm({ sale, onClose }) {
  const { products, addSale, deleteSale } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    pricePerUnit: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available products with stock
  const availableProducts = products.filter(product => product.currentStock > 0);

  useEffect(() => {
    if (sale) {
      setFormData({
        productId: sale.productId || '',
        quantity: sale.quantity?.toString() || '',
        pricePerUnit: sale.pricePerUnit?.toString() || '',
        date: sale.date || new Date().toISOString().split('T')[0],
        time: sale.time || new Date().toTimeString().split(' ')[0].substring(0, 5),
        notes: sale.notes || ''
      });
    }
  }, [sale]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-fill price when product is selected
    if (name === 'productId' && value) {
      const product = products.find(p => p.id === parseInt(value));
      if (product && product.suggestedPrice) {
        setFormData(prev => ({
          ...prev,
          pricePerUnit: product.suggestedPrice.toString()
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else {
      const quantity = parseInt(formData.quantity);
      if (quantity <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0';
      } else {
        // Check stock availability
        const product = products.find(p => p.id === parseInt(formData.productId));
        if (product && quantity > product.currentStock) {
          newErrors.quantity = `Only ${product.currentStock} units available in stock`;
        }
      }
    }

    if (!formData.pricePerUnit) {
      newErrors.pricePerUnit = 'Price per unit is required';
    } else if (parseFloat(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'Price must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const saleData = {
        productId: parseInt(formData.productId),
        quantity: parseInt(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        date: formData.date,
        time: formData.time,
        notes: formData.notes.trim()
      };

      if (sale) {
        // For editing, we need to delete the old sale and create a new one
        // This will properly handle stock adjustments
        await deleteSale(sale.id);
        await addSale(saleData);
        showSuccessMessage('Sale Updated', 'Sale has been updated successfully');
      } else {
        await addSale(saleData);
        showSuccessMessage('Sale Recorded', 'New sale has been recorded successfully');
      }

      onClose();
    } catch (error) {
      console.error('Sale submission error:', error);
      showErrorMessage('Sale Failed', error.message || 'Failed to record sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
  const totalAmount = formData.quantity && formData.pricePerUnit 
    ? parseInt(formData.quantity) * parseFloat(formData.pricePerUnit)
    : 0;

  // Calculate estimated profit: totalAmount - (quantity × costPerKg × bagWeight)
  const estimatedProfit = selectedProduct && totalAmount
    ? totalAmount - (parseInt(formData.quantity) * (selectedProduct.costPerKg || selectedProduct.costPerUnit || 0) * (selectedProduct.bagWeight || 25))
    : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="medium">
      <div className="bg-white rounded-lg shadow-xl p-5">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {sale ? 'Edit Sale' : 'Record New Sale'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection */}
            <div>
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.productId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                }`}
              >
                <option value="">Select a product...</option>
                {availableProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.category}) - Stock: {product.currentStock}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="mt-1 text-sm text-red-600">{errors.productId}</p>}
              {availableProducts.length === 0 && (
                <p className="mt-1 text-sm text-orange-600">No products with stock available. Add inventory first.</p>
              )}
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.quantity ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                  placeholder="0"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
                {selectedProduct && (
                  <p className="mt-1 text-xs text-gray-500">Available: {selectedProduct.currentStock} units</p>
                )}
              </div>

              <div>
                <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Unit ($) *
                </label>
                <input
                  type="number"
                  id="pricePerUnit"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.pricePerUnit ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                  placeholder="0.00"
                />
                {errors.pricePerUnit && <p className="mt-1 text-sm text-red-600">{errors.pricePerUnit}</p>}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.time ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                  }`}
                />
                {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Additional notes about this sale..."
              />
            </div>

            {/* Sale Summary */}
            {totalAmount > 0 && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-2">Sale Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Total Amount:</span>
                    <span className="font-semibold text-green-900">{formatCurrency(totalAmount)}</span>
                  </div>
                  {selectedProduct && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-green-600">
                        <span>Cost per bag: {formatCurrency((selectedProduct.costPerKg || selectedProduct.costPerUnit || 0) * (selectedProduct.bagWeight || 25))}</span>
                        <span>({selectedProduct.bagWeight || 25}kg × {formatCurrency(selectedProduct.costPerKg || selectedProduct.costPerUnit || 0)}/kg)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Total Cost:</span>
                        <span className="font-semibold text-green-900">
                          {formatCurrency((parseInt(formData.quantity) || 0) * (selectedProduct.costPerKg || selectedProduct.costPerUnit || 0) * (selectedProduct.bagWeight || 25))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Estimated Profit:</span>
                        <span className={`font-semibold ${estimatedProfit > 0 ? 'text-green-900' : 'text-red-600'}`}>
                          {formatCurrency(estimatedProfit)}
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedProduct && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Remaining Stock:</span>
                      <span className="font-semibold text-green-900">
                        {selectedProduct.currentStock - (parseInt(formData.quantity) || 0)} units
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || availableProducts.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : (sale ? 'Update Sale' : 'Record Sale')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}