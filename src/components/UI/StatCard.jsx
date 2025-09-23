import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  trend,
  trendValue,
  loading = false
}) {
  const bgColors = {
    'bg-blue-100': 'bg-gradient-to-br from-blue-50 to-blue-100',
    'bg-green-100': 'bg-gradient-to-br from-green-50 to-green-100',
    'bg-purple-100': 'bg-gradient-to-br from-purple-50 to-purple-100',
    'bg-yellow-100': 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    'bg-red-100': 'bg-gradient-to-br from-red-50 to-red-100',
    'bg-orange-100': 'bg-gradient-to-br from-orange-50 to-orange-100',
    'bg-pink-100': 'bg-gradient-to-br from-pink-50 to-pink-100',
    'bg-indigo-100': 'bg-gradient-to-br from-indigo-50 to-indigo-100',
  };

  const gradientBg = bgColors[iconBgColor] || iconBgColor;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${gradientBg}`}>
              {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <dt className="text-sm font-medium text-gray-600 truncate">
                  {title}
                </dt>
                <dd className="mt-1">
                  <div className="text-2xl font-semibold text-gray-900">
                    {value}
                  </div>
                  {(subtitle || trendValue) && (
                    <div className="mt-1 flex items-center text-xs">
                      {trend && (
                        <span className={`font-medium mr-1 ${
                          trend === 'up' ? 'text-green-600' :
                          trend === 'down' ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                          {trendValue && ` ${trendValue}`}
                        </span>
                      )}
                      {subtitle && (
                        <span className="text-gray-500">{subtitle}</span>
                      )}
                    </div>
                  )}
                </dd>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}