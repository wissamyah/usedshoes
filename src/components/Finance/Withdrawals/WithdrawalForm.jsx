import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import Modal from '../../UI/Modal';

export default function WithdrawalForm({ availableCash, onClose }) {
  const { partners, addWithdrawal } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  
  const [formData, setFormData] = useState({
    partnerId: '',
    amount: '',
    type: 'personal',
    purpose: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5)
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const withdrawalTypes = [
    { value: 'personal', label: 'Personal Draw' },
    { value: 'business_expense', label: 'Business Expense' },
    { value: 'profit_distribution', label: 'Profit Distribution' },
    { value: 'loan', label: 'Loan' }
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!formData.partnerId) newErrors.partnerId = 'Please select a partner';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > availableCash) {
      newErrors.amount = `Cannot exceed available cash (${availableCash.toFixed(2)})`;
    }
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const partner = partners.find(p => p.id === formData.partnerId);
      await addWithdrawal({
        partnerId: formData.partnerId,
        partnerName: partner?.name || 'Unknown',
        amount: parseFloat(formData.amount),
        type: formData.type,
        purpose: formData.purpose,
        notes: formData.notes,
        date: formData.date,
        time: formData.time
      });
      
      showSuccessMessage('Withdrawal Recorded', 'The withdrawal has been recorded successfully');
      onClose();
    } catch (error) {
      showErrorMessage('Operation Failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal isOpen={true} onClose={onClose} size="medium">
      <div className="bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Record Withdrawal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner *
              </label>
              <select
                value={formData.partnerId}
                onChange={(e) => setFormData({...formData, partnerId: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${errors.partnerId ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Select partner...</option>
                {partners.map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name} ({partner.ownershipPercent}%)
                  </option>
                ))}
              </select>
              {errors.partnerId && <p className="mt-1 text-sm text-red-600">{errors.partnerId}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md ${errors.amount ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
              <p className="mt-1 text-xs text-gray-500">Available: ${availableCash.toFixed(2)}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {withdrawalTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose *
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className={`w-full px-3 py-2 border rounded-md ${errors.purpose ? 'border-red-300' : 'border-gray-300'}`}
            />
            {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}