import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import Modal from '../UI/Modal';

export default function SalesForm({ sale, onClose }) {
  const { products, addSale, deleteSale } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  
  // Common date and time for all entries
  const [commonDate, setCommonDate] = useState(new Date().toISOString().split('T')[0]);
  const [commonTime, setCommonTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
  
  // Array of sale entries
  const [saleEntries, setSaleEntries] = useState([{
    id: Date.now(),
    productId: '',
    quantity: '',
    pricePerUnit: '',
    notes: ''
  }]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available products with stock
  const availableProducts = products.filter(product => product.currentStock > 0);
  
  // Track which products are already selected
  const selectedProductIds = saleEntries.map(entry => entry.productId).filter(id => id);

  useEffect(() => {
    if (sale) {
      // In edit mode, load single sale
      setCommonDate(sale.date || new Date().toISOString().split('T')[0]);
      setCommonTime(sale.time || new Date().toTimeString().split(' ')[0].substring(0, 5));
      setSaleEntries([{
        id: Date.now(),
        productId: sale.productId || '',
        quantity: sale.quantity?.toString() || '',
        pricePerUnit: sale.pricePerUnit?.toString() || '',
        notes: sale.notes || ''
      }]);
    }
  }, [sale]);

  const handleEntryChange = (entryId, field, value) => {
    setSaleEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const updated = { ...entry, [field]: value };
        
        // Auto-fill price when product is selected
        if (field === 'productId' && value) {
          const product = products.find(p => p.id === parseInt(value));
          if (product && product.suggestedPrice && !entry.pricePerUnit) {
            updated.pricePerUnit = product.suggestedPrice.toString();
          }
        }
        
        return updated;
      }
      return entry;
    }));
    
    // Clear error for this entry
    if (errors[`entry_${entryId}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`entry_${entryId}_${field}`];
        return newErrors;
      });
    }
  };
  
  const addNewEntry = () => {
    setSaleEntries(prev => [...prev, {
      id: Date.now(),
      productId: '',
      quantity: '',
      pricePerUnit: '',
      notes: ''
    }]);
  };
  
  const removeEntry = (entryId) => {
    if (saleEntries.length > 1) {
      setSaleEntries(prev => prev.filter(entry => entry.id !== entryId));
      // Clear errors for removed entry
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.includes(`entry_${entryId}_`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!commonDate) {
      newErrors.date = 'Date is required';
    }
    
    if (!commonTime) {
      newErrors.time = 'Time is required';
    }
    
    // Validate each entry
    saleEntries.forEach((entry, index) => {
      if (!entry.productId) {
        newErrors[`entry_${entry.id}_productId`] = 'Please select a product';
      }
      
      if (!entry.quantity) {
        newErrors[`entry_${entry.id}_quantity`] = 'Quantity is required';
      } else {
        const quantity = parseInt(entry.quantity);
        if (quantity <= 0) {
          newErrors[`entry_${entry.id}_quantity`] = 'Quantity must be greater than 0';
        } else {
          // Check stock availability
          const product = products.find(p => p.id === parseInt(entry.productId));
          if (product && quantity > product.currentStock) {
            newErrors[`entry_${entry.id}_quantity`] = `Only ${product.currentStock} units available`;
          }
        }
      }
      
      if (!entry.pricePerUnit) {
        newErrors[`entry_${entry.id}_pricePerUnit`] = 'Price is required';
      } else if (parseFloat(entry.pricePerUnit) <= 0) {
        newErrors[`entry_${entry.id}_pricePerUnit`] = 'Price must be > 0';
      }
    });
    
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
      if (sale) {
        // For editing single sale
        const saleData = {
          productId: parseInt(saleEntries[0].productId),
          quantity: parseInt(saleEntries[0].quantity),
          pricePerUnit: parseFloat(saleEntries[0].pricePerUnit),
          date: commonDate,
          time: commonTime,
          notes: saleEntries[0].notes.trim()
        };
        
        await deleteSale(sale.id);
        await addSale(saleData);
        showSuccessMessage('Sale Updated', 'Sale has been updated successfully');
      } else {
        // Process multiple sales
        const salesData = saleEntries.map(entry => ({
          productId: parseInt(entry.productId),
          quantity: parseInt(entry.quantity),
          pricePerUnit: parseFloat(entry.pricePerUnit),
          date: commonDate,
          time: commonTime,
          notes: entry.notes.trim()
        }));
        
        // Add all sales
        for (const saleData of salesData) {
          await addSale(saleData);
        }
        
        const message = salesData.length === 1 
          ? 'Sale recorded successfully'
          : `${salesData.length} sales recorded successfully`;
        showSuccessMessage('Sales Recorded', message);
      }

      onClose();
    } catch (error) {
      console.error('Sale submission error:', error);
      showErrorMessage('Sale Failed', error.message || 'Failed to record sale(s)');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals for all entries
  const calculateTotals = () => {
    let totalAmount = 0;
    let totalProfit = 0;
    let totalQuantity = 0;
    
    saleEntries.forEach(entry => {
      if (entry.quantity && entry.pricePerUnit) {
        const quantity = parseInt(entry.quantity) || 0;
        const price = parseFloat(entry.pricePerUnit) || 0;
        const amount = quantity * price;
        totalAmount += amount;
        totalQuantity += quantity;
        
        const product = products.find(p => p.id === parseInt(entry.productId));
        if (product) {
          const cost = quantity * (product.costPerKg || product.costPerUnit || 0) * (product.bagWeight || 25);
          totalProfit += (amount - cost);
        }
      }
    });
    
    return { totalAmount, totalProfit, totalQuantity };
  };
  
  const totals = calculateTotals();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xlarge">
      <div className="rounded-lg shadow-xl" style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040'
      }}>
        {/* Header */}
        <div className="flex items-start justify-between px-4 sm:px-6 py-4" style={{
          borderBottom: '1px solid #404040'
        }}>
          <div className="flex-1 pr-2">
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#ebebeb'
            }}>
              {sale ? 'Edit Sale' : 'Record Sales'}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#b3b3b3',
              marginTop: '4px'
            }} className="hidden sm:block">
              Add multiple products for the same date and time
            </p>
          </div>
          <button
            onClick={onClose}
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
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Common Date and Time */}
            <div className="rounded-lg p-4" style={{
              backgroundColor: '#1c1c1c',
              border: '1px solid #404040'
            }}>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-1">
                  <label className="flex items-center gap-2 mb-2" style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ebebeb'
                  }}>
                    <Calendar className="h-4 w-4" style={{ color: '#b3b3b3' }} />
                    Sale Date
                  </label>
                  <input
                    type="date"
                    value={commonDate}
                    onChange={(e) => setCommonDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
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
                <div className="flex-1">
                  <label className="flex items-center gap-2 mb-2" style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ebebeb'
                  }}>
                    <Clock className="h-4 w-4" style={{ color: '#b3b3b3' }} />
                    Sale Time
                  </label>
                  <input
                    type="time"
                    value={commonTime}
                    onChange={(e) => setCommonTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      backgroundColor: '#1c1c1c',
                      color: '#ebebeb',
                      border: errors.time ? '1px solid #ef4444' : '1px solid #404040',
                      borderRadius: '6px',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = errors.time ? '#ef4444' : '#60a5fa';
                      e.target.style.boxShadow = errors.time ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.time ? '#ef4444' : '#404040';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {errors.time && <p style={{
                    marginTop: '4px',
                    fontSize: '14px',
                    color: '#ef4444'
                  }}>{errors.time}</p>}
                </div>
              </div>
            </div>
            
            {/* Sale Entries */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#ebebeb'
                }}>Sale Items</h4>
                {!sale && (
                  <button
                    type="button"
                    onClick={addNewEntry}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                )}
              </div>
              
              {/* Desktop Table Header */}
              <div className="hidden md:block rounded-t-lg" style={{
                backgroundColor: '#1c1c1c',
                border: '1px solid #404040'
              }}>
                <div className="grid grid-cols-12 gap-4 px-4 py-3" style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb'
                }}>
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Price/Unit</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1">Notes</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>
              </div>
              
              {/* Sale Entry Rows - Desktop */}
              <div className="hidden md:block rounded-b-lg overflow-hidden" style={{
                border: '1px solid #404040',
                borderTop: 'none'
              }}>
                {saleEntries.map((entry, index) => {
                  const product = products.find(p => p.id === parseInt(entry.productId));
                  const entryTotal = (parseInt(entry.quantity) || 0) * (parseFloat(entry.pricePerUnit) || 0);

                  return (
                    <div key={entry.id} className="grid grid-cols-12 gap-4 px-4 py-3" style={{
                      backgroundColor: index % 2 === 0 ? '#2a2a2a' : '#1c1c1c',
                      borderBottom: '1px solid #404040'
                    }}>
                      {/* Product Selection */}
                      <div className="col-span-4">
                        <select
                          value={entry.productId}
                          onChange={(e) => handleEntryChange(entry.id, 'productId', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            backgroundColor: '#1c1c1c',
                            color: '#ebebeb',
                            border: errors[`entry_${entry.id}_productId`] ? '1px solid #ef4444' : '1px solid #404040',
                            borderRadius: '6px',
                            outline: 'none'
                          }}
                        >
                          <option value="">Select product...</option>
                          {availableProducts.map(product => {
                            const isDisabled = selectedProductIds.includes(product.id.toString()) && product.id.toString() !== entry.productId;
                            return (
                              <option key={product.id} value={product.id} disabled={isDisabled}>
                                {product.name} ({product.category}) - Stock: {product.currentStock}
                                {isDisabled && ' (Already selected)'}
                              </option>
                            );
                          })}
                        </select>
                        {errors[`entry_${entry.id}_productId`] && (
                          <p style={{
                            marginTop: '4px',
                            fontSize: '12px',
                            color: '#ef4444'
                          }}>{errors[`entry_${entry.id}_productId`]}</p>
                        )}
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={entry.quantity}
                          onChange={(e) => handleEntryChange(entry.id, 'quantity', e.target.value)}
                          min="1"
                          step="1"
                          style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            backgroundColor: '#1c1c1c',
                            color: '#ebebeb',
                            border: errors[`entry_${entry.id}_quantity`] ? '1px solid #ef4444' : '1px solid #404040',
                            borderRadius: '6px',
                            outline: 'none'
                          }}
                          placeholder="0"
                        />
                        {errors[`entry_${entry.id}_quantity`] && (
                          <p style={{
                            marginTop: '4px',
                            fontSize: '12px',
                            color: '#ef4444'
                          }}>{errors[`entry_${entry.id}_quantity`]}</p>
                        )}
                        {product && (
                          <p style={{
                            marginTop: '4px',
                            fontSize: '12px',
                            color: '#b3b3b3'
                          }}>Stock: {product.currentStock}</p>
                        )}
                      </div>
                      
                      {/* Price per Unit */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={entry.pricePerUnit}
                          onChange={(e) => handleEntryChange(entry.id, 'pricePerUnit', e.target.value)}
                          min="0"
                          step="0.01"
                          style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            backgroundColor: '#1c1c1c',
                            color: '#ebebeb',
                            border: errors[`entry_${entry.id}_pricePerUnit`] ? '1px solid #ef4444' : '1px solid #404040',
                            borderRadius: '6px',
                            outline: 'none'
                          }}
                          placeholder="0.00"
                        />
                        {errors[`entry_${entry.id}_pricePerUnit`] && (
                          <p style={{
                            marginTop: '4px',
                            fontSize: '12px',
                            color: '#ef4444'
                          }}>{errors[`entry_${entry.id}_pricePerUnit`]}</p>
                        )}
                      </div>
                      
                      {/* Total */}
                      <div className="col-span-2 flex items-center">
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#ebebeb'
                        }}>
                          {formatCurrency(entryTotal)}
                        </span>
                      </div>
                      
                      {/* Notes */}
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={entry.notes}
                          onChange={(e) => handleEntryChange(entry.id, 'notes', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            backgroundColor: '#1c1c1c',
                            color: '#ebebeb',
                            border: '1px solid #404040',
                            borderRadius: '6px',
                            outline: 'none'
                          }}
                          placeholder="Notes..."
                        />
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-1 flex justify-center">
                        {!sale && saleEntries.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            style={{
                              color: '#ef4444',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.color = '#ef4444'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {saleEntries.map((entry, index) => {
                  const product = products.find(p => p.id === parseInt(entry.productId));
                  const entryTotal = (parseInt(entry.quantity) || 0) * (parseFloat(entry.pricePerUnit) || 0);

                  return (
                    <div key={entry.id} className="rounded-lg p-4" style={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #404040'
                    }}>
                      {/* Mobile Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#b3b3b3'
                        }}>Item #{index + 1}</span>
                        {!sale && saleEntries.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            style={{
                              color: '#ef4444',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.color = '#ef4444'}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      {/* Product Selection */}
                      <div className="mb-3">
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#ebebeb',
                          marginBottom: '4px'
                        }}>Product</label>
                        <select
                          value={entry.productId}
                          onChange={(e) => handleEntryChange(entry.id, 'productId', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            backgroundColor: '#1c1c1c',
                            color: '#ebebeb',
                            border: errors[`entry_${entry.id}_productId`] ? '1px solid #ef4444' : '1px solid #404040',
                            borderRadius: '6px',
                            outline: 'none',
                            transition: 'border-color 0.2s, box-shadow 0.2s'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = errors[`entry_${entry.id}_productId`] ? '#ef4444' : '#60a5fa';
                            e.target.style.boxShadow = errors[`entry_${entry.id}_productId`] ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = errors[`entry_${entry.id}_productId`] ? '#ef4444' : '#404040';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">Select product...</option>
                          {availableProducts.map(product => {
                            const isDisabled = selectedProductIds.includes(product.id.toString()) && product.id.toString() !== entry.productId;
                            return (
                              <option key={product.id} value={product.id} disabled={isDisabled}>
                                {product.name} - Stock: {product.currentStock}
                                {isDisabled && ' (Already selected)'}
                              </option>
                            );
                          })}
                        </select>
                        {errors[`entry_${entry.id}_productId`] && (
                          <p style={{
                            marginTop: '4px',
                            fontSize: '14px',
                            color: '#ef4444'
                          }}>{errors[`entry_${entry.id}_productId`]}</p>
                        )}
                      </div>

                      {/* Quantity and Price Row */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Quantity */}
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#ebebeb',
                            marginBottom: '4px'
                          }}>Quantity</label>
                          <input
                            type="number"
                            value={entry.quantity}
                            onChange={(e) => handleEntryChange(entry.id, 'quantity', e.target.value)}
                            min="1"
                            step="1"
                            inputMode="numeric"
                            style={{
                              width: '100%',
                              padding: '12px',
                              fontSize: '16px',
                              backgroundColor: '#1c1c1c',
                              color: '#ebebeb',
                              border: errors[`entry_${entry.id}_quantity`] ? '1px solid #ef4444' : '1px solid #404040',
                              borderRadius: '6px',
                              outline: 'none',
                              transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = errors[`entry_${entry.id}_quantity`] ? '#ef4444' : '#60a5fa';
                              e.target.style.boxShadow = errors[`entry_${entry.id}_quantity`] ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = errors[`entry_${entry.id}_quantity`] ? '#ef4444' : '#404040';
                              e.target.style.boxShadow = 'none';
                            }}
                            placeholder="0"
                          />
                          {errors[`entry_${entry.id}_quantity`] && (
                            <p style={{
                              marginTop: '4px',
                              fontSize: '12px',
                              color: '#ef4444'
                            }}>{errors[`entry_${entry.id}_quantity`]}</p>
                          )}
                          {product && (
                            <p style={{
                              marginTop: '4px',
                              fontSize: '12px',
                              color: '#b3b3b3'
                            }}>Stock: {product.currentStock}</p>
                          )}
                        </div>

                        {/* Price per Unit */}
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#ebebeb',
                            marginBottom: '4px'
                          }}>Price/Unit</label>
                          <input
                            type="number"
                            value={entry.pricePerUnit}
                            onChange={(e) => handleEntryChange(entry.id, 'pricePerUnit', e.target.value)}
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            style={{
                              width: '100%',
                              padding: '12px',
                              fontSize: '16px',
                              backgroundColor: '#1c1c1c',
                              color: '#ebebeb',
                              border: errors[`entry_${entry.id}_pricePerUnit`] ? '1px solid #ef4444' : '1px solid #404040',
                              borderRadius: '6px',
                              outline: 'none',
                              transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = errors[`entry_${entry.id}_pricePerUnit`] ? '#ef4444' : '#60a5fa';
                              e.target.style.boxShadow = errors[`entry_${entry.id}_pricePerUnit`] ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = errors[`entry_${entry.id}_pricePerUnit`] ? '#ef4444' : '#404040';
                              e.target.style.boxShadow = 'none';
                            }}
                            placeholder="0.00"
                          />
                          {errors[`entry_${entry.id}_pricePerUnit`] && (
                            <p style={{
                              marginTop: '4px',
                              fontSize: '12px',
                              color: '#ef4444'
                            }}>{errors[`entry_${entry.id}_pricePerUnit`]}</p>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mb-3">
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#ebebeb',
                          marginBottom: '4px'
                        }}>Notes (Optional)</label>
                        <input
                          type="text"
                          value={entry.notes}
                          onChange={(e) => handleEntryChange(entry.id, 'notes', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
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
                          placeholder="Add notes..."
                        />
                      </div>

                      {/* Total */}
                      <div className="pt-3" style={{ borderTop: '1px solid #404040' }}>
                        <div className="flex justify-between items-center">
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#b3b3b3'
                          }}>Item Total:</span>
                          <span style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#10b981'
                          }}>
                            {formatCurrency(entryTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {availableProducts.length === 0 && (
                <div className="text-center py-4" style={{
                fontSize: '14px',
                color: '#f59e0b'
              }}>
                  No products with stock available. Add inventory first.
                </div>
              )}
            </div>

            {/* Sale Summary */}
            {totals.totalAmount > 0 && (
              <div className="rounded-lg p-4 md:p-5" style={{
                background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#10b981',
                  marginBottom: '12px'
                }}>Order Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex justify-between sm:block">
                    <p style={{
                      fontSize: '14px',
                      color: '#10b981'
                    }}>Total Items</p>
                    <div className="text-right sm:text-left">
                      <p style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#ebebeb'
                      }}>{totals.totalQuantity}</p>
                      <p style={{
                        fontSize: '12px',
                        color: '#10b981'
                      }}>{saleEntries.length} product{saleEntries.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex justify-between sm:block">
                    <p style={{
                      fontSize: '14px',
                      color: '#10b981'
                    }}>Total Revenue</p>
                    <div className="text-right sm:text-left">
                      <p style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#ebebeb'
                      }}>{formatCurrency(totals.totalAmount)}</p>
                      <p style={{
                        fontSize: '12px',
                        color: '#10b981'
                      }}>Before expenses</p>
                    </div>
                  </div>
                  <div className="flex justify-between sm:block">
                    <p style={{
                      fontSize: '14px',
                      color: '#10b981'
                    }}>Est. Profit</p>
                    <div className="text-right sm:text-left">
                      <p style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: totals.totalProfit >= 0 ? '#ebebeb' : '#ef4444'
                      }}>
                        {formatCurrency(totals.totalProfit)}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#10b981'
                      }}>
                        {totals.totalAmount > 0 ? `${((totals.totalProfit / totals.totalAmount) * 100).toFixed(1)}% margin` : '0% margin'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 pt-4" style={{
              borderTop: '1px solid #404040'
            }}>
              <div className="text-center sm:text-left" style={{
                fontSize: '14px',
                color: '#b3b3b3'
              }}>
                {!sale && saleEntries.length > 1 && (
                  <span className="hidden sm:inline" style={{
                    color: '#b3b3b3'
                  }}>Recording {saleEntries.length} sales for {commonDate}</span>
                )}
              </div>
              <div className="flex flex-row justify-end gap-3">
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
                  disabled={isSubmitting || availableProducts.length === 0}
                  style={{
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: '#10b981',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (isSubmitting || availableProducts.length === 0) ? 'not-allowed' : 'pointer',
                    opacity: (isSubmitting || availableProducts.length === 0) ? 0.5 : 1,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && availableProducts.length > 0) {
                      e.target.style.backgroundColor = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting && availableProducts.length > 0) {
                      e.target.style.backgroundColor = '#10b981';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {sale ? 'Update Sale' : `Record ${saleEntries.length > 1 ? saleEntries.length + ' Sales' : 'Sale'}`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}