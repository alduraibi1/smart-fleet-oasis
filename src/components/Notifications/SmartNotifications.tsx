import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Clock,
  Package,
  Settings,
  FileText,
  RefreshCw
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  created_at: string;
  metadata?: any;
  reference_type?: string;
  reference_id?: string;
}

export const SmartNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  // جلب التنبيهات
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('خطأ في جلب التنبيهات:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب التنبيهات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تشغيل التحقق من التنبيهات
  const runSmartCheck = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-notifications');
      
      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تشغيل نظام التنبيهات الذكي",
      });

      // تحديث قائمة التنبيهات
      await fetchNotifications();
    } catch (error) {
      console.error('خطأ في تشغيل التنبيهات الذكية:', error);
      toast({
        title: "خطأ",
        description: "فشل في تشغيل نظام التنبيهات",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  // تحديد أيقونة التنبيه
  const getNotificationIcon = (type: string, severity: string) => {
    switch (type) {
      case 'maintenance_due':
      case 'maintenance_overdue':
        return <Settings className="h-4 w-4" />;
      case 'low_stock':
      case 'item_expiring':
      case 'item_expired':
        return <Package className="h-4 w-4" />;
      case 'document_expiring':
        return <FileText className="h-4 w-4" />;
      default:
        return severity === 'error' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />;
    }
  };

  // تحديد لون التنبيه
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // تحديد نص حالة التنبيه
  const getStatusText = (status: string) => {
    switch (status) {
      case 'unread':
        return 'غير مقروء';
      case 'read':
        return 'مقروء';
      case 'dismissed':
        return 'تم تجاهله';
      default:
        return status;
    }
  };

  // تحديث حالة التنبيه
  const updateNotificationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, status } : notif
        )
      );
    } catch (error) {
      console.error('خطأ في تحديث التنبيه:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // الاشتراك في التحديثات المباشرة
    const subscription = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            <CardTitle>التنبيهات الذكية</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <Button 
            onClick={runSmartCheck} 
            disabled={running}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'جاري الفحص...' : 'فحص التنبيهات'}
          </Button>
        </div>
        <CardDescription>
          نظام ذكي لمراقبة الصيانة والمخزون والوثائق تلقائياً
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">جاري تحميل التنبيهات...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد تنبيهات</p>
            <Button 
              onClick={runSmartCheck} 
              variant="outline" 
              className="mt-4"
              disabled={running}
            >
              تشغيل الفحص الذكي
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div className={`p-4 rounded-lg border ${
                  notification.status === 'unread' ? 'bg-accent/50' : ''
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        notification.severity === 'error' ? 'bg-destructive/10 text-destructive' :
                        notification.severity === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {getNotificationIcon(notification.type, notification.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge variant={getSeverityColor(notification.severity) as any}>
                            {notification.severity === 'error' ? 'عاجل' :
                             notification.severity === 'warning' ? 'تحذير' : 'معلومة'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(notification.created_at).toLocaleString('ar-SA')}</span>
                          <span>الحالة: {getStatusText(notification.status)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {notification.status === 'unread' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateNotificationStatus(notification.id, 'read')}
                          className="h-8 w-8 p-0"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateNotificationStatus(notification.id, 'dismissed')}
                        className="h-8 w-8 p-0"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};