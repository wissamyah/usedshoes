import { useState } from 'react';
import { X, Pencil, Package, DollarSign, Truck, Calendar, FileText, BarChart3, MapPin, Clock, Edit3 } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { validatePriceAdjustmentForm } from '../../utils/validation';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import Modal from '../UI/Modal';

export default function ContainerDetails({ container, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPriceAdjustment, setShowPriceAdjustment] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    reason: '',
    adjustedBy: '',
    productAdjustments: []
  });
  const [formErrors, setFormErrors] = useState({});

  const { adjustContainerPrices, products } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Calculate container totals
  const totalBags = container.products?.reduce((sum, p) => sum + (p.bagQuantity || 0), 0) || 0;
  const totalKg = container.products?.reduce((sum, p) => sum + ((p.bagQuantity || 0) * (p.bagWeight || 25)), 0) || 0;
  const productsCost = container.products?.reduce((sum, p) => sum + ((p.bagQuantity || 0) * (p.costPerKg || 0) * (p.bagWeight || 25)), 0) || 0;
  const shippingCost = parseFloat(container.shippingCost) || 0;
  const customsCost = parseFloat(container.customsCost) || 0;
  const totalCost = productsCost + shippingCost + customsCost;
  const uniqueProducts = container.products?.length || 0;

  // Calculate container status
  const getContainerStatus = () => {
    if (totalCost === 0) return { status: 'Draft', color: 'gray', bg: 'bg-gray-100' };
    if (container.arrivalDate) return { status: 'Arrived', color: 'green', bg: 'bg-green-100' };
    if (container.shippingDate) return { status: 'In Transit', color: 'blue', bg: 'bg-blue-100' };
    return { status: 'Ordered', color: 'yellow', bg: 'bg-yellow-100' };
  };

  const containerStatus = getContainerStatus();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'costs', label: 'Costs', icon: DollarSign },
    { id: 'adjustments', label: 'Price Adjustments', icon: Edit3 },
    { id: 'timeline', label: 'Timeline', icon: Clock }
  ];

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={() => onClick(tab.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: isActive ? '#2563eb' : 'transparent',
        color: isActive ? '#ffffff' : '#b3b3b3',
        boxShadow: isActive ? '0 2px 4px rgba(37, 99, 235, 0.2)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.color = '#ebebeb';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#b3b3b3';
        }
      }}
    >
      <tab.icon className="h-4 w-4" />
      <span className="hidden sm:block">{tab.label}</span>
      <span className="sm:hidden">{tab.label.charAt(0)}</span>
    </button>
  );

  // Price adjustment functions
  const initializePriceAdjustment = () => {
    const productAdjustments = container.products?.map(cp => {
      const product = products.find(p =>
        p.id == cp.productId ||
        p.id === parseInt(cp.productId) ||
        p.id === cp.productId.toString()
      );

      return {
        productId: cp.productId,
        productName: product?.name || 'Unknown Product',
        oldPricePerKg: cp.costPerKg || 0,
        newPricePerKg: cp.costPerKg || 0,
        bagQuantity: cp.bagQuantity,
        bagWeight: cp.bagWeight || 25,
        currentStock: product?.currentStock || 0
      };
    }) || [];

    setAdjustmentForm({
      reason: '',
      adjustedBy: '',
      productAdjustments
    });
    setFormErrors({});
    setShowPriceAdjustment(true);
  };

  const handleAdjustmentFormChange = (field, value) => {
    setAdjustmentForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleProductAdjustmentChange = (index, newPrice) => {
    setAdjustmentForm(prev => ({
      ...prev,
      productAdjustments: prev.productAdjustments.map((adj, i) =>
        i === index ? { ...adj, newPricePerKg: parseFloat(newPrice) || 0 } : adj
      )
    }));

    // Clear error for this adjustment
    const fieldKey = `adjustment_${index}_price`;
    if (formErrors[fieldKey]) {
      setFormErrors(prev => ({
        ...prev,
        [fieldKey]: ''
      }));
    }
  };

  const submitPriceAdjustment = async () => {
    try {
      // Validate form
      const validation = validatePriceAdjustmentForm(adjustmentForm);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        showErrorMessage('Validation Error', 'Please fix the errors before submitting');
        return;
      }

      // Filter out adjustments with no price change
      const changedAdjustments = adjustmentForm.productAdjustments.filter(adj =>
        adj.oldPricePerKg !== adj.newPricePerKg
      );

      if (changedAdjustments.length === 0) {
        showErrorMessage('No Changes', 'No price changes detected');
        return;
      }

      // Prepare adjustment data
      const adjustmentData = {
        containerId: container.id,
        productAdjustments: changedAdjustments,
        reason: adjustmentForm.reason.trim(),
        adjustedBy: adjustmentForm.adjustedBy.trim()
      };

      // Submit adjustment
      await adjustContainerPrices(adjustmentData);

      showSuccessMessage(
        'Price Adjustment Applied',
        `Successfully adjusted prices for ${changedAdjustments.length} product(s). Product costs have been recalculated using weighted average method.`
      );

      setShowPriceAdjustment(false);

      // Switch to the adjustments tab to show the changes
      setActiveTab('adjustments');

    } catch (error) {
      console.error('Price adjustment error:', error);
      showErrorMessage('Adjustment Failed', error.message || 'Failed to apply price adjustment');
    }
  };

  const renderPriceAdjustmentModal = () => {
    if (!showPriceAdjustment) return null;

    return (
      <Modal isOpen={true} onClose={() => setShowPriceAdjustment(false)} size="large">
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '8px',
          padding: '24px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ebebeb',
            marginBottom: '16px'
          }}>
            Adjust Container Prices
          </h3>

          <p style={{
            color: '#b3b3b3',
            fontSize: '14px',
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            Adjust prices negotiated with supplier after container creation. This will recalculate your product costs using the weighted average method based on current stock levels.
          </p>

          {/* Reason and Adjuster */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Reason for Adjustment *
                </label>
                <input
                  type="text"
                  value={adjustmentForm.reason}
                  onChange={(e) => handleAdjustmentFormChange('reason', e.target.value)}
                  placeholder="e.g., Negotiated discount due to quality issues"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1c1c1c',
                    border: formErrors.reason ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ebebeb',
                    fontSize: '14px'
                  }}
                />
                {formErrors.reason && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.reason}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '8px'
                }}>
                  Adjusted By *
                </label>
                <input
                  type="text"
                  value={adjustmentForm.adjustedBy}
                  onChange={(e) => handleAdjustmentFormChange('adjustedBy', e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1c1c1c',
                    border: formErrors.adjustedBy ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ebebeb',
                    fontSize: '14px'
                  }}
                />
                {formErrors.adjustedBy && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {formErrors.adjustedBy}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Product Adjustments */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '16px'
            }}>
              Product Price Adjustments
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {adjustmentForm.productAdjustments.map((adjustment, index) => {
                const fieldKey = `adjustment_${index}_price`;
                const hasChange = adjustment.oldPricePerKg !== adjustment.newPricePerKg;
                const changeAmount = adjustment.newPricePerKg - adjustment.oldPricePerKg;
                const changePercent = adjustment.oldPricePerKg > 0 ?
                  ((changeAmount / adjustment.oldPricePerKg) * 100).toFixed(1) : '0';

                return (
                  <div key={adjustment.productId} style={{
                    backgroundColor: '#1c1c1c',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                      <div>
                        <p style={{
                          color: '#ebebeb',
                          fontSize: '14px',
                          fontWeight: '500',
                          marginBottom: '4px'
                        }}>
                          {adjustment.productName}
                        </p>
                        <p style={{
                          color: '#b3b3b3',
                          fontSize: '12px'
                        }}>
                          {adjustment.bagQuantity} bags × {adjustment.bagWeight}kg | Stock: {adjustment.currentStock} bags
                        </p>
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#b3b3b3',
                          marginBottom: '4px'
                        }}>
                          Current Price
                        </label>
                        <p style={{
                          color: '#ebebeb',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          ${adjustment.oldPricePerKg.toFixed(2)}/kg
                        </p>
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#b3b3b3',
                          marginBottom: '4px'
                        }}>
                          New Price/kg *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={adjustment.newPricePerKg}
                          onChange={(e) => handleProductAdjustmentChange(index, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: '#2a2a2a',
                            border: formErrors[fieldKey] ? '1px solid #ef4444' : '1px solid #404040',
                            borderRadius: '4px',
                            color: '#ebebeb',
                            fontSize: '14px'
                          }}
                        />
                        {formErrors[fieldKey] && (
                          <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>
                            {formErrors[fieldKey]}
                          </p>
                        )}
                      </div>

                      <div>
                        {hasChange && (
                          <div style={{
                            padding: '8px',
                            backgroundColor: changeAmount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            border: `1px solid ${changeAmount > 0 ? '#ef4444' : '#22c55e'}`,
                            borderRadius: '4px',
                            textAlign: 'center'
                          }}>
                            <p style={{
                              color: changeAmount > 0 ? '#ef4444' : '#22c55e',
                              fontSize: '12px',
                              fontWeight: '500',
                              margin: 0
                            }}>
                              {changeAmount > 0 ? '+' : ''}${changeAmount.toFixed(2)}
                            </p>
                            <p style={{
                              color: changeAmount > 0 ? '#ef4444' : '#22c55e',
                              fontSize: '11px',
                              margin: 0
                            }}>
                              ({changeAmount > 0 ? '+' : ''}{changePercent}%)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={() => setShowPriceAdjustment(false)}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #404040',
                borderRadius: '8px',
                color: '#b3b3b3',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={submitPriceAdjustment}
              style={{
                padding: '12px 20px',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Apply Adjustments
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Container Header */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ebebeb'
              }}>Container {container.id}</h3>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: containerStatus.status === 'Arrived' ? 'rgba(34, 197, 94, 0.1)' :
                                 containerStatus.status === 'In Transit' ? 'rgba(59, 130, 246, 0.1)' :
                                 containerStatus.status === 'Ordered' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                color: containerStatus.status === 'Arrived' ? '#22c55e' :
                       containerStatus.status === 'In Transit' ? '#3b82f6' :
                       containerStatus.status === 'Ordered' ? '#f59e0b' : '#6b7280'
              }}>
                {containerStatus.status}
              </span>
            </div>
            <p style={{
              color: '#b3b3b3',
              display: 'flex',
              alignItems: 'center'
            }}>
              <MapPin className="h-4 w-4 mr-2" />
              {container.supplier}
            </p>
          </div>
          <div className="text-right">
            <p style={{
              fontSize: '14px',
              color: '#b3b3b3'
            }}>Total Investment</p>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ebebeb'
            }}>{formatCurrency(totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div className="flex items-center">
            <Package style={{ color: '#3b82f6' }} className="h-6 w-6 mr-3" />
            <div>
              <p style={{ fontSize: '24px', fontWeight: '600', color: '#ebebeb' }}>{uniqueProducts}</p>
              <p style={{ fontSize: '14px', color: '#b3b3b3' }}>Products</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div className="flex items-center">
            <Package style={{ color: '#22c55e' }} className="h-6 w-6 mr-3" />
            <div>
              <p style={{ fontSize: '24px', fontWeight: '600', color: '#ebebeb' }}>{totalBags}</p>
              <p style={{ fontSize: '14px', color: '#b3b3b3' }}>Total Bags</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div className="flex items-center">
            <Truck style={{ color: '#8b5cf6' }} className="h-6 w-6 mr-3" />
            <div>
              <p style={{ fontSize: '24px', fontWeight: '600', color: '#ebebeb' }}>{(totalKg / 1000).toFixed(1)}t</p>
              <p style={{ fontSize: '14px', color: '#b3b3b3' }}>Total Weight</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div className="flex items-center">
            <DollarSign style={{ color: '#f59e0b' }} className="h-6 w-6 mr-3" />
            <div>
              <p style={{ fontSize: '24px', fontWeight: '600', color: '#ebebeb' }}>
                {totalKg > 0 ? formatCurrency(totalCost / totalKg) : '$0'}
              </p>
              <p style={{ fontSize: '14px', color: '#b3b3b3' }}>Cost per Kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Container Information - Compact Layout */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#ebebeb',
          marginBottom: '12px'
        }}>Container Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p style={{
              fontSize: '12px',
              color: '#b3b3b3',
              marginBottom: '2px'
            }}>Supplier</p>
            <p style={{
              fontSize: '14px',
              color: '#ebebeb',
              fontWeight: '500'
            }}>{container.supplier}</p>
          </div>
          <div>
            <p style={{
              fontSize: '12px',
              color: '#b3b3b3',
              marginBottom: '2px'
            }}>Purchase Date</p>
            <p style={{
              fontSize: '14px',
              color: '#ebebeb'
            }}>{formatDate(container.purchaseDate)}</p>
          </div>
          {container.invoiceNumber && (
            <div>
              <p style={{
                fontSize: '12px',
                color: '#b3b3b3',
                marginBottom: '2px'
              }}>Invoice #</p>
              <p style={{
                fontSize: '14px',
                color: '#ebebeb',
                fontFamily: 'monospace'
              }}>{container.invoiceNumber}</p>
            </div>
          )}
          {container.arrivalDate && (
            <div>
              <p style={{
                fontSize: '12px',
                color: '#b3b3b3',
                marginBottom: '2px'
              }}>Arrival Date</p>
              <p style={{
                fontSize: '14px',
                color: '#ebebeb'
              }}>{formatDate(container.arrivalDate)}</p>
            </div>
          )}
        </div>

        {container.description && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #404040'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#b3b3b3',
              marginBottom: '4px'
            }}>Description</p>
            <p style={{
              fontSize: '14px',
              color: '#ebebeb',
              lineHeight: '1.5'
            }}>{container.description}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#ebebeb'
        }}>Products in Container</h4>
        <span style={{
          fontSize: '14px',
          color: '#b3b3b3'
        }}>{uniqueProducts} products • {totalBags} bags</span>
      </div>

      {container.products && container.products.length > 0 ? (
        <div className="space-y-4">
          {container.products.map((product, index) => {
            const productTotalKg = (product.bagQuantity || 0) * (product.bagWeight || 25);
            const productTotalCost = (product.bagQuantity || 0) * (product.costPerKg || 0) * (product.bagWeight || 25);
            const landedCostPerBag = ((product.costPerKg || 0) * (product.bagWeight || 25)) + (totalBags > 0 ? (shippingCost + customsCost) / totalBags : 0);

            return (
              <div key={index} style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #404040',
                borderRadius: '12px',
                padding: '24px',
                transition: 'all 0.2s'
              }}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h5 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#ebebeb',
                        marginBottom: '8px'
                      }} className="sm:mb-0">{product.productName}</h5>
                      <span style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#22c55e'
                      }}>{formatCurrency(productTotalCost)}</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        <p style={{
                          fontSize: '12px',
                          color: '#3b82f6',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>Quantity</p>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#ebebeb'
                        }}>{product.bagQuantity}</p>
                        <p style={{
                          fontSize: '12px',
                          color: '#3b82f6'
                        }}>bags</p>
                      </div>

                      <div style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        <p style={{
                          fontSize: '12px',
                          color: '#22c55e',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>Weight</p>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#ebebeb'
                        }}>{productTotalKg} kg</p>
                        <p style={{
                          fontSize: '12px',
                          color: '#22c55e'
                        }}>{product.bagWeight}kg/bag</p>
                      </div>

                      <div style={{
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        <p style={{
                          fontSize: '12px',
                          color: '#8b5cf6',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>Cost/Kg</p>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#ebebeb'
                        }}>{formatCurrency(product.costPerKg)}</p>
                      </div>

                      <div style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        <p style={{
                          fontSize: '12px',
                          color: '#f59e0b',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>Cost/Bag</p>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#ebebeb'
                        }}>{formatCurrency((product.costPerKg || 0) * (product.bagWeight || 25))}</p>
                      </div>

                      <div style={{
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        borderRadius: '8px',
                        padding: '12px'
                      }} className="col-span-2 lg:col-span-1">
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>Landed/Bag</p>
                        <p style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#ebebeb'
                        }}>{formatCurrency(landedCostPerBag)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          backgroundColor: '#333333',
          borderRadius: '12px',
          border: '2px dashed #404040'
        }}>
          <Package style={{ color: '#808080' }} className="mx-auto h-12 w-12 mb-4" />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#ebebeb',
            marginBottom: '8px'
          }}>No Products Found</h3>
          <p style={{
            color: '#b3b3b3'
          }}>This container doesn't have any products assigned yet.</p>
        </div>
      )}
    </div>
  );

  const renderCostsTab = () => (
    <div className="space-y-6">
      {/* Cost Summary */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#ebebeb',
          marginBottom: '16px'
        }}>Cost Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p style={{
              fontSize: '14px',
              color: '#b3b3b3',
              marginBottom: '4px'
            }}>Products Cost</p>
            <p style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ebebeb'
            }}>{formatCurrency(productsCost)}</p>
            <p style={{
              fontSize: '12px',
              color: '#808080'
            }}>{((productsCost/totalCost)*100).toFixed(1)}% of total</p>
          </div>
          <div className="text-center">
            <p style={{
              fontSize: '14px',
              color: '#b3b3b3',
              marginBottom: '4px'
            }}>Shipping & Customs</p>
            <p style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ebebeb'
            }}>{formatCurrency(shippingCost + customsCost)}</p>
            <p style={{
              fontSize: '12px',
              color: '#808080'
            }}>{(((shippingCost + customsCost)/totalCost)*100).toFixed(1)}% of total</p>
          </div>
          <div className="text-center">
            <p style={{
              fontSize: '14px',
              color: '#b3b3b3',
              marginBottom: '4px'
            }}>Total Investment</p>
            <p style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#22c55e'
            }}>{formatCurrency(totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#ebebeb',
          marginBottom: '24px'
        }}>Detailed Cost Breakdown</h4>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3" style={{
            borderBottom: '1px solid #404040'
          }}>
            <div className="flex items-center space-x-3">
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%'
              }}></div>
              <span style={{
                fontWeight: '500',
                color: '#ebebeb'
              }}>Products Total</span>
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ebebeb'
            }}>{formatCurrency(productsCost)}</span>
          </div>

          <div className="flex justify-between items-center py-3" style={{
            borderBottom: '1px solid #404040'
          }}>
            <div className="flex items-center space-x-3">
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#22c55e',
                borderRadius: '50%'
              }}></div>
              <span style={{
                fontWeight: '500',
                color: '#ebebeb'
              }}>Shipping Cost</span>
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ebebeb'
            }}>{formatCurrency(shippingCost)}</span>
          </div>

          <div className="flex justify-between items-center py-3" style={{
            borderBottom: '1px solid #404040'
          }}>
            <div className="flex items-center space-x-3">
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#8b5cf6',
                borderRadius: '50%'
              }}></div>
              <span style={{
                fontWeight: '500',
                color: '#ebebeb'
              }}>Customs/Clearing Cost</span>
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ebebeb'
            }}>{formatCurrency(customsCost)}</span>
          </div>

          <div className="flex justify-between items-center py-4" style={{
            backgroundColor: '#333333',
            margin: '0 -24px',
            padding: '16px 24px',
            borderRadius: '8px'
          }}>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#ebebeb'
            }}>Total Container Cost</span>
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#22c55e'
            }}>{formatCurrency(totalCost)}</span>
          </div>
        </div>

        {totalKg > 0 && (
          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #404040'
          }}>
            <h5 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#ebebeb',
              marginBottom: '16px'
            }}>Unit Cost Analysis</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#3b82f6',
                  fontWeight: '500'
                }}>Average Landed Cost per Kg</p>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ebebeb'
                }}>{formatCurrency(totalCost / totalKg)}</p>
              </div>
              {totalBags > 0 && (
                <div style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#22c55e',
                    fontWeight: '500'
                  }}>Average Landed Cost per Bag</p>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#ebebeb'
                  }}>{formatCurrency(totalCost / totalBags)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="space-y-6">
      <h4 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#ebebeb'
      }}>Container Timeline</h4>

      <div className="relative">
        <div style={{
          position: 'absolute',
          left: '32px',
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundColor: '#404040'
        }}></div>

        <div className="space-y-8">
          {/* Purchase Date */}
          <div className="relative flex items-start">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '50%',
              border: '4px solid #1c1c1c',
              zIndex: 10
            }}>
              <Calendar style={{ width: '24px', height: '24px', color: '#22c55e' }} />
            </div>
            <div className="ml-6 min-w-0 flex-1">
              <div style={{
                backgroundColor: '#2a2a2a',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #404040'
              }}>
                <h5 style={{
                  fontWeight: '600',
                  color: '#ebebeb'
                }}>Container Ordered</h5>
                <p style={{
                  fontSize: '14px',
                  color: '#b3b3b3',
                  marginTop: '4px'
                }}>{formatDate(container.purchaseDate)}</p>
                <p style={{
                  fontSize: '14px',
                  color: '#808080',
                  marginTop: '8px'
                }}>
                  Container ordered from {container.supplier}
                  {container.invoiceNumber && ` with invoice #${container.invoiceNumber}`}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Date */}
          {container.shippingDate && (
            <div className="relative flex items-start">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '50%',
                border: '4px solid #1c1c1c',
                zIndex: 10
              }}>
                <Truck style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
              </div>
              <div className="ml-6 min-w-0 flex-1">
                <div style={{
                  backgroundColor: '#2a2a2a',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #404040'
                }}>
                  <h5 style={{
                    fontWeight: '600',
                    color: '#ebebeb'
                  }}>Shipping Started</h5>
                  <p style={{
                    fontSize: '14px',
                    color: '#b3b3b3',
                    marginTop: '4px'
                  }}>{formatDate(container.shippingDate)}</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#808080',
                    marginTop: '8px'
                  }}>Container departed and is in transit</p>
                </div>
              </div>
            </div>
          )}

          {/* Arrival Date */}
          {container.arrivalDate && (
            <div className="relative flex items-start">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '50%',
                border: '4px solid #1c1c1c',
                zIndex: 10
              }}>
                <MapPin style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
              </div>
              <div className="ml-6 min-w-0 flex-1">
                <div style={{
                  backgroundColor: '#2a2a2a',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #404040'
                }}>
                  <h5 style={{
                    fontWeight: '600',
                    color: '#ebebeb'
                  }}>Container Arrived</h5>
                  <p style={{
                    fontSize: '14px',
                    color: '#b3b3b3',
                    marginTop: '4px'
                  }}>{formatDate(container.arrivalDate)}</p>
                  <p style={{
                    fontSize: '14px',
                    color: '#808080',
                    marginTop: '8px'
                  }}>Container successfully arrived at destination</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="relative flex items-start">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: containerStatus.status === 'Arrived' ? 'rgba(34, 197, 94, 0.1)' :
                               containerStatus.status === 'In Transit' ? 'rgba(59, 130, 246, 0.1)' :
                               containerStatus.status === 'Ordered' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
              borderRadius: '50%',
              border: '4px solid #1c1c1c',
              zIndex: 10
            }}>
              <FileText style={{
                width: '24px',
                height: '24px',
                color: containerStatus.status === 'Arrived' ? '#22c55e' :
                       containerStatus.status === 'In Transit' ? '#3b82f6' :
                       containerStatus.status === 'Ordered' ? '#f59e0b' : '#6b7280'
              }} />
            </div>
            <div className="ml-6 min-w-0 flex-1">
              <div style={{
                backgroundColor: '#2a2a2a',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #404040'
              }}>
                <h5 style={{
                  fontWeight: '600',
                  color: '#ebebeb'
                }}>Current Status</h5>
                <p style={{
                  fontSize: '14px',
                  color: containerStatus.status === 'Arrived' ? '#22c55e' :
                         containerStatus.status === 'In Transit' ? '#3b82f6' :
                         containerStatus.status === 'Ordered' ? '#f59e0b' : '#6b7280',
                  fontWeight: '500',
                  marginTop: '4px'
                }}>{containerStatus.status}</p>
                <p style={{
                  fontSize: '14px',
                  color: '#808080',
                  marginTop: '8px'
                }}>
                  Total investment: {formatCurrency(totalCost)} • {totalBags} bags • {uniqueProducts} products
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdjustmentsTab = () => (
    <div className="space-y-6">
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ebebeb'
          }}>
            Price Adjustments
          </h3>
          <button
            onClick={initializePriceAdjustment}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
          >
            <Edit3 className="h-4 w-4" />
            Adjust Prices
          </button>
        </div>

        <p style={{
          color: '#b3b3b3',
          fontSize: '14px',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          Make price adjustments after negotiating with suppliers. This will recalculate your product costs using the weighted average method based on current stock levels.
        </p>

        {/* Current Container Prices */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#ebebeb',
            marginBottom: '16px'
          }}>
            Current Container Prices
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {container.products?.map((cp, index) => {
              const product = products.find(p =>
                p.id == cp.productId ||
                p.id === parseInt(cp.productId) ||
                p.id === cp.productId.toString()
              );

              return (
                <div key={cp.productId || index} style={{
                  backgroundColor: '#1c1c1c',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                    <div>
                      <p style={{
                        color: '#ebebeb',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '4px'
                      }}>
                        {product?.name || 'Unknown Product'}
                      </p>
                      <p style={{
                        color: '#b3b3b3',
                        fontSize: '12px'
                      }}>
                        {cp.bagQuantity} bags × {cp.bagWeight || 25}kg
                      </p>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#b3b3b3',
                        marginBottom: '4px'
                      }}>
                        Container Price
                      </label>
                      <p style={{
                        color: '#ebebeb',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        ${(cp.costPerKg || 0).toFixed(2)}/kg
                      </p>
                      {cp.originalCostPerKg && cp.originalCostPerKg !== cp.costPerKg && (
                        <p style={{
                          color: '#b3b3b3',
                          fontSize: '11px',
                          textDecoration: 'line-through'
                        }}>
                          Original: ${cp.originalCostPerKg.toFixed(2)}/kg
                        </p>
                      )}
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#b3b3b3',
                        marginBottom: '4px'
                      }}>
                        Current Stock
                      </label>
                      <p style={{
                        color: '#ebebeb',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {product?.currentStock || 0} bags
                      </p>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#b3b3b3',
                        marginBottom: '4px'
                      }}>
                        Current Product Cost
                      </label>
                      <p style={{
                        color: '#ebebeb',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        ${(product?.costPerKg || product?.costPerUnit || 0).toFixed(2)}/kg
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Adjustment History */}
        {container.priceAdjustments && container.priceAdjustments.length > 0 && (
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '16px'
            }}>
              Adjustment History
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {container.priceAdjustments.map((adjustment, index) => (
                <div key={index} style={{
                  backgroundColor: '#1c1c1c',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div className="flex items-center justify-between">
                      <p style={{
                        color: '#ebebeb',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {formatDate(adjustment.adjustmentDate)}
                      </p>
                      <p style={{
                        color: '#b3b3b3',
                        fontSize: '12px'
                      }}>
                        by {adjustment.adjustedBy}
                      </p>
                    </div>
                    <p style={{
                      color: '#b3b3b3',
                      fontSize: '13px',
                      marginTop: '4px'
                    }}>
                      {adjustment.reason}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {adjustment.adjustments?.map((adj, adjIndex) => {
                      const product = products.find(p =>
                        p.id == adj.productId ||
                        p.id === parseInt(adj.productId) ||
                        p.id === adj.productId.toString()
                      );
                      const changeAmount = adj.newPricePerKg - adj.oldPricePerKg;
                      const changePercent = adj.oldPricePerKg > 0 ?
                        ((changeAmount / adj.oldPricePerKg) * 100).toFixed(1) : '0';

                      return (
                        <div key={adjIndex} style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr',
                          gap: '12px',
                          alignItems: 'center',
                          padding: '8px',
                          backgroundColor: '#2a2a2a',
                          borderRadius: '4px'
                        }}>
                          <p style={{
                            color: '#ebebeb',
                            fontSize: '13px'
                          }}>
                            {product?.name || 'Unknown Product'}
                          </p>
                          <p style={{
                            color: '#b3b3b3',
                            fontSize: '12px'
                          }}>
                            ${adj.oldPricePerKg.toFixed(2)}/kg
                          </p>
                          <p style={{
                            color: '#ebebeb',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            ${adj.newPricePerKg.toFixed(2)}/kg
                          </p>
                          <div style={{
                            padding: '4px 8px',
                            backgroundColor: changeAmount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            border: `1px solid ${changeAmount > 0 ? '#ef4444' : '#22c55e'}`,
                            borderRadius: '4px',
                            textAlign: 'center'
                          }}>
                            <p style={{
                              color: changeAmount > 0 ? '#ef4444' : '#22c55e',
                              fontSize: '11px',
                              fontWeight: '500',
                              margin: 0
                            }}>
                              {changeAmount > 0 ? '+' : ''}${changeAmount.toFixed(2)} ({changeAmount > 0 ? '+' : ''}{changePercent}%)
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!container.priceAdjustments || container.priceAdjustments.length === 0) && (
          <div style={{
            textAlign: 'center',
            padding: '32px',
            color: '#b3b3b3'
          }}>
            <Edit3 className="h-12 w-12 mx-auto mb-4" style={{ opacity: 0.5 }} />
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No Price Adjustments</p>
            <p style={{ fontSize: '14px' }}>
              Click "Adjust Prices" to negotiate new prices with your supplier and maintain accurate cost tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'products':
        return renderProductsTab();
      case 'costs':
        return renderCostsTab();
      case 'adjustments':
        return renderAdjustmentsTab();
      case 'timeline':
        return renderTimelineTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="large">
      <div style={{
        backgroundColor: '#1c1c1c',
        minHeight: '80vh',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#2a2a2a',
          borderBottom: '1px solid #404040',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ebebeb'
            }}>Container Details</h2>
            <p style={{
              fontSize: '14px',
              color: '#b3b3b3',
              marginTop: '4px'
            }}>{container.supplier} • {formatDate(container.purchaseDate)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              }}
              title="Edit container"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                color: '#b3b3b3',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
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
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          backgroundColor: '#2a2a2a',
          borderBottom: '1px solid #404040',
          padding: '12px 24px'
        }}>
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={setActiveTab}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: '#1c1c1c',
          scrollbarWidth: 'thin',
          scrollbarColor: '#404040 #1c1c1c'
        }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              div[style*="overflowY: auto"]::-webkit-scrollbar {
                width: 8px;
              }
              div[style*="overflowY: auto"]::-webkit-scrollbar-track {
                background: #1c1c1c;
              }
              div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
                background: #404040;
                border-radius: 4px;
              }
              div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
                background: #505050;
              }
            `
          }} />
          {renderTabContent()}
        </div>

        {/* Footer Actions */}
        <div style={{
          backgroundColor: '#2a2a2a',
          borderTop: '1px solid #404040',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
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
            Close
          </button>
          <button
            onClick={onEdit}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
          >
            Edit Container
          </button>
        </div>
      </div>

      {/* Price Adjustment Modal */}
      {renderPriceAdjustmentModal()}
    </Modal>
  );
}