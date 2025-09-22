import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, Filter, X } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Report Filters</h3>
          </div>
          {(localDateRange.startDate || localDateRange.endDate) && (
            <button
              onClick={() => {
                const newRange = { startDate: '', endDate: '', preset: 'allTime' };
                setLocalDateRange(newRange);
                onDateRangeChange(newRange);
              }}
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              <X className="h-3 sm:h-4 w-3 sm:w-4" />
              <span className="hidden sm:inline">Clear all</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Preset Date Ranges */}
        <div>
          <div className="flex items-center mb-2 sm:mb-3">
            <Clock className="h-4 w-4 text-gray-500 mr-2" />
            <label className="text-sm font-medium text-gray-700">Quick Date Ranges</label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {presetRanges.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-200 ${
                  localDateRange.preset === preset.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div>
          <div className="flex items-center mb-2 sm:mb-3">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <label className="text-sm font-medium text-gray-700">Custom Date Range</label>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1.5">From</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    id="startDate"
                    value={localDateRange.startDate}
                    onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1.5">To</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    id="endDate"
                    value={localDateRange.endDate}
                    onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Clear Custom Range */}
            {localDateRange.preset === 'custom' && (localDateRange.startDate || localDateRange.endDate) && (
              <button
                onClick={() => {
                  handleCustomDateChange('startDate', '');
                  handleCustomDateChange('endDate', '');
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear custom range
              </button>
            )}
          </div>
        </div>

        {/* Date Range Summary */}
        {(localDateRange.startDate || localDateRange.endDate) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Active Period</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {localDateRange.startDate && localDateRange.endDate ? (
                      localDateRange.startDate === localDateRange.endDate ? (
                        formatDate(localDateRange.startDate)
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{formatDate(localDateRange.startDate)}</span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(localDateRange.endDate)}</span>
                        </div>
                      )
                    ) : localDateRange.startDate ? (
                      `From ${formatDate(localDateRange.startDate)}`
                    ) : (
                      `Until ${formatDate(localDateRange.endDate)}`
                    )}
                  </div>
                </div>
              </div>
              {localDateRange.startDate && localDateRange.endDate && (
                <div className="text-right">
                  <div className="text-xs text-gray-600">Duration</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {Math.ceil((new Date(localDateRange.endDate) - new Date(localDateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}