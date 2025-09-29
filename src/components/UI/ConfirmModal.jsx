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
          icon: <Trash2 className="h-6 w-6" style={{ color: '#ef4444' }} />,
          bgColor: 'rgba(239, 68, 68, 0.1)',
          textColor: '#ef4444',
          buttonColor: '#dc2626',
          buttonHoverColor: '#b91c1c',
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6" style={{ color: '#3b82f6' }} />,
          bgColor: 'rgba(59, 130, 246, 0.1)',
          textColor: '#3b82f6',
          buttonColor: '#2563eb',
          buttonHoverColor: '#1d4ed8',
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6" style={{ color: '#f59e0b' }} />,
          bgColor: 'rgba(245, 158, 11, 0.1)',
          textColor: '#f59e0b',
          buttonColor: '#d97706',
          buttonHoverColor: '#b45309',
        };
    }
  };

  const { icon, bgColor, textColor, buttonColor, buttonHoverColor } = getIconAndColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
          backdropFilter: isAnimating ? 'blur(4px)' : 'blur(0px)',
          transition: 'all 0.3s ease-out'
        }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          style={{
            position: 'relative',
            transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
            overflow: 'hidden',
            borderRadius: '8px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #404040',
            padding: '20px 16px 16px 16px',
            textAlign: 'left',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease-out',
            opacity: isAnimating ? 1 : 0,
            maxWidth: '32rem',
            width: '100%',
            margin: '32px 0'
          }}
          className="sm:p-6"
        >
          {/* Close button */}
          <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
            <button
              type="button"
              style={{
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#b3b3b3',
                padding: '4px',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#ebebeb';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#b3b3b3';
                e.target.style.backgroundColor = 'transparent';
              }}
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div style={{
              margin: '0 auto',
              display: 'flex',
              height: '48px',
              width: '48px',
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: bgColor,
              border: `1px solid ${textColor}30`
            }} className="sm:mx-0 sm:h-10 sm:w-10">
              {icon}
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                lineHeight: '24px',
                color: '#ebebeb'
              }}>
                {title}
              </h3>
              <div className="mt-2">
                <p style={{
                  fontSize: '14px',
                  color: '#b3b3b3'
                }}>
                  {message}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              style={{
                display: 'inline-flex',
                justifyContent: 'center',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: buttonColor,
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
                minWidth: 'auto',
                whiteSpace: 'nowrap'
              }}
              className="w-full sm:ml-3 sm:w-auto"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = buttonHoverColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = buttonColor;
              }}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                justifyContent: 'center',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#b3b3b3',
                backgroundColor: 'transparent',
                border: '1px solid #404040',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s',
                minWidth: 'auto',
                whiteSpace: 'nowrap'
              }}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = '#60a5fa';
                e.target.style.color = '#ebebeb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#404040';
                e.target.style.color = '#b3b3b3';
              }}
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