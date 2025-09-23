// Performance configuration
export const performanceConfig = {
  // Enable/disable performance monitoring
  enableMonitoring: import.meta.env.DEV && false, // Set to true to enable in dev

  // Thresholds for warnings
  longTaskThreshold: 100, // milliseconds
  memoryWarningThreshold: 100, // MB

  // Auto-save configuration
  autoSaveDelay: 10000, // 10 seconds

  // React StrictMode (causes double renders in dev)
  strictMode: false, // Set to false to disable double rendering

  // Console logging levels
  logging: {
    performance: false, // Set to true to see performance logs
    network: true,
    saves: true,
  }
};

// Helper to conditionally log
export const perfLog = (type, ...args) => {
  if (performanceConfig.logging[type]) {
    console.log(...args);
  }
};