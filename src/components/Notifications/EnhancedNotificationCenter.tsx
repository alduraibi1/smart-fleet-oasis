import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  CheckIcon, 
  XIcon, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  AlertCircle,
  UserPlus,
  Settings,
  Car,
  Wrench
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  reference_type?: string;
  reference_id?: string;
  reference_data?: any;
  user_id?: string;
  target_roles?: string[];
  action_required: boolean;
  status: string;
  scheduled_for: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

export const EnhancedNotificationCenter = () => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'action_required'>('all');
  const { toast } = useToast();
  const { user, userRoles } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Subscribe to real-time notifications
      const channel = supabase
        .channel('smart_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'smart_notifications'
          },
          (payload) => {
            const newNotification = payload.new as SmartNotification;
            
            // Check if notification is for this user or their roles
              const isForUser = newNotification.user_id === user.id ||
              (newNotification.target_roles && 
               newNotification.target_roles.some(role => 
                 userRoles.some(userRole => userRole === role)
               ));
            
            if (isForUser) {
              setNotifications(prev => [newNotification, ...prev]);
              
              // Show toast for high/urgent priority notifications
              if (['high', 'urgent'].includes(newNotification.priority)) {
                toast({
                  title: newNotification.title,
                  description: newNotification.message,
                  variant: newNotification.type === 'error' ? 'destructive' : 'default',
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, userRoles, toast]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const userRoleNames = userRoles.map(r => r);
      
      const { data, error } = await supabase
        .from('smart_notifications')
        .select('*')
        .or(`user_id.eq.${user.id},target_roles.cs.{${userRoleNames.join(',')}}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإشعارات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ 
          status: 'read', 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, status: 'read' as const, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ status: 'dismissed' })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'users') return UserPlus;
    if (category === 'vehicles') return Car;
    if (category === 'maintenance') return Wrench;
    if (category === 'system') return Settings;
    
    switch (type) {
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'text-red-600';
    if (priority === 'high') return 'text-orange-600';
    
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'outline';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.status === 'pending';
    if (filter === 'action_required') return notification.action_required;
    return true;
  });

  const unreadCount = notifications.filter(n => n.status === 'pending').length;
  const actionRequiredCount = notifications.filter(n => n.action_required && n.status === 'pending').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            مركز الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            مركز الإشعارات
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              الكل ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              غير مقروء ({unreadCount})
            </Button>
            <Button
              variant={filter === 'action_required' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('action_required')}
            >
              يتطلب إجراء ({actionRequiredCount})
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {filter === 'unread' 
                  ? 'لا توجد إشعارات غير مقروءة' 
                  : filter === 'action_required'
                  ? 'لا توجد إشعارات تتطلب إجراء'
                  : 'لا توجد إشعارات'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification, index) => {
                const IconComponent = getNotificationIcon(notification.type, notification.category);
                
                return (
                  <div key={notification.id}>
                    <div 
                      className={`p-4 rounded-lg border transition-colors ${
                        notification.status === 'pending' 
                          ? 'bg-muted/50 border-primary/20' 
                          : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent 
                          className={`h-5 w-5 mt-1 ${getNotificationColor(notification.type, notification.priority)}`} 
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={getPriorityBadgeVariant(notification.priority)} className="text-xs">
                                  {notification.priority === 'urgent' ? 'عاجل' :
                                   notification.priority === 'high' ? 'مهم' :
                                   notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                </Badge>
                                
                                {notification.action_required && (
                                  <Badge variant="outline" className="text-xs">
                                    يتطلب إجراء
                                  </Badge>
                                )}
                                
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(notification.created_at), 'dd MMM yyyy HH:mm', { locale: ar })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              {notification.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => dismissNotification(notification.id)}
                                className="h-8 w-8 p-0"
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {index < filteredNotifications.length - 1 && <Separator className="my-2" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};