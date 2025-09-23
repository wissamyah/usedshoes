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

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-50 text-blue-700 border-blue-500' : 'hover:bg-blue-50/50',
      purple: isActive ? 'bg-purple-50 text-purple-700 border-purple-500' : 'hover:bg-purple-50/50',
      indigo: isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-500' : 'hover:bg-indigo-50/50',
      green: isActive ? 'bg-green-50 text-green-700 border-green-500' : 'hover:bg-green-50/50',
      red: isActive ? 'bg-red-50 text-red-700 border-red-500' : 'hover:bg-red-50/50',
      yellow: isActive ? 'bg-yellow-50 text-yellow-700 border-yellow-500' : 'hover:bg-yellow-50/50',
      cyan: isActive ? 'bg-cyan-50 text-cyan-700 border-cyan-500' : 'hover:bg-cyan-50/50',
      gray: isActive ? 'bg-gray-100 text-gray-700 border-gray-500' : 'hover:bg-gray-50',
    };
    return colors[color] || colors.gray;
  };

  const getIconColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500',
      purple: isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-500',
      indigo: isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500',
      green: isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500',
      red: isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-500',
      yellow: isActive ? 'text-yellow-600' : 'text-gray-400 group-hover:text-yellow-500',
      cyan: isActive ? 'text-cyan-600' : 'text-gray-400 group-hover:text-cyan-500',
      gray: isActive ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500',
    };
    return colors[color] || colors.gray;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="sm:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            {navigationTabs.find(tab => tab.id === activeTab)?.icon && (() => {
              const Icon = navigationTabs.find(tab => tab.id === activeTab).icon;
              const activeTabData = navigationTabs.find(tab => tab.id === activeTab);
              return (
                <div className={`p-2 rounded-lg mr-3 bg-${activeTabData.color}-100`}>
                  <Icon className={`h-5 w-5 text-${activeTabData.color}-600`} />
                </div>
              );
            })()}
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {navigationTabs.find(tab => tab.id === activeTab)?.name || 'Menu'}
              </div>
              <div className="text-xs text-gray-500">
                {navigationTabs.find(tab => tab.id === activeTab)?.description}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isMobileMenuOpen
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
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
        <div className={`fixed top-0 left-0 right-0 bottom-0 z-40 bg-white overflow-y-auto transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
            {/* Menu header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Navigation</p>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {navigationTabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <div key={tab.id}>
                    <button
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full group flex items-center px-4 py-4 text-left transition-all duration-200 relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-white to-gray-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${tab.color}-500`} />
                      )}

                      {/* Icon container */}
                      <div className={`relative p-2.5 rounded-xl mr-4 transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-br from-${tab.color}-100 to-${tab.color}-50 shadow-sm`
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <Icon className={`h-5 w-5 transition-colors duration-200 ${
                          isActive
                            ? `text-${tab.color}-600`
                            : 'text-gray-500 group-hover:text-gray-700'
                        }`} />
                      </div>

                      {/* Text content */}
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {tab.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {tab.description}
                        </div>
                      </div>

                    </button>

                    {/* Separator - except for last item */}
                    {index < navigationTabs.length - 1 && (
                      <div className="mx-4 border-b border-gray-100" />
                    )}
                  </div>
                );
              })}
            </div>

          </div>
      </div>

      {/* Desktop navigation */}
      <nav className={`hidden sm:block sticky top-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white'
      }`}>
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`group relative flex items-center py-4 px-6 font-medium text-sm whitespace-nowrap transition-all duration-200 border-b-3 ${
                    isActive
                      ? `border-${tab.color}-500 text-gray-900 bg-gradient-to-t from-${tab.color}-50/50 to-transparent`
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`relative flex items-center`}>
                    <div className={`p-1.5 rounded-lg mr-2.5 transition-all duration-200 ${
                      isActive
                        ? `bg-${tab.color}-100`
                        : 'bg-transparent group-hover:bg-gray-100'
                    }`}>
                      <Icon className={`h-4 w-4 transition-colors duration-200 ${
                        getIconColorClasses(tab.color, isActive)
                      }`} />
                    </div>
                    <span>
                      {tab.name}
                    </span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {tab.description}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navigation;