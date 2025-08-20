
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Car,
  User,
  CheckCircle,
  X
} from 'lucide-react';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';

interface SmartContractNotificationsProps {
  className?: string;
}

export const SmartContractNotifications: React.FC<SmartContractNotificationsProps> = ({ 
  className 
}) => {
  const { notifications, markAsRead, runAllChecks } = useSmartNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('unread');

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'contract_expiry':
        return <Calendar className="h-4 w-4" />;
      case 'maintenance':
        return <Car className="h-4 w-4" />;
      case 'payment_due':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'destructive';
    if (type === 'error') return 'destructive';
    if (type === 'warning') return 'secondary';
    return 'default';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'urgent') return notification.priority === 'urgent';
    return true;
  });

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            التنبيهات الذكية
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={runAllChecks}
          >
            تحديث
          </Button>
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
            غير مقروء ({notifications.filter(n => !n.read).length})
          </Button>
          <Button
            variant={filter === 'urgent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('urgent')}
          >
            عاجل ({notifications.filter(n => n.priority === 'urgent').length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>لا توجد تنبيهات جديدة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Alert 
                key={notification.id}
                className={`relative ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">
                        {notification.title}
                      </h4>
                      <Badge 
                        variant={getNotificationColor(notification.type, notification.priority)}
                        className="text-xs"
                      >
                        {notification.priority === 'urgent' ? 'عاجل' : 
                         notification.priority === 'high' ? 'مهم' : 'عادي'}
                      </Badge>
                    </div>
                    
                    <AlertDescription className="text-sm">
                      {notification.message}
                    </AlertDescription>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs"
                        >
                          تم القراءة
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
