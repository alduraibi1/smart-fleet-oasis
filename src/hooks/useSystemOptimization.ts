
import { useState, useEffect, useCallback } from 'react';
import { usePerformanceOptimization } from './usePerformanceOptimization';

interface SystemHealth {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
  recommendations: string[];
  lastCheck: Date;
}

export function useSystemOptimization() {
  const {
    metrics,
    settings,
    performanceScore,
    updateSettings,
    optimizeImages,
    preloadCriticalResources,
    enableGPUAcceleration
  } = usePerformanceOptimization();

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'good',
    issues: [],
    recommendations: [],
    lastCheck: new Date()
  });

  // System health analysis
  const analyzeSystemHealth = useCallback(() => {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: SystemHealth['status'] = 'excellent';

    // Memory analysis
    if (metrics.memoryUsage > 80) {
      issues.push('استخدام ذاكرة عالي');
      recommendations.push('تفعيل التنظيف التلقائي للذاكرة');
      status = 'poor';
    } else if (metrics.memoryUsage > 60) {
      recommendations.push('مراقبة استخدام الذاكرة');
      if (status === 'excellent') status = 'good';
    }

    // Performance analysis
    if (metrics.fps < 30) {
      issues.push('أداء بطيء في الرسوميات');
      recommendations.push('تحسين الرسوميات والحركات');
      status = 'poor';
    } else if (metrics.fps < 45) {
      recommendations.push('تحسين أداء الرسوميات');
      if (status === 'excellent') status = 'fair';
    }

    // Network analysis
    if (metrics.networkLatency > 2000) {
      issues.push('زمن استجابة شبكة بطيء');
      recommendations.push('تحسين استراتيجية التخزين المؤقت');
      status = 'poor';
    }

    setSystemHealth({
      status,
      issues,
      recommendations,
      lastCheck: new Date()
    });
  }, [metrics]);

  // Auto-optimization
  const runAutoOptimization = useCallback(() => {
    console.log('تشغيل التحسين التلقائي...');
    
    // Apply optimizations
    optimizeImages();
    preloadCriticalResources();
    enableGPUAcceleration();
    
    // Update settings based on performance
    if (performanceScore < 70) {
      updateSettings(prev => ({
        ...prev,
        enableVirtualization: true,
        optimizeAnimations: metrics.fps < 30,
        enableCaching: true
      }));
    }
    
    console.log('تم تطبيق التحسينات التلقائية');
  }, [optimizeImages, preloadCriticalResources, enableGPUAcceleration, performanceScore, updateSettings, metrics.fps]);

  // Memory cleanup
  const optimizeMemory = useCallback(() => {
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    // Clear unused cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old') || name.includes('temp')) {
            caches.delete(name);
          }
        });
      });
    }
    
    console.log('تم تحسين استخدام الذاكرة');
  }, []);

  // Run analysis periodically
  useEffect(() => {
    const interval = setInterval(() => {
      analyzeSystemHealth();
      
      if (performanceScore < 60) {
        runAutoOptimization();
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [analyzeSystemHealth, runAutoOptimization, performanceScore]);

  return {
    metrics,
    settings,
    systemHealth,
    performanceScore,
    optimizeMemory,
    runAutoOptimization,
    updateSettings
  };
}
