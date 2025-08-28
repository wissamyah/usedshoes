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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <Modal isOpen={true} onClose={onCancel} size="large">
      <div className="bg-white rounded-lg shadow-xl p-5 max-h-[80vh] overflow-y-auto">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {container ? 'Edit Container' : 'Add New Container'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Container Info */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                  Container ID *
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.id ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="e.g., CONT-2024-001"
                />
                {errors.id && <p className="mt-1 text-sm text-red-600">{errors.id}</p>}
              </div>

              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
                  Supplier *
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.supplier ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Supplier name"
                />
                {errors.supplier && <p className="mt-1 text-sm text-red-600">{errors.supplier}</p>}
              </div>

              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Invoice number"
                />
              </div>

              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="customsCost" className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional details about the container..."
              />
            </div>

            {/* Product Selection */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Add Products to Container</h4>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-4">
                <div>
                  <label htmlFor="selectedProduct" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Product
                  </label>
                  <select
                    id="selectedProduct"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label htmlFor="bagQuantity" className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="costPerKg" className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Kg ($)
                  </label>
                  <input
                    type="number"
                    id="costPerKg"
                    name="costPerKg"
                    value={productPurchase.costPerKg}
                    onChange={handleProductPurchaseChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="bagWeight" className="block text-sm font-medium text-gray-700 mb-1">
                    Bag Weight (kg)
                  </label>
                  <select
                    id="bagWeight"
                    name="bagWeight"
                    value={productPurchase.bagWeight}
                    onChange={handleProductPurchaseChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add Product
                </button>
                
                {/* Debug button */}
                <button
                  type="button"
                  onClick={() => console.log('Current form state:', formData)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Debug Form State
                </button>
              </div>

              {/* Products in Container */}
              {formData.products.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-md font-medium text-gray-900 mb-3">Products in Container:</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {formData.products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.productName}</p>
                          <p className="text-sm text-gray-600">
                            {product.bagQuantity} bags × {product.bagWeight}kg × {formatCurrency(product.costPerKg)}/kg = 
                            <span className="font-semibold text-gray-900 ml-1">
                              {formatCurrency(product.bagQuantity * product.costPerKg * product.bagWeight)}
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProductFromContainer(product.productId)}
                          className="ml-4 text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
                          title="Remove product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Total Cost Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="flex justify-between text-sm">
                        <span>Products Total:</span>
                        <span>{formatCurrency(formData.products.reduce((sum, p) => sum + (p.bagQuantity * p.costPerKg * p.bagWeight), 0))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping Cost:</span>
                        <span>{formatCurrency(formData.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Customs/Clearing Cost:</span>
                        <span>{formatCurrency(formData.customsCost)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t border-gray-300 pt-2">
                        <span>Total Container Cost:</span>
                        <span>{formatCurrency(calculateTotalCost())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.products && <p className="mt-1 text-sm text-red-600">{errors.products}</p>}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (container ? 'Update Container' : 'Add Container')}
              </button>
            </div>

            {errors.submit && (
              <div className="text-center">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </form>

          {/* Help Text */}
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Container Setup Guide:</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Select existing products from your catalog</li>
                    <li>For products with 0 stock: new cost overrides existing cost</li>
                    <li>For products with existing stock: costs are averaged based on quantities</li>
                    <li>Each container purchase is tracked separately for cost history</li>
                    <li>Shipping and customs costs are allocated proportionally to each product's actual cost</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}