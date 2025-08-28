import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import Modal from '../../UI/Modal';

export default function CashInjectionForm({ injection, onClose }) {
  const { partners, addCashInjection, updateCashInjection } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  
  const [formData, setFormData] = useState({
    type: injection?.type || 'Capital Contribution',
    amount: injection?.amount?.toString() || '',
    date: injection?.date || new Date().toISOString().split('T')[0],
    source: injection?.source || '',
    description: injection?.description || '',
    reference: injection?.reference || '',
    partnerId: injection?.partnerId || '',
    notes: injection?.notes || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cash injection types
  const injectionTypes = [
    { value: 'Capital Contribution', label: 'Capital Contribution', requiresPartner: true },
    { value: 'Loan', label: 'Loan/Financing', requiresPartner: false },
    { value: 'Other Income', label: 'Other Income', requiresPartner: false },
    { value: 'Opening Balance', label: 'Opening Balance Adjustment', requiresPartner: false }
  ];
  
  const selectedType = injectionTypes.find(t => t.value === formData.type);
  
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
    
    // Clear partner selection if type doesn't require it
    if (name === 'type') {
      const newType = injectionTypes.find(t => t.value === value);
      if (!newType?.requiresPartner) {
        setFormData(prev => ({
          ...prev,
          partnerId: ''
        }));
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.type) {
      newErrors.type = 'Please select an injection type';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }
    
    if (selectedType?.requiresPartner && !formData.partnerId) {
      newErrors.partnerId = 'Please select a partner for capital contribution';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      const injectionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        source: formData.source.trim(),
        description: formData.description.trim(),
        reference: formData.reference.trim(),
        partnerId: formData.partnerId || null,
        notes: formData.notes.trim()
      };
      
      if (injection) {
        await updateCashInjection(injection.id, injectionData);
        showSuccessMessage('Cash Injection Updated', 'Cash injection has been updated successfully');
      } else {
        await addCashInjection(injectionData);
        showSuccessMessage('Cash Injection Added', 'New cash injection has been recorded successfully');
      }
      
      onClose();
    } catch (error) {
      console.error('Cash injection submission error:', error);
      showErrorMessage('Submission Failed', error.message || 'Failed to record cash injection');
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
              {injection ? 'Edit Cash Injection' : 'Add Cash Injection'}
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
            {/* Type and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Injection Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.type ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  {injectionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
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
            
            {/* Partner Selection (for Capital Contributions) */}
            {selectedType?.requiresPartner && (
              <div>
                <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700 mb-1">
                  Partner *
                </label>
                <select
                  id="partnerId"
                  name="partnerId"
                  value={formData.partnerId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.partnerId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select a partner</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} ({partner.ownershipPercent}%)
                    </option>
                  ))}
                </select>
                {errors.partnerId && <p className="mt-1 text-sm text-red-600">{errors.partnerId}</p>}
              </div>
            )}
            
            {/* Source and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                  Source *
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.source ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder={selectedType?.value === 'Loan' ? 'Bank/Lender name' : 'Source of funds'}
                />
                {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source}</p>}
              </div>
              
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
                placeholder="Brief description of the cash injection..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            
            {/* Reference Number */}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Transaction ID, check number, etc."
              />
              <p className="mt-1 text-xs text-gray-500">Optional reference for tracking</p>
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
                placeholder={
                  selectedType?.value === 'Loan' 
                    ? 'Loan terms, interest rate, repayment schedule...'
                    : 'Additional details about this cash injection...'
                }
              />
            </div>
            
            {/* Injection Preview */}
            {formData.amount && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-2">Cash Injection Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Type:</span>
                    <span className="font-semibold text-green-900">{formData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Amount:</span>
                    <span className="font-semibold text-green-900">{formatCurrency(formData.amount)}</span>
                  </div>
                  {selectedType?.requiresPartner && formData.partnerId && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Partner:</span>
                      <span className="font-semibold text-green-900">
                        {partners.find(p => p.id === formData.partnerId)?.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-green-700">Date:</span>
                    <span className="font-semibold text-green-900">
                      {new Date(formData.date).toLocaleDateString()}
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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : (injection ? 'Update Injection' : 'Add Cash Injection')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}