
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AutoSyncSettings {
  enabled: boolean;
  interval: number;
  confidenceThreshold: number;
  maxAutoMatches: number;
}

export interface AutoSyncStats {
  totalRuns: number;
  successfulRuns: number;
  lastRun: string | null;
  lastError: string | null;
}

export const useAutoSync = () => {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const [autoSyncStats, setAutoSyncStats] = useState<AutoSyncStats>({
    totalRuns: 15,
    successfulRuns: 12,
    lastRun: new Date().toISOString(),
    lastError: null,
  });
  
  const [autoSyncSettings, setAutoSyncSettings] = useState<AutoSyncSettings>({
    enabled: false,
    interval: 60,
    confidenceThreshold: 95,
    maxAutoMatches: 10,
  });

  const { toast } = useToast();

  const toggleAutoSync = () => {
    setIsAutoSyncEnabled(prev => {
      const newValue = !prev;
      setAutoSyncSettings(prev => ({ ...prev, enabled: newValue }));
      
      toast({
        title: newValue ? "تم تفعيل المزامنة التلقائية" : "تم إلغاء المزامنة التلقائية",
        description: newValue 
          ? "ستتم مزامنة الأجهزة عالية الثقة تلقائياً"
          : "المزامنة التلقائية متوقفة الآن",
        variant: "default"
      });
      
      return newValue;
    });
  };

  return {
    isAutoSyncEnabled,
    toggleAutoSync,
    autoSyncStats,
    autoSyncSettings,
  };
};
