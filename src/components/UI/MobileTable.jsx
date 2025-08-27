import { useState } from 'react';
import { useScreenSize } from './ResponsiveContainer';

// Mobile-friendly table that switches to cards on small screens
export default function MobileTable({ 
  data = [], 
  columns = [], 
  keyField = 'id',
  onRowClick = null,
  emptyMessage = 'No data available',
  loading = false,
  className = ''
}) {
  const { isMobile } = useScreenSize();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort data based on current sort config
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {sortedData.map((item, index) => (
          <div
            key={item[keyField] || index}
            className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${
              onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
            onClick={() => onRowClick && onRowClick(item)}
          >
            <div className="space-y-3">
              {columns.map((column, columnIndex) => {
                const value = column.accessor ? column.accessor(item) : item[column.key];
                
                return (
                  <div key={columnIndex} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {column.header}
                    </span>
                    <span className="text-sm text-gray-900 text-right">
                      {column.cell ? column.cell(value, item) : value}
                    </span>
                  </div>
                );
              })}
            </div>
            {onRowClick && (
              <div className="mt-3 flex justify-end">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sortConfig.key === column.key && (
                      <svg
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          sortConfig.direction === 'desc' ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr
                key={item[keyField] || index}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column, columnIndex) => {
                  const value = column.accessor ? column.accessor(item) : item[column.key];
                  
                  return (
                    <td
                      key={columnIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.cell ? column.cell(value, item) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Predefined column helpers
export const currencyColumn = (key, header, sortable = true) => ({
  key,
  header,
  sortable,
  cell: (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
});

export const dateColumn = (key, header, sortable = true) => ({
  key,
  header,
  sortable,
  cell: (value) => value ? new Date(value).toLocaleDateString() : '-'
});

export const badgeColumn = (key, header, colorMap = {}) => ({
  key,
  header,
  sortable: true,
  cell: (value) => (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      colorMap[value] || 'bg-gray-100 text-gray-800'
    }`}>
      {value}
    </span>
  )
});

export const actionColumn = (header, actions = []) => ({
  key: 'actions',
  header,
  cell: (_, item) => (
    <div className="flex space-x-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item);
          }}
          className={`p-1 rounded-md hover:bg-gray-100 ${action.className || ''}`}
          title={action.title}
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
});