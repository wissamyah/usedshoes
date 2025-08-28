import { useState } from 'react';
import {
  BarChart3,
  Package,
  ShoppingBag,
  DollarSign,
  Receipt,
  FileBarChart,
  Settings,
  Wallet,
} from 'lucide-react';

const navigationTabs = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: BarChart3,
    description: 'Overview and KPIs',
  },
  {
    id: 'products',
    name: 'Products',
    icon: Package,
    description: 'Inventory management',
  },
  {
    id: 'containers',
    name: 'Containers',
    icon: ShoppingBag,
    description: 'Container tracking',
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: DollarSign,
    description: 'Sales transactions',
  },
  {
    id: 'expenses',
    name: 'Expenses',
    icon: Receipt,
    description: 'Expense tracking',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: Wallet,
    description: 'Cash flow & withdrawals',
  },
  {
    id: 'reports',
    name: 'Reports',
    icon: FileBarChart,
    description: 'Analytics & P&L',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'App configuration',
  },
];

function Navigation({ activeTab, onTabChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {navigationTabs.find(tab => tab.id === activeTab)?.name || 'Menu'}
          <svg
            className={`ml-2 h-5 w-5 transition-transform ${
              isMobileMenuOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop navigation */}
      <nav className="hidden sm:block">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {tab.name}
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