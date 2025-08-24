
import { useState, useEffect, useRef } from 'react';
import { useTrackerSync } from './useTrackerSync';
import { useToast } from './use-toast';
import { useSystemSettings } from './useSystemSettings';

export interface AutoSyncSettings {
  enabled: boolean;
  interval: number; // بالدقائق
  confidenceThreshold: number; // مستوى الثقة للمزامنة التلقائية
  maxAutoMatches: number; // عدد الحد الأقصى للمطابقات التلقائية
}

export const useAutoSync = () => {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState<Date | null>(null);
  const [autoSyncStats, setAutoSyncStats] = useState({
    totalRuns: 0,
    successfulRuns: 0,
    lastError: null as string | null,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { syncAuto } = useTrackerSync();
  const { toast } = useToast();
  const { settings } = useSystemSettings();

  // إعدادات المزامنة التلقائية الافتراضية
  const defaultSettings: AutoSyncSettings = {
    enabled: false,
    interval: 60, // كل ساعة
    confidenceThreshold: 95, // مستوى ثقة 95%
    maxAutoMatches: 10, // حد أقصى 10 مطابقات تلقائية
  };

  const autoSyncSettings: AutoSyncSettings = {
    ...defaultSettings,
    ...settings?.autoSync,
  };

  // تشغيل المزامنة التلقائية
  const runAutoSync = async () => {
    try {
      console.log('[AutoSync] بدء المزامنة التلقائية...');
      
      // تنفيذ مزامنة جافة أولاً للتحقق من الاقتراحات
      const dryResult = await syncAuto(true);
      
      if (!dryResult.success || !dryResult.summary?.unmatchedSuggestions) {
        console.log('[AutoSync] لا توجد اقتراحات للمزامنة التلقائية');
        return;
      }

      // فلترة الاقتراحات عالية الثقة
      const highConfidenceMatches = dryResult.summary.unmatchedSuggestions
        .filter(suggestion => 
          suggestion.topCandidates.some(candidate => 
            candidate.score >= autoSyncSettings.confidenceThreshold
          )
        )
        .slice(0, autoSyncSettings.maxAutoMatches);

      if (highConfidenceMatches.length === 0) {
        console.log('[AutoSync] لا توجد مطابقات عالية الثقة للمزامنة التلقائية');
        return;
      }

      // تحويل الاقتراحات إلى أجهزة للمزامنة اليدوية
      const devicesToSync = highConfidenceMatches
        .map(suggestion => {
          const bestMatch = suggestion.topCandidates[0];
          return {
            plate: bestMatch.plate,
            trackerId: suggestion.devicePlate,
          };
        });

      console.log(`[AutoSync] مزامنة تلقائية لـ ${devicesToSync.length} جهاز عالي الثقة`);

      // تنفيذ المزامنة الفعلية
      const syncResult = await syncAuto(false);
      
      setAutoSyncStats(prev => ({
        ...prev,
        totalRuns: prev.totalRuns + 1,
        successfulRuns: syncResult.success ? prev.successfulRuns + 1 : prev.successfulRuns,
        lastError: syncResult.success ? null : syncResult.error || 'خطأ غير معروف',
      }));

      setLastAutoSync(new Date());

      if (syncResult.success) {
        toast({
          title: '🤖 مزامنة تلقائية مكتملة',
          description: `تم مطابقة ${syncResult.summary?.matched || 0} مركبة تلقائياً`,
          duration: 3000,
        });
      }

    } catch (error) {
      console.error('[AutoSync] خطأ في المزامنة التلقائية:', error);
      setAutoSyncStats(prev => ({
        ...prev,
        totalRuns: prev.totalRuns + 1,
        lastError: error instanceof Error ? error.message : 'خطأ غير معروف',
      }));
    }
  };

  // تشغيل/إيقاف المزامنة التلقائية
  const toggleAutoSync = (enabled: boolean) => {
    setIsAutoSyncEnabled(enabled);
    
    if (enabled) {
      // بدء المزامنة التلقائية
      runAutoSync(); // تشغيل فوري
      
      intervalRef.current = setInterval(() => {
        runAutoSync();
      }, autoSyncSettings.interval * 60 * 1000); // تحويل من دقائق إلى ميلي ثانية
      
      toast({
        title: 'تم تفعيل المزامنة التلقائية',
        description: `ستتم المزامنة كل ${autoSyncSettings.interval} دقيقة`,
        duration: 4000,
      });
    } else {
      // إيقاف المزامنة التلقائية
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      toast({
        title: 'تم إيقاف المزامنة التلقائية',
        description: 'يمكنك تشغيلها مرة أخرى من الإعدادات',
        duration: 3000,
      });
    }
  };

  // تنظيف عند إزالة المكون
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isAutoSyncEnabled,
    toggleAutoSync,
    runAutoSync,
    lastAutoSync,
    autoSyncStats,
    autoSyncSettings,
  };
};
