import { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  ShoppingBag,
  DollarSign,
  Receipt,
  FileBarChart,
  Settings,
  Wallet,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

const navigationTabs = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: BarChart3,
    description: 'Overview and KPIs',
    color: 'blue',
  },
  {
    id: 'products',
    name: 'Products',
    icon: Package,
    description: 'Inventory management',
    color: 'purple',
  },
  {
    id: 'containers',
    name: 'Containers',
    icon: ShoppingBag,
    description: 'Container tracking',
    color: 'indigo',
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: DollarSign,
    description: 'Sales transactions',
    color: 'green',
  },
  {
    id: 'expenses',
    name: 'Expenses',
    icon: Receipt,
    description: 'Expense tracking',
    color: 'red',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: Wallet,
    description: 'Cash flow & withdrawals',
    color: 'yellow',
  },
  {
    id: 'reports',
    name: 'Reports',
    icon: FileBarChart,
    description: 'Analytics & P&L',
    color: 'cyan',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'App configuration',
    color: 'gray',
  },
];

function Navigation({ activeTab, onTabChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      {/* Mobile menu button - sticky on mobile */}
      <div className="sm:hidden sticky top-0 z-40" style={{
        backgroundColor: '#2a2a2a',
        borderBottom: '1px solid #404040',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              {navigationTabs.find(tab => tab.id === activeTab)?.icon && (() => {
                const Icon = navigationTabs.find(tab => tab.id === activeTab).icon;
                const activeTabData = navigationTabs.find(tab => tab.id === activeTab);
                return (
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    marginRight: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <Icon style={{ height: '20px', width: '20px', color: '#60a5fa' }} />
                  </div>
                );
              })()}
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ebebeb'
                }}>
                  {navigationTabs.find(tab => tab.id === activeTab)?.name || 'Menu'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                backgroundColor: isMobileMenuOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: isMobileMenuOpen ? '#ebebeb' : '#b3b3b3',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isMobileMenuOpen) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobileMenuOpen) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
        </div>
      </div>


      {/* Mobile menu overlay */}
      <div className={`sm:hidden ${isMobileMenuOpen ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Slide-out menu */}
        <div className={`fixed inset-0 z-50 overflow-y-auto transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`} style={{ backgroundColor: '#1c1c1c' }}>
            {/* Menu header */}
            <div style={{
              padding: '12px 0',
              borderBottom: '1px solid #404040',
              background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(28, 28, 28, 0.95) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '16px',
              paddingRight: '16px'
            }}>
              <p style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#808080',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Navigation</p>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#b3b3b3',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {navigationTabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                // Get tab-specific colors for mobile menu
                const getTabColors = (color) => {
                  const colorMap = {
                    blue: { active: '#3b82f6', bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))', icon: '#60a5fa' },
                    purple: { active: '#8b5cf6', bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))', icon: '#a78bfa' },
                    indigo: { active: '#6366f1', bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))', icon: '#818cf8' },
                    green: { active: '#10b981', bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))', icon: '#34d399' },
                    red: { active: '#ef4444', bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))', icon: '#f87171' },
                    yellow: { active: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))', icon: '#fbbf24' },
                    cyan: { active: '#06b6d4', bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.1))', icon: '#22d3ee' },
                    gray: { active: '#6b7280', bg: 'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(107, 114, 128, 0.1))', icon: '#9ca3af' }
                  };
                  return colorMap[color] || colorMap.gray;
                };

                const colors = getTabColors(tab.color);

                return (
                  <div key={tab.id}>
                    <button
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full group flex items-center py-4 text-left transition-all duration-200 relative overflow-hidden px-4"
                      style={{
                        background: isActive
                          ? 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                          : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';

                          // Brighten icon on hover
                          const icon = e.currentTarget.querySelector('.tab-icon');
                          if (icon) {
                            icon.style.color = colors.icon;
                          }

                          // Brighten text on hover
                          const textElement = e.currentTarget.querySelector('.tab-text');
                          if (textElement) {
                            textElement.style.color = '#ebebeb';
                          }

                          // Brighten icon container on hover
                          const iconContainer = e.currentTarget.querySelector('.icon-container');
                          if (iconContainer) {
                            iconContainer.style.background = 'rgba(255, 255, 255, 0.15)';
                          }
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';

                          // Reset icon color
                          const icon = e.currentTarget.querySelector('.tab-icon');
                          if (icon) {
                            icon.style.color = '#808080';
                          }

                          // Reset text color
                          const textElement = e.currentTarget.querySelector('.tab-text');
                          if (textElement) {
                            textElement.style.color = '#b3b3b3';
                          }

                          // Reset icon container
                          const iconContainer = e.currentTarget.querySelector('.icon-container');
                          if (iconContainer) {
                            iconContainer.style.background = 'rgba(255, 255, 255, 0.1)';
                          }
                        }
                      }}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{
                          backgroundColor: colors.active
                        }} />
                      )}

                      {/* Icon container */}
                      <div
                        className="relative p-2.5 rounded-xl mr-4 transition-all duration-300 icon-container"
                        style={{
                          background: isActive ? colors.bg : 'rgba(255, 255, 255, 0.1)',
                          boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.2)' : 'none'
                        }}
                      >
                        <Icon
                          className="h-5 w-5 transition-colors duration-200 tab-icon"
                          style={{
                            color: isActive ? colors.icon : '#808080'
                          }}
                        />
                      </div>

                      {/* Text content */}
                      <div className="flex-1">
                        <div className="font-medium text-sm tab-text" style={{
                          color: isActive ? '#ebebeb' : '#b3b3b3'
                        }}>
                          {tab.name}
                        </div>
                      </div>

                    </button>

                    {/* Separator - except for last item */}
                    {index < navigationTabs.length - 1 && (
                      <div style={{ borderBottom: '1px solid #404040' }} />
                    )}
                  </div>
                );
              })}
            </div>

          </div>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden sm:block sticky top-0 z-40" style={{
        backgroundColor: isScrolled ? 'rgba(42, 42, 42, 0.95)' : '#2a2a2a',
        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
        boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : 'none',
        transition: 'all 0.3s'
      }}>
        <div style={{ borderBottom: '1px solid #404040' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto scrollbar-hide">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              // Get tab-specific colors for dark theme
              const getTabColors = (color) => {
                const colorMap = {
                  blue: { active: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: '#60a5fa' },
                  purple: { active: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: '#a78bfa' },
                  indigo: { active: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', icon: '#818cf8' },
                  green: { active: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: '#34d399' },
                  red: { active: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: '#f87171' },
                  yellow: { active: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '#fbbf24' },
                  cyan: { active: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', icon: '#22d3ee' },
                  gray: { active: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', icon: '#9ca3af' }
                };
                return colorMap[color] || colorMap.gray;
              };

              const colors = getTabColors(tab.color);

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="group relative flex items-center py-4 px-6 font-medium text-sm whitespace-nowrap transition-all duration-200"
                  style={{
                    borderBottom: isActive ? `3px solid ${colors.active}` : '3px solid transparent',
                    color: isActive ? '#ebebeb' : '#b3b3b3',
                    background: isActive ? colors.bg : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.color = '#ebebeb';
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.color = '#b3b3b3';
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="relative flex items-center">
                    <div className="p-1.5 rounded-lg mr-2.5 transition-all duration-200" style={{
                      backgroundColor: isActive ? colors.bg : 'transparent'
                    }}>
                      <Icon className="h-4 w-4 transition-colors duration-200" style={{
                        color: isActive ? colors.icon : '#808080'
                      }} />
                    </div>
                    <span>
                      {tab.name}
                    </span>
                  </div>

                </button>
              );
            })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navigation;