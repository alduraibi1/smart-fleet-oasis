
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Preference = {
  id?: string;
  user_id?: string;
  notification_type: string;
  enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  advance_days: number | null;
};

const NOTIFICATION_TYPES: { type: string; label: string; description: string }[] = [
  { type: 'contract_expiry', label: 'انتهاء العقود', description: 'تذكيرات قبل انتهاء عقود الإيجار' },
  { type: 'maintenance_due', label: 'مواعيد الصيانة', description: 'تنبيهات مواعيد الصيانة المجدولة' },
  { type: 'payment_overdue', label: 'المدفوعات المتأخرة', description: 'تنبيهات للفواتير غير المدفوعة' },
  { type: 'license_expiry', label: 'انتهاء التراخيص', description: 'تذكيرات انتهاء صلاحية التراخيص' },
  { type: 'general', label: 'إشعارات عامة', description: 'إشعارات النظام العامة' },
];

export default function UserNotificationPreferences() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, Preference>>({});

  const defaults = useMemo<Record<string, Preference>>(() => {
    const base: Preference = {
      notification_type: '',
      enabled: true,
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      advance_days: 3,
    };
    return NOTIFICATION_TYPES.reduce((acc, n) => {
      acc[n.type] = { ...base, notification_type: n.type };
      return acc;
    }, {} as Record<string, Preference>);
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        setPrefs(defaults);
        return;
      }

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .order('notification_type');

      if (error) throw error;

      // Merge DB data with defaults to ensure all types exist in UI
      const merged: Record<string, Preference> = { ...defaults };
      (data || []).forEach((row) => {
        merged[row.notification_type] = row as Preference;
      });
      setPrefs(merged);
    } catch (err) {
      console.error('Error loading user notification preferences:', err);
      toast({
        title: 'خطأ في التحميل',
        description: 'تعذر تحميل تفضيلات الإشعارات.',
        variant: 'destructive',
      });
      setPrefs(defaults);
    } finally {
      setLoading(false);
    }
  };

  const updatePref = (type: string, field: keyof Preference, value: any) => {
    setPrefs((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        throw new Error('لم يتم العثور على المستخدم.');
      }

      const toSave = NOTIFICATION_TYPES.map(({ type }) => ({
        ...prefs[type],
        user_id: userId,
        notification_type: type,
        // ضمان وجود advance_days رقم صحيح أو null
        advance_days:
          prefs[type]?.advance_days !== null && prefs[type]?.advance_days !== undefined
            ? Number(prefs[type].advance_days)
            : null,
      }));

      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert(toSave as any, { onConflict: 'user_id,notification_type' });

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ تفضيلات الإشعارات بنجاح.',
      });
      await loadPreferences();
    } catch (err) {
      console.error('Error saving user notification preferences:', err);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ تفضيلات الإشعارات.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            تفضيلات الإشعارات للمستخدم
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            تحكم في أنواع الإشعارات وقنوات التسليم الخاصة بك.
          </p>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/50 rounded-xl loading-shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {NOTIFICATION_TYPES.map((n) => {
            const pref = prefs[n.type] || defaults[n.type];
            return (
              <Card key={n.type} className="card-interactive">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{n.label}</CardTitle>
                        <p className="text-sm text-muted-foreground">{n.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={!!pref?.enabled}
                      onCheckedChange={(checked) => updatePref(n.type, 'enabled', checked)}
                    />
                  </div>
                </CardHeader>

                {pref?.enabled && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">تذكير مقدماً (بالأيام)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={365}
                          value={pref?.advance_days ?? 3}
                          onChange={(e) =>
                            updatePref(n.type, 'advance_days', e.target.value === '' ? null : parseInt(e.target.value, 10))
                          }
                          className="w-28"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">قنوات التسليم</Label>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-primary" />
                            <span className="text-sm">داخل التطبيق</span>
                            <Badge variant="secondary" className="text-xs">مُوصى به</Badge>
                          </div>
                          <Switch
                            checked={!!pref?.push_enabled}
                            onCheckedChange={(checked) => updatePref(n.type, 'push_enabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="text-sm">البريد الإلكتروني</span>
                          </div>
                          <Switch
                            checked={!!pref?.email_enabled}
                            onCheckedChange={(checked) => updatePref(n.type, 'email_enabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <span className="text-sm">رسائل SMS</span>
                          </div>
                          <Switch
                            checked={!!pref?.sms_enabled}
                            onCheckedChange={(checked) => updatePref(n.type, 'sms_enabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-primary" />
                            <span className="text-sm">إشعارات الهاتف</span>
                          </div>
                          <Switch
                            checked={!!pref?.push_enabled}
                            onCheckedChange={(checked) => updatePref(n.type, 'push_enabled', checked)}
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
        <Button onClick={savePreferences} disabled={saving} className="btn-glow">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'جاري الحفظ...' : 'حفظ التفضيلات'}
        </Button>
      </div>
    </div>
  );
}
