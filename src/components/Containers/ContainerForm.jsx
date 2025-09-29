import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { validateContainerForm } from '../../utils/validation';
import Modal from '../UI/Modal';

export default function ContainerForm({ container, onSubmit, onCancel }) {
  const { products, updateProduct } = useData();
  const { showErrorMessage } = useUI();
  const [formData, setFormData] = useState({
    id: '',
    supplier: '',
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    shippingCost: '0',
    customsCost: '0',
    description: '',
    products: [] // Array of { productId, bagQuantity, costPerKg, bagWeight }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productPurchase, setProductPurchase] = useState({
    bagQuantity: '',
    costPerKg: '',
    bagWeight: '25'
  });

  useEffect(() => {
    if (container) {
      setFormData({
        id: container.id || '',
        supplier: container.supplier || '',
        invoiceNumber: container.invoiceNumber || '',
        purchaseDate: container.purchaseDate || new Date().toISOString().split('T')[0],
        shippingCost: container.shippingCost?.toString() || '0',
        customsCost: container.customsCost?.toString() || '0',
        description: container.description || '',
        products: container.products || []
      });
    }
  }, [container]);
  
  // Debug: Monitor formData.products changes
  useEffect(() => {
    console.log('formData.products updated:', formData.products);
  }, [formData.products]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProductPurchaseChange = (e) => {
    const { name, value } = e.target;
    setProductPurchase(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProductToContainer = () => {
    console.log('Adding product to container:', {
      selectedProduct,
      productPurchase,
      formData: formData.products,
      isProductsArray: Array.isArray(formData.products),
      formDataType: typeof formData,
      fullFormData: formData
    });
    
    if (!selectedProduct || !productPurchase.bagQuantity || !productPurchase.costPerKg) {
      showErrorMessage('Incomplete Product Details', 'Please select a product and fill in all purchase details');
      return;
    }
    
    // Ensure products is an array
    if (!Array.isArray(formData.products)) {
      console.error('formData.products is not an array!', formData.products);
      setFormData(prev => ({ ...prev, products: [] }));
      return;
    }

    const product = products.find(p => p.id == selectedProduct || p.id === parseInt(selectedProduct) || p.id === selectedProduct.toString());
    console.log('Looking for product with ID:', selectedProduct);
    console.log('Available products:', products.map(p => ({id: p.id, idType: typeof p.id, name: p.name})));
    console.log('selectedProduct type:', typeof selectedProduct);
    console.log('Found product:', product);
    
    if (!product) {
      console.error('Product not found! Selected ID:', selectedProduct, 'Available products:', products.map(p => ({id: p.id, name: p.name})));
      showErrorMessage('Product Not Found', 'Selected product not found. Please try again.');
      return;
    }

    const existingProductIndex = formData.products.findIndex(p => p.productId == selectedProduct || p.productId === parseInt(selectedProduct) || p.productId === selectedProduct.toString());
    
    if (existingProductIndex >= 0) {
      // Update existing product entry
      console.log('Updating existing product at index:', existingProductIndex);
      
      setFormData(prev => {
        const updatedProducts = prev.products.map((p, index) => 
          index === existingProductIndex
            ? {
                ...p,
                bagQuantity: parseInt(productPurchase.bagQuantity),
                costPerKg: parseFloat(productPurchase.costPerKg),
                bagWeight: parseFloat(productPurchase.bagWeight)
              }
            : p
        );
        
        console.log('Updated existing product, new products array:', updatedProducts);
        
        return {
          ...prev,
          products: updatedProducts
        };
      });
    } else {
      // Add new product entry
      const newProduct = {
        productId: selectedProduct,
        productName: product.name,
        bagQuantity: parseInt(productPurchase.bagQuantity),
        costPerKg: parseFloat(productPurchase.costPerKg),
        bagWeight: parseFloat(productPurchase.bagWeight)
      };
      
      console.log('Creating new product:', newProduct);
      console.log('Current products before adding:', formData.products);
      
      const updatedProducts = [...formData.products, newProduct];
      console.log('Updated products array:', updatedProducts);
      
      setFormData(prev => {
        const newFormData = {
          ...prev,
          products: updatedProducts
        };
        console.log('Setting new form data:', newFormData);
        return newFormData;
      });
    }

    // Reset form
    setSelectedProduct('');
    setProductPurchase({
      bagQuantity: '',
      costPerKg: '',
      bagWeight: '25'
    });
    
    console.log('Product added successfully. Updated formData:', formData.products);
  };

  const removeProductFromContainer = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.productId !== productId)
    }));
  };

  const calculateTotalCost = () => {
    const productsCost = formData.products.reduce((sum, p) => {
      return sum + (p.bagQuantity * p.costPerKg * p.bagWeight);
    }, 0);
    const shippingCost = parseFloat(formData.shippingCost) || 0;
    const customsCost = parseFloat(formData.customsCost) || 0;
    return productsCost + shippingCost + customsCost;
  };

  const calculateWeightedAverageCost = (currentStock, currentCostPerKg, newBags, newCostPerKg, bagWeight, allocatedCostPerBag = 0) => {
    const currentTotalKg = currentStock * bagWeight;
    const newTotalKg = newBags * bagWeight;
    const totalKg = currentTotalKg + newTotalKg;
    
    if (totalKg === 0) return newCostPerKg;
    
    const currentTotalValue = currentTotalKg * currentCostPerKg;
    const newTotalValue = (newTotalKg * newCostPerKg) + (newBags * allocatedCostPerBag);
    const totalValue = currentTotalValue + newTotalValue;
    
    return totalValue / totalKg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Submitting container form:', {
      id: formData.id,
      supplier: formData.supplier,
      productsCount: formData.products.length,
      products: formData.products
    });
    
    // Basic validation
    if (!formData.id || !formData.supplier || formData.products.length === 0) {
      const validationErrors = {
        id: !formData.id ? 'Container ID is required' : '',
        supplier: !formData.supplier ? 'Supplier is required' : '',
        products: formData.products.length === 0 ? 'At least one product is required' : ''
      };
      
      console.log('Validation failed:', validationErrors);
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate total cost
      const totalCost = calculateTotalCost();
      
      const containerData = {
        ...formData,
        shippingCost: parseFloat(formData.shippingCost) || 0,
        customsCost: parseFloat(formData.customsCost) || 0,
        totalCost
      };

      // Update product stock and costs ONLY for NEW containers
      // For edits, DataContext UPDATE_CONTAINER handles stock management properly
      if (!container) {
        console.log('NEW CONTAINER: Updating product stocks for container products:', formData.products);
        
        for (const containerProduct of formData.products) {
          console.log('Processing container product:', containerProduct);
          const product = products.find(p => p.id == containerProduct.productId || p.id === parseInt(containerProduct.productId) || p.id === containerProduct.productId.toString());
          
          console.log('Found product for update:', product);
          
          if (product) {
            // Calculate allocated shipping and customs cost per bag
            const totalBags = formData.products.reduce((sum, p) => sum + p.bagQuantity, 0);
            const shippingCost = parseFloat(formData.shippingCost) || 0;
            const customsCost = parseFloat(formData.customsCost) || 0;
            const allocatedCostPerBag = totalBags > 0 ? (shippingCost + customsCost) / totalBags : 0;
            
            let newCostPerKg;
            
            if (product.currentStock === 0) {
              // If stock is 0, override with new cost including allocated costs
              const totalCostPerBag = (containerProduct.costPerKg * containerProduct.bagWeight) + allocatedCostPerBag;
              newCostPerKg = totalCostPerBag / containerProduct.bagWeight;
            } else {
              // Calculate weighted average cost including allocated costs
              newCostPerKg = calculateWeightedAverageCost(
                product.currentStock,
                product.costPerKg || product.costPerUnit || 0,
                containerProduct.bagQuantity,
                containerProduct.costPerKg,
                containerProduct.bagWeight,
                allocatedCostPerBag
              );
            }

            const updatedProduct = {
              ...product,
              currentStock: product.currentStock + containerProduct.bagQuantity,
              costPerKg: newCostPerKg,
              costPerUnit: newCostPerKg, // Keep for backward compatibility
              bagWeight: containerProduct.bagWeight // Update bag weight if different
            };

            console.log('Updating product:', {
              productId: product.id,
              oldStock: product.currentStock,
              addedBags: containerProduct.bagQuantity,
              newStock: updatedProduct.currentStock,
              oldCost: product.costPerKg || product.costPerUnit || 0,
              newCost: newCostPerKg
            });

            await updateProduct(product.id, updatedProduct);
            console.log('Product updated successfully');
          } else {
            console.error('Product not found for ID:', containerProduct.productId, 'Available products:', products.map(p => ({id: p.id, name: p.name})));
          }
        }
      } else {
        console.log('EDITING CONTAINER: Skipping manual product stock updates - DataContext handles this');
      }

      await onSubmit(containerData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to save container' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const formatCurrency = (amount, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount || 0);
  };

  return (
    <Modal isOpen={true} onClose={onCancel} size="large">
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        padding: '20px',
        maxHeight: '80vh',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#404040 #2a2a2a'
      }}>
        <style dangerouslySetInnerHTML={{
          __html: `
            div[style*="maxHeight: 80vh"]::-webkit-scrollbar {
              width: 8px;
            }
            div[style*="maxHeight: 80vh"]::-webkit-scrollbar-track {
              background: #2a2a2a;
            }
            div[style*="maxHeight: 80vh"]::-webkit-scrollbar-thumb {
              background: #404040;
              border-radius: 4px;
            }
            div[style*="maxHeight: 80vh"]::-webkit-scrollbar-thumb:hover {
              background: #505050;
            }
          `
        }} />
        <div style={{ marginTop: '12px' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#ebebeb'
            }}>
              {container ? 'Edit Container' : 'Add New Container'}
            </h3>
            <button
              onClick={handleCancel}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Container Info */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="id" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Container ID *
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: errors.id ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.id ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.id ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.id ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                  placeholder="Container ID"
                />
                {errors.id && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.id}</p>}
              </div>

              <div>
                <label htmlFor="supplier" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Supplier *
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: errors.supplier ? '1px solid #ef4444' : '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = errors.supplier ? '#ef4444' : '#60a5fa';
                    e.target.style.boxShadow = errors.supplier ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.supplier ? '#ef4444' : '#404040';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                  placeholder="Supplier"
                />
                {errors.supplier && <p style={{
                  marginTop: '4px',
                  fontSize: '14px',
                  color: '#ef4444'
                }}>{errors.supplier}</p>}
              </div>

              <div>
                <label htmlFor="invoiceNumber" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
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
                  placeholder="Invoice #"
                />
              </div>

              <div>
                <label htmlFor="purchaseDate" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Purchase Date *
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
                    backgroundColor: '#1c1c1c',
                    color: '#ebebeb',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    colorScheme: 'dark'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#60a5fa';
                    e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#404040';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>

              <div>
                <label htmlFor="shippingCost" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  id="shippingCost"
                  name="shippingCost"
                  value={formData.shippingCost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
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
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="customsCost" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ebebeb',
                  marginBottom: '4px'
                }}>
                  Customs/Clearing Cost ($)
                </label>
                <input
                  type="number"
                  id="customsCost"
                  name="customsCost"
                  value={formData.customsCost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  style={{
                    marginTop: '4px',
                    display: 'block',
                    width: '100%',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px',
                    fontSize: '14px',
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
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
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
                  padding: '8px 12px',
                  fontSize: '14px',
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
                placeholder="Notes..."
              />
            </div>

            {/* Product Selection */}
            <div style={{ borderTop: '1px solid #404040', paddingTop: '24px' }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '500',
                color: '#ebebeb',
                marginBottom: '16px'
              }}>Add Products to Container</h4>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-4">
                <div>
                  <label htmlFor="selectedProduct" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ebebeb',
                    marginBottom: '4px'
                  }}>
                    Select Product
                  </label>
                  <select
                    id="selectedProduct"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #404040',
                      borderRadius: '6px',
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
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bagQuantity" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ebebeb',
                    marginBottom: '4px'
                  }}>
                    Bags Quantity
                  </label>
                  <input
                    type="number"
                    id="bagQuantity"
                    name="bagQuantity"
                    value={productPurchase.bagQuantity}
                    onChange={handleProductPurchaseChange}
                    min="1"
                    step="1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #404040',
                      borderRadius: '6px',
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
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="costPerKg" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ebebeb',
                    marginBottom: '4px'
                  }}>
                    Cost per Kg ($)
                  </label>
                  <input
                    type="number"
                    id="costPerKg"
                    name="costPerKg"
                    value={productPurchase.costPerKg}
                    onChange={handleProductPurchaseChange}
                    min="0"
                    step="0.0001"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #404040',
                      borderRadius: '6px',
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
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0.0000"
                  />
                </div>

                <div>
                  <label htmlFor="bagWeight" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ebebeb',
                    marginBottom: '4px'
                  }}>
                    Bag Weight (kg)
                  </label>
                  <select
                    id="bagWeight"
                    name="bagWeight"
                    value={productPurchase.bagWeight}
                    onChange={handleProductPurchaseChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #404040',
                      borderRadius: '6px',
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
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="20">20 kg per bag</option>
                    <option value="25">25 kg per bag</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <button
                  type="button"
                  onClick={addProductToContainer}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '6px',
                    color: '#ffffff',
                    backgroundColor: '#16a34a',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#15803d';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#16a34a';
                  }}
                >
                  Add Product
                </button>

                {/* Debug button */}
                <button
                  type="button"
                  onClick={() => console.log('Current form state:', formData)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    border: '1px solid #404040',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '6px',
                    color: '#b3b3b3',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s'
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
                  Debug Form State
                </button>
              </div>

              {/* Products in Container */}
              {formData.products.length > 0 && (
                <div className="mt-4">
                  <h5 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#ebebeb',
                    marginBottom: '12px'
                  }}>Products in Container:</h5>
                  <div style={{
                    backgroundColor: '#333333',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #404040'
                  }}>
                    {formData.products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between py-2" style={{
                        borderBottom: index < formData.products.length - 1 ? '1px solid #404040' : 'none'
                      }}>
                        <div className="flex-1">
                          <p style={{ fontWeight: '500', color: '#ebebeb' }}>{product.productName}</p>
                          <p style={{ fontSize: '14px', color: '#b3b3b3' }}>
                            {product.bagQuantity} bags × {product.bagWeight}kg × {formatCurrency(product.costPerKg, 4)}/kg =
                            <span style={{ fontWeight: '600', color: '#ebebeb', marginLeft: '4px' }}>
                              {formatCurrency(product.bagQuantity * product.costPerKg * product.bagWeight)}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProductFromContainer(product.productId)}
                          style={{
                            marginLeft: '16px',
                            color: '#ef4444',
                            padding: '4px',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#dc2626';
                            e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#ef4444';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                          title="Remove product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Total Cost Summary */}
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #404040' }}>
                      <div className="flex justify-between" style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ color: '#b3b3b3' }}>Products Total:</span>
                        <span style={{ color: '#ebebeb' }}>{formatCurrency(formData.products.reduce((sum, p) => sum + (p.bagQuantity * p.costPerKg * p.bagWeight), 0))}</span>
                      </div>
                      <div className="flex justify-between" style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ color: '#b3b3b3' }}>Shipping Cost:</span>
                        <span style={{ color: '#ebebeb' }}>{formatCurrency(formData.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between" style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <span style={{ color: '#b3b3b3' }}>Customs/Clearing Cost:</span>
                        <span style={{ color: '#ebebeb' }}>{formatCurrency(formData.customsCost)}</span>
                      </div>
                      <div className="flex justify-between" style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        borderTop: '1px solid #404040',
                        paddingTop: '8px',
                        marginTop: '8px'
                      }}>
                        <span style={{ color: '#ebebeb' }}>Total Container Cost:</span>
                        <span style={{ color: '#ebebeb' }}>{formatCurrency(calculateTotalCost())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.products && <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: '#ef4444'
              }}>{errors.products}</p>}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3" style={{
              paddingTop: '24px',
              borderTop: '1px solid #404040'
            }}>
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
                  outline: 'none',
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
                  outline: 'none',
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
              >
                {isSubmitting ? 'Saving...' : (container ? 'Update Container' : 'Add Container')}
              </button>
            </div>

            {errors.submit && (
              <div className="text-center">
                <p style={{ fontSize: '14px', color: '#ef4444' }}>{errors.submit}</p>
              </div>
            )}
          </form>

        </div>
      </div>
    </Modal>
  );
}