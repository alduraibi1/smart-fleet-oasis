import { useState, useEffect } from 'react';
import { Settings, Bell, Mail, Smartphone, Calendar, Wrench, CreditCard, FileText, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationSetting {
  id: string;
  notification_type: string;
  enabled: boolean;
  advance_days: number;
  email_enabled: boolean;
  push_enabled: boolean;
}

const notificationTypes = [
  {
    type: 'contract_expiry',
    label: 'انتهاء العقود',
    description: 'تذكيرات قبل انتهاء عقود الإيجار',
    icon: <FileText className="h-4 w-4" />,
    color: 'blue'
  },
  {
    type: 'maintenance_due',
    label: 'مواعيد الصيانة',
    description: 'تنبيهات مواعيد الصيانة المجدولة',
    icon: <Wrench className="h-4 w-4" />,
    color: 'orange'
  },
  {
    type: 'payment_overdue',
    label: 'المدفوعات المتأخرة',
    description: 'تنبيهات للفواتير غير المدفوعة',
    icon: <CreditCard className="h-4 w-4" />,
    color: 'red'
  },
  {
    type: 'license_expiry',
    label: 'انتهاء التراخيص',
    description: 'تذكيرات انتهاء صلاحية التراخيص',
    icon: <Calendar className="h-4 w-4" />,
    color: 'purple'
  },
  {
    type: 'general',
    label: 'إشعارات عامة',
    description: 'إشعارات النظام العامة',
    icon: <Bell className="h-4 w-4" />,
    color: 'gray'
  }
];

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // جلب إعدادات الإشعارات
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .order('notification_type');

      if (error) throw error;

      setSettings(data || []);
    } catch (error: any) {
      console.error('خطأ في جلب الإعدادات:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب إعدادات الإشعارات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // حفظ الإعدادات
  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert(settings, { onConflict: 'notification_type' });

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات الإشعارات بنجاح',
      });
    } catch (error: any) {
      console.error('خطأ في حفظ الإعدادات:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // تحديث إعداد معين
  const updateSetting = (type: string, field: keyof NotificationSetting, value: any) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.notification_type === type 
          ? { ...setting, [field]: value }
          : setting
      )
    );
  };

  // الحصول على إعداد نوع معين
  const getSetting = (type: string): NotificationSetting | undefined => {
    return settings.find(s => s.notification_type === type);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            إعدادات الإشعارات
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            تخصيص تفضيلات الإشعارات وطرق التسليم
          </p>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl loading-shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {notificationTypes.map((notificationType, index) => {
            const setting = getSetting(notificationType.type);
            
            return (
              <Card 
                key={notificationType.type} 
                className="card-interactive hover-lift fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-${notificationType.color}-500/20 text-${notificationType.color}-600`}>
                        {notificationType.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{notificationType.label}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {notificationType.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={setting?.enabled || false}
                      onCheckedChange={(checked) => 
                        updateSetting(notificationType.type, 'enabled', checked)
                      }
                    />
                  </div>
                </CardHeader>

                {setting?.enabled && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* إعدادات التوقيت */}
                      {notificationType.type !== 'payment_overdue' && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            تذكير مقدماً (بالأيام)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="365"
                            value={setting?.advance_days || 0}
                            onChange={(e) => 
                              updateSetting(notificationType.type, 'advance_days', parseInt(e.target.value) || 0)
                            }
                            className="w-24"
                          />
                        </div>
                      )}

                      <Separator />

                      {/* طرق التسليم */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">طرق التسليم</Label>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-primary" />
                            <span className="text-sm">إشعارات التطبيق</span>
                            <Badge variant="secondary" className="text-xs">مفعل دائماً</Badge>
                          </div>
                          <Switch checked={true} disabled />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-info" />
                            <span className="text-sm">البريد الإلكتروني</span>
                          </div>
                          <Switch
                            checked={setting?.email_enabled || false}
                            onCheckedChange={(checked) => 
                              updateSetting(notificationType.type, 'email_enabled', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-success" />
                            <span className="text-sm">إشعارات الهاتف</span>
                          </div>
                          <Switch
                            checked={setting?.push_enabled || false}
                            onCheckedChange={(checked) => 
                              updateSetting(notificationType.type, 'push_enabled', checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="btn-glow"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
}