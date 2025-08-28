import { lazy, Suspense } from 'react';
import LoadingSpinner, { SkeletonCard, SkeletonChart, SkeletonTable } from './UI/LoadingSpinner';
import ErrorBoundary from './UI/ErrorBoundary';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./Dashboard/Dashboard'));
const ProductsPage = lazy(() => import('./Products/ProductsPage'));
const ContainersPage = lazy(() => import('./Containers/ContainersPage'));
const SalesPage = lazy(() => import('./Sales/SalesPage'));
const ExpensesPage = lazy(() => import('./Expenses/ExpensesPage'));
const FinancePage = lazy(() => import('./Finance/FinancePage'));
const ReportsPage = lazy(() => import('./Reports/ReportsPage'));
const SettingsPage = lazy(() => import('./Settings/SettingsPage'));

// Chart components (loaded separately for better chunking)
const SalesChart = lazy(() => import('./Dashboard/SalesChart'));
const ExpenseChart = lazy(() => import('./Dashboard/ExpenseChart'));
const TopProductsChart = lazy(() => import('./Dashboard/TopProductsChart'));

// Form components (loaded separately)
const ProductForm = lazy(() => import('./Products/ProductForm'));
const ContainerForm = lazy(() => import('./Containers/ContainerForm'));
const SalesForm = lazy(() => import('./Sales/SalesForm'));
const ExpenseForm = lazy(() => import('./Expenses/ExpenseForm'));

// Higher-order component for lazy loading with error boundary and custom loading
export function withLazyLoading(LazyComponent, LoadingComponent = null, fallbackComponent = null) {
  return function LazyWrapper(props) {
    const defaultLoading = LoadingComponent || (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );

    return (
      <ErrorBoundary fallback={fallbackComponent}>
        <Suspense fallback={defaultLoading}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// Pre-configured lazy components with appropriate loading states
export const LazyDashboard = withLazyLoading(Dashboard, (
  <div className="p-4 sm:p-6 space-y-6">
    <div className="space-y-2">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    <SkeletonChart />
  </div>
));

export const LazyProductsPage = withLazyLoading(ProductsPage, (
  <div className="p-4 sm:p-6 space-y-6">
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
    </div>
    <SkeletonTable rows={8} columns={5} />
  </div>
));

export const LazyContainersPage = withLazyLoading(ContainersPage, (
  <div className="p-4 sm:p-6 space-y-6">
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded w-36 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-28 animate-pulse"></div>
    </div>
    <SkeletonTable rows={6} columns={6} />
  </div>
));

export const LazySalesPage = withLazyLoading(SalesPage, (
  <div className="p-4 sm:p-6 space-y-6">
    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    <SkeletonTable rows={10} columns={6} />
  </div>
));

export const LazyExpensesPage = withLazyLoading(ExpensesPage, (
  <div className="p-4 sm:p-6 space-y-6">
    <div className="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    <SkeletonTable rows={8} columns={5} />
  </div>
));

export const LazyFinancePage = withLazyLoading(FinancePage, (
  <div className="p-4 sm:p-6 space-y-6">
    <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    <SkeletonTable rows={8} columns={6} />
  </div>
));

export const LazyReportsPage = withLazyLoading(ReportsPage, (
  <div className="p-4 sm:p-6 space-y-6">
    <div className="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="lg:col-span-3">
        <SkeletonCard className="h-96" />
      </div>
    </div>
  </div>
));

export const LazySettingsPage = withLazyLoading(SettingsPage, (
  <div className="p-4 sm:p-6 space-y-6">
    <div className="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
));

// Chart components with appropriate loading states
export const LazySalesChart = withLazyLoading(SalesChart, (
  <SkeletonChart className="h-64" />
));

export const LazyExpenseChart = withLazyLoading(ExpenseChart, (
  <SkeletonChart className="h-64" />
));

export const LazyTopProductsChart = withLazyLoading(TopProductsChart, (
  <SkeletonChart className="h-64" />
));

// Form components with simple loading states
export const LazyProductForm = withLazyLoading(ProductForm, (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8">
      <LoadingSpinner size="lg" text="Loading form..." />
    </div>
  </div>
));

export const LazyContainerForm = withLazyLoading(ContainerForm, (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8">
      <LoadingSpinner size="lg" text="Loading form..." />
    </div>
  </div>
));

export const LazySalesForm = withLazyLoading(SalesForm, (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8">
      <LoadingSpinner size="lg" text="Loading form..." />
    </div>
  </div>
));

export const LazyExpenseForm = withLazyLoading(ExpenseForm, (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8">
      <LoadingSpinner size="lg" text="Loading form..." />
    </div>
  </div>
));

// Pre-loading utility for critical components
export function preloadCriticalComponents() {
  // Preload Dashboard and Products page as they're most likely to be accessed first
  const componentsToPreload = [
    () => import('./Dashboard/Dashboard'),
    () => import('./Products/ProductsPage'),
    () => import('./Sales/SalesPage')
  ];

  // Use requestIdleCallback for non-blocking preloading
  if ('requestIdleCallback' in window) {
    componentsToPreload.forEach(importFn => {
      window.requestIdleCallback(() => {
        importFn().catch(err => {
          console.warn('Failed to preload component:', err);
        });
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      componentsToPreload.forEach(importFn => {
        importFn().catch(err => {
          console.warn('Failed to preload component:', err);
        });
      });
    }, 1000);
  }
}

// Component for managing preloading
export function ComponentPreloader() {
  return null; // This component doesn't render anything
}

// Hook for preloading components on user interaction
export function usePreloadOnHover(importFn) {
  let isPreloaded = false;
  
  return {
    onMouseEnter: () => {
      if (!isPreloaded) {
        isPreloaded = true;
        importFn().catch(err => {
          console.warn('Failed to preload on hover:', err);
        });
      }
    }
  };
}