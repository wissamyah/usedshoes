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
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '8px'
      }}>
        {/* Header */}
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
          }}>
            {partner ? 'Edit Partner' : 'Add New Partner'}
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
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Basic Information */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#ebebeb',
              marginBottom: '16px'
            }}>Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label htmlFor="name" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    border: errors.name ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.name ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.name ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Partner name"
                />
                {errors.name && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.name}</p>}
              </div>
              
              {/* Ownership */}
              <div>
                <label htmlFor="ownershipPercent" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
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
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    border: errors.ownershipPercent ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.ownershipPercent ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.ownershipPercent ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.ownershipPercent ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="50"
                />
                {errors.ownershipPercent && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.ownershipPercent}</p>}
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#ebebeb',
              marginBottom: '16px'
            }}>Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label htmlFor="email" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    border: errors.email ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.email ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.email ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Email address"
                />
                {errors.email && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.email}</p>}
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="phoneNumber" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
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
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>
          
          {/* Financial Information */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#ebebeb',
              marginBottom: '16px'
            }}>Financial Information</h4>
            <div className="grid grid-cols-1 gap-4">
              {/* Initial Investment */}
              <div>
                <label htmlFor="initialInvestment" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
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
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    border: errors.initialInvestment ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.initialInvestment ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.initialInvestment ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.initialInvestment ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Initial investment"
                />
                {errors.initialInvestment && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.initialInvestment}</p>}
              </div>
            </div>
          </div>
          
          {/* Bank Details */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#ebebeb',
              marginBottom: '16px'
            }}>Bank Details (Optional)</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Name */}
                <div>
                  <label htmlFor="bank_accountName" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ebebeb',
                    marginBottom: '8px'
                  }}>
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="bank_accountName"
                    name="bank_accountName"
                    value={formData.bankDetails.accountName}
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
                    placeholder="Partner name"
                  />
                </div>
                
                {/* Bank Name */}
                <div>
                  <label htmlFor="bank_bankName" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ebebeb',
                    marginBottom: '8px'
                  }}>
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bank_bankName"
                    name="bank_bankName"
                    value={formData.bankDetails.bankName}
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
                    placeholder="Bank name"
                  />
                </div>
              </div>
              
              {/* Account Number */}
              <div>
                <label htmlFor="bank_accountNumber" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Account Number
                </label>
                <input
                  type="text"
                  id="bank_accountNumber"
                  name="bank_accountNumber"
                  value={formData.bankDetails.accountNumber}
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
                  placeholder="Account number"
                />
              </div>
            </div>
          </div>
          
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
              {isSubmitting ? 'Saving...' : (partner ? 'Update Partner' : 'Add Partner')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}