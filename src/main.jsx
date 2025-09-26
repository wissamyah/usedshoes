import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { onNetworkStatusChange, unregister } from './utils/serviceWorker'
import { performanceConfig } from './config/performance'

// Conditionally wrap in StrictMode based on config
const AppWrapper = performanceConfig.strictMode ? (
  <StrictMode>
    <App />
  </StrictMode>
) : (
  <App />
);

createRoot(document.getElementById('root')).render(AppWrapper)

// Unregister any existing service worker to fix deployment issues
// The service worker was causing problems with GitHub Pages deployment
unregister();

// Monitor network status for offline handling
onNetworkStatusChange((status) => {
  console.log('Network status:', status.isOnline ? 'online' : 'offline');
  
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('network-status-change', { 
    detail: status 
  }));
});

// Performance monitoring based on config
if (performanceConfig.enableMonitoring) {
  // Monitor bundle size and performance
  import('./utils/performanceMonitor').then(({ startPerformanceMonitoring }) => {
    startPerformanceMonitoring();
  });
}
