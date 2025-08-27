import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { generateProfitLossReport } from '../utils/calculations';

/**
 * Custom hook for profit & loss calculations
 * Provides real-time P&L data with caching for performance
 */
export function useProfitLoss(startDate = null, endDate = null) {
  const { sales, expenses, products } = useData();

  // Memoize the P&L report to avoid recalculating on every render
  const report = useMemo(() => {
    return generateProfitLossReport(sales, expenses, products, startDate, endDate);
  }, [sales, expenses, products, startDate, endDate]);

  // Additional helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatPercentage = (percentage) => {
    return `${(percentage || 0).toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  // Get common date ranges
  const getDateRanges = () => {
    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    const yearStart = `${today.getFullYear()}-01-01`;
    const lastYear = `${today.getFullYear() - 1}-01-01`;
    const lastYearEnd = `${today.getFullYear() - 1}-12-31`;

    return {
      today: {
        label: 'Today',
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      thisMonth: {
        label: 'This Month',
        startDate: currentMonth + '-01',
        endDate: today.toISOString().split('T')[0]
      },
      lastMonth: {
        label: 'Last Month',
        startDate: lastMonth,
        endDate: lastMonthEnd
      },
      thisYear: {
        label: 'This Year',
        startDate: yearStart,
        endDate: today.toISOString().split('T')[0]
      },
      lastYear: {
        label: 'Last Year',
        startDate: lastYear,
        endDate: lastYearEnd
      },
      allTime: {
        label: 'All Time',
        startDate: null,
        endDate: null
      }
    };
  };

  // Performance indicators
  const getPerformanceIndicators = () => {
    const indicators = [];
    
    if (report.netMargin > 20) {
      indicators.push({ type: 'success', message: 'Excellent profit margin' });
    } else if (report.netMargin > 10) {
      indicators.push({ type: 'info', message: 'Good profit margin' });
    } else if (report.netMargin > 0) {
      indicators.push({ type: 'warning', message: 'Low profit margin' });
    } else {
      indicators.push({ type: 'error', message: 'Operating at a loss' });
    }

    if (report.salesCount === 0) {
      indicators.push({ type: 'warning', message: 'No sales in selected period' });
    }

    if (report.inventoryValue > report.revenue * 2) {
      indicators.push({ type: 'warning', message: 'High inventory relative to sales' });
    }

    return indicators;
  };

  return {
    // Main P&L report
    report,
    
    // Formatting helpers
    formatCurrency,
    formatPercentage,
    formatDate,
    
    // Date range helpers
    getDateRanges,
    
    // Performance insights
    getPerformanceIndicators,
    
    // Quick access to key metrics
    isProfit: report.netProfit > 0,
    isProfitable: report.netMargin > 0,
    hasRevenue: report.revenue > 0,
    hasExpenses: report.totalExpenses > 0,
    
    // Comparison helpers
    compareWith: (otherStartDate, otherEndDate) => {
      const otherReport = generateProfitLossReport(sales, expenses, products, otherStartDate, otherEndDate);
      
      return {
        revenue: {
          current: report.revenue,
          previous: otherReport.revenue,
          change: report.revenue - otherReport.revenue,
          percentageChange: otherReport.revenue > 0 
            ? ((report.revenue - otherReport.revenue) / otherReport.revenue) * 100 
            : 0
        },
        netProfit: {
          current: report.netProfit,
          previous: otherReport.netProfit,
          change: report.netProfit - otherReport.netProfit,
          percentageChange: otherReport.netProfit !== 0
            ? ((report.netProfit - otherReport.netProfit) / Math.abs(otherReport.netProfit)) * 100
            : 0
        }
      };
    }
  };
}