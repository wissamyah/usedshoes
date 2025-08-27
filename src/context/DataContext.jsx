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
      
      // Create products from container products
      const newProducts = action.payload.products?.map(p => ({
        id: state.metadata.nextIds.product + p.productIndex,
        name: p.name || `Product ${state.metadata.nextIds.product + p.productIndex}`,
        category: p.category || 'Uncategorized',
        size: p.size || 'Various',
        currentStock: p.quantity,
        containerId: containerId,
        costPerUnit: p.costPerUnit,
        createdAt: new Date().toISOString(),
      })) || [];
      
      return {
        ...state,
        containers: [...state.containers, newContainer],
        products: [...state.products, ...newProducts],
        metadata: {
          ...state.metadata,
          nextIds: {
            ...state.metadata.nextIds,
            container: state.metadata.nextIds.container + 1,
            product: state.metadata.nextIds.product + (newProducts.length || 1),
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
      
      const newSale = {
        ...action.payload,
        id: state.metadata.nextIds.sale,
        productName: product.name,
        costPerUnit: product.costPerUnit,
        profit: (action.payload.pricePerUnit - product.costPerUnit) * action.payload.quantity,
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
    addProduct: (productData) => dispatch({ type: DATA_ACTIONS.ADD_PRODUCT, payload: productData }),
    addSale: (saleData) => dispatch({ type: DATA_ACTIONS.ADD_SALE, payload: saleData }),
    addExpense: (expenseData) => dispatch({ type: DATA_ACTIONS.ADD_EXPENSE, payload: expenseData }),
    
    deleteSale: (saleId) => dispatch({ type: DATA_ACTIONS.DELETE_SALE, payload: saleId }),
    deleteExpense: (expenseId) => dispatch({ type: DATA_ACTIONS.DELETE_EXPENSE, payload: expenseId }),
    
    loadData: (data) => dispatch({ type: DATA_ACTIONS.LOAD_DATA, payload: data }),
    setLoading: (loading) => dispatch({ type: DATA_ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: DATA_ACTIONS.SET_ERROR, payload: error }),
    
    markSaved: () => dispatch({ type: DATA_ACTIONS.MARK_SAVED }),
    markUnsaved: () => dispatch({ type: DATA_ACTIONS.MARK_UNSAVED }),
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