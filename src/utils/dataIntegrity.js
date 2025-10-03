// Data Integrity Utilities
// Ensures critical finance data is properly validated before saving

export function validateFinanceData(data) {
  const errors = [];
  const warnings = [];

  // Validate data structure
  if (!data || typeof data !== 'object') {
    errors.push('Data must be a valid object');
    return { isValid: false, errors, warnings };
  }

  // Check required arrays exist
  const requiredArrays = ['partners', 'withdrawals', 'cashInjections', 'cashFlows', 'products', 'containers', 'sales', 'expenses'];
  requiredArrays.forEach(arrayName => {
    if (!Array.isArray(data[arrayName])) {
      errors.push(`${arrayName} must be an array`);
    }
  });

  // Validate metadata
  if (!data.metadata || typeof data.metadata !== 'object') {
    errors.push('Metadata is required');
  } else {
    if (!data.metadata.nextIds || typeof data.metadata.nextIds !== 'object') {
      errors.push('Metadata nextIds is required');
    }
  }

  // Validate finance data consistency
  if (data.partners && data.withdrawals) {
    // Check that all withdrawals reference valid partners
    const partnerIds = new Set(data.partners.map(p => p.id));
    const invalidWithdrawals = data.withdrawals.filter(w => w.partnerId && !partnerIds.has(w.partnerId));
    if (invalidWithdrawals.length > 0) {
      warnings.push(`${invalidWithdrawals.length} withdrawals reference non-existent partners`);
    }
  }

  if (data.cashInjections && data.partners) {
    // Check that capital contributions reference valid partners
    const partnerIds = new Set(data.partners.map(p => p.id));
    const invalidInjections = data.cashInjections.filter(ci =>
      ci.type === 'Capital Contribution' && ci.partnerId && !partnerIds.has(ci.partnerId)
    );
    if (invalidInjections.length > 0) {
      warnings.push(`${invalidInjections.length} capital contributions reference non-existent partners`);
    }
  }

  // Validate ID uniqueness
  if (data.partners) {
    const partnerIds = data.partners.map(p => p.id);
    const uniquePartnerIds = new Set(partnerIds);
    if (partnerIds.length !== uniquePartnerIds.size) {
      errors.push('Duplicate partner IDs found');
    }
  }

  if (data.withdrawals) {
    const withdrawalIds = data.withdrawals.map(w => w.id);
    const uniqueWithdrawalIds = new Set(withdrawalIds);
    if (withdrawalIds.length !== uniqueWithdrawalIds.size) {
      errors.push('Duplicate withdrawal IDs found');
    }
  }

  if (data.cashInjections) {
    const injectionIds = data.cashInjections.map(ci => ci.id);
    const uniqueInjectionIds = new Set(injectionIds);
    if (injectionIds.length !== uniqueInjectionIds.size) {
      errors.push('Duplicate cash injection IDs found');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function sanitizeFinanceData(data) {
  // Create a clean copy of the data with proper sanitization
  return {
    ...data,
    partners: (data.partners || []).map(partner => ({
      ...partner,
      id: partner.id || `P${Date.now()}`,
      capitalAccount: {
        initialInvestment: 0,
        additionalContributions: 0,
        profitShare: 0,
        totalWithdrawn: 0,
        currentEquity: 0,
        ...partner.capitalAccount,
        // Ensure additionalContributions is always a number, not an array
        additionalContributions: typeof partner.capitalAccount?.additionalContributions === 'number'
          ? partner.capitalAccount.additionalContributions
          : 0
      }
    })),
    withdrawals: (data.withdrawals || []).map(withdrawal => ({
      ...withdrawal,
      id: withdrawal.id || `W${Date.now()}`,
      amount: Number(withdrawal.amount) || 0
    })),
    cashInjections: (data.cashInjections || []).map(injection => ({
      ...injection,
      id: injection.id || `CI${Date.now()}`,
      amount: Number(injection.amount) || 0
    })),
    cashFlows: (data.cashFlows || []).map(flow => ({
      ...flow,
      id: flow.id || `CF${Date.now()}`
    }))
  };
}

export function logDataState(data, operation = 'Unknown') {
  if (!data) {
    console.log(`📊 Data State (${operation}): No data`);
    return;
  }

  const counts = {
    partners: data.partners?.length || 0,
    withdrawals: data.withdrawals?.length || 0,
    cashInjections: data.cashInjections?.length || 0,
    cashFlows: data.cashFlows?.length || 0,
    products: data.products?.length || 0,
    containers: data.containers?.length || 0,
    sales: data.sales?.length || 0,
    expenses: data.expenses?.length || 0
  };

  console.log(`📊 Data State (${operation}):`, counts);

  // Log finance data summary
  if (counts.partners > 0 || counts.withdrawals > 0 || counts.cashInjections > 0) {
    console.log(`💰 Finance Summary:`, {
      partners: counts.partners,
      withdrawals: counts.withdrawals,
      cashInjections: counts.cashInjections,
      totalWithdrawals: data.withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0,
      totalInjections: data.cashInjections?.reduce((sum, ci) => sum + (ci.amount || 0), 0) || 0
    });
  }
}