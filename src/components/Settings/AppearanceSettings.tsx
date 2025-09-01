import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { Palette, Monitor, Sun, Moon, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [settings, setSettings] = useState({
    compactMode: false,
    animationsEnabled: true,
    fontSize: 'medium',
    sidebarCollapsed: false
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "تم الحفظ التلقائي",
        description: "تم حفظ إعدادات المظهر تلقائياً",
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
    toast({
      title: "تم حفظ إعدادات المظهر",
      description: "تم تطبيق التغييرات على واجهة النظام",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Auto-save status */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2">
          {hasUnsavedChanges ? (
            <>
              <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
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
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">الحفظ التلقائي مفعل</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            سمة الألوان
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <Card 
              className={`cursor-pointer transition-all hover-scale hover:border-primary ${theme === 'light' ? 'border-primary ring-2 ring-primary/20' : ''}`}
              onClick={() => setTheme('light')}
            >
              <CardContent className="p-4 text-center">
                <Sun className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">فاتح</span>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover-scale hover:border-primary ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <CardContent className="p-4 text-center">
                <Moon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">داكن</span>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover-scale hover:border-primary ${theme === 'system' ? 'border-primary ring-2 ring-primary/20' : ''}`}
              onClick={() => setTheme('system')}
            >
              <CardContent className="p-4 text-center">
                <Monitor className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">تلقائي</span>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              حجم الخط
            </Label>
            <p className="text-sm text-muted-foreground">
              اختر حجم النص المناسب لك
            </p>
          </div>
          <Select 
            value={settings.fontSize} 
            onValueChange={(value) => handleSettingChange('fontSize', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">صغير</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="large">كبير</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="compact-mode" className="text-base">
              الوضع المضغوط
            </Label>
            <p className="text-sm text-muted-foreground">
              عرض أكثر محتوى في مساحة أقل
            </p>
          </div>
          <Switch
            id="compact-mode"
            checked={settings.compactMode}
            onCheckedChange={(value) => handleSettingChange('compactMode', value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="animations" className="text-base">
              تأثيرات الحركة
            </Label>
            <p className="text-sm text-muted-foreground">
              تفعيل الانتقالات والحركات في الواجهة
            </p>
          </div>
          <Switch
            id="animations"
            checked={settings.animationsEnabled}
            onCheckedChange={(value) => handleSettingChange('animationsEnabled', value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="sidebar-collapsed" className="text-base">
              طي الشريط الجانبي
            </Label>
            <p className="text-sm text-muted-foreground">
              إخفاء نصوص القائمة الجانبية لتوفير مساحة أكبر
            </p>
          </div>
          <Switch
            id="sidebar-collapsed"
            checked={settings.sidebarCollapsed}
            onCheckedChange={(value) => handleSettingChange('sidebarCollapsed', value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={saveSettings} 
          disabled={!hasUnsavedChanges}
          className="hover-scale"
        >
          تطبيق يدوي
        </Button>
      </div>
    </div>
  );
}