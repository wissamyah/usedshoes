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
    <div style={{
      backgroundColor: '#2a2a2a',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #404040',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {Icon && <Icon style={{ height: '24px', width: '24px', color: '#ebebeb', opacity: 0.7 }} />}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            {loading ? (
              <div className="animate-pulse">
                <div style={{
                  height: '16px',
                  backgroundColor: '#404040',
                  borderRadius: '4px',
                  width: '75%',
                  marginBottom: '8px'
                }}></div>
                <div style={{
                  height: '24px',
                  backgroundColor: '#404040',
                  borderRadius: '4px',
                  width: '50%'
                }}></div>
              </div>
            ) : (
              <>
                <dt style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#b3b3b3',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  {title}
                </dt>
                <dd className="mt-1">
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#ebebeb'
                  }}>
                    {value}
                  </div>
                  {(subtitle || trendValue) && (
                    <div className="mt-1 flex items-center text-xs">
                      {trend && (
                        <span style={{
                          fontWeight: '500',
                          marginRight: '4px',
                          color: trend === 'up' ? '#22c55e' :
                                 trend === 'down' ? '#ef4444' :
                                 '#808080'
                        }}>
                          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                          {trendValue && ` ${trendValue}`}
                        </span>
                      )}
                      {subtitle && (
                        <span style={{ color: '#808080' }}>{subtitle}</span>
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