import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  DollarSign,
  Car,
  User,
  Settings,
  X,
  Eye,
  MoreHorizontal,
  Filter,
  BellRing,
  AlertCircle,
  Info,
  MessageSquare,
  Mail,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  category: 'contract_expiry' | 'payment_due' | 'vehicle_return' | 'system' | 'maintenance';
  relatedEntity?: {
    type: 'contract' | 'customer' | 'vehicle';
    id: string;
    name: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationSettings {
  enabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  contractExpiry: {
    enabled: boolean;
    advanceDays: number;
  };
  paymentDue: {
    enabled: boolean;
    advanceDays: number;
  };
  vehicleReturn: {
    enabled: boolean;
    advanceHours: number;
  };
  maintenance: {
    enabled: boolean;
    advanceDays: number;
  };
}

export function SmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'urgent',
      title: 'عقد قريب الانتهاء',
      message: 'العقد CR-2024-001 سينتهي خلال 3 أيام. العميل: أحمد محمد',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      actionRequired: true,
      category: 'contract_expiry',
      relatedEntity: {
        type: 'contract',
        id: 'cr-001',
        name: 'CR-2024-001'
      },
      priority: 'urgent'
    },
    {
      id: '2',
      type: 'warning',
      title: 'دفعة مستحقة',
      message: 'دفعة بقيمة 5,000 ر.س مستحقة للعقد CR-2024-002',
      timestamp: '2024-01-15T09:15:00Z',
      read: false,
      actionRequired: true,
      category: 'payment_due',
      relatedEntity: {
        type: 'contract',
        id: 'cr-002',
        name: 'CR-2024-002'
      },
      priority: 'high'
    },
    {
      id: '3',
      type: 'info',
      title: 'إرجاع مركبة مجدول',
      message: 'مركبة كامري 2023 (أ ب ج 123) مجدولة للإرجاع غداً',
      timestamp: '2024-01-15T08:45:00Z',
      read: true,
      actionRequired: false,
      category: 'vehicle_return',
      relatedEntity: {
        type: 'vehicle',
        id: 'v-001',
        name: 'كامري 2023'
      },
      priority: 'medium'
    },
    {
      id: '4',
      type: 'success',
      title: 'تم تجديد العقد',
      message: 'تم تجديد العقد CR-2024-003 بنجاح لمدة 6 أشهر إضافية',
      timestamp: '2024-01-14T16:20:00Z',
      read: true,
      actionRequired: false,
      category: 'contract_expiry',
      relatedEntity: {
        type: 'contract',
        id: 'cr-003',
        name: 'CR-2024-003'
      },
      priority: 'low'
    },
    {
      id: '5',
      type: 'warning',
      title: 'صيانة مطلوبة',
      message: 'مركبة أكورد 2022 تحتاج صيانة دورية خلال الأسبوع القادم',
      timestamp: '2024-01-14T14:30:00Z',
      read: false,
      actionRequired: true,
      category: 'maintenance',
      relatedEntity: {
        type: 'vehicle',
        id: 'v-002',
        name: 'أكورد 2022'
      },
      priority: 'medium'
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    contractExpiry: {
      enabled: true,
      advanceDays: 7
    },
    paymentDue: {
      enabled: true,
      advanceDays: 3
    },
    vehicleReturn: {
      enabled: true,
      advanceHours: 24
    },
    maintenance: {
      enabled: true,
      advanceDays: 5
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contract_expiry':
        return <Calendar className="h-4 w-4" />;
      case 'payment_due':
        return <DollarSign className="h-4 w-4" />;
      case 'vehicle_return':
        return <Car className="h-4 w-4" />;
      case 'maintenance':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (selectedCategory !== 'all' && notif.category !== selectedCategory) return false;
    if (showUnreadOnly && notif.read) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  const categoryStats = {
    contract_expiry: notifications.filter(n => n.category === 'contract_expiry' && !n.read).length,
    payment_due: notifications.filter(n => n.category === 'payment_due' && !n.read).length,
    vehicle_return: notifications.filter(n => n.category === 'vehicle_return' && !n.read).length,
    maintenance: notifications.filter(n => n.category === 'maintenance' && !n.read).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">الإشعارات الذكية</h2>
          <p className="text-muted-foreground mt-1">
            نظام إشعارات متقدم للعقود والعمليات المهمة
          </p>
        </div>
        <div className="flex items-center gap-3">
          {urgentCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {urgentCount} عاجل
            </Badge>
          )}
          <Badge variant="outline">
            {unreadCount} غير مقروء
          </Badge>
          <Button size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            تعليم الكل كمقروء
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-scale cursor-pointer" onClick={() => setSelectedCategory('contract_expiry')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">انتهاء العقود</p>
                <p className="text-2xl font-bold text-red-600">{categoryStats.contract_expiry}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer" onClick={() => setSelectedCategory('payment_due')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">دفعات مستحقة</p>
                <p className="text-2xl font-bold text-yellow-600">{categoryStats.payment_due}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer" onClick={() => setSelectedCategory('vehicle_return')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إرجاع المركبات</p>
                <p className="text-2xl font-bold text-blue-600">{categoryStats.vehicle_return}</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer" onClick={() => setSelectedCategory('maintenance')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الصيانة</p>
                <p className="text-2xl font-bold text-purple-600">{categoryStats.maintenance}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    الكل
                  </Button>
                  <Button 
                    variant={selectedCategory === 'contract_expiry' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedCategory('contract_expiry')}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    انتهاء العقود
                  </Button>
                  <Button 
                    variant={selectedCategory === 'payment_due' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedCategory('payment_due')}
                    className="gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    الدفعات
                  </Button>
                  <Button 
                    variant={selectedCategory === 'vehicle_return' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedCategory('vehicle_return')}
                    className="gap-2"
                  >
                    <Car className="h-4 w-4" />
                    إرجاع المركبات
                  </Button>
                  <Button 
                    variant={selectedCategory === 'maintenance' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedCategory('maintenance')}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    الصيانة
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showUnreadOnly}
                    onCheckedChange={setShowUnreadOnly}
                  />
                  <Label>غير المقروء فقط</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle>الإشعارات ({filteredNotifications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد إشعارات</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-4 p-4 border-l-4 rounded-lg transition-all hover:bg-muted/50",
                        getNotificationColor(notification.type),
                        !notification.read && "shadow-sm"
                      )}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                "font-medium text-sm",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </h4>
                              {notification.actionRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  يتطلب إجراء
                                </Badge>
                              )}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(notification.category)}
                                <span>{formatTimestamp(notification.timestamp)}</span>
                              </div>
                              {notification.relatedEntity && (
                                <div className="flex items-center gap-1">
                                  <span>{notification.relatedEntity.name}</span>
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {notification.priority === 'urgent' ? 'عاجل' :
                                 notification.priority === 'high' ? 'عالي' :
                                 notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>
                تخصيص كيفية ووقت تلقي الإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Global Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">تفعيل الإشعارات</Label>
                    <p className="text-sm text-muted-foreground">تفعيل أو إيقاف جميع الإشعارات</p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label>البريد الإلكتروني</Label>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label>الرسائل النصية</Label>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, smsNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-4 w-4" />
                      <Label>الإشعارات المباشرة</Label>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Category-specific Settings */}
              <div className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-medium">إعدادات الفئات</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contract Expiry */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <Label>انتهاء العقود</Label>
                      </div>
                      <Switch
                        checked={settings.contractExpiry.enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            contractExpiry: { ...prev.contractExpiry, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {settings.contractExpiry.enabled && (
                      <div className="ml-6">
                        <Label className="text-sm">التنبيه قبل (أيام)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={settings.contractExpiry.advanceDays}
                            onChange={(e) => 
                              setSettings(prev => ({ 
                                ...prev, 
                                contractExpiry: { 
                                  ...prev.contractExpiry, 
                                  advanceDays: parseInt(e.target.value) || 7
                                }
                              }))
                            }
                            className="w-20 px-2 py-1 border rounded text-sm"
                            min="1"
                            max="30"
                          />
                          <span className="text-sm text-muted-foreground">يوم</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Due */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <Label>الدفعات المستحقة</Label>
                      </div>
                      <Switch
                        checked={settings.paymentDue.enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            paymentDue: { ...prev.paymentDue, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {settings.paymentDue.enabled && (
                      <div className="ml-6">
                        <Label className="text-sm">التنبيه قبل (أيام)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={settings.paymentDue.advanceDays}
                            onChange={(e) => 
                              setSettings(prev => ({ 
                                ...prev, 
                                paymentDue: { 
                                  ...prev.paymentDue, 
                                  advanceDays: parseInt(e.target.value) || 3
                                }
                              }))
                            }
                            className="w-20 px-2 py-1 border rounded text-sm"
                            min="1"
                            max="15"
                          />
                          <span className="text-sm text-muted-foreground">يوم</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vehicle Return */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <Label>إرجاع المركبات</Label>
                      </div>
                      <Switch
                        checked={settings.vehicleReturn.enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            vehicleReturn: { ...prev.vehicleReturn, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {settings.vehicleReturn.enabled && (
                      <div className="ml-6">
                        <Label className="text-sm">التنبيه قبل (ساعات)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={settings.vehicleReturn.advanceHours}
                            onChange={(e) => 
                              setSettings(prev => ({ 
                                ...prev, 
                                vehicleReturn: { 
                                  ...prev.vehicleReturn, 
                                  advanceHours: parseInt(e.target.value) || 24
                                }
                              }))
                            }
                            className="w-20 px-2 py-1 border rounded text-sm"
                            min="1"
                            max="72"
                          />
                          <span className="text-sm text-muted-foreground">ساعة</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Maintenance */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <Label>الصيانة</Label>
                      </div>
                      <Switch
                        checked={settings.maintenance.enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ 
                            ...prev, 
                            maintenance: { ...prev.maintenance, enabled: checked }
                          }))
                        }
                      />
                    </div>
                    {settings.maintenance.enabled && (
                      <div className="ml-6">
                        <Label className="text-sm">التنبيه قبل (أيام)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={settings.maintenance.advanceDays}
                            onChange={(e) => 
                              setSettings(prev => ({ 
                                ...prev, 
                                maintenance: { 
                                  ...prev.maintenance, 
                                  advanceDays: parseInt(e.target.value) || 5
                                }
                              }))
                            }
                            className="w-20 px-2 py-1 border rounded text-sm"
                            min="1"
                            max="30"
                          />
                          <span className="text-sm text-muted-foreground">يوم</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-6 border-t">
                <Button variant="outline">إلغاء</Button>
                <Button>حفظ الإعدادات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}