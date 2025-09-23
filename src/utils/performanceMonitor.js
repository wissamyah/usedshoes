// Performance monitoring utilities for development

let performanceObserver;
let memoryMonitorInterval;

export function startPerformanceMonitoring() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('🚀 Starting performance monitoring...');

  // Monitor Web Vitals
  monitorWebVitals();
  
  // Monitor memory usage
  monitorMemoryUsage();
  
  // Monitor long tasks
  monitorLongTasks();
  
  // Monitor resource loading
  monitorResourceLoading();
  
  // Bundle size analysis
  analyzeBundleSize();
}

function monitorWebVitals() {
  try {
    if ('PerformanceObserver' in window) {
      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime;
            console.log(`🎨 First Contentful Paint: ${fcp.toFixed(2)}ms ${fcp < 1800 ? '✅' : '⚠️'}`);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;
        console.log(`🖼️ Largest Contentful Paint: ${lcp.toFixed(2)}ms ${lcp < 2500 ? '✅' : '⚠️'}`);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const fid = entry.processingStart - entry.startTime;
          console.log(`⚡ First Input Delay: ${fid.toFixed(2)}ms ${fid < 100 ? '✅' : '⚠️'}`);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log(`📐 Cumulative Layout Shift: ${clsValue.toFixed(4)} ${clsValue < 0.1 ? '✅' : '⚠️'}`);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  } catch (error) {
    console.warn('Performance monitoring setup failed:', error);
  }
}

function monitorMemoryUsage() {
  if (!performance.memory) {
    console.log('💾 Memory monitoring not available');
    return;
  }

  const logMemoryUsage = () => {
    const memory = performance.memory;
    const used = Math.round(memory.usedJSHeapSize / 1048576);
    const total = Math.round(memory.totalJSHeapSize / 1048576);
    const limit = Math.round(memory.jsHeapSizeLimit / 1048576);
    
    const usagePercent = ((used / limit) * 100).toFixed(1);
    const status = usagePercent > 80 ? '🔴' : usagePercent > 60 ? '🟡' : '🟢';
    
    console.log(`💾 Memory: ${used}MB used / ${total}MB total (${usagePercent}% of ${limit}MB limit) ${status}`);
  };

  // Log memory usage every 30 seconds
  logMemoryUsage(); // Initial log
  memoryMonitorInterval = setInterval(logMemoryUsage, 30000);
}

function monitorLongTasks() {
  try {
    if ('PerformanceObserver' in window) {
      // Debounce to prevent duplicate logs
      const reportedTasks = new Set();

      const longTaskObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Create a unique key for this task
          const taskKey = `${entry.startTime}-${entry.duration}`;

          // Skip if we've already reported this task (prevents duplicates)
          if (reportedTasks.has(taskKey)) continue;
          reportedTasks.add(taskKey);

          // Only log tasks over 100ms (ignore smaller ones)
          if (entry.duration > 100) {
            console.warn(`🐌 Long task detected: ${entry.duration.toFixed(2)}ms (blocked main thread)`);

            // Log the attribution if available
            if (entry.attribution) {
              entry.attribution.forEach(attr => {
                console.log(`  - ${attr.name}: ${attr.containerType} ${attr.containerSrc || attr.containerId}`);
              });
            }
          }

          // Clean up old entries after 5 seconds
          setTimeout(() => reportedTasks.delete(taskKey), 5000);
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }
  } catch (error) {
    console.warn('Long task monitoring not available:', error);
  }
}

function monitorResourceLoading() {
  try {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const duration = entry.responseEnd - entry.startTime;
          const size = entry.transferSize || 0;
          
          // Flag slow or large resources
          if (duration > 1000 || size > 100000) {
            const sizeKB = (size / 1024).toFixed(1);
            const type = entry.initiatorType;
            const status = duration > 1000 ? '🐌' : size > 100000 ? '📦' : '📄';
            
            console.log(`${status} ${type}: ${entry.name.split('/').pop()} (${duration.toFixed(0)}ms, ${sizeKB}KB)`);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  } catch (error) {
    console.warn('Resource monitoring not available:', error);
  }
}

function analyzeBundleSize() {
  // Get all script tags to estimate bundle size
  const scripts = document.querySelectorAll('script[src]');
  let estimatedBundleSize = 0;

  const checkBundleSize = async () => {
    for (const script of scripts) {
      try {
        const response = await fetch(script.src, { method: 'HEAD' });
        const size = parseInt(response.headers.get('content-length'), 10);
        if (size) {
          estimatedBundleSize += size;
        }
      } catch (error) {
        // Ignore errors for external scripts
      }
    }

    const sizeMB = (estimatedBundleSize / 1048576).toFixed(2);
    const status = estimatedBundleSize > 2097152 ? '🔴' : estimatedBundleSize > 1048576 ? '🟡' : '🟢';
    
    console.log(`📦 Estimated bundle size: ${sizeMB}MB ${status}`);
    
    // Performance recommendations
    if (estimatedBundleSize > 2097152) {
      console.log('💡 Bundle size recommendations:');
      console.log('  - Implement code splitting with React.lazy()');
      console.log('  - Tree shake unused dependencies');
      console.log('  - Use dynamic imports for non-critical code');
    }
  };

  setTimeout(checkBundleSize, 2000); // Check after page load
}

// React DevTools profiling helper
export function profileComponent(componentName, renderTime) {
  if (renderTime > 16.67) { // More than one frame at 60fps
    console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
  }
}

// Bundle analyzer helper
export function logBundleComposition() {
  const modules = Object.keys(window.__webpack_require__.cache || {});
  const modulesBySize = modules
    .map(moduleId => {
      const module = window.__webpack_require__.cache[moduleId];
      return {
        id: moduleId,
        size: JSON.stringify(module).length,
        exports: Object.keys(module.exports || {})
      };
    })
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  console.log('📊 Top 10 modules by size:');
  console.table(modulesBySize);
}

// Network performance monitoring
export function monitorNetworkPerformance() {
  if ('PerformanceObserver' in window) {
    const networkObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const timing = {
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          tcp: entry.connectEnd - entry.connectStart,
          request: entry.responseStart - entry.requestStart,
          response: entry.responseEnd - entry.responseStart,
          total: entry.responseEnd - entry.startTime
        };

        if (timing.total > 1000) { // Log requests taking more than 1 second
          console.log(`🌐 Slow network request: ${entry.name}`);
          console.table(timing);
        }
      }
    });
    networkObserver.observe({ entryTypes: ['navigation', 'resource'] });
  }
}

// React render performance tracking
export function trackRenderPerformance() {
  let renderStart;
  
  const originalRender = console.log;
  
  // Hook into React DevTools if available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = (id, root, priorityLevel) => {
      if (renderStart) {
        const renderTime = performance.now() - renderStart;
        if (renderTime > 50) { // Log renders taking more than 50ms
          console.log(`🔄 Slow React render: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
    
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = () => {
      renderStart = performance.now();
    };
  }
}

// Cleanup function
export function stopPerformanceMonitoring() {
  if (performanceObserver) {
    performanceObserver.disconnect();
  }
  
  if (memoryMonitorInterval) {
    clearInterval(memoryMonitorInterval);
  }
  
  console.log('🛑 Performance monitoring stopped');
}

// Initialize on load
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(startPerformanceMonitoring, 1000);
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', stopPerformanceMonitoring);
}