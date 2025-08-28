import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { formatDate } from '../../utils/dateFormatter';
import Modal from '../UI/Modal';

export default function ExpenseForm({ expense, onClose }) {
  const { addExpense, deleteExpense } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  
  const [formData, setFormData] = useState({
    category: 'Transport',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    containerId: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expense categories based on the roadmap
  const expenseCategories = [
    'Transport',
    'Rent',
    'Staff Salaries',
    'Miscellaneous',
    'Marketing',
    'Utilities',
    'Financial Expenses',
    'Taxes',
    'Discount'
  ];

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category || 'Transport',
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        date: expense.date || new Date().toISOString().split('T')[0],
        containerId: expense.containerId || '',
        notes: expense.notes || ''
      });
    }
  }, [expense]);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
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
      const expenseData = {
        category: formData.category,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        date: formData.date,
        containerId: formData.containerId || null,
        notes: formData.notes.trim()
      };

      if (expense) {
        // For editing, we need to delete the old expense and create a new one
        await deleteExpense(expense.id);
        await addExpense(expenseData);
        showSuccessMessage('Expense Updated', 'Expense has been updated successfully');
      } else {
        await addExpense(expenseData);
        showSuccessMessage('Expense Added', 'New expense has been recorded successfully');
      }

      onClose();
    } catch (error) {
      console.error('Expense submission error:', error);
      showErrorMessage('Expense Failed', error.message || 'Failed to record expense');
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

  return (
    <Modal isOpen={true} onClose={onClose} size="medium">
      <div className="bg-white rounded-lg shadow-xl p-5">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {expense ? 'Edit Expense' : 'Add New Expense'}
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
            {/* Category and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.amount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="0.00"
                />
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Brief description of the expense..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Date and Container ID */}
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="containerId" className="block text-sm font-medium text-gray-700 mb-1">
                  Container ID
                </label>
                <input
                  type="text"
                  id="containerId"
                  name="containerId"
                  value={formData.containerId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional container reference"
                />
                <p className="mt-1 text-xs text-gray-500">Link to specific container (optional)</p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional details, receipts, etc..."
              />
            </div>

            {/* Expense Preview */}
            {formData.amount && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Expense Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Category:</span>
                    <span className="font-semibold text-blue-900">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Amount:</span>
                    <span className="font-semibold text-blue-900">{formatCurrency(formData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Date:</span>
                    <span className="font-semibold text-blue-900">
                      {formatDate(formData.date)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : (expense ? 'Update Expense' : 'Add Expense')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}