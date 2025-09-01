
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  dismissible: boolean;
  priority: number;
}

export function SystemStatusBar() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

useEffect(() => {
    let canceled = false;

    const checkConnectivity = async () => {
      const newAlerts: SystemAlert[] = [];

      // اتصال المتصفح
      if (!navigator.onLine) {
        newAlerts.push({
          id: 'offline',
          type: 'error',
          message: 'أنت غير متصل بالإنترنت',
          dismissible: false,
          priority: 1,
        });
      }

      // فحص اتصال قاعدة البيانات عبر استعلام خفيف
      try {
        const { error } = await supabase
          .from('system_settings')
          .select('id', { count: 'exact', head: true })
          .limit(1);

        if (error) {
          newAlerts.push({
            id: 'db-connection',
            type: 'error',
            message: 'تحذير: تعذر الاتصال بقاعدة البيانات حالياً',
            dismissible: false,
            priority: 1,
          });
        }
      } catch (e) {
        newAlerts.push({
          id: 'db-connection',
          type: 'error',
          message: 'تحذير: تعذر الاتصال بقاعدة البيانات حالياً',
          dismissible: false,
          priority: 1,
        });
      }

      if (!canceled) setAlerts(newAlerts);
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 60000);
    return () => {
      canceled = true;
      clearInterval(interval);
    };
  }, []);

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
