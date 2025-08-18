
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface SystemStatus {
  isOnline: boolean;
  lastUpdate: Date;
  maintenanceMode: boolean;
  databaseStatus: 'healthy' | 'slow' | 'error';
  backupStatus: 'recent' | 'warning' | 'overdue';
}

export function useSystemStatus() {
  const { user, userRoles } = useAuth();
  const [status, setStatus] = useState<SystemStatus>({
    isOnline: true,
    lastUpdate: new Date(),
    maintenanceMode: false,
    databaseStatus: 'healthy',
    backupStatus: 'recent'
  });

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        // محاكاة فحص حالة النظام
        const healthCheck = {
          isOnline: navigator.onLine,
          lastUpdate: new Date(),
          maintenanceMode: false,
          databaseStatus: Math.random() > 0.95 ? 'error' : 
                         Math.random() > 0.85 ? 'slow' : 'healthy',
          backupStatus: Math.random() > 0.7 ? 'recent' : 
                       Math.random() > 0.3 ? 'warning' : 'overdue'
        } as SystemStatus;

        setStatus(healthCheck);
      } catch (error) {
        console.error('System health check failed:', error);
        setStatus(prev => ({
          ...prev,
          isOnline: false,
          databaseStatus: 'error'
        }));
      }
    };

    // فحص فوري
    checkSystemHealth();

    // فحص دوري كل دقيقة
    const interval = setInterval(checkSystemHealth, 60000);

    // مراقبة حالة الاتصال
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  return status;
}
