import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import Modal from '../UI/Modal';

export default function DestroyProductModal({ product, onClose }) {
  const { destroyProduct } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  
  const [formData, setFormData] = useState({
    quantity: '1',
    reason: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const reasons = [
    'Damaged during transportation',
    'Water damage',
    'Mold/contamination',
    'Quality issues',
    'Expired/deteriorated',
    'Packaging destroyed',
    'Other'
  ];
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be at least 1';
    } else if (parseInt(formData.quantity) > product.currentStock) {
      newErrors.quantity = `Cannot destroy more than available stock (${product.currentStock})`;
    }
    
    if (!formData.reason) {
      newErrors.reason = 'Please select a reason';
    }
    
    if (formData.reason === 'Other' && !formData.notes.trim()) {
      newErrors.notes = 'Please provide details for "Other" reason';
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
      const destroyData = {
        productId: product.id,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        notes: formData.notes.trim(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5)
      };
      
      await destroyProduct(destroyData);
      
      showSuccessMessage(
        'Product Destroyed',
        `${formData.quantity} ${formData.quantity === '1' ? 'bag' : 'bags'} of ${product.name} marked as destroyed`
      );
      
      onClose();
    } catch (error) {
      console.error('Destroy product error:', error);
      showErrorMessage('Operation Failed', error.message || 'Failed to record destroyed product');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  const lossValue = parseInt(formData.quantity || 0) * (product.costPerKg || product.costPerUnit || 0) * (product.bagWeight || 25);
  
  return (
    <Modal isOpen={true} onClose={onClose} size="medium">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Destroy/Damage Product
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Record damaged or destroyed inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-medium text-gray-900">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Stock</p>
                <p className="font-medium text-gray-900">{product.currentStock} bags</p>
              </div>
            </div>
          </div>
          
          {/* Quantity to Destroy */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Destroy (bags) *
            </label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              min="1"
              max={product.currentStock}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.quantity ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
              }`}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Remaining stock after destruction: {product.currentStock - (parseInt(formData.quantity) || 0)} bags
            </p>
          </div>
          
          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Destruction *
            </label>
            <select
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.reason ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
              }`}
            >
              <option value="">Select a reason...</option>
              {reasons.map(reason => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
          </div>
          
          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Details {formData.reason === 'Other' && '*'}
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.notes ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-red-500'
              }`}
              placeholder="Provide additional details about the damage or destruction..."
            />
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
          </div>
          
          {/* Loss Value */}
          {lossValue > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="text-sm font-medium text-red-900 mb-2">Financial Impact</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-700">Cost per bag:</span>
                  <span className="font-medium text-red-900">
                    {formatCurrency((product.costPerKg || product.costPerUnit || 0) * (product.bagWeight || 25))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Total Loss Value:</span>
                  <span className="font-semibold text-red-900">
                    {formatCurrency(lossValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Destruction'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}