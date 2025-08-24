
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Mail, MessageSquare, Settings, Clock, AlertTriangle } from 'lucide-react';

interface NotificationPreference {
  id?: string;
  notification_type: string;
  enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  advance_days?: number;
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const notificationTypes = [
    { id: 'maintenance_due', name: 'صيانة مستحقة', icon: Settings, defaultAdvanceDays: 3 },
    { id: 'maintenance_overdue', name: 'صيانة متأخرة', icon: AlertTriangle, defaultAdvanceDays: 0 },
    { id: 'document_expiry', name: 'انتهاء الوثائق', icon: Bell, defaultAdvanceDays: 30 },
    { id: 'insurance_expiry', name: 'انتهاء التأمين', icon: Bell, defaultAdvanceDays: 30 },
    { id: 'contract_expiry', name: 'انتهاء العقود', icon: Bell, defaultAdvanceDays: 7 },
    { id: 'low_stock', name: 'نفاد المخزون', icon: Bell, defaultAdvanceDays: 0 },
    { id: 'item_expiring', name: 'انتهاء صلاحية الأصناف', icon: Clock, defaultAdvanceDays: 30 },
    { id: 'vehicle_idle', name: 'مركبات خاملة', icon: Bell, defaultAdvanceDays: 0 },
    { id: 'customer_arrears', name: 'عملاء متعثرين', icon: AlertTriangle, defaultAdvanceDays: 0 }
  ];

  // جلب الإعدادات الحالية
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // إنشاء إعدادات افتراضية للأنواع غير الموجودة
      const existingTypes = data?.map(p => p.notification_type) || [];
      const defaultPreferences: NotificationPreference[] = [];

      notificationTypes.forEach(type => {
        const existing = data?.find(p => p.notification_type === type.id);
        if (existing) {
          defaultPreferences.push(existing);
        } else {
          defaultPreferences.push({
            notification_type: type.id,
            enabled: true,
            email_enabled: true,
            push_enabled: true,
            sms_enabled: false,
            advance_days: type.defaultAdvanceDays
          });
        }
      });

      setPreferences(defaultPreferences);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // حفظ الإعدادات
  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // حذف الإعدادات الحالية
      await supabase
        .from('user_notification_preferences')
        .delete()
        .eq('user_id', user.id);

      // إضافة الإعدادات الجديدة
      const preferencesToSave = preferences.map(pref => ({
        ...pref,
        user_id: user.id
      }));

      const { error } = await supabase
        .from('user_notification_preferences')
        .insert(preferencesToSave);

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات التنبيهات بنجاح",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // تحديث إعداد معين
  const updatePreference = (type: string, field: keyof NotificationPreference, value: any) => {
    setPreferences(prev => prev.map(pref => 
      pref.notification_type === type 
        ? { ...pref, [field]: value }
        : pref
    ));
  };

  // اختبار التنبيهات
  const testNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('smart-notifications');
      
      if (error) throw error;

      toast({
        title: "تم الاختبار",
        description: "تم تشغيل فحص التنبيهات التجريبي",
      });
    } catch (error) {
      console.error('Error testing notifications:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء اختبار التنبيهات",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">إعدادات التنبيهات</h2>
          <p className="text-muted-foreground">
            تخصيص تنبيهاتك وطرق التواصل المفضلة
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testNotification}>
            اختبار التنبيهات
          </Button>
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications">أنواع التنبيهات</TabsTrigger>
            <TabsTrigger value="channels">قنوات التواصل</TabsTrigger>
            <TabsTrigger value="schedule">الجدولة</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {notificationTypes.map(type => {
              const pref = preferences.find(p => p.notification_type === type.id);
              const Icon = type.icon;
              
              return (
                <Card key={type.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            تنبيهات {type.name.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {type.defaultAdvanceDays > 0 && (
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">أيام مسبقة:</Label>
                            <Input
                              type="number"
                              min="1"
                              max="365"
                              value={pref?.advance_days || type.defaultAdvanceDays}
                              onChange={(e) => updatePreference(type.id, 'advance_days', parseInt(e.target.value))}
                              className="w-20"
                            />
                          </div>
                        )}
                        
                        <Switch
                          checked={pref?.enabled || false}
                          onCheckedChange={(checked) => updatePreference(type.id, 'enabled', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>قنوات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {notificationTypes.map(type => {
                  const pref = preferences.find(p => p.notification_type === type.id);
                  const Icon = type.icon;
                  
                  return (
                    <div key={type.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="h-4 w-4" />
                        <h4 className="font-medium">{type.name}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-blue-500" />
                          <Label>داخل التطبيق</Label>
                          <Switch
                            checked={pref?.push_enabled || false}
                            onCheckedChange={(checked) => updatePreference(type.id, 'push_enabled', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-green-500" />
                          <Label>البريد الإلكتروني</Label>
                          <Switch
                            checked={pref?.email_enabled || false}
                            onCheckedChange={(checked) => updatePreference(type.id, 'email_enabled', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-orange-500" />
                          <Label>رسائل SMS</Label>
                          <Switch
                            checked={pref?.sms_enabled || false}
                            onCheckedChange={(checked) => updatePreference(type.id, 'sms_enabled', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>جدولة التنبيهات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>وقت الفحص اليومي</Label>
                    <Select defaultValue="09:00">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الوقت" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06:00">6:00 ص</SelectItem>
                        <SelectItem value="09:00">9:00 ص</SelectItem>
                        <SelectItem value="12:00">12:00 م</SelectItem>
                        <SelectItem value="15:00">3:00 م</SelectItem>
                        <SelectItem value="18:00">6:00 م</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>تكرار الفحص</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التكرار" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">كل ساعة</SelectItem>
                        <SelectItem value="daily">يومياً</SelectItem>
                        <SelectItem value="weekly">أسبوعياً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Label>تفعيل الفحص التلقائي</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <Label>إرسال تقرير يومي</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default NotificationSettings;
