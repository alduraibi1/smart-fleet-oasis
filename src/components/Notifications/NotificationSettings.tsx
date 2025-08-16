
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, Smartphone, AlertTriangle, Calendar, Car, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CategoryPreference {
  enabled: boolean;
  advance_days: number;
}

interface CategoryPreferences {
  contract_expiry?: CategoryPreference;
  document_expiry?: CategoryPreference;
  maintenance?: CategoryPreference;
  payment_due?: CategoryPreference;
}

interface NotificationPreferences {
  enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  contract_expiry: CategoryPreference;
  document_expiry: CategoryPreference;
  maintenance_due: CategoryPreference;
  payment_overdue: CategoryPreference;
}

export default function NotificationSettings() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    contract_expiry: { enabled: true, advance_days: 7 },
    document_expiry: { enabled: true, advance_days: 14 },
    maintenance_due: { enabled: true, advance_days: 5 },
    payment_overdue: { enabled: true, advance_days: 3 },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const categoryPrefs = data.category_preferences as CategoryPreferences || {};
        
        setPreferences({
          enabled: data.enabled,
          email_enabled: data.email_enabled,
          sms_enabled: data.sms_enabled,
          push_enabled: data.push_enabled,
          contract_expiry: categoryPrefs.contract_expiry || { enabled: true, advance_days: 7 },
          document_expiry: categoryPrefs.document_expiry || { enabled: true, advance_days: 14 },
          maintenance_due: categoryPrefs.maintenance || { enabled: true, advance_days: 5 },
          payment_overdue: categoryPrefs.payment_due || { enabled: true, advance_days: 3 },
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const categoryPreferences: CategoryPreferences = {
        contract_expiry: preferences.contract_expiry,
        document_expiry: preferences.document_expiry,
        maintenance: preferences.maintenance_due,
        payment_due: preferences.payment_overdue,
      };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          enabled: preferences.enabled,
          email_enabled: preferences.email_enabled,
          sms_enabled: preferences.sms_enabled,
          push_enabled: preferences.push_enabled,
          category_preferences: categoryPreferences,
        });

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إعدادات الإشعارات",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">الإعدادات العامة</TabsTrigger>
          <TabsTrigger value="categories">إعدادات الفئات</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                إعدادات الإشعارات العامة
              </CardTitle>
              <CardDescription>
                تحكم في تفعيل الإشعارات وطرق التسليم المختلفة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">تفعيل الإشعارات</Label>
                  <p className="text-sm text-muted-foreground">تفعيل أو إيقاف جميع الإشعارات</p>
                </div>
                <Switch
                  checked={preferences.enabled}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label className="font-medium">البريد الإلكتروني</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تفعيل</span>
                    <Switch
                      checked={preferences.email_enabled}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, email_enabled: checked }))
                      }
                      disabled={!preferences.enabled}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label className="font-medium">الرسائل النصية</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تفعيل</span>
                    <Switch
                      checked={preferences.sms_enabled}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, sms_enabled: checked }))
                      }
                      disabled={!preferences.enabled}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label className="font-medium">الإشعارات المباشرة</Label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تفعيل</span>
                    <Switch
                      checked={preferences.push_enabled}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, push_enabled: checked }))
                      }
                      disabled={!preferences.enabled}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  انتهاء العقود
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>تفعيل التنبيهات</Label>
                  <Switch
                    checked={preferences.contract_expiry.enabled}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        contract_expiry: { ...prev.contract_expiry, enabled: checked }
                      }))
                    }
                  />
                </div>
                {preferences.contract_expiry.enabled && (
                  <div className="space-y-2">
                    <Label className="text-sm">التنبيه قبل (أيام)</Label>
                    <Input
                      type="number"
                      value={preferences.contract_expiry.advance_days}
                      onChange={(e) => 
                        setPreferences(prev => ({ 
                          ...prev, 
                          contract_expiry: { 
                            ...prev.contract_expiry, 
                            advance_days: parseInt(e.target.value) || 7
                          }
                        }))
                      }
                      min="1"
                      max="30"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4" />
                  انتهاء الوثائق
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>تفعيل التنبيهات</Label>
                  <Switch
                    checked={preferences.document_expiry.enabled}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        document_expiry: { ...prev.document_expiry, enabled: checked }
                      }))
                    }
                  />
                </div>
                {preferences.document_expiry.enabled && (
                  <div className="space-y-2">
                    <Label className="text-sm">التنبيه قبل (أيام)</Label>
                    <Input
                      type="number"
                      value={preferences.document_expiry.advance_days}
                      onChange={(e) => 
                        setPreferences(prev => ({ 
                          ...prev, 
                          document_expiry: { 
                            ...prev.document_expiry, 
                            advance_days: parseInt(e.target.value) || 14
                          }
                        }))
                      }
                      min="1"
                      max="60"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="h-4 w-4" />
                  الصيانة المستحقة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>تفعيل التنبيهات</Label>
                  <Switch
                    checked={preferences.maintenance_due.enabled}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        maintenance_due: { ...prev.maintenance_due, enabled: checked }
                      }))
                    }
                  />
                </div>
                {preferences.maintenance_due.enabled && (
                  <div className="space-y-2">
                    <Label className="text-sm">التنبيه قبل (أيام)</Label>
                    <Input
                      type="number"
                      value={preferences.maintenance_due.advance_days}
                      onChange={(e) => 
                        setPreferences(prev => ({ 
                          ...prev, 
                          maintenance_due: { 
                            ...prev.maintenance_due, 
                            advance_days: parseInt(e.target.value) || 5
                          }
                        }))
                      }
                      min="1"
                      max="30"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  الدفعات المتأخرة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>تفعيل التنبيهات</Label>
                  <Switch
                    checked={preferences.payment_overdue.enabled}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ 
                        ...prev, 
                        payment_overdue: { ...prev.payment_overdue, enabled: checked }
                      }))
                    }
                  />
                </div>
                {preferences.payment_overdue.enabled && (
                  <div className="space-y-2">
                    <Label className="text-sm">التنبيه بعد (أيام)</Label>
                    <Input
                      type="number"
                      value={preferences.payment_overdue.advance_days}
                      onChange={(e) => 
                        setPreferences(prev => ({ 
                          ...prev, 
                          payment_overdue: { 
                            ...prev.payment_overdue, 
                            advance_days: parseInt(e.target.value) || 3
                          }
                        }))
                      }
                      min="1"
                      max="30"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-6 border-t">
        <Button variant="outline" onClick={loadPreferences}>
          إلغاء
        </Button>
        <Button onClick={savePreferences} disabled={loading}>
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
}
