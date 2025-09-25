// Finance synchronization utilities

export function calculateInitialCashPosition(containers, sales, expenses) {
  // Calculate total investment from containers
  const totalContainerCost = containers.reduce((sum, container) => {
    return sum + (container.totalInvestment || 0);
  }, 0);
  
  // Calculate total sales revenue
  const totalSalesRevenue = sales.reduce((sum, sale) => {
    return sum + (sale.totalAmount || 0);
  }, 0);
  
  // Calculate total expenses (excluding product destruction which is already in expenses)
  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + expense.amount;
  }, 0);
  
  // Current cash position = Sales Revenue - Expenses - Container Investments
  const currentCashPosition = totalSalesRevenue - totalExpenses - totalContainerCost;
  
  return {
    totalContainerCost,
    totalSalesRevenue,
    totalExpenses,
    currentCashPosition
  };
}

export function generateInitialCashFlow(containers, sales, expenses) {
  // Combine all transactions for cash flow history
  const transactions = [];
  const today = new Date().toISOString().split('T')[0];

  // Add container purchases as cash outflows (use a reasonable default date if not available)
  containers.forEach(container => {
    const containerDate = container.arrivalDate || container.orderDate || container.createdAt || '2024-01-01';
    transactions.push({
      date: containerDate,
      type: 'expense',
      category: 'Container Purchase',
      description: `Container ${container.id} - ${container.name}`,
      amount: -(container.totalInvestment || 0),
      reference: `container_${container.id}`
    });
  });

  // Add sales as cash inflows
  sales.forEach(sale => {
    transactions.push({
      date: sale.date,
      type: 'sale',
      category: 'Product Sale',
      description: `Sale #${sale.id}`,
      amount: sale.totalAmount || 0,
      reference: `sale_${sale.id}`
    });
  });

  // Add expenses as cash outflows
  expenses.forEach(expense => {
    transactions.push({
      date: expense.date,
      type: 'expense',
      category: expense.category,
      description: expense.description,
      amount: -expense.amount,
      reference: `expense_${expense.id}`
    });
  });

  // Sort transactions by date
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate running balance
  let runningBalance = 0;
  const cashFlowRecords = [];

  // Group transactions by date
  const groupedByDate = transactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {});

  // Create cash flow records for each date (sorted chronologically)
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));

  sortedDates.forEach(date => {
    const dayTransactions = groupedByDate[date];
    const dayInflows = dayTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const dayOutflows = dayTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const openingBalance = runningBalance;
    const closingBalance = runningBalance + dayInflows - dayOutflows;
    runningBalance = closingBalance; // Update running balance for next day

    // Only auto-reconcile historical records (before today)
    const isHistorical = date < today;

    cashFlowRecords.push({
      id: `cf_${date}`,
      date,
      openingBalance,
      cashIn: dayInflows,
      cashOut: dayOutflows,
      theoreticalBalance: closingBalance, // This is the closing balance for the day
      actualBalance: isHistorical ? closingBalance : null, // Only set for historical records
      discrepancy: isHistorical ? 0 : null,
      transactions: dayTransactions,
      reconciled: isHistorical,
      reconciledBy: isHistorical ? 'System Init' : null,
      reconciledAt: isHistorical ? new Date().toISOString() : null
    });
  });

  return cashFlowRecords;
}

export function createDefaultPartners() {
  // Create default partners based on common business structure
  return [
    {
      id: 'P1',
      name: 'Primary Owner',
      email: 'owner@business.com',
      phone: '',
      ownershipPercent: 60,
      role: 'Managing Partner',
      joinDate: new Date().toISOString().split('T')[0],
      capitalAccount: {
        initialInvestment: 0, // Will be updated based on containers
        profitShare: 0,
        totalWithdrawn: 0,
        currentEquity: 0
      },
      active: true
    },
    {
      id: 'P2',
      name: 'Partner 2',
      email: 'partner2@business.com',
      phone: '',
      ownershipPercent: 40,
      role: 'Partner',
      joinDate: new Date().toISOString().split('T')[0],
      capitalAccount: {
        initialInvestment: 0, // Will be updated based on containers
        profitShare: 0,
        totalWithdrawn: 0,
        currentEquity: 0
      },
      active: true
    }
  ];
}

export function updatePartnersWithInvestments(partners, totalInvestment) {
  // Distribute initial investment based on ownership percentage
  return partners.map(partner => ({
    ...partner,
    capitalAccount: {
      ...partner.capitalAccount,
      initialInvestment: (totalInvestment * partner.ownershipPercent) / 100,
      currentEquity: (totalInvestment * partner.ownershipPercent) / 100
    }
  }));
}

export function syncFinanceData(existingData) {
  const { containers, sales, expenses } = existingData;
  
  // Calculate financial position
  const financialPosition = calculateInitialCashPosition(containers, sales, expenses);
  
  // Generate cash flow history
  const cashFlows = generateInitialCashFlow(containers, sales, expenses);
  
  // Never create default partners - let user manage them manually
  const partners = existingData.partners || [];
  
  // Get today's cash flow or create one - NEVER auto-reconciled
  const today = new Date().toISOString().split('T')[0];
  let todayCashFlow = cashFlows.find(cf => cf.date === today);

  if (!todayCashFlow) {
    const lastCashFlow = cashFlows[cashFlows.length - 1];
    todayCashFlow = {
      id: `cf_${today}`,
      date: today,
      openingBalance: lastCashFlow ? lastCashFlow.theoreticalBalance : 0,
      cashIn: 0,
      cashOut: 0,
      theoreticalBalance: lastCashFlow ? lastCashFlow.theoreticalBalance : 0,
      actualBalance: null, // Not reconciled yet
      discrepancy: null,
      transactions: [],
      reconciled: false,
      reconciledBy: null,
      reconciledAt: null
    };
    cashFlows.push(todayCashFlow);
  } else if (todayCashFlow.date === today) {
    // Ensure today's record is never auto-reconciled
    todayCashFlow.reconciled = false;
    todayCashFlow.reconciledBy = null;
    todayCashFlow.reconciledAt = null;
    if (todayCashFlow.actualBalance === todayCashFlow.theoreticalBalance && todayCashFlow.discrepancy === 0) {
      // Reset auto-reconciled today's record
      todayCashFlow.actualBalance = null;
      todayCashFlow.discrepancy = null;
    }
  }
  
  return {
    partners,
    cashFlows,
    withdrawals: existingData.withdrawals || [],
    financialSummary: {
      ...financialPosition,
      lastSync: new Date().toISOString(),
      syncedFromExistingData: true
    }
  };
}