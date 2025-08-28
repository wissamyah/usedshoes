import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import Modal from '../../UI/Modal';

export default function PartnerForm({ partner, onClose }) {
  const { partners, addPartner, updatePartner } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  
  const [formData, setFormData] = useState({
    name: partner?.name || '',
    email: partner?.email || '',
    phoneNumber: partner?.phoneNumber || '',
    ownershipPercent: partner?.ownershipPercent?.toString() || '',
    initialInvestment: partner?.capitalAccount?.initialInvestment?.toString() || '0',
    bankDetails: {
      accountName: partner?.bankDetails?.accountName || '',
      accountNumber: partner?.bankDetails?.accountNumber || '',
      bankName: partner?.bankDetails?.bankName || ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bank_')) {
      const bankField = name.replace('bank_', '');
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bankField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Partner name is required';
    }
    
    if (!formData.ownershipPercent) {
      newErrors.ownershipPercent = 'Ownership percentage is required';
    } else {
      const percent = parseFloat(formData.ownershipPercent);
      if (percent <= 0 || percent > 100) {
        newErrors.ownershipPercent = 'Must be between 0 and 100';
      }
      
      // Check total ownership doesn't exceed 100%
      const otherPartnersOwnership = partners
        .filter(p => p.id !== partner?.id)
        .reduce((sum, p) => sum + (p.ownershipPercent || 0), 0);
      
      if (otherPartnersOwnership + percent > 100) {
        newErrors.ownershipPercent = `Total ownership would exceed 100% (current: ${otherPartnersOwnership}%)`;
      }
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.initialInvestment && parseFloat(formData.initialInvestment) < 0) {
      newErrors.initialInvestment = 'Investment cannot be negative';
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
      const partnerData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        ownershipPercent: parseFloat(formData.ownershipPercent),
        initialInvestment: parseFloat(formData.initialInvestment || 0),
        bankDetails: {
          accountName: formData.bankDetails.accountName.trim(),
          accountNumber: formData.bankDetails.accountNumber.trim(),
          bankName: formData.bankDetails.bankName.trim()
        }
      };
      
      if (partner) {
        await updatePartner(partner.id, partnerData);
        showSuccessMessage('Partner Updated', `${partnerData.name}'s information has been updated`);
      } else {
        await addPartner(partnerData);
        showSuccessMessage('Partner Added', `${partnerData.name} has been added successfully`);
      }
      
      onClose();
    } catch (error) {
      console.error('Partner form submission error:', error);
      showErrorMessage('Operation Failed', error.message || 'Failed to save partner');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal isOpen={true} onClose={onClose} size="medium">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {partner ? 'Edit Partner' : 'Add New Partner'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Partner name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              {/* Ownership */}
              <div>
                <label htmlFor="ownershipPercent" className="block text-sm font-medium text-gray-700 mb-1">
                  Ownership (%) *
                </label>
                <input
                  type="number"
                  id="ownershipPercent"
                  name="ownershipPercent"
                  value={formData.ownershipPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.ownershipPercent ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="50"
                />
                {errors.ownershipPercent && <p className="mt-1 text-sm text-red-600">{errors.ownershipPercent}</p>}
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Email address"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>
          
          {/* Financial Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Financial Information</h4>
            <div className="grid grid-cols-1 gap-4">
              {/* Initial Investment */}
              <div>
                <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Investment ($)
                </label>
                <input
                  type="number"
                  id="initialInvestment"
                  name="initialInvestment"
                  value={formData.initialInvestment}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.initialInvestment ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Initial investment"
                />
                {errors.initialInvestment && <p className="mt-1 text-sm text-red-600">{errors.initialInvestment}</p>}
              </div>
            </div>
          </div>
          
          {/* Bank Details */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Bank Details (Optional)</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Name */}
                <div>
                  <label htmlFor="bank_accountName" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="bank_accountName"
                    name="bank_accountName"
                    value={formData.bankDetails.accountName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Partner name"
                  />
                </div>
                
                {/* Bank Name */}
                <div>
                  <label htmlFor="bank_bankName" className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bank_bankName"
                    name="bank_bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Bank name"
                  />
                </div>
              </div>
              
              {/* Account Number */}
              <div>
                <label htmlFor="bank_accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  id="bank_accountNumber"
                  name="bank_accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Account number"
                />
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (partner ? 'Update Partner' : 'Add Partner')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}