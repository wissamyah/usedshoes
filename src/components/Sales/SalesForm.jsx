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
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex-1 pr-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {sale ? 'Edit Sale' : 'Record Sales'}
            </h3>
            <p className="text-sm text-gray-500 mt-1 hidden sm:block">
              Add multiple products for the same date and time
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Common Date and Time */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    Sale Date
                  </label>
                  <input
                    type="date"
                    value={commonDate}
                    onChange={(e) => setCommonDate(e.target.value)}
                    className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Sale Time
                  </label>
                  <input
                    type="time"
                    value={commonTime}
                    onChange={(e) => setCommonTime(e.target.value)}
                    className={`w-full px-3 py-3 sm:py-2 text-base sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.time ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                </div>
              </div>
            </div>
            
            {/* Sale Entries */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base sm:text-sm font-medium text-gray-700">Sale Items</h4>
                {!sale && (
                  <button
                    type="button"
                    onClick={addNewEntry}
                    className="inline-flex items-center px-3 py-2 sm:py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 touch-manipulation"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                )}
              </div>
              
              {/* Desktop Table Header */}
              <div className="hidden md:block bg-gray-50 border border-gray-200 rounded-t-lg">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-700">
                  <div className="col-span-4">Product</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Price/Unit</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1">Notes</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>
              </div>
              
              {/* Sale Entry Rows - Desktop */}
              <div className="hidden md:block border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
                {saleEntries.map((entry, index) => {
                  const product = products.find(p => p.id === parseInt(entry.productId));
                  const entryTotal = (parseInt(entry.quantity) || 0) * (parseFloat(entry.pricePerUnit) || 0);

                  return (
                    <div key={entry.id} className={`grid grid-cols-12 gap-4 px-4 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 last:border-b-0`}>
                      {/* Product Selection */}
                      <div className="col-span-4">
                        <select
                          value={entry.productId}
                          onChange={(e) => handleEntryChange(entry.id, 'productId', e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors[`entry_${entry.id}_productId`] ? 'border-red-300' : 'border-gray-300'
                          }`}
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
                          <p className="mt-1 text-xs text-red-600">{errors[`entry_${entry.id}_productId`]}</p>
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
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors[`entry_${entry.id}_quantity`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0"
                        />
                        {errors[`entry_${entry.id}_quantity`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`entry_${entry.id}_quantity`]}</p>
                        )}
                        {product && (
                          <p className="mt-1 text-xs text-gray-500">Stock: {product.currentStock}</p>
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
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors[`entry_${entry.id}_pricePerUnit`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                        {errors[`entry_${entry.id}_pricePerUnit`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`entry_${entry.id}_pricePerUnit`]}</p>
                        )}
                      </div>
                      
                      {/* Total */}
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(entryTotal)}
                        </span>
                      </div>
                      
                      {/* Notes */}
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={entry.notes}
                          onChange={(e) => handleEntryChange(entry.id, 'notes', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Notes..."
                        />
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-1 flex justify-center">
                        {!sale && saleEntries.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
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
                    <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {/* Mobile Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-500">Item #{index + 1}</span>
                        {!sale && saleEntries.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEntry(entry.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      {/* Product Selection */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                        <select
                          value={entry.productId}
                          onChange={(e) => handleEntryChange(entry.id, 'productId', e.target.value)}
                          className={`w-full px-3 py-2.5 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors[`entry_${entry.id}_productId`] ? 'border-red-300' : 'border-gray-300'
                          }`}
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
                          <p className="mt-1 text-sm text-red-600">{errors[`entry_${entry.id}_productId`]}</p>
                        )}
                      </div>

                      {/* Quantity and Price Row */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={entry.quantity}
                            onChange={(e) => handleEntryChange(entry.id, 'quantity', e.target.value)}
                            min="1"
                            step="1"
                            inputMode="numeric"
                            className={`w-full px-3 py-2.5 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              errors[`entry_${entry.id}_quantity`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0"
                          />
                          {errors[`entry_${entry.id}_quantity`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`entry_${entry.id}_quantity`]}</p>
                          )}
                          {product && (
                            <p className="mt-1 text-xs text-gray-500">Stock: {product.currentStock}</p>
                          )}
                        </div>

                        {/* Price per Unit */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price/Unit</label>
                          <input
                            type="number"
                            value={entry.pricePerUnit}
                            onChange={(e) => handleEntryChange(entry.id, 'pricePerUnit', e.target.value)}
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            className={`w-full px-3 py-2.5 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                              errors[`entry_${entry.id}_pricePerUnit`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                          {errors[`entry_${entry.id}_pricePerUnit`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`entry_${entry.id}_pricePerUnit`]}</p>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <input
                          type="text"
                          value={entry.notes}
                          onChange={(e) => handleEntryChange(entry.id, 'notes', e.target.value)}
                          className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Add notes..."
                        />
                      </div>

                      {/* Total */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Item Total:</span>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(entryTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {availableProducts.length === 0 && (
                <div className="text-center py-4 text-sm text-orange-600">
                  No products with stock available. Add inventory first.
                </div>
              )}
            </div>

            {/* Sale Summary */}
            {totals.totalAmount > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 md:p-5 border border-green-200">
                <h4 className="text-base font-semibold text-green-900 mb-3">Order Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex justify-between sm:block">
                    <p className="text-sm text-green-700">Total Items</p>
                    <div className="text-right sm:text-left">
                      <p className="text-xl font-bold text-green-900">{totals.totalQuantity}</p>
                      <p className="text-xs text-green-600">{saleEntries.length} product{saleEntries.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex justify-between sm:block">
                    <p className="text-sm text-green-700">Total Revenue</p>
                    <div className="text-right sm:text-left">
                      <p className="text-xl font-bold text-green-900">{formatCurrency(totals.totalAmount)}</p>
                      <p className="text-xs text-green-600">Before expenses</p>
                    </div>
                  </div>
                  <div className="flex justify-between sm:block">
                    <p className="text-sm text-green-700">Est. Profit</p>
                    <div className="text-right sm:text-left">
                      <p className={`text-xl font-bold ${totals.totalProfit >= 0 ? 'text-green-900' : 'text-red-600'}`}>
                        {formatCurrency(totals.totalProfit)}
                      </p>
                      <p className="text-xs text-green-600">
                        {totals.totalAmount > 0 ? `${((totals.totalProfit / totals.totalAmount) * 100).toFixed(1)}% margin` : '0% margin'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                {!sale && saleEntries.length > 1 && (
                  <span className="hidden sm:inline">Recording {saleEntries.length} sales for {commonDate}</span>
                )}
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:space-x-0">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableProducts.length === 0}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-3 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 border border-transparent rounded-md shadow-sm hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
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