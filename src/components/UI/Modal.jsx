import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  size = 'medium',
  className = '',
  preventClose = false 
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure the DOM is ready before starting animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else if (shouldRender) {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  const handleBackdropClick = (e) => {
    if (!preventClose && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const handleEscape = (e) => {
    if (!preventClose && e.key === 'Escape') {
      onClose?.();
    }
  };

  useEffect(() => {
    if (shouldRender) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [shouldRender, preventClose]);

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  if (!shouldRender) return null;

  return createPortal(
    <>
      {/* Backdrop with blur */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isAnimating 
            ? 'bg-black/40 backdrop-blur-sm' 
            : 'bg-black/0 backdrop-blur-none'
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          {/* Modal Content with scale and fade animation */}
          <div 
            className={`
              relative w-full ${sizeClasses[size]} 
              transform transition-all duration-300 ease-out
              ${isAnimating 
                ? 'scale-100 opacity-100 translate-y-0' 
                : 'scale-95 opacity-0 translate-y-4'
              }
              ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// Animated Modal Wrapper for form components
export function AnimatedModal({ isOpen, onClose, children, title, size = 'medium' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {children}
      </div>
    </Modal>
  );
}