import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { onNetworkStatusChange } from './utils/serviceWorker'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Temporarily disable service worker to fix caching issues
// Will re-enable after fixing the deployment

// Monitor network status for offline handling
onNetworkStatusChange((status) => {
  console.log('Network status:', status.isOnline ? 'online' : 'offline');
  
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('network-status-change', { 
    detail: status 
  }));
});

// Performance monitoring in development
if (import.meta.env.DEV) {
  // Monitor bundle size and performance
  import('./utils/performanceMonitor').then(({ startPerformanceMonitoring }) => {
    startPerformanceMonitoring();
  });
}
