
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info, X, Eye } from 'lucide-react';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const getPriorityIcon = (priority: string) => {
  switch (priority) {
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'medium':
      return 'default';
    default:
      return 'secondary';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'contract_expiry':
      return 'انتهاء عقد';
    case 'maintenance':
      return 'صيانة';
    case 'payment':
      return 'مالية';
    case 'financial':
      return 'مالية';
    case 'system':
      return 'نظام';
    default:
      return category;
  }
};

export function SmartNotificationsCard() {
  const { notifications, markAsRead, refetch } = useSmartNotifications();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const markAllAsRead = async () => {
    if (!notifications || notifications.length === 0) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('status', 'unread');

      if (error) throw error;

      await refetch();
      toast({
        title: 'تم بنجاح',
        description: 'تم تعليم جميع الإشعارات كمقروءة',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الإشعارات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ status: 'dismissed' })
        .eq('id', notificationId);

      if (error) throw error;
      
      await refetch();
      toast({
        title: 'تم إخفاء الإشعار',
        description: 'تم إخفاء الإشعار بنجاح',
      });
    } catch (error) {
      console.error('Error dismissing notification:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إخفاء الإشعار',
        variant: 'destructive',
      });
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            الإشعارات الذكية
          </CardTitle>
          <CardDescription>
            لا توجد إشعارات جديدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>جميع الإشعارات محدثة!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              الإشعارات الذكية
              <Badge variant="destructive" className="ml-2">
                {notifications.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              أحدث الإشعارات والتنبيهات
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={loading}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            تعليم الكل كمقروء
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(notification.priority)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {notification.title}
                    </h4>
                    <Badge variant={getPriorityColor(notification.priority) as any} className="text-xs">
                      {getCategoryLabel(notification.category)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString('ar-SA', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    
                    {notification.action_required && (
                      <Badge variant="outline" className="text-xs">
                        يتطلب إجراء
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
