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
      <div className="rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto" style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        scrollbarWidth: 'thin',
        scrollbarColor: '#404040 #2a2a2a'
      }}>
        <style dangerouslySetInnerHTML={{
          __html: `
            .rounded-lg.shadow-xl::-webkit-scrollbar {
              width: 8px;
            }
            .rounded-lg.shadow-xl::-webkit-scrollbar-track {
              background: #2a2a2a;
            }
            .rounded-lg.shadow-xl::-webkit-scrollbar-thumb {
              background: #404040;
              border-radius: 4px;
            }
            .rounded-lg.shadow-xl::-webkit-scrollbar-thumb:hover {
              background: #505050;
            }
          `
        }} />
        <div className="sticky top-0 rounded-t-lg px-4 sm:px-6 py-4" style={{
          backgroundColor: '#2a2a2a',
          borderBottom: '1px solid #404040'
        }}>
          <div className="flex items-center justify-between">
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#ebebeb'
            }}>
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={handleCancel}
              style={{
                color: '#b3b3b3',
                padding: '4px',
                borderRadius: '6px',
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
        </div>
        
        <div className="px-4 sm:px-6 py-6">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label htmlFor="name" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: errors.name ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.name ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.name ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                  placeholder="Product name"
                />
                {errors.name && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.name}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: errors.category ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.category ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.category ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.category ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  {businessCategories.map(category => (
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

              {/* Current Stock */}
              <div>
                <label htmlFor="currentStock" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
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
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: errors.currentStock ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.currentStock ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.currentStock ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.currentStock ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                  placeholder="0"
                />
                {errors.currentStock && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.currentStock}</p>}
                <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#b3b3b3'
                }}>
                  Number of bags in stock
                </p>
              </div>

              {/* Cost Per Kg */}
              <div>
                <label htmlFor="costPerKg" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
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
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: errors.costPerKg ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.costPerKg ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.costPerKg ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.costPerKg ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                  placeholder="0.00"
                />
                {errors.costPerKg && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.costPerKg}</p>}
                <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#b3b3b3'
                }}>
                  Purchase cost per kilogram
                </p>
              </div>

              {/* Bag Weight */}
              <div>
                <label htmlFor="bagWeight" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Bag Weight (kg) *
                </label>
                <select
                  id="bagWeight"
                  name="bagWeight"
                  value={formData.bagWeight}
                  onChange={handleInputChange}
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#60a5fa';
                    e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#404040';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <option value="20">20 kg per bag</option>
                  <option value="25">25 kg per bag</option>
                </select>
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label htmlFor="description" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '12px',
                    fontSize: '16px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
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
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                  placeholder="Description..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3" style={{ paddingTop: '24px', borderTop: '1px solid #404040' }}>
              <button
                type="button"
                onClick={handleCancel}
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
                className="w-full sm:w-auto"
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
                  backgroundColor: '#2563eb',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>

        </div>
      </div>
    </Modal>
  );
}