import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Modal from './Modal';

// Hook to detect screen size
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

// Responsive container component
export function ResponsiveContainer({ children, className = '', maxWidth = 'max-w-7xl' }) {
  return (
    <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

// Responsive grid component
export function ResponsiveGrid({ 
  children, 
  cols = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = 'gap-6',
  className = ''
}) {
  const gridCols = `grid-cols-${cols.base} sm:grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg}`;
  
  return (
    <div className={`grid ${gridCols} ${gap} ${className}`}>
      {children}
    </div>
  );
}

// Mobile-first stack component
export function Stack({ 
  children, 
  direction = { base: 'col', md: 'row' },
  spacing = 'gap-4',
  align = 'items-start',
  justify = 'justify-start',
  className = '' 
}) {
  const flexDirection = direction.base === 'col' 
    ? `flex-col ${direction.md ? `md:flex-${direction.md}` : ''}`
    : `flex-${direction.base} ${direction.md ? `md:flex-${direction.md}` : ''}`;

  return (
    <div className={`flex ${flexDirection} ${spacing} ${align} ${justify} ${className}`}>
      {children}
    </div>
  );
}

// Responsive text component
export function ResponsiveText({ 
  children, 
  size = { base: 'text-sm', md: 'text-base' },
  weight = 'font-normal',
  color = 'text-gray-900',
  className = ''
}) {
  const textSize = `${size.base} ${size.md ? `md:${size.md}` : ''}`;
  
  return (
    <span className={`${textSize} ${weight} ${color} ${className}`}>
      {children}
    </span>
  );
}

// Touch-friendly button component
export function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon = null,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]', // Minimum touch target
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

// Responsive table wrapper
export function ResponsiveTable({ children, className = '' }) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-300 ${className}`}>
          {children}
        </table>
      </div>
    </div>
  );
}

// Mobile card wrapper for table data
export function MobileCard({ children, className = '' }) {
  const { isMobile } = useScreenSize();
  
  if (!isMobile) return null;
  
  return (
    <div className={`bg-white p-4 border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Hide on mobile/desktop utilities
export function HideOnMobile({ children }) {
  return <div className="hidden sm:block">{children}</div>;
}

export function ShowOnMobile({ children }) {
  return <div className="block sm:hidden">{children}</div>;
}

// Responsive modal
export function ResponsiveModal({ 
  children, 
  isOpen, 
  onClose, 
  title = '',
  size = 'md',
  className = '' 
}) {
  const { isMobile } = useScreenSize();
  
  if (!isOpen) return null;

  const sizeClasses = {
    sm: isMobile ? 'w-full mx-4' : 'w-full max-w-md',
    md: isMobile ? 'w-full mx-4' : 'w-full max-w-lg',
    lg: isMobile ? 'w-full mx-4' : 'w-full max-w-2xl',
    xl: isMobile ? 'w-full mx-4' : 'w-full max-w-4xl'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size === 'sm' ? 'small' : size === 'xl' ? 'xlarge' : size === 'lg' ? 'large' : 'medium'}>
      <div className={`bg-white rounded-lg shadow-xl ${className} ${isMobile ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>
        )}
        <div className={`${title ? '' : 'p-4'}`}>
          {children}
        </div>
      </div>
    </Modal>
  );
}

export default ResponsiveContainer;