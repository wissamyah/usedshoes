import { createContext, useContext, useReducer, useEffect, useState } from 'react';

// UI state structure
const initialState = {
  // Modal management
  modals: {
    addProduct: { isOpen: false, data: null },
    editProduct: { isOpen: false, data: null },
    addContainer: { isOpen: false, data: null },
    editContainer: { isOpen: false, data: null },
    addSale: { isOpen: false, data: null },
    editSale: { isOpen: false, data: null },
    addExpense: { isOpen: false, data: null },
    editExpense: { isOpen: false, data: null },
    confirmDelete: { isOpen: false, data: null },
    gitHubSettings: { isOpen: false, data: null },
  },
  
  // Loading states
  loading: {
    global: false,
    sync: false,
    export: false,
    delete: false,
  },
  
  // Notifications/Toast messages
  notifications: [],
  
  // UI preferences
  preferences: {
    theme: 'light',
    autoSave: true,
    syncInterval: 300000, // 5 minutes in milliseconds
  },
  
  // Form states
  forms: {
    hasUnsavedChanges: false,
    activeForm: null,
  },
};

// Action types
export const UI_ACTIONS = {
  // Modal actions
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  CLOSE_ALL_MODALS: 'CLOSE_ALL_MODALS',
  
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  
  // Notification actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // Preference actions
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  
  // Form actions
  SET_FORM_STATE: 'SET_FORM_STATE',
  CLEAR_FORM_STATE: 'CLEAR_FORM_STATE',
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// UI reducer
function uiReducer(state, action) {
  switch (action.type) {
    case UI_ACTIONS.OPEN_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modalName]: {
            isOpen: true,
            data: action.payload.data || null,
          },
        },
      };
    
    case UI_ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload]: {
            isOpen: false,
            data: null,
          },
        },
      };
    
    case UI_ACTIONS.CLOSE_ALL_MODALS:
      return {
        ...state,
        modals: Object.keys(state.modals).reduce((acc, key) => ({
          ...acc,
          [key]: { isOpen: false, data: null },
        }), {}),
      };
    
    case UI_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.value,
        },
      };
    
    case UI_ACTIONS.ADD_NOTIFICATION: {
      const notification = {
        id: Date.now() + Math.random(),
        type: action.payload.type || NOTIFICATION_TYPES.INFO,
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        createdAt: new Date().toISOString(),
      };
      
      return {
        ...state,
        notifications: [...state.notifications, notification],
      };
    }
    
    case UI_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case UI_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };
    
    case UI_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };
    
    case UI_ACTIONS.SET_FORM_STATE:
      return {
        ...state,
        forms: {
          ...state.forms,
          ...action.payload,
        },
      };
    
    case UI_ACTIONS.CLEAR_FORM_STATE:
      return {
        ...state,
        forms: {
          hasUnsavedChanges: false,
          activeForm: null,
        },
      };
    
    default:
      return state;
  }
}

// Create context
const UIContext = createContext(null);

// Context provider
export function UIProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Helper functions
  const openModal = (modalName, data = null) => {
    dispatch({
      type: UI_ACTIONS.OPEN_MODAL,
      payload: { modalName, data },
    });
  };

  const closeModal = (modalName) => {
    dispatch({
      type: UI_ACTIONS.CLOSE_MODAL,
      payload: modalName,
    });
  };

  const closeAllModals = () => {
    dispatch({ type: UI_ACTIONS.CLOSE_ALL_MODALS });
  };

  const setLoading = (type, value) => {
    dispatch({
      type: UI_ACTIONS.SET_LOADING,
      payload: { type, value },
    });
  };

  const addNotification = (notification) => {
    const notificationId = dispatch({
      type: UI_ACTIONS.ADD_NOTIFICATION,
      payload: notification,
    });

    // Auto-remove notification after duration
    if (notification.duration > 0) {
      setTimeout(() => {
        dispatch({
          type: UI_ACTIONS.REMOVE_NOTIFICATION,
          payload: notificationId,
        });
      }, notification.duration);
    }

    return notificationId;
  };

  const removeNotification = (id) => {
    dispatch({
      type: UI_ACTIONS.REMOVE_NOTIFICATION,
      payload: id,
    });
  };

  const showSuccessMessage = (title, message, duration) => {
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      duration,
    });
  };

  const showErrorMessage = (title, message, duration) => {
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message,
      duration: duration || 7000, // Errors stay longer
    });
  };

  const showWarningMessage = (title, message, duration) => {
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      duration,
    });
  };

  const showInfoMessage = (title, message, duration) => {
    addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      duration,
    });
  };

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null,
    onCancel: null,
  });

  const showConfirmDialog = (title, message, type = 'warning') => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  const updatePreferences = (preferences) => {
    dispatch({
      type: UI_ACTIONS.UPDATE_PREFERENCES,
      payload: preferences,
    });
    
    // Save preferences to localStorage
    localStorage.setItem('ui-preferences', JSON.stringify({
      ...state.preferences,
      ...preferences,
    }));
  };

  const setFormState = (formState) => {
    dispatch({
      type: UI_ACTIONS.SET_FORM_STATE,
      payload: formState,
    });
  };

  const clearFormState = () => {
    dispatch({ type: UI_ACTIONS.CLEAR_FORM_STATE });
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('ui-preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        dispatch({
          type: UI_ACTIONS.UPDATE_PREFERENCES,
          payload: preferences,
        });
      } catch (error) {
        console.error('Failed to load UI preferences:', error);
      }
    }
  }, []);

  const value = {
    ...state,
    confirmModal,
    
    // Modal functions
    openModal,
    closeModal,
    closeAllModals,
    
    // Loading functions
    setLoading,
    
    // Notification functions
    addNotification,
    removeNotification,
    showSuccessMessage,
    showErrorMessage,
    showWarningMessage,
    showInfoMessage,
    showConfirmDialog,
    clearNotifications: () => dispatch({ type: UI_ACTIONS.CLEAR_NOTIFICATIONS }),
    
    // Preference functions
    updatePreferences,
    
    // Form functions
    setFormState,
    clearFormState,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

// Custom hook to use the UI context
export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

export default UIContext;