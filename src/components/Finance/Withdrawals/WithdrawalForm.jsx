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
      // Convert partnerId to number to match partner ID type
      const partnerIdNumber = parseInt(formData.partnerId);
      const partner = partners.find(p => p.id === partnerIdNumber);

      console.log(`💰 Creating withdrawal for partner ${partnerIdNumber} (${partner?.name})`);

      await addWithdrawal({
        partnerId: partnerIdNumber,
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
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #404040'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ebebeb'
          }}>Record Withdrawal</h3>
          <button
            onClick={onClose}
            style={{
              color: '#b3b3b3',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#ebebeb';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#b3b3b3';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ebebeb',
                marginBottom: '8px'
              }}>
                Partner *
              </label>
              <select
                value={formData.partnerId}
                onChange={(e) => setFormData({...formData, partnerId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  backgroundColor: '#1c1c1c',
                  color: '#ebebeb',
                  border: errors.partnerId ? '1px solid #ef4444' : '1px solid #404040',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = errors.partnerId ? '#ef4444' : '#60a5fa';
                  e.target.style.boxShadow = errors.partnerId ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.partnerId ? '#ef4444' : '#404040';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Select partner...</option>
                {partners.map(partner => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name} ({partner.ownershipPercent}%)
                  </option>
                ))}
              </select>
              {errors.partnerId && <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: '#ef4444'
              }}>{errors.partnerId}</p>}
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ebebeb',
                marginBottom: '8px'
              }}>
                Amount ($) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                step="0.01"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  backgroundColor: '#1c1c1c',
                  color: '#ebebeb',
                  border: errors.amount ? '1px solid #ef4444' : '1px solid #404040',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = errors.amount ? '#ef4444' : '#60a5fa';
                  e.target.style.boxShadow = errors.amount ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.amount ? '#ef4444' : '#404040';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.amount && <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: '#ef4444'
              }}>{errors.amount}</p>}
              <p style={{
                marginTop: '4px',
                fontSize: '12px',
                color: '#22c55e'
              }}>Available: ${availableCash.toFixed(2)}</p>
            </div>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '8px'
            }}>
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                backgroundColor: '#1c1c1c',
                color: '#ebebeb',
                border: '1px solid #404040',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#60a5fa';
                e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#404040';
                e.target.style.boxShadow = 'none';
              }}
            >
              {withdrawalTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '8px'
            }}>
              Purpose *
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                backgroundColor: '#1c1c1c',
                color: '#ebebeb',
                border: errors.purpose ? '1px solid #ef4444' : '1px solid #404040',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.purpose ? '#ef4444' : '#60a5fa';
                e.target.style.boxShadow = errors.purpose ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.purpose ? '#ef4444' : '#404040';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.purpose && <p style={{
              marginTop: '4px',
              fontSize: '14px',
              color: '#ef4444'
            }}>{errors.purpose}</p>}
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '8px'
            }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                backgroundColor: '#1c1c1c',
                color: '#ebebeb',
                border: '1px solid #404040',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#60a5fa';
                e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#404040';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #404040',
            marginTop: '8px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#b3b3b3',
                backgroundColor: 'transparent',
                border: '1px solid #404040',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.color = '#ebebeb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#b3b3b3';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                backgroundColor: '#22c55e',
                border: 'none',
                borderRadius: '6px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#16a34a';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#22c55e';
                }
              }}
            >
              {isSubmitting ? 'Recording...' : 'Record Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}