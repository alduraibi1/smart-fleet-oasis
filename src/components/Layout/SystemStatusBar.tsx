
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  dismissible: boolean;
  priority: number;
}

export function SystemStatusBar() {
  const { user, userRoles } = useAuth();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // محاكاة تحديث حالة النظام
    const updateSystemStatus = () => {
      const newAlerts: SystemAlert[] = [];

      // تحقق من حالة الاتصال بقاعدة البيانات
      if (Math.random() > 0.9) {
        newAlerts.push({
          id: 'db-connection',
          type: 'error',
          message: 'تحذير: انقطاع مؤقت في الاتصال بقاعدة البيانات',
          dismissible: false,
          priority: 1
        });
      }

      // تنبيهات الصيانة المجدولة
      if (new Date().getDay() === 6 && new Date().getHours() === 2) {
        newAlerts.push({
          id: 'maintenance',
          type: 'warning',
          message: 'صيانة مجدولة للنظام يوم السبت من 2:00 إلى 4:00 صباحاً',
          dismissible: true,
          priority: 2
        });
      }

      // تنبيهات للمدراء والمحاسبين
      if (userRoles.includes('admin') || userRoles.includes('manager')) {
        if (Math.random() > 0.7) {
          newAlerts.push({
            id: 'backup-reminder',
            type: 'info',
            message: 'تذكير: آخر نسخة احتياطية تمت منذ 3 أيام',
            dismissible: true,
            priority: 3
          });
        }
      }

      // النظام يعمل بشكل طبيعي
      if (newAlerts.length === 0) {
        newAlerts.push({
          id: 'system-ok',
          type: 'success',
          message: 'النظام يعمل بشكل طبيعي',
          dismissible: true,
          priority: 4
        });
      }

      setAlerts(newAlerts);
    };

    updateSystemStatus();
    const interval = setInterval(updateSystemStatus, 30000); // تحديث كل 30 ثانية

    return () => clearInterval(interval);
  }, [userRoles]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'default' as const;
      case 'success':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => new Set([...prev, alertId]));
  };

  const visibleAlerts = alerts
    .filter(alert => !dismissed.has(alert.id))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 1); // عرض تنبيه واحد فقط

  if (visibleAlerts.length === 0) return null;

  const alert = visibleAlerts[0];

  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <Alert variant={getAlertVariant(alert.type)} className="border-0 rounded-none py-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {getAlertIcon(alert.type)}
              <AlertDescription className="text-sm font-medium">
                {alert.message}
              </AlertDescription>
            </div>
            {alert.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Alert>
      </div>
    </div>
  );
}
