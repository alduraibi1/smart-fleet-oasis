import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { Palette, Monitor, Sun, Moon, Eye } from 'lucide-react';

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    compactMode: false,
    animationsEnabled: true,
    fontSize: 'medium',
    sidebarCollapsed: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    toast({
      title: "تم حفظ إعدادات المظهر",
      description: "تم تطبيق التغييرات على واجهة النظام",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            سمة الألوان
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <Card 
              className={`cursor-pointer transition-all hover:border-primary ${theme === 'light' ? 'border-primary ring-2 ring-primary/20' : ''}`}
              onClick={() => setTheme('light')}
            >
              <CardContent className="p-4 text-center">
                <Sun className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">فاتح</span>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:border-primary ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <CardContent className="p-4 text-center">
                <Moon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">داكن</span>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:border-primary ${theme === 'system' ? 'border-primary ring-2 ring-primary/20' : ''}`}
              onClick={() => setTheme('system')}
            >
              <CardContent className="p-4 text-center">
                <Monitor className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">تلقائي</span>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between">
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

        <div className="flex items-center justify-between">
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

        <div className="flex items-center justify-between">
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

        <div className="flex items-center justify-between">
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
        <Button onClick={saveSettings}>
          تطبيق الإعدادات
        </Button>
      </div>
    </div>
  );
}