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
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{
          borderBottom: '1px solid #404040',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}>
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3" style={{ color: '#ef4444' }} />
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#ebebeb'
              }}>
                Destroy/Damage Product
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#b3b3b3',
                marginTop: '2px'
              }}>
                Record damaged or destroyed inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#b3b3b3',
              padding: '4px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              border: 'none',
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
        
        <form onSubmit={handleSubmit} style={{ padding: '24px' }} className="space-y-4">
          {/* Product Info */}
          <div style={{
            backgroundColor: '#333333',
            border: '1px solid #404040',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p style={{ fontSize: '14px', color: '#b3b3b3' }}>Product</p>
                <p style={{ fontWeight: '500', color: '#ebebeb' }}>{product.name}</p>
              </div>
              <div>
                <p style={{ fontSize: '14px', color: '#b3b3b3' }}>Current Stock</p>
                <p style={{ fontWeight: '500', color: '#ebebeb' }}>{product.currentStock} bags</p>
              </div>
            </div>
          </div>
          
          {/* Quantity to Destroy */}
          <div>
            <label htmlFor="quantity" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '4px'
            }}>
              Quantity to Destroy (bags) *
            </label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              min="1"
              max={product.currentStock}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.quantity ? '1px solid #ef4444' : '1px solid #404040',
                borderRadius: '6px',
                backgroundColor: '#1c1c1c',
                color: '#ebebeb',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.quantity ? '#ef4444' : '#60a5fa';
                e.target.style.boxShadow = errors.quantity ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.quantity ? '#ef4444' : '#404040';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.quantity && <p style={{
              marginTop: '4px',
              fontSize: '14px',
              color: '#ef4444'
            }}>{errors.quantity}</p>}
            <p style={{
              marginTop: '4px',
              fontSize: '12px',
              color: '#b3b3b3'
            }}>
              Remaining stock after destruction: {product.currentStock - (parseInt(formData.quantity) || 0)} bags
            </p>
          </div>
          
          {/* Reason */}
          <div>
            <label htmlFor="reason" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '4px'
            }}>
              Reason for Destruction *
            </label>
            <select
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.reason ? '1px solid #ef4444' : '1px solid #404040',
                borderRadius: '6px',
                backgroundColor: '#1c1c1c',
                color: '#ebebeb',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.reason ? '#ef4444' : '#60a5fa';
                e.target.style.boxShadow = errors.reason ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.reason ? '#ef4444' : '#404040';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Select a reason...</option>
              {reasons.map(reason => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            {errors.reason && <p style={{
              marginTop: '4px',
              fontSize: '14px',
              color: '#ef4444'
            }}>{errors.reason}</p>}
          </div>
          
          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '4px'
            }}>
              Additional Details {formData.reason === 'Other' && '*'}
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.notes ? '1px solid #ef4444' : '1px solid #404040',
                borderRadius: '6px',
                backgroundColor: '#1c1c1c',
                color: '#ebebeb',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = errors.notes ? '#ef4444' : '#60a5fa';
                e.target.style.boxShadow = errors.notes ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.notes ? '#ef4444' : '#404040';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Provide additional details about the damage or destruction..."
            />
            {errors.notes && <p style={{
              marginTop: '4px',
              fontSize: '14px',
              color: '#ef4444'
            }}>{errors.notes}</p>}
          </div>
          
          {/* Loss Value */}
          {lossValue > 0 && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#ef4444',
                marginBottom: '8px'
              }}>Financial Impact</h4>
              <div className="space-y-1" style={{ fontSize: '14px' }}>
                <div className="flex justify-between">
                  <span style={{ color: '#ef4444' }}>Cost per bag:</span>
                  <span style={{ fontWeight: '500', color: '#ef4444' }}>
                    {formatCurrency((product.costPerKg || product.costPerUnit || 0) * (product.bagWeight || 25))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#ef4444' }}>Total Loss Value:</span>
                  <span style={{ fontWeight: '600', color: '#ef4444' }}>
                    {formatCurrency(lossValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-3" style={{
            paddingTop: '16px',
            borderTop: '1px solid #404040'
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
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = '#60a5fa';
                  e.target.style.color = '#ebebeb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#404040';
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
                backgroundColor: '#dc2626',
                border: '1px solid transparent',
                borderRadius: '6px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#b91c1c';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = '#dc2626';
                }
              }}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Destruction'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}