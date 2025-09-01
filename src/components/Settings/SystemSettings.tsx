import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Database, HardDrive, Zap, Activity } from 'lucide-react';

export function SystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    performanceMode: false,
    debugMode: false,
    cacheEnabled: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    toast({
      title: "تم حفظ إعدادات النظام",
      description: "سيتم تطبيق الإعدادات عند إعادة تشغيل النظام",
    });
  };

  const clearCache = () => {
    toast({
      title: "تم مسح ذاكرة التخزين المؤقت",
      description: "تم حذف الملفات المؤقتة بنجاح",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              النسخ الاحتياطي التلقائي
            </Label>
            <p className="text-sm text-muted-foreground">
              إنشاء نسخ احتياطية تلقائية من البيانات
            </p>
          </div>
          <Switch
            checked={settings.autoBackup}
            onCheckedChange={(value) => handleSettingChange('autoBackup', value)}
          />
        </div>

        {settings.autoBackup && (
          <div className="flex items-center justify-between ml-6">
            <div className="space-y-0.5">
              <Label className="text-base">
                تكرار النسخ الاحتياطي
              </Label>
            </div>
            <Select 
              value={settings.backupFrequency} 
              onValueChange={(value) => handleSettingChange('backupFrequency', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">كل ساعة</SelectItem>
                <SelectItem value="daily">يومياً</SelectItem>
                <SelectItem value="weekly">أسبوعياً</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              وضع الأداء العالي
            </Label>
            <p className="text-sm text-muted-foreground">
              تحسين الأداء مقابل استهلاك أكثر للموارد
            </p>
          </div>
          <Switch
            checked={settings.performanceMode}
            onCheckedChange={(value) => handleSettingChange('performanceMode', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              ذاكرة التخزين المؤقت
            </Label>
            <p className="text-sm text-muted-foreground">
              تخزين البيانات مؤقتاً لتسريع الوصول
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearCache}>
              مسح الذاكرة
            </Button>
            <Switch
              checked={settings.cacheEnabled}
              onCheckedChange={(value) => handleSettingChange('cacheEnabled', value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              وضع التطوير
            </Label>
            <p className="text-sm text-muted-foreground">
              عرض معلومات تقنية إضافية للتشخيص
            </p>
          </div>
          <Switch
            checked={settings.debugMode}
            onCheckedChange={(value) => handleSettingChange('debugMode', value)}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-medium mb-4">معلومات النظام</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">إصدار النظام:</span>
            <p className="text-muted-foreground">v2.1.0</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">آخر تحديث:</span>
            <p className="text-muted-foreground">{new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">حالة قاعدة البيانات:</span>
            <p className="text-green-600">متصلة</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <span className="font-medium">مساحة التخزين:</span>
            <p className="text-muted-foreground">2.4 GB / 10 GB</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={saveSettings}>
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}