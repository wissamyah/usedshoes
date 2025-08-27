import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { register, setupInstallPrompt, onNetworkStatusChange } from './utils/serviceWorker'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for caching and offline functionality
if (process.env.NODE_ENV === 'production') {
  register({
    onSuccess: (registration) => {
      console.log('App is cached and ready for offline use');
    },
    onUpdate: (registration) => {
      console.log('New version available');
      // You could show a user notification here
      if (window.confirm('New version available. Refresh to update?')) {
        window.location.reload();
      }
    }
  });
}

// Setup PWA install prompt
setupInstallPrompt();

// Monitor network status for offline handling
onNetworkStatusChange((status) => {
  console.log('Network status:', status.isOnline ? 'online' : 'offline');
  
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('network-status-change', { 
    detail: status 
  }));
});

// Performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Monitor bundle size and performance
  import('./utils/performanceMonitor').then(({ startPerformanceMonitoring }) => {
    startPerformanceMonitoring();
  });
}
