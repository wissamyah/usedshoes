import { createContext, useContext, useReducer, useEffect } from 'react';

// Initial data structure based on our data model
const initialState = {
  metadata: {
    version: '1.0.0',
    lastUpdated: null,
    nextIds: {
      product: 1,
      container: 1,
      sale: 1,
      expense: 1,
    },
  },
  containers: [],
  products: [],
  sales: [],
  expenses: [],
  // UI state
  loading: false,
  error: null,
  unsavedChanges: false,
};

// Action types
export const DATA_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_DATA: 'LOAD_DATA',
  
  // Container actions
  ADD_CONTAINER: 'ADD_CONTAINER',
  UPDATE_CONTAINER: 'UPDATE_CONTAINER',
  DELETE_CONTAINER: 'DELETE_CONTAINER',
  
  // Product actions
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  UPDATE_STOCK: 'UPDATE_STOCK',
  
  // Sales actions
  ADD_SALE: 'ADD_SALE',
  UPDATE_SALE: 'UPDATE_SALE',
  DELETE_SALE: 'DELETE_SALE',
  
  // Expense actions
  ADD_EXPENSE: 'ADD_EXPENSE',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  
  // Utility actions
  MARK_SAVED: 'MARK_SAVED',
  MARK_UNSAVED: 'MARK_UNSAVED',
};

// Data reducer
function dataReducer(state, action) {
  switch (action.type) {
    case DATA_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };
    
    case DATA_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case DATA_ACTIONS.LOAD_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null,
        unsavedChanges: false,
      };
    
    case DATA_ACTIONS.ADD_CONTAINER: {
      const containerId = `C${state.metadata.nextIds.container}`;
      const newContainer = {
        ...action.payload,
        id: containerId,
        createdAt: new Date().toISOString(),
      };
      
      return {
        ...state,
        containers: [...state.containers, newContainer],
        metadata: {
          ...state.metadata,
          nextIds: {
            ...state.metadata.nextIds,
            container: state.metadata.nextIds.container + 1,
          },
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.ADD_PRODUCT: {
      const newProduct = {
        ...action.payload,
        id: state.metadata.nextIds.product,
        createdAt: new Date().toISOString(),
      };
      
      return {
        ...state,
        products: [...state.products, newProduct],
        metadata: {
          ...state.metadata,
          nextIds: {
            ...state.metadata.nextIds,
            product: state.metadata.nextIds.product + 1,
          },
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.ADD_SALE: {
      const product = state.products.find(p => p.id === action.payload.productId);
      if (!product || product.currentStock < action.payload.quantity) {
        return {
          ...state,
          error: 'Insufficient stock for this sale',
        };
      }
      
      // Calculate actual cost per bag: costPerKg × bagWeight (e.g., $2/kg × 25kg = $50/bag)
      const actualCostPerBag = (product.costPerKg || product.costPerUnit || 0) * (product.bagWeight || 25);
      const newSale = {
        ...action.payload,
        id: state.metadata.nextIds.sale,
        productName: product.name,
        costPerUnit: actualCostPerBag,
        profit: (action.payload.pricePerUnit - actualCostPerBag) * action.payload.quantity,
        totalAmount: action.payload.pricePerUnit * action.payload.quantity,
        createdAt: new Date().toISOString(),
      };
      
      // Update product stock
      const updatedProducts = state.products.map(p =>
        p.id === action.payload.productId
          ? { ...p, currentStock: p.currentStock - action.payload.quantity }
          : p
      );
      
      return {
        ...state,
        sales: [...state.sales, newSale],
        products: updatedProducts,
        metadata: {
          ...state.metadata,
          nextIds: {
            ...state.metadata.nextIds,
            sale: state.metadata.nextIds.sale + 1,
          },
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.ADD_EXPENSE: {
      const newExpense = {
        ...action.payload,
        id: state.metadata.nextIds.expense,
        createdAt: new Date().toISOString(),
      };
      
      return {
        ...state,
        expenses: [...state.expenses, newExpense],
        metadata: {
          ...state.metadata,
          nextIds: {
            ...state.metadata.nextIds,
            expense: state.metadata.nextIds.expense + 1,
          },
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.DELETE_SALE: {
      const sale = state.sales.find(s => s.id === action.payload);
      if (!sale) return state;
      
      // Restore stock
      const updatedProducts = state.products.map(p =>
        p.id === sale.productId
          ? { ...p, currentStock: p.currentStock + sale.quantity }
          : p
      );
      
      return {
        ...state,
        sales: state.sales.filter(s => s.id !== action.payload),
        products: updatedProducts,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.UPDATE_PRODUCT: {
      const updatedProducts = state.products.map(p =>
        p.id === action.payload.id
          ? { ...p, ...action.payload.data }
          : p
      );
      
      return {
        ...state,
        products: updatedProducts,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.DELETE_PRODUCT: {
      // Check if product has sales
      const hasSales = state.sales.some(s => s.productId === action.payload);
      if (hasSales) {
        return {
          ...state,
          error: 'Cannot delete product with sales history',
        };
      }
      
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.UPDATE_CONTAINER: {
      console.log('Updating container with ID:', action.payload.id);
      
      // Find the existing container
      const existingContainer = state.containers.find(c => c.id === action.payload.id);
      if (!existingContainer) {
        console.error('Container not found for update:', action.payload.id);
        return {
          ...state,
          error: 'Container not found',
        };
      }

      const newContainerData = action.payload.data;
      let updatedProducts = [...state.products];

      // Handle product changes if products array is being updated
      if (newContainerData.products && Array.isArray(newContainerData.products)) {
        console.log('Container products are being updated, adjusting stock...');

        // First, revert all stock AND cost changes from the existing container
        if (existingContainer.products && Array.isArray(existingContainer.products)) {
          existingContainer.products.forEach(containerProduct => {
            const productIndex = updatedProducts.findIndex(p => 
              p.id == containerProduct.productId || 
              p.id === parseInt(containerProduct.productId) || 
              p.id === containerProduct.productId.toString()
            );
            
            if (productIndex >= 0) {
              const product = updatedProducts[productIndex];
              // REVERT: Subtract the stock that was previously added when this container was created
              const revertedStock = Math.max(0, product.currentStock - containerProduct.bagQuantity);
              
              console.log(`Reverting stock for product ${product.name}: ${product.currentStock} - ${containerProduct.bagQuantity} = ${revertedStock}`);
              
              // For cost calculation, we need to recalculate weighted average cost after removing the old container contribution
              let revertedCostPerKg = product.costPerKg || product.costPerUnit || 0;
              
              // If we're reverting all stock from this container and it results in 0 stock, reset cost
              if (revertedStock === 0) {
                revertedCostPerKg = 0;
                console.log(`Product ${product.name} stock reduced to 0, resetting cost to 0`);
              } else if (product.currentStock > 0 && containerProduct.bagQuantity > 0) {
                // Attempt to reverse the weighted average calculation
                // This is complex, so we'll recalculate from scratch in the next step
                console.log(`Product ${product.name} will need cost recalculation`);
              }
              
              updatedProducts[productIndex] = {
                ...product,
                currentStock: revertedStock,
                costPerKg: revertedCostPerKg,
                costPerUnit: revertedCostPerKg
              };
            }
          });
        }

        // Calculate allocated shipping and customs cost per bag
        const totalBags = newContainerData.products.reduce((sum, p) => sum + p.bagQuantity, 0);
        const shippingCost = parseFloat(newContainerData.shippingCost) || 0;
        const customsCost = parseFloat(newContainerData.customsCost) || 0;
        const allocatedCostPerBag = totalBags > 0 ? (shippingCost + customsCost) / totalBags : 0;
        
        console.log(`Container overhead allocation: $${shippingCost + customsCost} / ${totalBags} bags = $${allocatedCostPerBag}/bag`);
        
        // Then, apply the new stock and cost changes (add stock since container represents incoming stock)
        newContainerData.products.forEach(containerProduct => {
          const productIndex = updatedProducts.findIndex(p => 
            p.id == containerProduct.productId || 
            p.id === parseInt(containerProduct.productId) || 
            p.id === containerProduct.productId.toString()
          );
          
          if (productIndex >= 0) {
            const product = updatedProducts[productIndex];
            // ADD stock since container represents incoming shipment/stock
            const newStock = product.currentStock + containerProduct.bagQuantity;
            
            console.log(`Adding incoming stock for product ${product.name}: ${product.currentStock} + ${containerProduct.bagQuantity} = ${newStock}`);
            
            // Calculate weighted average cost properly for updates
            let newCostPerKg;
            
            if (product.currentStock === 0) {
              // If current stock is 0, use the new cost directly including allocated costs
              const totalCostPerBag = (containerProduct.costPerKg * containerProduct.bagWeight) + allocatedCostPerBag;
              newCostPerKg = totalCostPerBag / containerProduct.bagWeight;
              console.log(`Product ${product.name} has 0 stock, using new landed cost: ${newCostPerKg}`);
            } else {
              // Calculate weighted average cost including allocated costs
              const bagWeight = containerProduct.bagWeight || product.bagWeight || 25;
              const currentTotalKg = product.currentStock * bagWeight;
              const newTotalKg = containerProduct.bagQuantity * bagWeight;
              const totalKg = currentTotalKg + newTotalKg;
              
              if (totalKg === 0) {
                const totalCostPerBag = (containerProduct.costPerKg * bagWeight) + allocatedCostPerBag;
                newCostPerKg = totalCostPerBag / bagWeight;
              } else {
                const currentTotalValue = currentTotalKg * (product.costPerKg || product.costPerUnit || 0);
                const newTotalValue = (newTotalKg * containerProduct.costPerKg) + (containerProduct.bagQuantity * allocatedCostPerBag);
                const totalValue = currentTotalValue + newTotalValue;
                newCostPerKg = totalValue / totalKg;
              }
              
              console.log(`Product ${product.name} weighted average cost calculation:
                Current: ${product.currentStock} bags × ${bagWeight}kg × $${product.costPerKg || product.costPerUnit || 0}/kg = $${currentTotalKg * (product.costPerKg || product.costPerUnit || 0)}
                New: ${containerProduct.bagQuantity} bags × ${bagWeight}kg × $${containerProduct.costPerKg}/kg + allocated costs = $${(newTotalKg * containerProduct.costPerKg) + (containerProduct.bagQuantity * allocatedCostPerBag)}
                Average Landed Cost: $${newCostPerKg}/kg`);
            }
            
            updatedProducts[productIndex] = {
              ...product,
              currentStock: newStock,
              costPerKg: newCostPerKg,
              costPerUnit: newCostPerKg,
              bagWeight: containerProduct.bagWeight // Update bag weight if different
            };
          } else {
            console.error(`Product not found for container product: ${containerProduct.productId}`);
          }
        });
      }

      // Update the container
      const updatedContainers = state.containers.map(c =>
        c.id === action.payload.id
          ? { ...c, ...newContainerData, updatedAt: new Date().toISOString() }
          : c
      );
      
      console.log('Container updated successfully with stock adjustments');
      
      return {
        ...state,
        containers: updatedContainers,
        products: updatedProducts,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.DELETE_CONTAINER: {
      console.log('Deleting container with ID:', action.payload);
      
      // Find the container to be deleted
      const containerToDelete = state.containers.find(c => c.id === action.payload);
      if (!containerToDelete) {
        console.error('Container not found for deletion:', action.payload);
        return {
          ...state,
          error: 'Container not found',
        };
      }

      // Check if any products from this container have sales history
      if (containerToDelete.products && Array.isArray(containerToDelete.products)) {
        const productsWithSales = [];
        
        containerToDelete.products.forEach(containerProduct => {
          const productId = containerProduct.productId;
          const hasSales = state.sales.some(sale => 
            sale.productId == productId || 
            sale.productId === parseInt(productId) || 
            sale.productId === productId.toString()
          );
          
          if (hasSales) {
            const product = state.products.find(p => 
              p.id == productId || 
              p.id === parseInt(productId) || 
              p.id === productId.toString()
            );
            productsWithSales.push(product?.name || `Product ID ${productId}`);
          }
        });
        
        if (productsWithSales.length > 0) {
          const errorMessage = `Cannot delete container: The following products from this container have sales history: ${productsWithSales.join(', ')}. Containers with sold products cannot be deleted to maintain sales records integrity.`;
          console.error('Container deletion blocked due to sales history:', productsWithSales);
          return {
            ...state,
            error: errorMessage,
          };
        }
      }

      // Check if deletion would cause any stock issues (e.g., negative stock due to sales)
      const stockIssues = [];
      let updatedProducts = [...state.products];
      
      if (containerToDelete.products && Array.isArray(containerToDelete.products)) {
        // Check each product for potential issues
        containerToDelete.products.forEach(containerProduct => {
          const product = updatedProducts.find(p => 
            p.id == containerProduct.productId || 
            p.id === parseInt(containerProduct.productId) || 
            p.id === containerProduct.productId.toString()
          );
          
          if (product) {
            const projectedStock = product.currentStock - containerProduct.bagQuantity;
            if (projectedStock < 0) {
              stockIssues.push({
                productName: product.name,
                currentStock: product.currentStock,
                containerQuantity: containerProduct.bagQuantity,
                shortage: Math.abs(projectedStock)
              });
            }
          }
        });

        // If there are stock issues, prevent deletion and provide detailed error
        if (stockIssues.length > 0) {
          const errorMessage = `Cannot delete container: Would result in negative stock for ${stockIssues.length} product(s). ` +
            stockIssues.map(issue => 
              `${issue.productName} (shortage: ${issue.shortage} bags)`
            ).join(', ');
          
          console.error('Container deletion blocked due to stock issues:', stockIssues);
          return {
            ...state,
            error: errorMessage,
          };
        }

        // If no issues, proceed with stock reversion
        containerToDelete.products.forEach(containerProduct => {
          const productIndex = updatedProducts.findIndex(p => 
            p.id == containerProduct.productId || 
            p.id === parseInt(containerProduct.productId) || 
            p.id === containerProduct.productId.toString()
          );
          
          if (productIndex >= 0) {
            const product = updatedProducts[productIndex];
            const revertedStock = product.currentStock - containerProduct.bagQuantity;
            
            console.log(`Reverting stock for product ${product.name}: ${product.currentStock} - ${containerProduct.bagQuantity} = ${revertedStock}`);
            
            let updatedProduct = {
              ...product,
              currentStock: revertedStock
            };
            
            // If stock becomes 0, we might want to consider cost implications
            if (revertedStock === 0) {
              console.log(`Product ${product.name} stock reduced to 0 after container deletion`);
              // Could potentially reset cost to 0 here if business logic requires it
              // updatedProduct.costPerKg = 0;
              // updatedProduct.costPerUnit = 0;
            }
            
            updatedProducts[productIndex] = updatedProduct;
          } else {
            console.error(`Product not found for container product: ${containerProduct.productId}`);
          }
        });
      }

      // Remove the container
      const filteredContainers = state.containers.filter(c => c.id !== action.payload);
      
      console.log('Containers before deletion:', state.containers.length);
      console.log('Containers after deletion:', filteredContainers.length);
      console.log('Products stock reverted for container deletion');
      
      return {
        ...state,
        containers: filteredContainers,
        products: updatedProducts,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }

    case DATA_ACTIONS.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    
    case DATA_ACTIONS.MARK_SAVED:
      return { ...state, unsavedChanges: false };
    
    case DATA_ACTIONS.MARK_UNSAVED:
      return { ...state, unsavedChanges: true };
    
    default:
      return state;
  }
}

// Create context
const DataContext = createContext(null);

// Context provider
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Auto-save detection
  useEffect(() => {
    if (state.unsavedChanges) {
      const timer = setTimeout(() => {
        // This will trigger auto-save via GitHub context
        console.log('Auto-save triggered due to unsaved changes');
      }, 30000); // Auto-save after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [state.unsavedChanges]);

  const value = {
    ...state,
    dispatch,
    
    // Helper functions for common operations
    addContainer: (containerData) => dispatch({ type: DATA_ACTIONS.ADD_CONTAINER, payload: containerData }),
    updateContainer: (id, data) => dispatch({ type: DATA_ACTIONS.UPDATE_CONTAINER, payload: { id, data } }),
    deleteContainer: (containerId) => dispatch({ type: DATA_ACTIONS.DELETE_CONTAINER, payload: containerId }),
    
    addProduct: (productData) => dispatch({ type: DATA_ACTIONS.ADD_PRODUCT, payload: productData }),
    updateProduct: (id, data) => dispatch({ type: DATA_ACTIONS.UPDATE_PRODUCT, payload: { id, data } }),
    deleteProduct: (productId) => dispatch({ type: DATA_ACTIONS.DELETE_PRODUCT, payload: productId }),
    
    addSale: (saleData) => dispatch({ type: DATA_ACTIONS.ADD_SALE, payload: saleData }),
    deleteSale: (saleId) => dispatch({ type: DATA_ACTIONS.DELETE_SALE, payload: saleId }),
    
    addExpense: (expenseData) => dispatch({ type: DATA_ACTIONS.ADD_EXPENSE, payload: expenseData }),
    deleteExpense: (expenseId) => dispatch({ type: DATA_ACTIONS.DELETE_EXPENSE, payload: expenseId }),
    
    loadData: (data) => dispatch({ type: DATA_ACTIONS.LOAD_DATA, payload: data }),
    setLoading: (loading) => dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error }),
    
    markSaved: () => dispatch({ type: DATA_ACTIONS.MARK_SAVED }),
    markUnsaved: () => dispatch({ type: DATA_ACTIONS.MARK_UNSAVED }),
    
    // Alias for compatibility
    hasUnsavedChanges: state.unsavedChanges,
    markChanged: () => dispatch({ type: DATA_ACTIONS.MARK_UNSAVED }),
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to use the data context
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataContext;