/**
 * Business calculations for profit & loss statements
 */

/**
 * Calculate Cost of Goods Sold (COGS) for given sales
 * COGS = Sum of (costPerUnit × quantity) for all sales
 */
export function calculateCOGS(sales) {
  return sales.reduce((total, sale) => {
    return total + ((sale.costPerUnit || 0) * (sale.quantity || 0));
  }, 0);
}

/**
 * Calculate total revenue from sales
 * Revenue = Sum of totalAmount for all sales
 */
export function calculateRevenue(sales) {
  return sales.reduce((total, sale) => {
    return total + (sale.totalAmount || 0);
  }, 0);
}

/**
 * Calculate gross profit from sales
 * Gross Profit = Sum of profit for all sales (or Revenue - COGS)
 */
export function calculateGrossProfit(sales) {
  return sales.reduce((total, sale) => {
    return total + (sale.profit || 0);
  }, 0);
}

/**
 * Calculate total expenses
 */
export function calculateTotalExpenses(expenses) {
  return expenses.reduce((total, expense) => {
    return total + (expense.amount || 0);
  }, 0);
}

/**
 * Calculate net profit
 * Net Profit = Gross Profit - Total Expenses
 */
export function calculateNetProfit(sales, expenses) {
  const grossProfit = calculateGrossProfit(sales);
  const totalExpenses = calculateTotalExpenses(expenses);
  return grossProfit - totalExpenses;
}

/**
 * Calculate profit margins
 */
export function calculateMargins(sales, expenses) {
  const revenue = calculateRevenue(sales);
  const grossProfit = calculateGrossProfit(sales);
  const netProfit = calculateNetProfit(sales, expenses);

  return {
    grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    netMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
  };
}

/**
 * Calculate current inventory value
 */
export function calculateInventoryValue(products) {
  return products.reduce((total, product) => {
    const costPerBag = (product.costPerKg || product.costPerUnit || 0) * (product.bagWeight || 25);
    return total + (product.currentStock * costPerBag);
  }, 0);
}

/**
 * Filter data by date range
 */
export function filterByDateRange(data, startDate, endDate) {
  if (!startDate && !endDate) return data;
  
  return data.filter(item => {
    const itemDate = item.date;
    if (!itemDate) return false;
    
    const matchesStart = !startDate || itemDate >= startDate;
    const matchesEnd = !endDate || itemDate <= endDate;
    
    return matchesStart && matchesEnd;
  });
}

/**
 * Generate comprehensive P&L report for a date range
 */
export function generateProfitLossReport(sales, expenses, products, startDate = null, endDate = null) {
  // Filter data by date range
  const filteredSales = filterByDateRange(sales, startDate, endDate);
  const filteredExpenses = filterByDateRange(expenses, startDate, endDate);

  // Calculate core metrics
  const revenue = calculateRevenue(filteredSales);
  const cogs = calculateCOGS(filteredSales);
  const grossProfit = calculateGrossProfit(filteredSales);
  const totalExpenses = calculateTotalExpenses(filteredExpenses);
  const netProfit = grossProfit - totalExpenses;
  const margins = calculateMargins(filteredSales, filteredExpenses);

  // Additional metrics
  const averageSaleAmount = filteredSales.length > 0 ? revenue / filteredSales.length : 0;
  const averageExpenseAmount = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  // Expense breakdown by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Miscellaneous';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  // Sales by product
  const salesByProduct = filteredSales.reduce((acc, sale) => {
    const productId = sale.productId;
    if (!acc[productId]) {
      acc[productId] = {
        productName: sale.productName,
        quantity: 0,
        revenue: 0,
        profit: 0,
        salesCount: 0
      };
    }
    acc[productId].quantity += sale.quantity || 0;
    acc[productId].revenue += sale.totalAmount || 0;
    acc[productId].profit += sale.profit || 0;
    acc[productId].salesCount += 1;
    return acc;
  }, {});

  return {
    // Period info
    startDate,
    endDate,
    salesCount: filteredSales.length,
    expensesCount: filteredExpenses.length,
    
    // Core P&L metrics
    revenue,
    cogs,
    grossProfit,
    totalExpenses,
    netProfit,
    
    // Margins
    grossMargin: margins.grossMargin,
    netMargin: margins.netMargin,
    
    // Additional insights
    averageSaleAmount,
    averageExpenseAmount,
    
    // Breakdowns
    expensesByCategory,
    salesByProduct: Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue),
    
    // Current inventory (not date-filtered)
    inventoryValue: calculateInventoryValue(products)
  };
}