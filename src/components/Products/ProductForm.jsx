import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { validateProductForm } from '../../utils/validation';
import Modal from '../UI/Modal';

export default function ProductForm({ product, containers, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Shoes', // Default to Shoes
    currentStock: '',
    costPerKg: '',
    bagWeight: '25', // Default to 25kg bags
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Business categories for bulk used items
  const businessCategories = [
    'Shoes',
    'Belts', 
    'Bags'
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'Shoes',
        currentStock: product.currentStock?.toString() || '',
        costPerKg: product.costPerKg?.toString() || product.costPerUnit?.toString() || '',
        bagWeight: product.bagWeight?.toString() || '25',
        description: product.description || ''
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateProductForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert string values to appropriate types
      const submitData = {
        ...formData,
        currentStock: parseFloat(formData.currentStock) || 0,
        costPerKg: parseFloat(formData.costPerKg) || 0,
        bagWeight: parseFloat(formData.bagWeight) || 25,
        // Keep costPerUnit for backward compatibility, but use costPerKg
        costPerUnit: parseFloat(formData.costPerKg) || 0
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal isOpen={true} onClose={onCancel} size="large">
      <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 py-6">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-3 px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="e.g., Nike Air Max 90"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  {businessCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              {/* Current Stock */}
              <div>
                <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700">
                  Current Stock (bags) *
                </label>
                <input
                  type="number"
                  id="currentStock"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentStock ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="0"
                />
                {errors.currentStock && <p className="mt-1 text-sm text-red-600">{errors.currentStock}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  Number of bags in stock
                </p>
              </div>

              {/* Cost Per Kg */}
              <div>
                <label htmlFor="costPerKg" className="block text-sm font-medium text-gray-700">
                  Cost Per Kg ($) *
                </label>
                <input
                  type="number"
                  id="costPerKg"
                  name="costPerKg"
                  value={formData.costPerKg}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.costPerKg ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="0.00"
                />
                {errors.costPerKg && <p className="mt-1 text-sm text-red-600">{errors.costPerKg}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  Purchase cost per kilogram
                </p>
              </div>

              {/* Bag Weight */}
              <div>
                <label htmlFor="bagWeight" className="block text-sm font-medium text-gray-700">
                  Bag Weight (kg) *
                </label>
                <select
                  id="bagWeight"
                  name="bagWeight"
                  value={formData.bagWeight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="20">20 kg per bag</option>
                  <option value="25">25 kg per bag</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Standard weight per bag for this product type
                </p>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional details about the product..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Product setup guide:</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Create product types first (Shoes, Belts, Bags)</li>
                    <li>Set cost per kg - this is your purchase cost from suppliers</li>
                    <li>Choose bag weight (20kg or 25kg standard sizes)</li>
                    <li>Stock is tracked in number of bags, not kilograms</li>
                    <li>When importing containers, allocate bags to these product types</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}