import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, AlertCircle, Info, Calendar, Wrench, CreditCard, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'contract_expiry' | 'maintenance_due' | 'payment_overdue' | 'license_expiry' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'dismissed';
  reference_id?: string;
  reference_type?: string;
  scheduled_for?: string;
  created_at: string;
  action_required: boolean;
  metadata?: any;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'contract_expiry':
      return <FileText className="h-4 w-4" />;
    case 'maintenance_due':
      return <Wrench className="h-4 w-4" />;
    case 'payment_overdue':
      return <CreditCard className="h-4 w-4" />;
    case 'license_expiry':
      return <Calendar className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'medium':
      return <Info className="h-4 w-4 text-info" />;
    default:
      return <CheckCircle className="h-4 w-4 text-success" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    default:
      return 'success';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'contract_expiry':
      return 'انتهاء عقد';
    case 'maintenance_due':
      return 'موعد صيانة';
    case 'payment_overdue':
      return 'دفع متأخر';
    case 'license_expiry':
      return 'انتهاء رخصة';
    default:
      return 'عام';
  }
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // جلب الإشعارات
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications((data as Notification[]) || []);
    } catch (error: any) {
      console.error('خطأ في جلب الإشعارات:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب الإشعارات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // تشغيل فحص الإشعارات
  const checkNotifications = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-notifications');
      
      if (error) throw error;

      toast({
        title: 'تم الفحص',
        description: data.message || 'تم فحص الإشعارات بنجاح',
      });

      await fetchNotifications();
    } catch (error: any) {
      console.error('خطأ في فحص الإشعارات:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في فحص الإشعارات',
        variant: 'destructive',
      });
    }
  };

  // تحديث حالة الإشعار
  const updateNotificationStatus = async (id: string, status: 'read' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status } : n)
      );

      toast({
        title: status === 'read' ? 'تم قراءة الإشعار' : 'تم إخفاء الإشعار',
        description: status === 'read' ? 'تم تحديد الإشعار كمقروء' : 'تم إخفاء الإشعار',
      });
    } catch (error: any) {
      console.error('خطأ في تحديث الإشعار:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الإشعار',
        variant: 'destructive',
      });
    }
  };

  // تحديد الإشعارات المفلترة حسب التبويب
  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return notification.status === 'unread';
      case 'critical':
        return notification.severity === 'critical';
      case 'action_required':
        return notification.action_required;
      default:
        return notification.status !== 'dismissed';
    }
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative btn-scale hover-glow">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:w-[540px] backdrop-glass border-border/60 p-0">
        <SheetHeader className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              مركز الإشعارات
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkNotifications}
                className="btn-scale"
              >
                <Settings className="h-4 w-4 mr-1" />
                فحص
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 m-4 mb-0">
              <TabsTrigger value="all" className="text-xs">
                الكل ({notifications.filter(n => n.status !== 'dismissed').length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                غير مقروء ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="critical" className="text-xs">
                حرج ({notifications.filter(n => n.severity === 'critical').length})
              </TabsTrigger>
              <TabsTrigger value="action_required" className="text-xs">
                يتطلب إجراء ({notifications.filter(n => n.action_required).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 m-0">
              <ScrollArea className="h-full custom-scrollbar">
                <div className="p-4 space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-muted/50 rounded-xl loading-shimmer" />
                      ))}
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">لا توجد إشعارات في هذا القسم</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification, index) => (
                      <Card 
                        key={notification.id} 
                        className={cn(
                          "card-interactive hover-lift",
                          notification.status === 'unread' && "border-primary/40 bg-primary/5",
                          notification.severity === 'critical' && "border-destructive/40 bg-destructive/5"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={cn(
                                "p-2 rounded-xl shadow-soft",
                                notification.severity === 'critical' ? "bg-destructive/20 text-destructive" :
                                notification.severity === 'high' ? "bg-warning/20 text-warning" :
                                notification.severity === 'medium' ? "bg-info/20 text-info" :
                                "bg-success/20 text-success"
                              )}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-sm font-semibold">
                                    {notification.title}
                                  </CardTitle>
                                  {getSeverityIcon(notification.severity)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getTypeLabel(notification.type)}
                                  </Badge>
                                  {notification.action_required && (
                                    <Badge variant="destructive" className="text-xs">
                                      يتطلب إجراء
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {notification.status === 'unread' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateNotificationStatus(notification.id, 'read')}
                                  className="h-8 w-8 p-0 btn-scale"
                                >
                                  <CheckCircle className="h-4 w-4 text-success" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateNotificationStatus(notification.id, 'dismissed')}
                                className="h-8 w-8 p-0 btn-scale"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">
                            {notification.message}
                          </p>
                          
                          {notification.metadata && (
                            <div className="bg-muted/30 rounded-lg p-3 text-xs space-y-1">
                              {notification.metadata.vehicle_name && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">المركبة:</span>
                                  <span className="font-medium">{notification.metadata.vehicle_name}</span>
                                </div>
                              )}
                              {notification.metadata.customer_name && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">العميل:</span>
                                  <span className="font-medium">{notification.metadata.customer_name}</span>
                                </div>
                              )}
                              {notification.metadata.amount && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">المبلغ:</span>
                                  <span className="font-medium">{notification.metadata.amount} ريال</span>
                                </div>
                              )}
                              {notification.metadata.days_remaining && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">الأيام المتبقية:</span>
                                  <span className="font-medium">{notification.metadata.days_remaining} يوم</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>
                              {new Date(notification.created_at).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {notification.action_required && (
                              <Button size="sm" className="btn-glow text-xs h-7">
                                اتخاذ إجراء
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}