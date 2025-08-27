import { useState, useEffect } from 'react';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // warning, danger, info
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

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  const handleConfirm = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onConfirm();
    }, 300);
  };

  if (!shouldRender) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="h-6 w-6 text-red-600" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
    }
  };

  const { icon, bgColor, textColor, buttonColor } = getIconAndColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className={`fixed inset-0 transition-all duration-300 ease-out ${
          isAnimating 
            ? 'bg-black/30 backdrop-blur-sm' 
            : 'bg-black/0 backdrop-blur-none'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          className={`relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all duration-300 ease-out sm:my-8 sm:w-full sm:max-w-lg sm:p-6 ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Close button */}
          <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${bgColor} sm:mx-0 sm:h-10 sm:w-10`}>
              {icon}
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={handleClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}