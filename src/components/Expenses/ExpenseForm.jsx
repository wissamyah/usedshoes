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
            {expense ? 'Edit Expense' : 'Add New Expense'}
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
            {/* Category and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    border: errors.category ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.category ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.category ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.category ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.category}</p>}
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
                placeholder="Brief description of the expense..."
              />
              {errors.description && <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: '#ef4444'
              }}>{errors.description}</p>}
            </div>

            {/* Date and Container ID */}
            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label htmlFor="containerId" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Container ID
                </label>
                <input
                  type="text"
                  id="containerId"
                  name="containerId"
                  value={formData.containerId}
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
                  placeholder="Optional container reference"
                />
                <p style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#b3b3b3'
                }}>Link to specific container (optional)</p>
              </div>
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
                placeholder="Additional details, receipts, etc..."
              />
            </div>

            {/* Expense Preview */}
            {formData.amount && (
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3b82f6',
                  marginBottom: '12px'
                }}>Expense Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#60a5fa' }}>Category:</span>
                    <span style={{ fontWeight: '600', color: '#ebebeb' }}>{formData.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#60a5fa' }}>Amount:</span>
                    <span style={{ fontWeight: '600', color: '#ebebeb' }}>{formatCurrency(formData.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#60a5fa' }}>Date:</span>
                    <span style={{ fontWeight: '600', color: '#ebebeb' }}>
                      {formatDate(formData.date)}
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
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {isSubmitting ? 'Processing...' : (expense ? 'Update Expense' : 'Add Expense')}
              </button>
            </div>
          </form>
      </div>
    </Modal>
  );
}