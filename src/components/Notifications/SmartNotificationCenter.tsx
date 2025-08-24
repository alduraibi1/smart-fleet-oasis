
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  X, 
  Filter, 
  Search,
  Wrench,
  Package,
  FileText,
  Shield,
  Users,
  Car,
  TrendingUp,
  Trash2
} from 'lucide-react';

interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  severity: 'info' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'dismissed';
  reference_type?: string;
  reference_id?: string;
  reference_data?: any;
  action_required: boolean;
  created_at: string;
  target_roles?: string[];
  delivery_channels?: string[];
}

const SmartNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const { toast } = useToast();

  const categoryIcons = {
    maintenance: Wrench,
    inventory: Package,
    documents: FileText,
    insurance: Shield,
    contracts: Users,
    operations: Car,
    payments: TrendingUp,
    system: Bell
  };

  const priorityColors = {
    urgent: 'destructive',
    high: 'orange',
    medium: 'yellow',
    low: 'blue'
  };

  const severityColors = {
    error: 'destructive',
    warning: 'warning',
    info: 'info'
  };

  // جلب التنبيهات
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('smart_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // تحويل البيانات من قاعدة البيانات إلى الواجهة المطلوبة
      const transformedNotifications: SmartNotification[] = (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        severity: notification.severity as 'info' | 'warning' | 'error',
        priority: notification.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: notification.status as 'unread' | 'read' | 'dismissed',
        reference_type: notification.reference_type,
        reference_id: notification.reference_id,
        reference_data: notification.reference_data,
        action_required: notification.action_required,
        created_at: notification.created_at,
        target_roles: notification.target_roles,
        delivery_channels: notification.delivery_channels
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب التنبيهات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تشغيل فحص التنبيهات الذكية
  const triggerSmartCheck = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-notifications');
      
      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: data.message || "تم فحص التنبيهات بنجاح",
      });

      // إعادة جلب التنبيهات
      await fetchNotifications();
    } catch (error) {
      console.error('Error triggering smart check:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء فحص التنبيهات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تحديث حالة التنبيه
  const updateNotificationStatus = async (id: string, status: 'read' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, status } : notif
        )
      );

      toast({
        title: "تم التحديث",
        description: status === 'read' ? "تم تحديد التنبيه كمقروء" : "تم إخفاء التنبيه",
      });
    } catch (error) {
      console.error('Error updating notification status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث التنبيه",
        variant: "destructive",
      });
    }
  };

  // حذف التنبيه
  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('smart_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      toast({
        title: "تم الحذف",
        description: "تم حذف التنبيه بنجاح",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف التنبيه",
        variant: "destructive",
      });
    }
  };

  // تطبيق الفلاتر
  useEffect(() => {
    let filtered = notifications;

    // فلترة حسب التاب النشط
    if (activeTab !== 'all') {
      if (activeTab === 'unread') {
        filtered = filtered.filter(n => n.status === 'unread');
      } else if (activeTab === 'action_required') {
        filtered = filtered.filter(n => n.action_required && n.status === 'unread');
      } else {
        filtered = filtered.filter(n => n.category === activeTab);
      }
    }

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // فلترة حسب الأولوية
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    // فلترة حسب الفئة
    if (filterCategory !== 'all') {
      filtered = filtered.filter(n => n.category === filterCategory);
    }

    setFilteredNotifications(filtered);
  }, [notifications, activeTab, searchTerm, filterPriority, filterCategory]);

  // جلب التنبيهات عند تحميل المكون
  useEffect(() => {
    fetchNotifications();

    // إعداد الاشتراك للتحديثات الفورية
    const subscription = supabase
      .channel('smart_notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'smart_notifications' },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // حساب إحصائيات التنبيهات
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => n.status === 'unread').length,
    urgent: notifications.filter(n => n.priority === 'urgent' && n.status === 'unread').length,
    actionRequired: notifications.filter(n => n.action_required && n.status === 'unread').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">مركز التنبيهات الذكية</h2>
          <p className="text-muted-foreground">
            إدارة ومتابعة جميع التنبيهات والإشعارات
          </p>
        </div>
        <Button onClick={triggerSmartCheck} disabled={loading} className="gap-2">
          <Bell className="h-4 w-4" />
          {loading ? "جاري الفحص..." : "فحص التنبيهات"}
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">غير مقروء</p>
                <p className="text-2xl font-bold">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">عاجل</p>
                <p className="text-2xl font-bold">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">يتطلب إجراء</p>
                <p className="text-2xl font-bold">{stats.actionRequired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والفلترة */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في التنبيهات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="urgent">عاجل</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="maintenance">صيانة</SelectItem>
                <SelectItem value="inventory">مخزون</SelectItem>
                <SelectItem value="documents">وثائق</SelectItem>
                <SelectItem value="insurance">تأمين</SelectItem>
                <SelectItem value="contracts">عقود</SelectItem>
                <SelectItem value="operations">عمليات</SelectItem>
                <SelectItem value="payments">مدفوعات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* التبويبات */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="unread">غير مقروء</TabsTrigger>
          <TabsTrigger value="action_required">يتطلب إجراء</TabsTrigger>
          <TabsTrigger value="maintenance">صيانة</TabsTrigger>
          <TabsTrigger value="inventory">مخزون</TabsTrigger>
          <TabsTrigger value="contracts">عقود</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد تنبيهات</p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => {
                  const CategoryIcon = categoryIcons[notification.category as keyof typeof categoryIcons] || Bell;
                  
                  return (
                    <Card key={notification.id} className={`${
                      notification.status === 'unread' ? 'border-l-4 border-l-primary' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-full ${
                              notification.severity === 'error' ? 'bg-red-100 text-red-600' :
                              notification.severity === 'warning' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{notification.title}</h4>
                                <Badge variant={priorityColors[notification.priority as keyof typeof priorityColors] as any}>
                                  {notification.priority === 'urgent' ? 'عاجل' :
                                   notification.priority === 'high' ? 'عالي' :
                                   notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                </Badge>
                                {notification.action_required && (
                                  <Badge variant="secondary">يتطلب إجراء</Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{new Date(notification.created_at).toLocaleString('ar-SA')}</span>
                                <span>الفئة: {notification.category}</span>
                                {notification.reference_data && (
                                  <span>المرجع: {notification.reference_type}</span>
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
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateNotificationStatus(notification.id, 'dismissed')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartNotificationCenter;
