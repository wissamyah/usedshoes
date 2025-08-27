import { memo, useMemo, useCallback, forwardRef } from 'react';
import { useMemoizedCalculations, useOptimizedSearch } from '../../hooks/usePerformance';

// Memoized KPI calculation component
export const OptimizedKPICard = memo(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = 'blue',
  trend = null,
  isLoading = false 
}) => {
  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    return value;
  }, [value]);

  const colorClasses = useMemo(() => ({
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-600' }
  }), []);

  const classes = colorClasses[color] || colorClasses.blue;

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg bg-gray-200 w-14 h-14`}></div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${classes.bg}`}>
          <Icon className={`h-8 w-8 ${classes.icon}`} aria-hidden="true" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          <div className="flex items-center">
            <p className="text-sm text-gray-600">{description}</p>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↗' : '↘'} {trend.percentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

OptimizedKPICard.displayName = 'OptimizedKPICard';

// Optimized search input component
export const OptimizedSearchInput = memo(({ 
  onSearchChange, 
  placeholder = 'Search...', 
  className = '',
  debounceMs = 300 
}) => {
  const handleInputChange = useCallback((e) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onChange={handleInputChange}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
});

OptimizedSearchInput.displayName = 'OptimizedSearchInput';

// Optimized data table with virtualization for large datasets
export const OptimizedDataTable = memo(({ 
  data = [], 
  columns = [], 
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick = null,
  maxHeight = 400,
  rowHeight = 60
}) => {
  const tableData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const headerRow = useMemo(() => (
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr>
        {columns.map((column, index) => (
          <th
            key={column.key || index}
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  ), [columns]);

  const tableRows = useMemo(() => {
    if (isLoading) {
      return (
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: 5 }, (_, index) => (
            <tr key={index} className="animate-pulse">
              {columns.map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      );
    }

    if (tableData.length === 0) {
      return (
        <tbody className="bg-white">
          <tr>
            <td colSpan={columns.length} className="px-6 py-12 text-center">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">{emptyMessage}</p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className="bg-white divide-y divide-gray-200">
        {tableData.map((row, rowIndex) => (
          <tr 
            key={row.id || rowIndex}
            onClick={() => onRowClick && onRowClick(row)}
            className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
          >
            {columns.map((column, colIndex) => {
              const cellValue = column.accessor ? column.accessor(row) : row[column.key];
              return (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.cell ? column.cell(cellValue, row) : cellValue}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    );
  }, [tableData, columns, isLoading, emptyMessage, onRowClick]);

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div 
        className="overflow-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <table className="min-w-full divide-y divide-gray-300">
          {headerRow}
          {tableRows}
        </table>
      </div>
    </div>
  );
});

OptimizedDataTable.displayName = 'OptimizedDataTable';

// Optimized form field component
export const OptimizedFormField = memo(forwardRef(({ 
  label, 
  type = 'text', 
  error, 
  helper,
  required = false,
  className = '',
  ...props 
}, ref) => {
  const inputClasses = useMemo(() => {
    const base = "mt-1 block w-full border rounded-md shadow-sm py-3 px-3 text-base focus:outline-none focus:ring-2";
    const errorClasses = error 
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
    return `${base} ${errorClasses} ${className}`;
  }, [error, className]);

  const fieldId = useMemo(() => {
    return props.id || props.name || `field-${Math.random().toString(36).substr(2, 9)}`;
  }, [props.id, props.name]);

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          ref={ref}
          id={fieldId}
          className={inputClasses}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          ref={ref}
          id={fieldId}
          className={inputClasses}
          {...props}
        >
          {props.children}
        </select>
      ) : (
        <input
          ref={ref}
          type={type}
          id={fieldId}
          className={inputClasses}
          {...props}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}
      
      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
}));

OptimizedFormField.displayName = 'OptimizedFormField';

// Optimized chart wrapper that only re-renders when data changes
export const OptimizedChartWrapper = memo(({ 
  title, 
  children, 
  isLoading = false,
  error = null,
  className = '' 
}) => {
  if (isLoading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-3">
            <div className="flex items-end space-x-2 h-32">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-t flex-1"
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Chart Error</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
});

OptimizedChartWrapper.displayName = 'OptimizedChartWrapper';

// Performance monitoring component (dev only)
export const PerformanceMonitor = memo(() => {
  if (process.env.NODE_ENV !== 'development') return null;

  const { metrics } = useMemoizedCalculations([], []);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
      <div>Renders: {metrics.count}</div>
      {metrics.memoryUsage && (
        <div>Memory: {Math.round(metrics.memoryUsage.used / 1048576)}MB</div>
      )}
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';