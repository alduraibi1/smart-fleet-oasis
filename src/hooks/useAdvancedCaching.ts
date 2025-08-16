
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface CacheConfig {
  strategy: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  compression: boolean;
  encryption: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  cacheSize: number;
  memoryUsage: number;
}

export function useAdvancedCaching<T = any>(key: string, config: Partial<CacheConfig> = {}) {
  const queryClient = useQueryClient();
  
  const defaultConfig: CacheConfig = {
    strategy: 'memory',
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    compression: false,
    encryption: false
  };

  const cacheConfig = { ...defaultConfig, ...config };
  
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());
  const [stats, setStats] = useState<CacheStats>({
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0,
    cacheSize: 0,
    memoryUsage: 0
  });

  // ضغط البيانات
  const compressData = useCallback((data: T): string => {
    if (!cacheConfig.compression) return JSON.stringify(data);
    
    // تطبيق ضغط بسيط (في بيئة الإنتاج، استخدم مكتبة ضغط متخصصة)
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  }, [cacheConfig.compression]);

  // إلغاء ضغط البيانات
  const decompressData = useCallback((compressedData: string): T => {
    if (!cacheConfig.compression) return JSON.parse(compressedData);
    
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  }, [cacheConfig.compression]);

  // تشفير البيانات
  const encryptData = useCallback((data: string): string => {
    if (!cacheConfig.encryption) return data;
    
    // تطبيق تشفير بسيط (في بيئة الإنتاج، استخدم تشفير قوي)
    return btoa(data);
  }, [cacheConfig.encryption]);

  // إلغاء تشفير البيانات
  const decryptData = useCallback((encryptedData: string): string => {
    if (!cacheConfig.encryption) return encryptedData;
    
    return atob(encryptedData);
  }, [cacheConfig.encryption]);

  // حفظ في التخزين المحلي
  const saveToStorage = useCallback((key: string, data: CacheEntry<T>) => {
    const serialized = compressData(data);
    const encrypted = encryptData(serialized);
    
    try {
      switch (cacheConfig.strategy) {
        case 'localStorage':
          localStorage.setItem(`cache_${key}`, encrypted);
          break;
        case 'sessionStorage':
          sessionStorage.setItem(`cache_${key}`, encrypted);
          break;
        case 'indexedDB':
          // تطبيق IndexedDB (مبسط)
          console.log('IndexedDB storage not implemented in this demo');
          break;
        default:
          // Memory storage - no persistence needed
          break;
      }
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  }, [cacheConfig.strategy, compressData, encryptData]);

  // استرجاع من التخزين المحلي
  const loadFromStorage = useCallback((key: string): CacheEntry<T> | null => {
    try {
      let encrypted: string | null = null;
      
      switch (cacheConfig.strategy) {
        case 'localStorage':
          encrypted = localStorage.getItem(`cache_${key}`);
          break;
        case 'sessionStorage':
          encrypted = sessionStorage.getItem(`cache_${key}`);
          break;
        case 'indexedDB':
          // تطبيق IndexedDB (مبسط)
          console.log('IndexedDB loading not implemented in this demo');
          return null;
        default:
          return null;
      }
      
      if (!encrypted) return null;
      
      const decrypted = decryptData(encrypted);
      const data = decompressData(decrypted);
      
      return data as CacheEntry<T>;
    } catch (error) {
      console.warn('Failed to load from storage:', error);
      return null;
    }
  }, [cacheConfig.strategy, decryptData, decompressData]);

  // التحقق من انتهاء صلاحية البيانات المخزنة
  const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  // إضافة إلى التخزين المؤقت
  const set = useCallback((key: string, data: T, customTTL?: number) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTTL || cacheConfig.ttl,
      accessCount: 0,
      lastAccess: Date.now()
    };

    setCache(prev => {
      const newCache = new Map(prev);
      
      // تنظيف التخزين المؤقت إذا وصل للحد الأقصى
      if (newCache.size >= cacheConfig.maxSize) {
        // إزالة أقل البيانات استخداماً
        const entries = Array.from(newCache.entries());
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        
        const toRemove = Math.floor(cacheConfig.maxSize * 0.2); // إزالة 20%
        for (let i = 0; i < toRemove; i++) {
          newCache.delete(entries[i][0]);
        }
      }
      
      newCache.set(key, entry);
      return newCache;
    });

    // حفظ في التخزين المحلي
    saveToStorage(key, entry);
  }, [cacheConfig.ttl, cacheConfig.maxSize, saveToStorage]);

  // استرجاع من التخزين المؤقت
  const get = useCallback((key: string): T | null => {
    setStats(prev => ({
      ...prev,
      totalRequests: prev.totalRequests + 1
    }));

    // البحث في الذاكرة أولاً
    let entry = cache.get(key);
    
    // إذا لم توجد، جرب التخزين المحلي
    if (!entry) {
      entry = loadFromStorage(key);
      if (entry) {
        setCache(prev => new Map(prev).set(key, entry!));
      }
    }

    if (!entry || isExpired(entry)) {
      setStats(prev => ({
        ...prev,
        totalMisses: prev.totalMisses + 1,
        missRate: ((prev.totalMisses + 1) / (prev.totalRequests)) * 100
      }));
      return null;
    }

    // تحديث إحصائيات الوصول
    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    setStats(prev => ({
      ...prev,
      totalHits: prev.totalHits + 1,
      hitRate: ((prev.totalHits + 1) / prev.totalRequests) * 100
    }));

    return entry.data;
  }, [cache, loadFromStorage, isExpired]);

  // إزالة من التخزين المؤقت
  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });

    // إزالة من التخزين المحلي
    try {
      switch (cacheConfig.strategy) {
        case 'localStorage':
          localStorage.removeItem(`cache_${key}`);
          break;
        case 'sessionStorage':
          sessionStorage.removeItem(`cache_${key}`);
          break;
      }
    } catch (error) {
      console.warn('Failed to remove from storage:', error);
    }
  }, [cacheConfig.strategy]);

  // مسح التخزين المؤقت
  const clear = useCallback(() => {
    setCache(new Map());
    
    // مسح التخزين المحلي
    try {
      switch (cacheConfig.strategy) {
        case 'localStorage':
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cache_')) {
              localStorage.removeItem(key);
            }
          });
          break;
        case 'sessionStorage':
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('cache_')) {
              sessionStorage.removeItem(key);
            }
          });
          break;
      }
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }, [cacheConfig.strategy]);

  // تنظيف البيانات منتهية الصلاحية
  const cleanup = useCallback(() => {
    setCache(prev => {
      const newCache = new Map();
      const currentTime = Date.now();
      
      prev.forEach((entry, key) => {
        if (currentTime - entry.timestamp <= entry.ttl) {
          newCache.set(key, entry);
        }
      });
      
      return newCache;
    });
  }, []);

  // تحديث الإحصائيات
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      cacheSize: cache.size,
      memoryUsage: JSON.stringify([...cache.entries()]).length
    }));
  }, [cache]);

  // تنظيف دوري
  useEffect(() => {
    const interval = setInterval(cleanup, 60000); // كل دقيقة
    return () => clearInterval(interval);
  }, [cleanup]);

  // استخدام React Query مع التخزين المؤقت المتقدم
  const cachedQuery = useCallback((queryKey: string[], queryFn: () => Promise<T>, options = {}) => {
    return useQuery({
      queryKey,
      queryFn: async () => {
        const cacheKey = queryKey.join(':');
        const cached = get(cacheKey);
        
        if (cached) {
          return cached;
        }
        
        const result = await queryFn();
        set(cacheKey, result);
        return result;
      },
      staleTime: cacheConfig.ttl,
      ...options
    });
  }, [get, set, cacheConfig.ttl]);

  return {
    get,
    set,
    remove,
    clear,
    cleanup,
    stats,
    config: cacheConfig,
    cachedQuery
  };
}
