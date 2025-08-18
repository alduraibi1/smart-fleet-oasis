
import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  networkLatency: number;
  fps: number;
  loadTime: number;
}

interface OptimizationSettings {
  enableVirtualization: boolean;
  lazyLoadImages: boolean;
  enablePrefetch: boolean;
  optimizeAnimations: boolean;
  enableCaching: boolean;
}

export function usePerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    networkLatency: 0,
    fps: 60,
    loadTime: 0
  });

  const [settings, setSettings] = useState<OptimizationSettings>({
    enableVirtualization: true,
    lazyLoadImages: true,
    enablePrefetch: true,
    optimizeAnimations: true,
    enableCaching: true
  });

  // Monitor performance metrics
  const monitorPerformance = useCallback(() => {
    // Memory usage monitoring
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }));
    }

    // Network timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        networkLatency: navigation.responseStart - navigation.requestStart,
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        renderTime: navigation.domContentLoadedEventEnd - navigation.navigationStart
      }));
    }

    // FPS monitoring
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (currentTime - lastTime))
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }, []);

  // Auto optimization based on performance
  const autoOptimize = useCallback(() => {
    const shouldOptimize = 
      metrics.memoryUsage > 70 || 
      metrics.fps < 30 || 
      metrics.renderTime > 3000;

    if (shouldOptimize) {
      setSettings(prev => ({
        ...prev,
        enableVirtualization: true,
        optimizeAnimations: metrics.fps < 30,
        enableCaching: metrics.renderTime > 2000
      }));
    }
  }, [metrics]);

  // Debounced monitoring
  const debouncedMonitor = useMemo(
    () => debounce(monitorPerformance, 1000),
    [monitorPerformance]
  );

  const debouncedOptimize = useMemo(
    () => debounce(autoOptimize, 2000),
    [autoOptimize]
  );

  // Performance score calculation
  const performanceScore = useMemo(() => {
    let score = 100;
    
    if (metrics.memoryUsage > 80) score -= 25;
    else if (metrics.memoryUsage > 60) score -= 10;
    
    if (metrics.fps < 30) score -= 20;
    else if (metrics.fps < 45) score -= 10;
    
    if (metrics.renderTime > 3000) score -= 20;
    else if (metrics.renderTime > 1500) score -= 10;
    
    if (metrics.networkLatency > 2000) score -= 15;
    else if (metrics.networkLatency > 1000) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }, [metrics]);

  // Initialize monitoring
  useEffect(() => {
    debouncedMonitor();
    debouncedOptimize();

    const interval = setInterval(() => {
      debouncedMonitor();
      debouncedOptimize();
    }, 5000);

    return () => {
      clearInterval(interval);
      debouncedMonitor.cancel();
      debouncedOptimize.cancel();
    };
  }, [debouncedMonitor, debouncedOptimize]);

  // Utility functions
  const optimizeImages = useCallback(() => {
    const images = document.querySelectorAll('img[data-optimize]');
    images.forEach(img => {
      if ('loading' in img) {
        (img as HTMLImageElement).loading = 'lazy';
      }
    });
  }, []);

  const preloadCriticalResources = useCallback(() => {
    if (settings.enablePrefetch) {
      const criticalPaths = ['/api/dashboard-stats', '/api/quick-actions'];
      
      criticalPaths.forEach(path => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = path;
        document.head.appendChild(link);
      });
    }
  }, [settings.enablePrefetch]);

  const enableGPUAcceleration = useCallback(() => {
    const elements = document.querySelectorAll('.interactive, .animate-fade-in, .dashboard-card');
    elements.forEach(el => {
      (el as HTMLElement).style.transform = 'translateZ(0)';
      (el as HTMLElement).style.willChange = 'transform';
    });
  }, []);

  return {
    metrics,
    settings,
    performanceScore,
    updateSettings: setSettings,
    optimizeImages,
    preloadCriticalResources,
    enableGPUAcceleration,
    monitorPerformance: debouncedMonitor,
    autoOptimize: debouncedOptimize
  };
}
