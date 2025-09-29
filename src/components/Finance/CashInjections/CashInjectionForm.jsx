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
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '8px',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ebebeb'
          }}>
            {injection ? 'Edit Cash Injection' : 'Add Cash Injection'}
          </h3>
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
            <span className="sr-only">Close</span>
            <X className="h-6 w-6" />
          </button>
        </div>
          
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Type and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Injection Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    border: errors.type ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.type ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.type ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.type ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {injectionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.type}</p>}
              </div>
              
              <div>
                <label htmlFor="amount" style={{
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
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
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
                  placeholder="0.00"
                />
                {errors.amount && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.amount}</p>}
              </div>
            </div>
            
            {/* Partner Selection (for Capital Contributions) */}
            {selectedType?.requiresPartner && (
              <div>
                <label htmlFor="partnerId" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Partner *
                </label>
                <select
                  id="partnerId"
                  name="partnerId"
                  value={formData.partnerId}
                  onChange={handleInputChange}
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
                  <option value="">Select a partner</option>
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
            )}
            
            {/* Source and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Source *
                </label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    border: errors.source ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.source ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.source ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.source ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Source"
                />
                {errors.source && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.source}</p>}
              </div>
              
              <div>
                <label htmlFor="date" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    border: errors.date ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.date ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.date ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.date ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.date && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.date}</p>}
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ebebeb',
                marginBottom: '8px'
              }}>
                Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  backgroundColor: '#1c1c1c',
                  color: '#ebebeb',
                  border: errors.description ? '1px solid #ef4444' : '1px solid #404040',
                  borderRadius: '6px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = errors.description ? '#ef4444' : '#60a5fa';
                  e.target.style.boxShadow = errors.description ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.description ? '#ef4444' : '#404040';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Description"
              />
              {errors.description && <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: '#ef4444'
              }}>{errors.description}</p>}
            </div>
            
            {/* Reference Number */}
            <div>
              <label htmlFor="reference" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ebebeb',
                marginBottom: '8px'
              }}>
                Reference Number
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
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
                placeholder="Reference number"
              />
              <p style={{
                marginTop: '4px',
                fontSize: '12px',
                color: '#b3b3b3'
              }}>Optional reference for tracking</p>
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ebebeb',
                marginBottom: '8px'
              }}>
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
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
                placeholder="Notes"
              />
            </div>
            
            {/* Injection Preview */}
            {formData.amount && (
              <div style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#22c55e',
                  marginBottom: '12px'
                }}>Cash Injection Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#10b981' }}>Type:</span>
                    <span style={{ fontWeight: '600', color: '#ebebeb' }}>{formData.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#10b981' }}>Amount:</span>
                    <span style={{ fontWeight: '600', color: '#ebebeb' }}>{formatCurrency(formData.amount)}</span>
                  </div>
                  {selectedType?.requiresPartner && formData.partnerId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#10b981' }}>Partner:</span>
                      <span style={{ fontWeight: '600', color: '#ebebeb' }}>
                        {partners.find(p => p.id === formData.partnerId)?.name}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#10b981' }}>Date:</span>
                    <span style={{ fontWeight: '600', color: '#ebebeb' }}>
                      {new Date(formData.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form Actions */}
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
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#b3b3b3',
                  backgroundColor: 'transparent',
                  border: '1px solid #404040',
                  borderRadius: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.color = '#ebebeb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#b3b3b3';
                  }
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
                {isSubmitting ? 'Processing...' : (injection ? 'Update Injection' : 'Add Cash Injection')}
              </button>
            </div>
          </form>
      </div>
    </Modal>
  );
}