import { useState, useEffect } from 'react';

export default function ReportFilters({ dateRange, onDateRangeChange }) {
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange]);

  const presetRanges = [
    { id: 'today', label: 'Today', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] },
    { 
      id: 'thisWeek', 
      label: 'This Week', 
      startDate: getWeekStart(),
      endDate: new Date().toISOString().split('T')[0]
    },
    { 
      id: 'thisMonth', 
      label: 'This Month', 
      startDate: new Date().toISOString().substring(0, 7) + '-01',
      endDate: new Date().toISOString().split('T')[0]
    },
    { 
      id: 'lastMonth', 
      label: 'Last Month', 
      startDate: getLastMonthStart(),
      endDate: getLastMonthEnd()
    },
    { 
      id: 'thisYear', 
      label: 'This Year', 
      startDate: new Date().getFullYear() + '-01-01',
      endDate: new Date().toISOString().split('T')[0]
    },
    { 
      id: 'lastYear', 
      label: 'Last Year', 
      startDate: (new Date().getFullYear() - 1) + '-01-01',
      endDate: (new Date().getFullYear() - 1) + '-12-31'
    },
    { id: 'allTime', label: 'All Time', startDate: '', endDate: '' },
  ];

  function getWeekStart() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(today.setDate(diff)).toISOString().split('T')[0];
  }

  function getLastMonthStart() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
  }

  function getLastMonthEnd() {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
  }

  const handlePresetChange = (preset) => {
    const newRange = {
      startDate: preset.startDate,
      endDate: preset.endDate,
      preset: preset.id
    };
    setLocalDateRange(newRange);
    onDateRangeChange(newRange);
  };

  const handleCustomDateChange = (field, value) => {
    const newRange = {
      ...localDateRange,
      [field]: value,
      preset: 'custom'
    };
    setLocalDateRange(newRange);
    onDateRangeChange(newRange);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
      
      {/* Preset Date Ranges */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Quick Date Ranges</label>
        <div className="flex flex-wrap gap-2">
          {presetRanges.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                localDateRange.preset === preset.id
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Custom Date Range</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={localDateRange.startDate}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              value={localDateRange.endDate}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Clear Custom Range */}
        {localDateRange.preset === 'custom' && (localDateRange.startDate || localDateRange.endDate) && (
          <button
            onClick={() => handleCustomDateChange('startDate', '') || handleCustomDateChange('endDate', '')}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear custom range
          </button>
        )}
      </div>

      {/* Date Range Summary */}
      {(localDateRange.startDate || localDateRange.endDate) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <strong>Selected Period:</strong>{' '}
            {localDateRange.startDate && localDateRange.endDate ? (
              localDateRange.startDate === localDateRange.endDate ? (
                new Date(localDateRange.startDate).toLocaleDateString()
              ) : (
                `${new Date(localDateRange.startDate).toLocaleDateString()} - ${new Date(localDateRange.endDate).toLocaleDateString()}`
              )
            ) : localDateRange.startDate ? (
              `From ${new Date(localDateRange.startDate).toLocaleDateString()}`
            ) : (
              `Until ${new Date(localDateRange.endDate).toLocaleDateString()}`
            )}
          </div>
        </div>
      )}
    </div>
  );
}