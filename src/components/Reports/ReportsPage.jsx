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
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive business performance analysis</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <ExportButton dateRange={dateRange} activeReport={activeReport} />
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeReport === report.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>
                  <div>{report.name}</div>
                  <div className="text-xs font-normal">{report.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Report Filters */}
      <div className="mb-6">
        <ReportFilters 
          dateRange={dateRange} 
          onDateRangeChange={handleDateRangeChange}
        />
      </div>

      {/* Report Content */}
      <div className="space-y-6">
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