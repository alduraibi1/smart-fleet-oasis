// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
  const startTime = performance.now();
  fn();
  const endTime = performance.now();
  console.log(`${name} took ${endTime - startTime} milliseconds`);
};

// Lazy loading utility for images
export const lazyLoadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Memory management
export const cleanupResources = (resources: Array<() => void>) => {
  resources.forEach(cleanup => {
    try {
      cleanup();
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  });
};

// Bundle optimization helpers
export const preloadRoute = async (routeImport: () => Promise<any>) => {
  try {
    await routeImport();
  } catch (error) {
    console.warn('Failed to preload route:', error);
  }
};

// Performance observer for Core Web Vitals
export const initPerformanceObserver = () => {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`${entry.name}: ${entry.duration}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['measure', 'navigation'] });
  }
};