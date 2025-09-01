import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Globe, Clock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export function AccountSettings() {
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [settings, setSettings] = useState({
    language: 'ar',
    timezone: 'Asia/Riyadh',
    autoSave: true,
    emailUpdates: true,
    dataRetention: '1year'
  });

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 1500);

    return () => clearTimeout(autoSaveTimer);
  }, [settings, hasUnsavedChanges]);

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "تم الحفظ التلقائي",
        description: "تم حفظ إعدادات الحساب تلقائياً",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "خطأ في الحفظ التلقائي",
        description: "حدث خطأ أثناء الحفظ التلقائي",
        variant: "destructive",
      });
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setHasUnsavedChanges(true);
      return newSettings;
    });
  };

  const saveSettings = () => {
    // Here you would save settings to the database
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ إعدادات الحساب بنجاح",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Auto-save status */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges ? (
            <>
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">يتم الحفظ التلقائي...</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">
                آخر حفظ: {lastSaved.toLocaleTimeString('ar-SA')}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الحفظ التلقائي مفعل</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              اللغة المفضلة
            </Label>
            <p className="text-sm text-muted-foreground">
              اختر اللغة الأساسية للواجهة
            </p>
          </div>
          <Select 
            value={settings.language} 
            onValueChange={(value) => handleSettingChange('language', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              المنطقة الزمنية
            </Label>
            <p className="text-sm text-muted-foreground">
              تحديد المنطقة الزمنية لعرض التواريخ والأوقات
            </p>
          </div>
          <Select 
            value={settings.timezone} 
            onValueChange={(value) => handleSettingChange('timezone', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Riyadh">الرياض</SelectItem>
              <SelectItem value="Asia/Dubai">دبي</SelectItem>
              <SelectItem value="Asia/Kuwait">الكويت</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="auto-save" className="text-base">
              الحفظ التلقائي
            </Label>
            <p className="text-sm text-muted-foreground">
              حفظ التغييرات تلقائياً أثناء العمل
            </p>
          </div>
          <Switch
            id="auto-save"
            checked={settings.autoSave}
            onCheckedChange={(value) => handleSettingChange('autoSave', value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="email-updates" className="text-base">
              تحديثات البريد الإلكتروني
            </Label>
            <p className="text-sm text-muted-foreground">
              تلقي تحديثات النظام عبر البريد الإلكتروني
            </p>
          </div>
          <Switch
            id="email-updates"
            checked={settings.emailUpdates}
            onCheckedChange={(value) => handleSettingChange('emailUpdates', value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              مدة الاحتفاظ بالبيانات
            </Label>
            <p className="text-sm text-muted-foreground">
              فترة الاحتفاظ بسجلات النشاط والملفات
            </p>
          </div>
          <Select 
            value={settings.dataRetention} 
            onValueChange={(value) => handleSettingChange('dataRetention', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 أشهر</SelectItem>
              <SelectItem value="6months">6 أشهر</SelectItem>
              <SelectItem value="1year">سنة واحدة</SelectItem>
              <SelectItem value="2years">سنتان</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={saveSettings} 
          disabled={!hasUnsavedChanges}
          className="hover-scale"
        >
          حفظ يدوي
        </Button>
      </div>
    </div>
  );
}