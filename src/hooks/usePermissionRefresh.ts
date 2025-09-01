import { useEffect } from 'react';
import { useAuth } from './useAuth';

interface UsePermissionRefreshOptions {
  intervalMinutes?: number;
  onAuthError?: () => void;
}

export function usePermissionRefresh({ 
  intervalMinutes = 30,
  onAuthError 
}: UsePermissionRefreshOptions = {}) {
  const { refreshPermissions, user, error } = useAuth();

  // تحديث الصلاحيات بشكل دوري
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshPermissions().catch(error => {
        console.error('Failed to refresh permissions:', error);
        onAuthError?.();
      });
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, intervalMinutes, refreshPermissions, onAuthError]);

  // تحديث الصلاحيات عند حدوث خطأ
  useEffect(() => {
    if (error && user) {
      const timeout = setTimeout(() => {
        refreshPermissions();
      }, 5000); // إعادة المحاولة بعد 5 ثواني

      return () => clearTimeout(timeout);
    }
  }, [error, user, refreshPermissions]);

  return { refreshPermissions };
}