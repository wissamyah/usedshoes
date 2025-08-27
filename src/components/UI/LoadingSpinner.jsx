import Modal from './Modal';

export default function LoadingSpinner({ size = 'md', text = '', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <svg
            className="w-full h-full"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
              className="opacity-25"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="15.708"
              className="opacity-75"
            />
          </svg>
        </div>
      </div>
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

// Skeleton loading components for different content types
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 p-3 rounded-lg bg-gray-200 w-14 h-14"></div>
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="divide-y divide-gray-200">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3">
          <div className="flex space-x-4">
            {Array.from({ length: columns }, (_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${100 / columns}%` }}></div>
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }, (_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-gray-200 rounded animate-pulse"
                  style={{ width: `${100 / columns}%` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse ${className}`}>
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
        <div className="flex justify-between text-sm">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-8"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ text = 'Loading...', isVisible = true }) {
  if (!isVisible) return null;

  return (
    <Modal isOpen={isVisible} preventClose={true} size="small">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{text}</h3>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we process your request...
          </p>
        </div>
      </div>
    </Modal>
  );
}

// Inline loading states for buttons
export function ButtonSpinner({ className = '' }) {
  return (
    <svg
      className={`animate-spin -ml-1 mr-3 h-4 w-4 text-white ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}