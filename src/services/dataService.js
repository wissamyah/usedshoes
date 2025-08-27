// Data Service Layer - CRUD operations for business data
import { validateContainer, validateProduct, validateSale, validateExpense } from '../utils/validation';

export class DataService {
  constructor() {
    this.data = {
      metadata: {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        nextIds: {
          product: 1,
          container: 1,
          sale: 1,
          expense: 1
        }
      },
      containers: [],
      products: [],
      sales: [],
      expenses: []
    };
  }

  // Initialize with existing data
  loadData(data) {
    if (data && typeof data === 'object') {
      this.data = {
        ...this.data,
        ...data,
        metadata: {
          ...this.data.metadata,
          ...data.metadata
        }
      };
    }
  }

  // Get all data
  getAllData() {
    return { ...this.data };
  }

  // Get next available ID for a type
  getNextId(type) {
    const nextId = this.data.metadata.nextIds[type] || 1;
    this.data.metadata.nextIds[type] = nextId + 1;
    this.updateMetadata();
    return nextId;
  }

  // Update metadata timestamp
  updateMetadata() {
    this.data.metadata.lastUpdated = new Date().toISOString();
  }

  // CONTAINER OPERATIONS
  addContainer(containerData) {
    const validation = validateContainer(containerData);
    if (!validation.isValid) {
      throw new Error(`Invalid container data: ${validation.errors.join(', ')}`);
    }

    // Check for duplicate container ID
    if (this.data.containers.find(c => c.id === containerData.id)) {
      throw new Error(`Container with ID "${containerData.id}" already exists`);
    }

    const container = {
      ...containerData,
      createdAt: new Date().toISOString(),
      products: containerData.products || []
    };

    this.data.containers.push(container);
    this.updateMetadata();

    // Add products to the products array if they don't exist
    if (container.products && container.products.length > 0) {
      container.products.forEach(productData => {
        this.addOrUpdateProductFromContainer(container.id, productData);
      });
    }

    return container;
  }

  updateContainer(id, updates) {
    const containerIndex = this.data.containers.findIndex(c => c.id === id);
    if (containerIndex === -1) {
      throw new Error(`Container with ID "${id}" not found`);
    }

    const currentContainer = this.data.containers[containerIndex];
    const updatedContainer = { ...currentContainer, ...updates };

    const validation = validateContainer(updatedContainer);
    if (!validation.isValid) {
      throw new Error(`Invalid container data: ${validation.errors.join(', ')}`);
    }

    this.data.containers[containerIndex] = updatedContainer;
    this.updateMetadata();

    // Update related products if products array changed
    if (updates.products) {
      // Remove products that are no longer in this container
      this.data.products = this.data.products.filter(p => 
        p.containerId !== id || updates.products.some(cp => cp.productId === p.id)
      );

      // Add or update products
      updates.products.forEach(productData => {
        this.addOrUpdateProductFromContainer(id, productData);
      });
    }

    return updatedContainer;
  }

  deleteContainer(id) {
    const containerIndex = this.data.containers.findIndex(c => c.id === id);
    if (containerIndex === -1) {
      throw new Error(`Container with ID "${id}" not found`);
    }

    // Check if any products from this container have sales
    const containerProducts = this.data.products.filter(p => p.containerId === id);
    const haseSales = containerProducts.some(product => 
      this.data.sales.some(sale => sale.productId === product.id)
    );

    if (haseSales) {
      throw new Error('Cannot delete container with products that have sales history');
    }

    // Remove the container and its products
    this.data.containers.splice(containerIndex, 1);
    this.data.products = this.data.products.filter(p => p.containerId !== id);
    this.updateMetadata();

    return true;
  }

  getContainer(id) {
    return this.data.containers.find(c => c.id === id);
  }

  getAllContainers() {
    return [...this.data.containers];
  }

  // PRODUCT OPERATIONS
  addOrUpdateProductFromContainer(containerId, productData) {
    // Check if product already exists
    let existingProduct = this.data.products.find(p => p.id === productData.productId);
    
    if (existingProduct) {
      // Update existing product
      existingProduct.currentStock = (existingProduct.currentStock || 0) + (productData.quantity || 0);
      existingProduct.costPerUnit = productData.costPerUnit || existingProduct.costPerUnit;
      existingProduct.containerId = containerId;
    } else {
      // Create new product
      const newProduct = {
        id: productData.productId || this.getNextId('product'),
        name: productData.name || `Product ${productData.productId}`,
        category: productData.category || 'General',
        size: productData.size || 'Various',
        currentStock: productData.quantity || 0,
        containerId: containerId,
        costPerUnit: productData.costPerUnit || 0,
        description: productData.description || '',
        createdAt: new Date().toISOString()
      };

      const validation = validateProduct(newProduct);
      if (!validation.isValid) {
        throw new Error(`Invalid product data: ${validation.errors.join(', ')}`);
      }

      this.data.products.push(newProduct);
    }
  }

  addProduct(productData) {
    const product = {
      id: this.getNextId('product'),
      ...productData,
      currentStock: productData.currentStock || 0,
      createdAt: new Date().toISOString()
    };

    const validation = validateProduct(product);
    if (!validation.isValid) {
      throw new Error(`Invalid product data: ${validation.errors.join(', ')}`);
    }

    this.data.products.push(product);
    this.updateMetadata();
    return product;
  }

  updateProduct(id, updates) {
    const productIndex = this.data.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error(`Product with ID "${id}" not found`);
    }

    const currentProduct = this.data.products[productIndex];
    const updatedProduct = { ...currentProduct, ...updates };

    const validation = validateProduct(updatedProduct);
    if (!validation.isValid) {
      throw new Error(`Invalid product data: ${validation.errors.join(', ')}`);
    }

    this.data.products[productIndex] = updatedProduct;
    this.updateMetadata();
    return updatedProduct;
  }

  deleteProduct(id) {
    const productIndex = this.data.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error(`Product with ID "${id}" not found`);
    }

    // Check if product has sales history
    const hasSales = this.data.sales.some(sale => sale.productId === id);
    if (hasSales) {
      throw new Error('Cannot delete product with sales history');
    }

    this.data.products.splice(productIndex, 1);
    this.updateMetadata();
    return true;
  }

  getProduct(id) {
    return this.data.products.find(p => p.id === id);
  }

  getAllProducts() {
    return [...this.data.products];
  }

  // SALE OPERATIONS
  addSale(saleData) {
    const product = this.getProduct(saleData.productId);
    if (!product) {
      throw new Error(`Product with ID "${saleData.productId}" not found`);
    }

    // Check if sufficient stock is available
    if (product.currentStock < saleData.quantity) {
      throw new Error(`Insufficient stock. Available: ${product.currentStock}, Requested: ${saleData.quantity}`);
    }

    const sale = {
      id: this.getNextId('sale'),
      ...saleData,
      productName: product.name,
      totalAmount: saleData.quantity * saleData.pricePerUnit,
      costPerUnit: product.costPerUnit,
      profit: (saleData.pricePerUnit - product.costPerUnit) * saleData.quantity,
      date: saleData.date || new Date().toISOString().split('T')[0],
      time: saleData.time || new Date().toTimeString().split(' ')[0],
      createdAt: new Date().toISOString()
    };

    const validation = validateSale(sale);
    if (!validation.isValid) {
      throw new Error(`Invalid sale data: ${validation.errors.join(', ')}`);
    }

    // Reduce product stock
    product.currentStock -= saleData.quantity;

    this.data.sales.push(sale);
    this.updateMetadata();
    return sale;
  }

  updateSale(id, updates) {
    const saleIndex = this.data.sales.findIndex(s => s.id === id);
    if (saleIndex === -1) {
      throw new Error(`Sale with ID "${id}" not found`);
    }

    const currentSale = this.data.sales[saleIndex];
    const product = this.getProduct(currentSale.productId);

    if (!product) {
      throw new Error('Associated product not found');
    }

    // Restore original stock
    product.currentStock += currentSale.quantity;

    // Check if new quantity is available
    if (updates.quantity && product.currentStock < updates.quantity) {
      // Restore the sale's stock before throwing error
      product.currentStock -= currentSale.quantity;
      throw new Error(`Insufficient stock for update. Available: ${product.currentStock}, Requested: ${updates.quantity}`);
    }

    const updatedSale = {
      ...currentSale,
      ...updates,
      totalAmount: updates.quantity && updates.pricePerUnit 
        ? updates.quantity * updates.pricePerUnit 
        : currentSale.totalAmount,
      profit: updates.quantity && updates.pricePerUnit 
        ? (updates.pricePerUnit - product.costPerUnit) * updates.quantity
        : currentSale.profit
    };

    const validation = validateSale(updatedSale);
    if (!validation.isValid) {
      product.currentStock -= currentSale.quantity; // Restore original state
      throw new Error(`Invalid sale data: ${validation.errors.join(', ')}`);
    }

    // Apply new stock reduction
    product.currentStock -= updatedSale.quantity;

    this.data.sales[saleIndex] = updatedSale;
    this.updateMetadata();
    return updatedSale;
  }

  deleteSale(id) {
    const saleIndex = this.data.sales.findIndex(s => s.id === id);
    if (saleIndex === -1) {
      throw new Error(`Sale with ID "${id}" not found`);
    }

    const sale = this.data.sales[saleIndex];
    const product = this.getProduct(sale.productId);

    if (product) {
      // Restore stock
      product.currentStock += sale.quantity;
    }

    this.data.sales.splice(saleIndex, 1);
    this.updateMetadata();
    return true;
  }

  getSale(id) {
    return this.data.sales.find(s => s.id === id);
  }

  getAllSales() {
    return [...this.data.sales];
  }

  getSalesByDateRange(startDate, endDate) {
    return this.data.sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });
  }

  getSalesByProduct(productId) {
    return this.data.sales.filter(sale => sale.productId === productId);
  }

  // EXPENSE OPERATIONS
  addExpense(expenseData) {
    const expense = {
      id: this.getNextId('expense'),
      ...expenseData,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    const validation = validateExpense(expense);
    if (!validation.isValid) {
      throw new Error(`Invalid expense data: ${validation.errors.join(', ')}`);
    }

    this.data.expenses.push(expense);
    this.updateMetadata();
    return expense;
  }

  updateExpense(id, updates) {
    const expenseIndex = this.data.expenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) {
      throw new Error(`Expense with ID "${id}" not found`);
    }

    const currentExpense = this.data.expenses[expenseIndex];
    const updatedExpense = { ...currentExpense, ...updates };

    const validation = validateExpense(updatedExpense);
    if (!validation.isValid) {
      throw new Error(`Invalid expense data: ${validation.errors.join(', ')}`);
    }

    this.data.expenses[expenseIndex] = updatedExpense;
    this.updateMetadata();
    return updatedExpense;
  }

  deleteExpense(id) {
    const expenseIndex = this.data.expenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) {
      throw new Error(`Expense with ID "${id}" not found`);
    }

    this.data.expenses.splice(expenseIndex, 1);
    this.updateMetadata();
    return true;
  }

  getExpense(id) {
    return this.data.expenses.find(e => e.id === id);
  }

  getAllExpenses() {
    return [...this.data.expenses];
  }

  getExpensesByDateRange(startDate, endDate) {
    return this.data.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
    });
  }

  getExpensesByCategory(category) {
    return this.data.expenses.filter(expense => expense.category === category);
  }

  // SUMMARY OPERATIONS
  getTotalInventoryValue() {
    return this.data.products.reduce((total, product) => {
      return total + (product.currentStock * product.costPerUnit);
    }, 0);
  }

  getTotalSalesRevenue(startDate = null, endDate = null) {
    const sales = startDate && endDate 
      ? this.getSalesByDateRange(startDate, endDate)
      : this.data.sales;
    
    return sales.reduce((total, sale) => total + sale.totalAmount, 0);
  }

  getTotalExpenses(startDate = null, endDate = null) {
    const expenses = startDate && endDate 
      ? this.getExpensesByDateRange(startDate, endDate)
      : this.data.expenses;
    
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  getTotalProfit(startDate = null, endDate = null) {
    const sales = startDate && endDate 
      ? this.getSalesByDateRange(startDate, endDate)
      : this.data.sales;
    
    return sales.reduce((total, sale) => total + sale.profit, 0);
  }

  // SEARCH AND FILTER
  searchProducts(query) {
    const lowerQuery = query.toLowerCase();
    return this.data.products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    );
  }

  getProductsWithLowStock(threshold = 5) {
    return this.data.products.filter(product => product.currentStock <= threshold);
  }

  getTopSellingProducts(limit = 10) {
    const productSales = {};
    
    this.data.sales.forEach(sale => {
      if (!productSales[sale.productId]) {
        productSales[sale.productId] = {
          productId: sale.productId,
          productName: sale.productName,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      productSales[sale.productId].totalQuantity += sale.quantity;
      productSales[sale.productId].totalRevenue += sale.totalAmount;
    });

    return Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }
}

// Export singleton instance
export const dataService = new DataService();