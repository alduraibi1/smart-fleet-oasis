import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Save, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SyncConfig {
  id: string;
  is_enabled: boolean;
  sync_interval_hours: number;
  last_sync: string | null;
  next_sync: string | null;
  sync_mode: string;
  notification_settings: any;
}

export function SyncSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [config, setConfig] = useState<SyncConfig | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('elm_sync_config')
        .select('*')
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error loading sync config:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل إعدادات المزامنة',
        variant: 'destructive',
      });
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('elm_sync_config')
        .update({
          is_enabled: config.is_enabled,
          sync_interval_hours: config.sync_interval_hours,
          sync_mode: config.sync_mode,
          notification_settings: config.notification_settings,
        })
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات المزامنة بنجاح',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('elm-sync', {
        body: { sync_type: 'manual' }
      });

      if (error) throw error;

      toast({
        title: 'تم بدء المزامنة',
        description: 'جاري مزامنة البيانات مع نظام علم',
      });

      // إعادة تحميل الإعدادات بعد المزامنة
      setTimeout(loadConfig, 2000);
    } catch (error) {
      console.error('Error starting sync:', error);
      toast({
        title: 'خطأ',
        description: 'فشل بدء المزامنة',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!config) {
    return <div className="flex justify-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات المزامنة التلقائية</CardTitle>
          <CardDescription>
            قم بإعداد المزامنة التلقائية مع نظام علم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-enabled">تفعيل المزامنة التلقائية</Label>
              <p className="text-sm text-muted-foreground">
                سيتم مزامنة البيانات تلقائياً حسب الفترة المحددة
              </p>
            </div>
            <Switch
              id="sync-enabled"
              checked={config.is_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, is_enabled: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="sync-interval">فترة المزامنة</Label>
            <Select
              value={config.sync_interval_hours.toString()}
              onValueChange={(value) => setConfig({ ...config, sync_interval_hours: parseInt(value) })}
            >
              <SelectTrigger id="sync-interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">كل ساعة</SelectItem>
                <SelectItem value="6">كل 6 ساعات</SelectItem>
                <SelectItem value="12">كل 12 ساعة</SelectItem>
                <SelectItem value="24">مرة يومياً</SelectItem>
                <SelectItem value="168">مرة أسبوعياً</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sync-mode">نوع المزامنة</Label>
            <Select
              value={config.sync_mode}
              onValueChange={(value) => setConfig({ ...config, sync_mode: value })}
            >
              <SelectTrigger id="sync-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incremental">تدريجية (التحديثات فقط)</SelectItem>
                <SelectItem value="full">كاملة (جميع البيانات)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>إعدادات الإشعارات</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-complete">إشعار عند اكتمال المزامنة</Label>
                <p className="text-sm text-muted-foreground">
                  احصل على إشعار عند انتهاء كل عملية مزامنة
                </p>
              </div>
              <Switch
                id="notify-complete"
                checked={config.notification_settings.onComplete}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  notification_settings: { ...config.notification_settings, onComplete: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-new">إشعار عند إضافة مركبات جديدة</Label>
                <p className="text-sm text-muted-foreground">
                  احصل على إشعار عند اكتشاف مركبات جديدة
                </p>
              </div>
              <Switch
                id="notify-new"
                checked={config.notification_settings.onNewVehicles}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  notification_settings: { ...config.notification_settings, onNewVehicles: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notify-expiring">إشعار عند اقتراب الانتهاءات</Label>
                <p className="text-sm text-muted-foreground">
                  احصل على تنبيه عند اقتراب انتهاء التأمين أو الفحص
                </p>
              </div>
              <Switch
                id="notify-expiring"
                checked={config.notification_settings.onExpirations}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  notification_settings: { ...config.notification_settings, onExpirations: checked }
                })}
              />
            </div>
          </div>

          <Separator />

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <strong>آخر مزامنة:</strong>
              {config.last_sync 
                ? format(new Date(config.last_sync), "dd MMMM yyyy 'الساعة' HH:mm", { locale: ar })
                : 'لم تتم بعد'}
            </div>
            {config.next_sync && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <strong>المزامنة القادمة:</strong>
                {format(new Date(config.next_sync), "dd MMMM yyyy 'الساعة' HH:mm", { locale: ar })}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveConfig} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              حفظ الإعدادات
            </Button>
            <Button 
              onClick={handleManualSync} 
              disabled={syncing}
              variant="outline" 
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              مزامنة الآن
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
