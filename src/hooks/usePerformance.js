import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Debounce hook for performance optimization
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for performance optimization
export function useThrottle(value, limit) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Memoized calculations hook
export function useMemoizedCalculations(data, dependencies = []) {
  return useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        total: 0,
        count: 0,
        average: 0,
        max: 0,
        min: 0
      };
    }

    const numbers = data.filter(item => typeof item === 'number' && !isNaN(item));
    
    if (numbers.length === 0) {
      return {
        total: 0,
        count: 0,
        average: 0,
        max: 0,
        min: 0
      };
    }

    const total = numbers.reduce((sum, num) => sum + num, 0);
    const count = numbers.length;
    const average = total / count;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);

    return { total, count, average, max, min };
  }, [data, ...dependencies]);
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling({ 
  items = [], 
  itemHeight = 60, 
  containerHeight = 400,
  overscan = 5 
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef();

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    scrollElementRef,
    handleScroll,
    visibleItems,
    totalHeight,
    offsetY,
    visibleRange
  };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const renderCount = useRef(0);
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: null,
    averageRenderTime: 0,
    memoryUsage: null
  });

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = performance.now();
    
    setMetrics(prev => ({
      renderCount: renderCount.current,
      lastRenderTime: renderTime,
      averageRenderTime: prev.averageRenderTime === 0 
        ? renderTime 
        : (prev.averageRenderTime + renderTime) / 2,
      memoryUsage: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null
    }));
  });

  return metrics;
}

// Optimized search hook with debouncing and memoization
export function useOptimizedSearch(data, searchFields, delay = 300) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm || !Array.isArray(data)) {
      return data;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return data.filter(item => 
      searchFields.some(field => {
        const value = field.includes('.') 
          ? field.split('.').reduce((obj, key) => obj?.[key], item)
          : item[field];
        
        return value && 
               typeof value === 'string' && 
               value.toLowerCase().includes(searchLower);
      })
    );
  }, [data, debouncedSearchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    isSearching: searchTerm !== debouncedSearchTerm
  };
}

// Lazy loading hook for images
export function useLazyImage(src, placeholder = '') {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const image = new Image();
          
          image.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
            setIsError(false);
          };
          
          image.onerror = () => {
            setIsError(true);
            setIsLoaded(false);
          };
          
          image.src = src;
          observer.unobserve(img);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(img);
    
    return () => {
      observer.disconnect();
    };
  }, [src]);

  return { imgRef, imageSrc, isLoaded, isError };
}

// Memory efficient data processing hook
export function useDataProcessor(data, processor, dependencies = []) {
  const processedDataRef = useRef();
  const lastDependenciesRef = useRef();

  return useMemo(() => {
    // Check if dependencies have changed
    const dependenciesChanged = !lastDependenciesRef.current ||
      dependencies.some((dep, index) => dep !== lastDependenciesRef.current[index]);

    if (!dependenciesChanged && processedDataRef.current) {
      return processedDataRef.current;
    }

    // Process data and cache result
    const result = processor(data);
    processedDataRef.current = result;
    lastDependenciesRef.current = [...dependencies];
    
    return result;
  }, [data, processor, ...dependencies]);
}

// Batch state updates hook
export function useBatchedState(initialState) {
  const [state, setState] = useState(initialState);
  const batchedUpdatesRef = useRef({});
  const timeoutRef = useRef();

  const batchedSetState = useCallback((updates) => {
    // Accumulate updates
    Object.assign(batchedUpdatesRef.current, updates);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Batch updates in the next frame
    timeoutRef.current = setTimeout(() => {
      setState(prevState => ({
        ...prevState,
        ...batchedUpdatesRef.current
      }));
      batchedUpdatesRef.current = {};
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchedSetState];
}

// Network status hook for handling offline scenarios
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect connection speed if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setConnectionSpeed(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionSpeed(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionSpeed };
}

// Performance budget monitor
export function usePerformanceBudget() {
  const [metrics, setMetrics] = useState({
    fcp: null, // First Contentful Paint
    lcp: null, // Largest Contentful Paint
    fid: null, // First Input Delay
    cls: null, // Cumulative Layout Shift
    ttfb: null // Time to First Byte
  });

  useEffect(() => {
    // Performance Observer for Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
              }
              break;
            case 'largest-contentful-paint':
              setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
              break;
            case 'first-input':
              setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
              break;
            case 'layout-shift':
              if (!entry.hadRecentInput) {
                setMetrics(prev => ({ 
                  ...prev, 
                  cls: (prev.cls || 0) + entry.value 
                }));
              }
              break;
            case 'navigation':
              setMetrics(prev => ({ 
                ...prev, 
                ttfb: entry.responseStart - entry.requestStart 
              }));
              break;
          }
        }
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const isWithinBudget = useMemo(() => ({
    fcp: metrics.fcp ? metrics.fcp < 1800 : null, // Good: < 1.8s
    lcp: metrics.lcp ? metrics.lcp < 2500 : null, // Good: < 2.5s
    fid: metrics.fid ? metrics.fid < 100 : null,  // Good: < 100ms
    cls: metrics.cls ? metrics.cls < 0.1 : null,  // Good: < 0.1
    ttfb: metrics.ttfb ? metrics.ttfb < 800 : null // Good: < 800ms
  }), [metrics]);

  return { metrics, isWithinBudget };
}