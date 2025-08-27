// Validation utilities for business data structures

// Common validation helpers
const isValidString = (value, minLength = 1) => {
  return typeof value === 'string' && value.trim().length >= minLength;
};

const isValidNumber = (value, min = 0) => {
  return typeof value === 'number' && !isNaN(value) && value >= min;
};

const isValidDate = (dateString) => {
  if (typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
};

// Container validation
export function validateContainer(container) {
  const errors = [];

  // Required fields
  if (!isValidString(container.id)) {
    errors.push('Container ID is required and must be a non-empty string');
  }

  if (!isValidString(container.supplier)) {
    errors.push('Supplier is required and must be a non-empty string');
  }

  if (!container.purchaseDate || !isValidDate(container.purchaseDate)) {
    errors.push('Purchase date is required and must be a valid date');
  }

  // Optional but validated fields
  if (container.invoiceNumber && !isValidString(container.invoiceNumber)) {
    errors.push('Invoice number must be a non-empty string if provided');
  }

  if (container.totalCost !== undefined && !isValidNumber(container.totalCost, 0)) {
    errors.push('Total cost must be a non-negative number');
  }

  if (container.notes !== undefined && typeof container.notes !== 'string') {
    errors.push('Notes must be a string if provided');
  }

  // Products array validation
  if (container.products) {
    if (!Array.isArray(container.products)) {
      errors.push('Products must be an array');
    } else {
      container.products.forEach((product, index) => {
        if (!isValidNumber(product.productId, 1)) {
          errors.push(`Product ${index + 1}: Product ID must be a positive number`);
        }
        if (!isValidNumber(product.quantity, 1)) {
          errors.push(`Product ${index + 1}: Quantity must be a positive number`);
        }
        if (!isValidNumber(product.costPerUnit, 0)) {
          errors.push(`Product ${index + 1}: Cost per unit must be a non-negative number`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Product validation
export function validateProduct(product) {
  const errors = [];

  // Required fields
  if (!isValidNumber(product.id, 1)) {
    errors.push('Product ID is required and must be a positive number');
  }

  if (!isValidString(product.name)) {
    errors.push('Product name is required and must be a non-empty string');
  }

  if (!isValidString(product.category)) {
    errors.push('Category is required and must be a non-empty string');
  }

  if (!isValidNumber(product.currentStock, 0)) {
    errors.push('Current stock must be a non-negative number');
  }

  if (!isValidNumber(product.costPerUnit, 0)) {
    errors.push('Cost per unit must be a non-negative number');
  }

  // Optional but validated fields
  if (product.size && !isValidString(product.size)) {
    errors.push('Size must be a non-empty string if provided');
  }

  if (product.description !== undefined && typeof product.description !== 'string') {
    errors.push('Description must be a string if provided');
  }

  if (product.containerId && !isValidString(product.containerId)) {
    errors.push('Container ID must be a non-empty string if provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sale validation
export function validateSale(sale) {
  const errors = [];

  // Required fields
  if (!isValidNumber(sale.id, 1)) {
    errors.push('Sale ID is required and must be a positive number');
  }

  if (!isValidNumber(sale.productId, 1)) {
    errors.push('Product ID is required and must be a positive number');
  }

  if (!isValidString(sale.productName)) {
    errors.push('Product name is required and must be a non-empty string');
  }

  if (!isValidNumber(sale.quantity, 1)) {
    errors.push('Quantity is required and must be a positive number');
  }

  if (!isValidNumber(sale.pricePerUnit, 0)) {
    errors.push('Price per unit is required and must be non-negative');
  }

  if (!isValidNumber(sale.totalAmount, 0)) {
    errors.push('Total amount is required and must be non-negative');
  }

  if (!isValidNumber(sale.costPerUnit, 0)) {
    errors.push('Cost per unit is required and must be non-negative');
  }

  if (!isValidNumber(sale.profit)) {
    errors.push('Profit is required and must be a number');
  }

  if (!sale.date || !isValidDate(sale.date)) {
    errors.push('Sale date is required and must be a valid date');
  }

  // Optional but validated fields
  if (sale.time && typeof sale.time !== 'string') {
    errors.push('Time must be a string if provided');
  }

  if (sale.notes !== undefined && typeof sale.notes !== 'string') {
    errors.push('Notes must be a string if provided');
  }

  // Business logic validation
  const calculatedTotal = sale.quantity * sale.pricePerUnit;
  if (Math.abs(sale.totalAmount - calculatedTotal) > 0.01) {
    errors.push('Total amount does not match quantity × price per unit');
  }

  const calculatedProfit = (sale.pricePerUnit - sale.costPerUnit) * sale.quantity;
  if (Math.abs(sale.profit - calculatedProfit) > 0.01) {
    errors.push('Profit does not match (price per unit - cost per unit) × quantity');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Expense validation
export function validateExpense(expense) {
  const errors = [];

  // Required fields
  if (!isValidNumber(expense.id, 1)) {
    errors.push('Expense ID is required and must be a positive number');
  }

  if (!isValidString(expense.category)) {
    errors.push('Category is required and must be a non-empty string');
  }

  if (!isValidString(expense.description)) {
    errors.push('Description is required and must be a non-empty string');
  }

  if (!isValidNumber(expense.amount, 0)) {
    errors.push('Amount is required and must be non-negative');
  }

  if (!expense.date || !isValidDate(expense.date)) {
    errors.push('Expense date is required and must be a valid date');
  }

  // Optional but validated fields
  if (expense.containerId && !isValidString(expense.containerId)) {
    errors.push('Container ID must be a non-empty string if provided');
  }

  // Category validation
  const validCategories = [
    'Transport',
    'Rent',
    'Staff Salaries',
    'Miscellaneous',
    'Marketing',
    'Utilities',
    'Supplies',
    'Insurance',
    'Legal',
    'Maintenance'
  ];

  if (!validCategories.includes(expense.category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Form validation helpers
export function validateContainerForm(formData) {
  const errors = {};

  if (!formData.id?.trim()) {
    errors.id = 'Container ID is required';
  }

  if (!formData.supplier?.trim()) {
    errors.supplier = 'Supplier is required';
  }

  if (!formData.purchaseDate) {
    errors.purchaseDate = 'Purchase date is required';
  } else if (!isValidDate(formData.purchaseDate)) {
    errors.purchaseDate = 'Invalid date format';
  }

  if (formData.totalCost && (!isValidNumber(parseFloat(formData.totalCost), 0))) {
    errors.totalCost = 'Total cost must be a non-negative number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateProductForm(formData) {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name = 'Product name is required';
  }

  if (!formData.category?.trim()) {
    errors.category = 'Category is required';
  }

  if (formData.currentStock !== undefined && !isValidNumber(parseFloat(formData.currentStock), 0)) {
    errors.currentStock = 'Current stock must be a non-negative number';
  }

  if (formData.costPerUnit !== undefined && !isValidNumber(parseFloat(formData.costPerUnit), 0)) {
    errors.costPerUnit = 'Cost per unit must be a non-negative number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateSaleForm(formData) {
  const errors = {};

  if (!formData.productId || !isValidNumber(parseFloat(formData.productId), 1)) {
    errors.productId = 'Please select a valid product';
  }

  if (!formData.quantity || !isValidNumber(parseFloat(formData.quantity), 1)) {
    errors.quantity = 'Quantity must be a positive number';
  }

  if (!formData.pricePerUnit || !isValidNumber(parseFloat(formData.pricePerUnit), 0)) {
    errors.pricePerUnit = 'Price per unit must be a non-negative number';
  }

  if (!formData.date) {
    errors.date = 'Sale date is required';
  } else if (!isValidDate(formData.date)) {
    errors.date = 'Invalid date format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateExpenseForm(formData) {
  const errors = {};

  if (!formData.category?.trim()) {
    errors.category = 'Category is required';
  }

  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (!formData.amount || !isValidNumber(parseFloat(formData.amount), 0)) {
    errors.amount = 'Amount must be a non-negative number';
  }

  if (!formData.date) {
    errors.date = 'Expense date is required';
  } else if (!isValidDate(formData.date)) {
    errors.date = 'Invalid date format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// GitHub token validation
export function validateGitHubSettings(formData) {
  const errors = {};

  if (!formData.owner?.trim()) {
    errors.owner = 'Repository owner is required';
  }

  if (!formData.repo?.trim()) {
    errors.repo = 'Repository name is required';
  }

  if (!formData.token?.trim()) {
    errors.token = 'Access token is required';
  } else if (formData.token.length < 40) {
    errors.token = 'GitHub token appears to be invalid (too short)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Business logic validation
export function validateSufficientStock(productStock, requestedQuantity) {
  if (requestedQuantity > productStock) {
    return {
      isValid: false,
      error: `Insufficient stock. Available: ${productStock}, Requested: ${requestedQuantity}`
    };
  }
  return { isValid: true };
}

export function validateUniqueContainerId(containers, id, excludeId = null) {
  const existingContainer = containers.find(c => c.id === id && c.id !== excludeId);
  if (existingContainer) {
    return {
      isValid: false,
      error: `Container with ID "${id}" already exists`
    };
  }
  return { isValid: true };
}

// Data integrity checks
export function validateDataIntegrity(data) {
  const errors = [];

  // Check for orphaned products
  data.products.forEach(product => {
    if (product.containerId && !data.containers.find(c => c.id === product.containerId)) {
      errors.push(`Product ${product.id} references non-existent container ${product.containerId}`);
    }
  });

  // Check for orphaned sales
  data.sales.forEach(sale => {
    if (!data.products.find(p => p.id === sale.productId)) {
      errors.push(`Sale ${sale.id} references non-existent product ${sale.productId}`);
    }
  });

  // Check for negative stock
  data.products.forEach(product => {
    if (product.currentStock < 0) {
      errors.push(`Product ${product.id} has negative stock: ${product.currentStock}`);
    }
  });

  // Check for duplicate IDs
  const containerIds = data.containers.map(c => c.id);
  const duplicateContainerIds = containerIds.filter((id, index) => containerIds.indexOf(id) !== index);
  if (duplicateContainerIds.length > 0) {
    errors.push(`Duplicate container IDs found: ${duplicateContainerIds.join(', ')}`);
  }

  const productIds = data.products.map(p => p.id);
  const duplicateProductIds = productIds.filter((id, index) => productIds.indexOf(id) !== index);
  if (duplicateProductIds.length > 0) {
    errors.push(`Duplicate product IDs found: ${duplicateProductIds.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}