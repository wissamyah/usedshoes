import { useState, useCallback } from 'react';
import { useUI } from '../context/UIContext';

// Custom hook for comprehensive error handling
export function useErrorHandler() {
  const { showErrorMessage } = useUI();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error, customMessage = null, showToast = true) => {
    console.error('Error caught by useErrorHandler:', error);
    
    let errorMessage = customMessage || 'An unexpected error occurred';
    let errorTitle = 'Error';

    // Parse different types of errors
    if (error) {
      // Network errors
      if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
        errorTitle = 'Connection Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      // GitHub API specific errors
      else if (error.status) {
        errorTitle = 'API Error';
        switch (error.status) {
          case 401:
            errorMessage = 'Authentication failed. Please check your GitHub token.';
            break;
          case 403:
            errorMessage = error.message?.includes('rate limit') 
              ? 'GitHub API rate limit exceeded. Please try again later.'
              : 'Access forbidden. Please check your GitHub token permissions.';
            break;
          case 404:
            errorMessage = 'Repository or file not found. Please check your GitHub settings.';
            break;
          case 422:
            errorMessage = 'Invalid data sent to GitHub. Please check your input and try again.';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'GitHub server error. Please try again in a few minutes.';
            break;
          default:
            errorMessage = `GitHub API error (${error.status}): ${error.message || 'Unknown error'}`;
        }
      }
      // Validation errors
      else if (error.type === 'VALIDATION_ERROR') {
        errorTitle = 'Validation Error';
        errorMessage = error.message || 'Please check your input and try again.';
      }
      // Business logic errors
      else if (error.type === 'BUSINESS_ERROR') {
        errorTitle = 'Business Rule Violation';
        errorMessage = error.message;
      }
      // Generic errors
      else if (error.message) {
        errorMessage = error.message;
      }
      // Handle error objects with details
      else if (typeof error === 'object' && error.details) {
        errorMessage = error.details;
      }
    }

    const errorObj = {
      title: errorTitle,
      message: errorMessage,
      originalError: error,
      timestamp: new Date().toISOString()
    };

    setError(errorObj);

    // Show toast notification if requested
    if (showToast) {
      showErrorMessage(errorTitle, errorMessage);
    }

    return errorObj;
  }, [showErrorMessage]);

  // Wrapper for async operations with automatic error handling
  const executeWithErrorHandling = useCallback(async (
    asyncOperation, 
    loadingMessage = 'Processing...',
    successMessage = null,
    customErrorMessage = null
  ) => {
    setIsLoading(true);
    clearError();

    try {
      const result = await asyncOperation();
      
      if (successMessage) {
        const { showSuccessMessage } = useUI();
        showSuccessMessage('Success', successMessage);
      }
      
      return result;
    } catch (error) {
      handleError(error, customErrorMessage);
      throw error; // Re-throw to allow caller to handle if needed
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  // Wrapper for form submissions
  const handleFormSubmission = useCallback(async (
    formData,
    submitFunction,
    validationFunction = null,
    successMessage = 'Form submitted successfully'
  ) => {
    // Validate form data if validator provided
    if (validationFunction) {
      const validation = validationFunction(formData);
      if (!validation.isValid) {
        const validationError = new Error('Form validation failed');
        validationError.type = 'VALIDATION_ERROR';
        validationError.details = validation.errors;
        handleError(validationError, 'Please correct the errors in the form');
        return { success: false, errors: validation.errors };
      }
    }

    return executeWithErrorHandling(
      () => submitFunction(formData),
      'Submitting form...',
      successMessage,
      'Failed to submit form. Please try again.'
    );
  }, [executeWithErrorHandling, handleError]);

  // GitHub-specific error handler
  const handleGitHubError = useCallback((error) => {
    const gitHubErrorMessages = {
      401: 'GitHub authentication failed. Please check your personal access token.',
      403: error.message?.includes('rate limit') 
        ? 'GitHub API rate limit exceeded. Please try again in an hour.'
        : 'Access forbidden. Ensure your token has the required repository permissions.',
      404: 'Repository or file not found. Please verify your GitHub settings.',
      422: 'Unable to process GitHub request. The data may be invalid.',
      500: 'GitHub servers are experiencing issues. Please try again later.',
      502: 'GitHub gateway error. Please try again in a few moments.',
      503: 'GitHub service unavailable. Please try again later.'
    };

    const customMessage = gitHubErrorMessages[error.status] || 
      `GitHub error: ${error.message || 'Unknown error occurred'}`;
    
    return handleError(error, customMessage);
  }, [handleError]);

  // Retry mechanism
  const createRetryHandler = useCallback((operation, maxRetries = 3, delay = 1000) => {
    return async (...args) => {
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation(...args);
        } catch (error) {
          lastError = error;
          
          if (attempt === maxRetries) {
            handleError(error, `Operation failed after ${maxRetries} attempts`);
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
        }
      }
    };
  }, [handleError]);

  return {
    error,
    isLoading,
    clearError,
    handleError,
    executeWithErrorHandling,
    handleFormSubmission,
    handleGitHubError,
    createRetryHandler
  };
}

// Utility functions for error handling
export function isNetworkError(error) {
  return error.name === 'NetworkError' || 
         error.code === 'NETWORK_ERROR' ||
         error.message?.includes('fetch');
}

export function isGitHubRateLimit(error) {
  return error.status === 403 && 
         error.message?.toLowerCase().includes('rate limit');
}

export function isValidationError(error) {
  return error.type === 'VALIDATION_ERROR';
}

export function isBusinessError(error) {
  return error.type === 'BUSINESS_ERROR';
}

// Error factory functions
export function createValidationError(message, details = {}) {
  const error = new Error(message);
  error.type = 'VALIDATION_ERROR';
  error.details = details;
  return error;
}

export function createBusinessError(message, code = null) {
  const error = new Error(message);
  error.type = 'BUSINESS_ERROR';
  if (code) error.code = code;
  return error;
}

export function createNetworkError(message = 'Network request failed') {
  const error = new Error(message);
  error.name = 'NetworkError';
  error.code = 'NETWORK_ERROR';
  return error;
}