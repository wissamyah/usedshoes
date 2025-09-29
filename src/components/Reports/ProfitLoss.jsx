import { useProfitLoss } from '../../hooks/useProfitLoss';
import { TrendingUp, TrendingDown, DollarSign, Package, Receipt } from 'lucide-react';

export default function ProfitLoss({ startDate, endDate }) {
  const { 
    report, 
    formatCurrency, 
    formatPercentage, 
    formatDate, 
    getPerformanceIndicators 
  } = useProfitLoss(startDate, endDate);

  const performanceIndicators = getPerformanceIndicators();

  const formatDateRange = () => {
    if (!startDate && !endDate) return 'All Time';
    if (startDate && endDate) {
      if (startDate === endDate) return formatDate(startDate);
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    if (startDate) return `From ${formatDate(startDate)}`;
    if (endDate) return `Until ${formatDate(endDate)}`;
    return 'All Time';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #404040',
        padding: '24px'
      }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ebebeb' }}>Profit & Loss Statement</h2>
          <span style={{
            fontSize: '14px',
            color: '#b3b3b3',
            backgroundColor: '#1c1c1c',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #404040'
          }}>
            {formatDateRange()}
          </span>
        </div>

        {/* Performance Indicators */}
        {performanceIndicators.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {performanceIndicators.map((indicator, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor:
                    indicator.type === 'success' ? 'rgba(34, 197, 94, 0.1)' :
                    indicator.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                    indicator.type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                    'rgba(59, 130, 246, 0.1)',
                  color:
                    indicator.type === 'success' ? '#22c55e' :
                    indicator.type === 'warning' ? '#f59e0b' :
                    indicator.type === 'error' ? '#ef4444' :
                    '#3b82f6',
                  border: `1px solid ${
                    indicator.type === 'success' ? 'rgba(34, 197, 94, 0.3)' :
                    indicator.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
                    indicator.type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                    'rgba(59, 130, 246, 0.3)'
                  }`
                }}
              >
                {indicator.message}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Professional Income Statement */}
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #404040',
        overflow: 'hidden'
      }}>
        {/* Statement Header */}
        <div style={{
          backgroundColor: '#333333',
          padding: '24px'
        }}>
          <div className="flex justify-between items-start">
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ebebeb' }}>Income Statement</h3>
              <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '4px' }}>For the period: {formatDateRange()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="flex items-center justify-end space-x-2">
                {report.netProfit >= 0 ? (
                  <TrendingUp style={{ height: '20px', width: '20px', color: '#22c55e' }} />
                ) : (
                  <TrendingDown style={{ height: '20px', width: '20px', color: '#ef4444' }} />
                )}
                <span style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: report.netProfit >= 0 ? '#22c55e' : '#ef4444'
                }}>
                  {formatCurrency(report.netProfit)}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#b3b3b3', marginTop: '4px' }}>Net Income</p>
            </div>
          </div>
        </div>
        
        {/* Statement Body */}
        <div style={{ padding: '24px' }}>
          <table style={{ width: '100%' }}>
            <tbody>
              {/* Revenue Section */}
              <tr style={{ borderBottom: '1px solid #404040' }}>
                <td style={{ paddingTop: '12px', paddingBottom: '12px' }} colSpan="3">
                  <div className="flex items-center space-x-2">
                    <DollarSign style={{ height: '16px', width: '16px', color: '#22c55e' }} />
                    <span style={{
                      fontWeight: '600',
                      color: '#ebebeb',
                      textTransform: 'uppercase',
                      fontSize: '14px',
                      letterSpacing: '0.05em'
                    }}>Revenue</span>
                  </div>
                </td>
              </tr>
              <tr style={{
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}>
                <td style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '32px', color: '#b3b3b3' }}>Sales Revenue</td>
                <td style={{ textAlign: 'right', color: '#808080', fontSize: '14px' }}>{report.salesCount} transactions</td>
                <td style={{ textAlign: 'right', fontWeight: '500', color: '#ebebeb', width: '128px' }}>{formatCurrency(report.revenue)}</td>
              </tr>
              <tr style={{ borderBottom: '2px solid #404040' }}>
                <td style={{ paddingTop: '8px', paddingBottom: '12px', fontWeight: '600', color: '#ebebeb' }} colSpan="2">Total Revenue</td>
                <td style={{ paddingTop: '8px', paddingBottom: '12px', textAlign: 'right', fontWeight: '700', color: '#ebebeb' }}>{formatCurrency(report.revenue)}</td>
              </tr>

              {/* Cost of Goods Sold */}
              <tr style={{ borderBottom: '1px solid #404040' }}>
                <td style={{ paddingTop: '12px', paddingBottom: '12px' }} colSpan="3">
                  <div className="flex items-center space-x-2">
                    <Package style={{ height: '16px', width: '16px', color: '#fb923c' }} />
                    <span style={{
                      fontWeight: '600',
                      color: '#ebebeb',
                      textTransform: 'uppercase',
                      fontSize: '14px',
                      letterSpacing: '0.05em'
                    }}>Cost of Goods Sold</span>
                  </div>
                </td>
              </tr>
              <tr style={{
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}>
                <td style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '32px', color: '#b3b3b3' }}>Product Costs</td>
                <td style={{ textAlign: 'right', color: '#808080', fontSize: '14px' }}>{report.salesCount} units</td>
                <td style={{ textAlign: 'right', fontWeight: '500', color: '#f87171', width: '128px' }}>({formatCurrency(report.cogs)})</td>
              </tr>
              <tr style={{ borderBottom: '2px solid #404040' }}>
                <td style={{ paddingTop: '8px', paddingBottom: '12px', fontWeight: '600', color: '#ebebeb' }} colSpan="2">Total COGS</td>
                <td style={{ paddingTop: '8px', paddingBottom: '12px', textAlign: 'right', fontWeight: '700', color: '#f87171' }}>({formatCurrency(report.cogs)})</td>
              </tr>

              {/* Gross Profit */}
              <tr style={{ backgroundColor: '#333333' }}>
                <td style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', fontWeight: '700', color: '#ebebeb' }} colSpan="2">
                  GROSS PROFIT
                  <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '400', color: '#b3b3b3' }}>({formatPercentage(report.grossMargin)} margin)</span>
                </td>
                <td style={{
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  paddingRight: '16px',
                  textAlign: 'right',
                  fontWeight: '700',
                  fontSize: '18px',
                  color: report.grossProfit >= 0 ? '#22c55e' : '#ef4444'
                }}>
                  {formatCurrency(report.grossProfit)}
                </td>
              </tr>

              {/* Operating Expenses */}
              <tr style={{ borderBottom: '1px solid #404040' }}>
                <td style={{ paddingTop: '12px', paddingBottom: '12px' }} colSpan="3">
                  <div className="flex items-center space-x-2">
                    <Receipt style={{ height: '16px', width: '16px', color: '#ef4444' }} />
                    <span style={{
                      fontWeight: '600',
                      color: '#ebebeb',
                      textTransform: 'uppercase',
                      fontSize: '14px',
                      letterSpacing: '0.05em'
                    }}>Operating Expenses</span>
                  </div>
                </td>
              </tr>
              {Object.entries(report.expensesByCategory).length > 0 ? (
                Object.entries(report.expensesByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => (
                    <tr key={category} style={{
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#333333';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                      <td style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '32px', color: '#b3b3b3' }}>{category}</td>
                      <td style={{ textAlign: 'right', color: '#808080', fontSize: '14px' }}>
                        {formatPercentage((amount / report.totalExpenses) * 100)} of expenses
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '500', color: '#f87171', width: '128px' }}>({formatCurrency(amount)})</td>
                    </tr>
                  ))
              ) : (
                <tr style={{
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}>
                  <td style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '32px', color: '#b3b3b3' }}>No expenses recorded</td>
                  <td style={{ textAlign: 'right', color: '#808080', fontSize: '14px' }}>-</td>
                  <td style={{ textAlign: 'right', fontWeight: '500', color: '#ebebeb', width: '128px' }}>$0.00</td>
                </tr>
              )}
              <tr style={{ borderBottom: '2px solid #404040' }}>
                <td style={{ paddingTop: '8px', paddingBottom: '12px', fontWeight: '600', color: '#ebebeb' }} colSpan="2">
                  Total Operating Expenses
                  <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '400', color: '#b3b3b3' }}>({report.expensesCount} expenses)</span>
                </td>
                <td style={{ paddingTop: '8px', paddingBottom: '12px', textAlign: 'right', fontWeight: '700', color: '#f87171' }}>({formatCurrency(report.totalExpenses)})</td>
              </tr>

              {/* Operating Income */}
              <tr style={{ backgroundColor: '#333333' }}>
                <td style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', fontWeight: '700', color: '#ebebeb' }} colSpan="2">OPERATING INCOME</td>
                <td style={{
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  paddingRight: '16px',
                  textAlign: 'right',
                  fontWeight: '700',
                  fontSize: '18px',
                  color: (report.grossProfit - report.totalExpenses) >= 0 ? '#22c55e' : '#ef4444'
                }}>
                  {formatCurrency(report.grossProfit - report.totalExpenses)}
                </td>
              </tr>

              {/* Net Income */}
              <tr style={{
                background: 'linear-gradient(to right, #1c1c1c, #2a2a2a)',
                borderTop: '2px solid #404040'
              }}>
                <td style={{
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  paddingLeft: '16px',
                  fontWeight: '700',
                  fontSize: '18px',
                  color: '#ebebeb'
                }} colSpan="2">
                  NET INCOME
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#b3b3b3'
                  }}>({formatPercentage(report.netMargin)} margin)</span>
                </td>
                <td style={{
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  paddingRight: '16px',
                  textAlign: 'right',
                  fontWeight: '700',
                  fontSize: '20px',
                  color: report.netProfit >= 0 ? '#22c55e' : '#ef4444'
                }}>
                  {formatCurrency(report.netProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>{formatCurrency(report.revenue)}</div>
            <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Total Revenue</div>
            <div style={{ fontSize: '12px', color: '#808080', marginTop: '4px' }}>{report.salesCount} transactions</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{formatCurrency(report.totalExpenses)}</div>
            <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Total Expenses</div>
            <div style={{ fontSize: '12px', color: '#808080', marginTop: '4px' }}>{report.expensesCount} expenses</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: report.grossProfit >= 0 ? '#22c55e' : '#ef4444'
            }}>
              {formatPercentage(report.grossMargin)}
            </div>
            <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Gross Margin</div>
            <div style={{ fontSize: '12px', color: '#808080', marginTop: '4px' }}>{formatCurrency(report.grossProfit)} profit</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: report.netProfit >= 0 ? '#22c55e' : '#ef4444'
            }}>
              {formatPercentage(report.netMargin)}
            </div>
            <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Net Margin</div>
            <div style={{ fontSize: '12px', color: '#808080', marginTop: '4px' }}>{formatCurrency(report.netProfit)} net</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        {Object.keys(report.expensesByCategory).length > 0 && (
          <div style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #404040',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb', marginBottom: '16px' }}>Expenses by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(report.expensesByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span style={{ color: '#b3b3b3' }}>{category}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '500', color: '#ebebeb' }}>{formatCurrency(amount)}</span>
                      <div style={{ fontSize: '12px', color: '#808080' }}>
                        {formatPercentage((amount / report.totalExpenses) * 100)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Top Products by Revenue */}
        {report.salesByProduct.length > 0 && (
          <div style={{
            backgroundColor: '#2a2a2a',
            border: '1px solid #404040',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb', marginBottom: '16px' }}>Top Products by Revenue</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.salesByProduct.slice(0, 5).map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span style={{ color: '#ebebeb', fontWeight: '500' }}>{product.productName}</span>
                    <div style={{ fontSize: '12px', color: '#808080' }}>{product.quantity} units sold</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '500', color: '#22c55e' }}>{formatCurrency(product.revenue)}</span>
                    <div style={{ fontSize: '12px', color: '#808080' }}>+{formatCurrency(product.profit)} profit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current Assets */}
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb', marginBottom: '16px' }}>Current Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{formatCurrency(report.inventoryValue)}</div>
            <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Inventory Value</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#808080' }}>{formatCurrency(report.netProfit)}</div>
            <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Retained Earnings</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
              {formatCurrency(report.inventoryValue + Math.max(0, report.netProfit))}
            </div>
            <div style={{ fontSize: '14px', color: '#b3b3b3' }}>Total Assets</div>
          </div>
        </div>
      </div>
    </div>
  );
}