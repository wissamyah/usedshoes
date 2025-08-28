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
      partner: 1,
      withdrawal: 1,
      cashFlow: 1,
    },
  },
  containers: [],
  products: [],
  sales: [],
  expenses: [],
  partners: [],
  withdrawals: [],
  cashFlows: [],
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
  DESTROY_PRODUCT: 'DESTROY_PRODUCT',
  
  // Sales actions
  ADD_SALE: 'ADD_SALE',
  UPDATE_SALE: 'UPDATE_SALE',
  DELETE_SALE: 'DELETE_SALE',
  
  // Expense actions
  ADD_EXPENSE: 'ADD_EXPENSE',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  
  // Partner actions
  ADD_PARTNER: 'ADD_PARTNER',
  UPDATE_PARTNER: 'UPDATE_PARTNER',
  DELETE_PARTNER: 'DELETE_PARTNER',
  
  // Withdrawal actions
  ADD_WITHDRAWAL: 'ADD_WITHDRAWAL',
  UPDATE_WITHDRAWAL: 'UPDATE_WITHDRAWAL',
  DELETE_WITHDRAWAL: 'DELETE_WITHDRAWAL',
  
  // Cash Flow actions
  ADD_CASH_FLOW: 'ADD_CASH_FLOW',
  UPDATE_CASH_FLOW: 'UPDATE_CASH_FLOW',
  DELETE_CASH_FLOW: 'DELETE_CASH_FLOW',
  SYNC_FINANCE_DATA: 'SYNC_FINANCE_DATA',
  
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
    
    case DATA_ACTIONS.DESTROY_PRODUCT: {
      const { productId, quantity, reason, notes, date, time } = action.payload;
      
      // Update product stock
      const updatedProducts = state.products.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            currentStock: Math.max(0, product.currentStock - quantity),
          };
        }
        return product;
      });
      
      // Add destruction record as an expense
      const product = state.products.find(p => p.id === productId);
      const destructionExpense = {
        id: state.metadata.nextIds.expense,
        type: 'product_destruction',
        category: 'Loss/Damage',
        description: `Destroyed ${quantity} bag(s) of ${product?.name || 'Unknown Product'} - ${reason}`,
        amount: quantity * (product?.costPerKg || product?.costPerUnit || 0) * (product?.bagWeight || 25),
        date,
        time,
        notes: notes || reason,
        productId,
        quantity,
        createdAt: new Date().toISOString()
      };
      
      return {
        ...state,
        products: updatedProducts,
        expenses: [...state.expenses, destructionExpense],
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
    
    // Partner actions
    case DATA_ACTIONS.ADD_PARTNER: {
      const newPartner = {
        ...action.payload,
        id: `P${state.metadata.nextIds.partner}`,
        capitalAccount: {
          initialInvestment: action.payload.initialInvestment || 0,
          additionalContributions: [],
          totalWithdrawn: 0,
          profitShare: 0
        },
        createdAt: new Date().toISOString()
      };
      
      return {
        ...state,
        partners: [...state.partners, newPartner],
        metadata: {
          ...state.metadata,
          nextIds: {
            ...state.metadata.nextIds,
            partner: state.metadata.nextIds.partner + 1,
          },
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.UPDATE_PARTNER: {
      return {
        ...state,
        partners: state.partners.map(p =>
          p.id === action.payload.id
            ? { ...p, ...action.payload.data }
            : p
        ),
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.DELETE_PARTNER: {
      // Check if partner has withdrawals
      const hasWithdrawals = state.withdrawals.some(w => w.partnerId === action.payload);
      if (hasWithdrawals) {
        return {
          ...state,
          error: 'Cannot delete partner with withdrawal history',
        };
      }
      
      return {
        ...state,
        partners: state.partners.filter(p => p.id !== action.payload),
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    // Withdrawal actions
    case DATA_ACTIONS.ADD_WITHDRAWAL: {
      const withdrawal = {
        ...action.payload,
        id: `W${state.metadata.nextIds.withdrawal}`,
        createdAt: new Date().toISOString()
      };
      
      // Update partner's capital account
      const updatedPartners = state.partners.map(p => {
        if (p.id === action.payload.partnerId) {
          return {
            ...p,
            capitalAccount: {
              ...p.capitalAccount,
              totalWithdrawn: (p.capitalAccount.totalWithdrawn || 0) + action.payload.amount
            }
          };
        }
        return p;
      });
      
      return {
        ...state,
        withdrawals: [...state.withdrawals, withdrawal],
        partners: updatedPartners,
        metadata: {
          ...state.metadata,
          nextIds: {
            ...state.metadata.nextIds,
            withdrawal: state.metadata.nextIds.withdrawal + 1,
          },
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.DELETE_WITHDRAWAL: {
      const withdrawal = state.withdrawals.find(w => w.id === action.payload);
      if (!withdrawal) return state;
      
      // Revert partner's capital account
      const updatedPartners = state.partners.map(p => {
        if (p.id === withdrawal.partnerId) {
          return {
            ...p,
            capitalAccount: {
              ...p.capitalAccount,
              totalWithdrawn: Math.max(0, (p.capitalAccount.totalWithdrawn || 0) - withdrawal.amount)
            }
          };
        }
        return p;
      });
      
      return {
        ...state,
        withdrawals: state.withdrawals.filter(w => w.id !== action.payload),
        partners: updatedPartners,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    // Cash Flow actions
    case DATA_ACTIONS.ADD_CASH_FLOW: {
      const cashFlow = {
        ...action.payload,
        id: `CF${state.metadata.nextIds.cashFlow}`,
        reconciledAt: new Date().toISOString()
      };
      
      return {
        ...state,
        cashFlows: [...state.cashFlows, cashFlow],
        metadata: {
          ...state.metadata,
          nextIds: {
            ...state.metadata.nextIds,
            cashFlow: state.metadata.nextIds.cashFlow + 1,
          },
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.UPDATE_CASH_FLOW: {
      return {
        ...state,
        cashFlows: state.cashFlows.map(cf =>
          cf.id === action.payload.id
            ? { ...cf, ...action.payload.data }
            : cf
        ),
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.DELETE_CASH_FLOW: {
      return {
        ...state,
        cashFlows: state.cashFlows.filter(cf => cf.id !== action.payload),
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
        },
        unsavedChanges: true,
      };
    }
    
    case DATA_ACTIONS.SYNC_FINANCE_DATA: {
      // Sync finance data from existing transactions
      const { partners, cashFlows, withdrawals, financialSummary } = action.payload;
      
      return {
        ...state,
        partners: partners.length > 0 ? partners : state.partners,
        cashFlows: cashFlows.length > 0 ? cashFlows : state.cashFlows,
        withdrawals: withdrawals,
        metadata: {
          ...state.metadata,
          lastUpdated: new Date().toISOString(),
          financialSummary,
        },
        unsavedChanges: true,
      };
    }
    
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

  // Calculate average selling prices for products
  const productsWithAvgPrice = state.products.map(product => {
    const productSales = state.sales.filter(sale => sale.productId === product.id);
    
    if (productSales.length === 0) {
      return { ...product, avgSellingPrice: null, totalSold: 0 };
    }
    
    const totalRevenue = productSales.reduce((sum, sale) => sum + (sale.quantity * sale.pricePerUnit), 0);
    const totalQuantity = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const avgSellingPrice = totalRevenue / totalQuantity;
    
    return {
      ...product,
      avgSellingPrice,
      totalSold: totalQuantity,
      totalRevenue
    };
  });
  
  const value = {
    ...state,
    products: productsWithAvgPrice,
    dispatch,
    
    // Helper functions for common operations
    addContainer: (containerData) => dispatch({ type: DATA_ACTIONS.ADD_CONTAINER, payload: containerData }),
    updateContainer: (id, data) => dispatch({ type: DATA_ACTIONS.UPDATE_CONTAINER, payload: { id, data } }),
    deleteContainer: (containerId) => dispatch({ type: DATA_ACTIONS.DELETE_CONTAINER, payload: containerId }),
    
    addProduct: (productData) => dispatch({ type: DATA_ACTIONS.ADD_PRODUCT, payload: productData }),
    updateProduct: (id, data) => dispatch({ type: DATA_ACTIONS.UPDATE_PRODUCT, payload: { id, data } }),
    deleteProduct: (productId) => dispatch({ type: DATA_ACTIONS.DELETE_PRODUCT, payload: productId }),
    destroyProduct: (destroyData) => dispatch({ type: DATA_ACTIONS.DESTROY_PRODUCT, payload: destroyData }),
    
    addSale: (saleData) => dispatch({ type: DATA_ACTIONS.ADD_SALE, payload: saleData }),
    deleteSale: (saleId) => dispatch({ type: DATA_ACTIONS.DELETE_SALE, payload: saleId }),
    
    addExpense: (expenseData) => dispatch({ type: DATA_ACTIONS.ADD_EXPENSE, payload: expenseData }),
    deleteExpense: (expenseId) => dispatch({ type: DATA_ACTIONS.DELETE_EXPENSE, payload: expenseId }),
    
    // Partner operations
    addPartner: (partnerData) => dispatch({ type: DATA_ACTIONS.ADD_PARTNER, payload: partnerData }),
    updatePartner: (id, data) => dispatch({ type: DATA_ACTIONS.UPDATE_PARTNER, payload: { id, data } }),
    deletePartner: (partnerId) => dispatch({ type: DATA_ACTIONS.DELETE_PARTNER, payload: partnerId }),
    
    // Withdrawal operations
    addWithdrawal: (withdrawalData) => dispatch({ type: DATA_ACTIONS.ADD_WITHDRAWAL, payload: withdrawalData }),
    deleteWithdrawal: (withdrawalId) => dispatch({ type: DATA_ACTIONS.DELETE_WITHDRAWAL, payload: withdrawalId }),
    
    // Cash Flow operations
    addCashFlow: (cashFlowData) => dispatch({ type: DATA_ACTIONS.ADD_CASH_FLOW, payload: cashFlowData }),
    updateCashFlow: (id, data) => dispatch({ type: DATA_ACTIONS.UPDATE_CASH_FLOW, payload: { id, data } }),
    deleteCashFlow: (cashFlowId) => dispatch({ type: DATA_ACTIONS.DELETE_CASH_FLOW, payload: cashFlowId }),
    syncFinanceData: (syncData) => dispatch({ type: DATA_ACTIONS.SYNC_FINANCE_DATA, payload: syncData }),
    
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