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
    <div style={{
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      border: '1px solid #404040',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#333333',
        padding: '16px 20px',
        borderBottom: '1px solid #404040'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter style={{ height: '18px', width: '18px', color: '#3b82f6' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ebebeb' }}>Report Filters</h3>
          </div>
          {(localDateRange.startDate || localDateRange.endDate) && (
            <button
              onClick={() => {
                const newRange = { startDate: '', endDate: '', preset: 'allTime' };
                setLocalDateRange(newRange);
                onDateRangeChange(newRange);
              }}
              style={{
                fontSize: '12px',
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              <X style={{ height: '14px', width: '14px' }} />
              <span className="hidden sm:inline">Clear all</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Preset Date Ranges */}
        <div>
          <div className="flex items-center mb-3">
            <Clock style={{ height: '16px', width: '16px', color: '#808080', marginRight: '8px' }} />
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#b3b3b3' }}>Quick Date Ranges</label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {presetRanges.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset)}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: localDateRange.preset === preset.id ? '#3b82f6' : '#404040',
                  backgroundColor: localDateRange.preset === preset.id ? '#3b82f6' : '#1c1c1c',
                  color: localDateRange.preset === preset.id ? 'white' : '#ebebeb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (localDateRange.preset !== preset.id) {
                    e.target.style.backgroundColor = '#333333';
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (localDateRange.preset !== preset.id) {
                    e.target.style.backgroundColor = '#1c1c1c';
                    e.target.style.borderColor = '#404040';
                  }
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div>
          <div className="flex items-center mb-3">
            <Calendar style={{ height: '16px', width: '16px', color: '#808080', marginRight: '8px' }} />
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#b3b3b3' }}>Custom Date Range</label>
          </div>
          <div style={{ backgroundColor: '#1c1c1c', borderRadius: '8px', padding: '16px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="startDate" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#808080', marginBottom: '6px' }}>From</label>
                <div className="relative">
                  <Calendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: '#808080' }} />
                  <input
                    type="date"
                    id="startDate"
                    value={localDateRange.startDate}
                    onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      border: '1px solid #404040',
                      borderRadius: '6px',
                      backgroundColor: '#2a2a2a',
                      color: '#ebebeb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#404040';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="endDate" style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#808080', marginBottom: '6px' }}>To</label>
                <div className="relative">
                  <Calendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: '#808080' }} />
                  <input
                    type="date"
                    id="endDate"
                    value={localDateRange.endDate}
                    onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      border: '1px solid #404040',
                      borderRadius: '6px',
                      backgroundColor: '#2a2a2a',
                      color: '#ebebeb',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#404040';
                      e.target.style.boxShadow = 'none';
                    }}
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
                style={{
                  marginTop: '12px',
                  fontSize: '14px',
                  color: '#3b82f6',
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#3b82f6';
                }}
              >
                <X style={{ height: '12px', width: '12px' }} />
                Clear custom range
              </button>
            )}
          </div>
        </div>

        {/* Date Range Summary */}
        {(localDateRange.startDate || localDateRange.endDate) && (
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div style={{
                  height: '32px',
                  width: '32px',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Calendar style={{ height: '16px', width: '16px', color: '#3b82f6' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Period</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ebebeb', marginTop: '2px' }}>
                    {localDateRange.startDate && localDateRange.endDate ? (
                      localDateRange.startDate === localDateRange.endDate ? (
                        formatDate(localDateRange.startDate)
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{formatDate(localDateRange.startDate)}</span>
                          <ChevronRight style={{ height: '16px', width: '16px', color: '#808080' }} />
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
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Duration</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ebebeb' }}>
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