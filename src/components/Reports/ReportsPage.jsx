import { useState } from 'react';
import ProfitLoss from './ProfitLoss';
import SalesReport from './SalesReport';
import ExpenseReport from './ExpenseReport';
import ReportFilters from './ReportFilters';
import ExportButton from './ExportButton';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    preset: 'thisMonth'
  });

  const [activeReport, setActiveReport] = useState('profitLoss'); // profitLoss, sales, expenses

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const reports = [
    { id: 'profitLoss', name: 'Profit & Loss', description: 'Revenue, expenses, and profitability analysis' },
    { id: 'sales', name: 'Sales Report', description: 'Detailed sales performance analysis' },
    { id: 'expenses', name: 'Expense Report', description: 'Expense breakdown and analysis' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ebebeb' }}>Reports & Analytics</h2>
          <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '6px' }}>Comprehensive business performance analysis</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <ExportButton dateRange={dateRange} activeReport={activeReport} />
        </div>
      </div>

      {/* Enhanced Report Type Selector */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          border: '1px solid #404040',
          padding: '8px',
          overflow: 'hidden'
        }}>
          <nav className="flex">
            {reports.map((report, index) => (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                style={{
                  flex: '1',
                  padding: '16px 20px',
                  borderRadius: '8px',
                  backgroundColor: activeReport === report.id ? '#3b82f6' : 'transparent',
                  color: activeReport === report.id ? 'white' : '#b3b3b3',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'center',
                  marginRight: index < reports.length - 1 ? '4px' : '0'
                }}
                onMouseEnter={(e) => {
                  if (activeReport !== report.id) {
                    e.target.style.backgroundColor = '#333333';
                    e.target.style.color = '#ebebeb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeReport !== report.id) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#b3b3b3';
                  }
                }}
                title={`${report.name}: ${report.description}`}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {report.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    opacity: activeReport === report.id ? 0.9 : 0.7,
                    lineHeight: '1.3'
                  }} className="hidden sm:block">
                    {report.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Report Filters */}
      <div style={{ marginBottom: '32px' }}>
        <ReportFilters
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      {/* Report Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {activeReport === 'profitLoss' && (
          <ProfitLoss
            startDate={dateRange.startDate || null}
            endDate={dateRange.endDate || null}
          />
        )}

        {activeReport === 'sales' && (
          <SalesReport
            startDate={dateRange.startDate || null}
            endDate={dateRange.endDate || null}
          />
        )}

        {activeReport === 'expenses' && (
          <ExpenseReport
            startDate={dateRange.startDate || null}
            endDate={dateRange.endDate || null}
          />
        )}
      </div>
    </div>
  );
}