
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Bell, X, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: 'maintenance' | 'document' | 'payment' | 'insurance' | 'contract';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  isRead: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
}

export const SmartAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Mock alerts data - in real implementation, this would come from the backend
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'maintenance',
        title: 'صيانة دورية مستحقة',
        message: 'المركبة أ ب ج 123 تحتاج صيانة دورية (30,000 كم)',
        priority: 'high',
        timestamp: new Date(Date.now() - 1800000), // 30 min ago
        isRead: false,
        actions: [
          {
            label: 'جدولة الصيانة',
            action: () => toast({ title: "تم جدولة الصيانة" }),
            variant: 'default'
          },
          {
            label: 'تأجيل',
            action: () => toast({ title: "تم تأجيل الصيانة" }),
            variant: 'outline'
          }
        ]
      },
      {
        id: '2',
        type: 'document',
        title: 'انتهاء صلاحية الوثائق',
        message: 'رخصة تسجيل المركبة د ه و 456 ستنتهي خلال 15 يوم',
        priority: 'critical',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        isRead: false,
        actions: [
          {
            label: 'تجديد الآن',
            action: () => toast({ title: "تم فتح صفحة التجديد" }),
            variant: 'default'
          }
        ]
      },
      {
        id: '3',
        type: 'payment',
        title: 'دفعة متأخرة',
        message: 'العميل أحمد محمد لديه دفعة متأخرة بقيمة 2,500 ريال',
        priority: 'high',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        isRead: true,
        actions: [
          {
            label: 'إرسال تذكير',
            action: () => toast({ title: "تم إرسال تذكير للعميل" }),
            variant: 'default'
          },
          {
            label: 'عرض التفاصيل',
            action: () => toast({ title: "عرض تفاصيل الدفعة" }),
            variant: 'outline'
          }
        ]
      },
      {
        id: '4',
        type: 'contract',
        title: 'عقد ينتهي قريباً',
        message: 'عقد إيجار المركبة ز ح ط 789 سينتهي خلال 3 أيام',
        priority: 'medium',
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        isRead: false,
        actions: [
          {
            label: 'تجديد العقد',
            action: () => toast({ title: "بدء عملية تجديد العقد" }),
            variant: 'default'
          },
          {
            label: 'تذكير العميل',
            action: () => toast({ title: "تم إرسال تذكير للعميل" }),
            variant: 'outline'
          }
        ]
      },
      {
        id: '5',
        type: 'insurance',
        title: 'تأمين المركبة',
        message: 'تأمين المركبة ي ك ل 101 سينتهي خلال أسبوع',
        priority: 'medium',
        timestamp: new Date(Date.now() - 21600000), // 6 hours ago
        isRead: true
      }
    ];
    
    setAlerts(mockAlerts);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'حرج';
      case 'high':
        return 'عالي';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'منخفض';
      default:
        return 'عادي';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Settings className="h-4 w-4" />;
      case 'document':
        return <AlertTriangle className="h-4 w-4" />;
      case 'payment':
        return <Clock className="h-4 w-4" />;
      case 'contract':
        return <CheckCircle className="h-4 w-4" />;
      case 'insurance':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'صيانة';
      case 'document':
        return 'وثائق';
      case 'payment':
        return 'مدفوعات';
      case 'contract':
        return 'عقود';
      case 'insurance':
        return 'تأمين';
      default:
        return 'عام';
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "تم إخفاء التنبيه",
      description: "يمكنك العثور على التنبيهات المخفية في الأرشيف",
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    const typeFilter = filter === 'all' || alert.type === filter;
    const readFilter = !showOnlyUnread || !alert.isRead;
    return typeFilter && readFilter;
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الإنذارات الذكية
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showOnlyUnread ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              >
                غير المقروءة فقط
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filter Buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              الكل
            </Button>
            <Button
              variant={filter === 'maintenance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('maintenance')}
            >
              صيانة
            </Button>
            <Button
              variant={filter === 'document' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('document')}
            >
              وثائق
            </Button>
            <Button
              variant={filter === 'payment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('payment')}
            >
              مدفوعات
            </Button>
            <Button
              variant={filter === 'contract' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('contract')}
            >
              عقود
            </Button>
          </div>

          {/* Alerts List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد تنبيهات متطابقة مع الفلاتر المحددة</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    alert.isRead ? 'bg-muted/30' : 'bg-background border-l-4 border-l-primary'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(alert.type)}
                        <span className="text-xs text-muted-foreground">
                          {getTypeText(alert.type)}
                        </span>
                        <Badge variant={getPriorityColor(alert.priority) as any}>
                          {getPriorityText(alert.priority)}
                        </Badge>
                        {!alert.isRead && (
                          <Badge variant="outline" className="text-xs">
                            جديد
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-semibold mb-1">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleString('ar-SA')}
                      </p>
                      
                      {alert.actions && (
                        <div className="flex gap-2 mt-3">
                          {alert.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant={action.variant || 'default'}
                              size="sm"
                              onClick={() => {
                                action.action();
                                markAsRead(alert.id);
                              }}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
