
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Clock, 
  Target, 
  Zap, 
  Shield, 
  Bell,
  Save,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAutoSync, AutoSyncSettings } from '@/hooks/useAutoSync';

const TrackerSyncSettings: React.FC = () => {
  const { 
    isAutoSyncEnabled, 
    toggleAutoSync, 
    autoSyncStats,
    autoSyncSettings: currentSettings 
  } = useAutoSync();
  
  const [settings, setSettings] = useState<AutoSyncSettings>(currentSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleSettingChange = (key: keyof AutoSyncSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      // في التطبيق الحقيقي، احفظ الإعدادات في قاعدة البيانات
      console.log('حفظ إعدادات المزامنة:', settings);
      
      setHasChanges(false);
      toast({
        title: 'تم حفظ الإعدادات',
        description: 'سيتم تطبيق الإعدادات الجديدة في المزامنة القادمة',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'خطأ في الحفظ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      });
    }
  };

  const resetSettings = () => {
    const defaultSettings: AutoSyncSettings = {
      enabled: false,
      interval: 60,
      confidenceThreshold: 95,
      maxAutoMatches: 10,
    };
    
    setSettings(defaultSettings);
    setHasChanges(true);
    
    toast({
      title: 'إعادة تعيين الإعدادات',
      description: 'تم استرجاع الإعدادات الافتراضية',
    });
  };

  const getSuccessRate = () => {
    if (autoSyncStats.totalRuns === 0) return 0;
    return Math.round((autoSyncStats.successfulRuns / autoSyncStats.totalRuns) * 100);
  };

  return (
    <div className="space-y-6">
      {/* عنوان الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات المزامنة المتقدمة
          </h3>
          <p className="text-sm text-muted-foreground">
            تخصيص سلوك المزامنة التلقائية والتنبيهات
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={isAutoSyncEnabled ? 'default' : 'secondary'}
            className="gap-1"
          >
            <Zap className="h-3 w-3" />
            {isAutoSyncEnabled ? 'مفعل' : 'معطل'}
          </Badge>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{autoSyncStats.totalRuns}</div>
            <p className="text-xs text-muted-foreground">إجمالي مرات التشغيل</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{getSuccessRate()}%</div>
            <p className="text-xs text-muted-foreground">معدل النجاح</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {autoSyncStats.lastError ? (
                <span className="text-red-500 text-sm">خطأ</span>
              ) : (
                <span className="text-green-500 text-sm">سليم</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">الحالة الأخيرة</p>
          </CardContent>
        </Card>
      </div>

      {/* إعدادات المزامنة التلقائية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            المزامنة التلقائية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* تفعيل/إلغاء المزامنة التلقائية */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">تفعيل المزامنة التلقائية</Label>
              <p className="text-sm text-muted-foreground">
                مزامنة تلقائية للأجهزة عالية مستوى الثقة
              </p>
            </div>
            <Switch
              checked={isAutoSyncEnabled}
              onCheckedChange={toggleAutoSync}
            />
          </div>

          <Separator />

          {/* فترة المزامنة */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              فترة المزامنة (بالدقائق)
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.interval]}
                onValueChange={([value]) => handleSettingChange('interval', value)}
                min={15}
                max={240}
                step={15}
                className="flex-1"
              />
              <div className="w-20">
                <Input
                  type="number"
                  value={settings.interval}
                  onChange={(e) => handleSettingChange('interval', parseInt(e.target.value))}
                  min={15}
                  max={240}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              المزامنة كل {settings.interval} دقيقة
            </p>
          </div>

          {/* مستوى الثقة للمزامنة التلقائية */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              مستوى الثقة للمزامنة التلقائية (%)
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.confidenceThreshold]}
                onValueChange={([value]) => handleSettingChange('confidenceThreshold', value)}
                min={80}
                max={99}
                step={1}
                className="flex-1"
              />
              <div className="w-20">
                <Input
                  type="number"
                  value={settings.confidenceThreshold}
                  onChange={(e) => handleSettingChange('confidenceThreshold', parseInt(e.target.value))}
                  min={80}
                  max={99}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              مزامنة تلقائية فقط للمطابقات أعلى من {settings.confidenceThreshold}%
            </p>
          </div>

          {/* الحد الأقصى للمطابقات التلقائية */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              الحد الأقصى للمطابقات التلقائية
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[settings.maxAutoMatches]}
                onValueChange={([value]) => handleSettingChange('maxAutoMatches', value)}
                min={1}
                max={50}
                step={1}
                className="flex-1"
              />
              <div className="w-20">
                <Input
                  type="number"
                  value={settings.maxAutoMatches}
                  onChange={(e) => handleSettingChange('maxAutoMatches', parseInt(e.target.value))}
                  min={1}
                  max={50}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              حد أقصى {settings.maxAutoMatches} مطابقة في المزامنة الواحدة
            </p>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات التنبيهات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            إعدادات التنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">تنبيهات الأجهزة المنقطعة</Label>
              <p className="text-sm text-muted-foreground">
                إشعار عند انقطاع الأجهزة لأكثر من ساعة
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">تنبيهات البطارية المنخفضة</Label>
              <p className="text-sm text-muted-foreground">
                إشعار عند انخفاض البطارية عن 30%
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">تنبيهات الإشارة الضعيفة</Label>
              <p className="text-sm text-muted-foreground">
                إشعار عند ضعف إشارة الجهاز
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">تقارير دورية</Label>
              <p className="text-sm text-muted-foreground">
                تقرير يومي عن حالة جميع الأجهزة
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* أزرار الحفظ والإعادة */}
      <div className="flex gap-4 justify-end">
        <Button onClick={resetSettings} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          إعادة تعيين
        </Button>
        
        <Button 
          onClick={saveSettings} 
          disabled={!hasChanges}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
};

export default TrackerSyncSettings;
