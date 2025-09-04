import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Settings, Database, Shield, Bell, Globe, Download, Upload } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // إعدادات عامة
    companyName: 'شركة تأجير المركبات',
    companyEmail: 'info@company.com',
    companyPhone: '+966 11 234 5678',
    companyAddress: 'الرياض، المملكة العربية السعودية',
    
    // إعدادات الأمان
    sessionTimeout: '30',
    passwordPolicy: 'strong',
    twoFactorAuth: false,
    loginAttempts: '5',
    
    // إعدادات النظام
    defaultLanguage: 'ar',
    defaultCurrency: 'SAR',
    dateFormat: 'dd/mm/yyyy',
    timeZone: 'Asia/Riyadh',
    
    // إعدادات التنبيهات
    emailNotifications: true,
    smsNotifications: false,
    maintenanceAlerts: true,
    contractExpiry: true,
    
    // إعدادات النسخ الاحتياطي
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: '30'
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      // تحويل إعدادات قاعدة البيانات إلى نموذج الواجهة
      const loadedSettings = { ...settings };
      data.forEach(setting => {
        if (setting.setting_value && typeof setting.setting_value === 'object') {
          Object.assign(loadedSettings, setting.setting_value);
        }
      });
      
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الإعدادات",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // حفظ الإعدادات في قاعدة البيانات
      const settingsToSave = [
        { setting_key: 'company_info', setting_value: {
          companyName: settings.companyName,
          companyEmail: settings.companyEmail,
          companyPhone: settings.companyPhone,
          companyAddress: settings.companyAddress
        }},
        { setting_key: 'security_settings', setting_value: {
          sessionTimeout: settings.sessionTimeout,
          passwordPolicy: settings.passwordPolicy,
          twoFactorAuth: settings.twoFactorAuth,
          loginAttempts: settings.loginAttempts
        }},
        { setting_key: 'system_settings', setting_value: {
          defaultLanguage: settings.defaultLanguage,
          defaultCurrency: settings.defaultCurrency,
          dateFormat: settings.dateFormat,
          timeZone: settings.timeZone
        }},
        { setting_key: 'notification_settings', setting_value: {
          emailNotifications: settings.emailNotifications,
          smsNotifications: settings.smsNotifications,
          maintenanceAlerts: settings.maintenanceAlerts,
          contractExpiry: settings.contractExpiry
        }},
        { setting_key: 'backup_settings', setting_value: {
          autoBackup: settings.autoBackup,
          backupFrequency: settings.backupFrequency,
          backupRetention: settings.backupRetention
        }}
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            setting_key: setting.setting_key,
            setting_value: setting.setting_value,
            description: `إعدادات ${setting.setting_key}`
          });

        if (error) throw error;
      }

      toast({
        title: "تم بنجاح",
        description: "تم حفظ جميع الإعدادات بنجاح",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting settings...');
    // Handle export logic here
  };

  const handleImport = () => {
    console.log('Importing settings...');
    // Handle import logic here
  };

  return (
    <div className="space-y-6">
      {/* إعدادات الشركة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Settings className="h-5 w-5 mr-2" />
            إعدادات الشركة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">اسم الشركة</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">رقم الهاتف</Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">العنوان</Label>
            <Textarea
              id="companyAddress"
              value={settings.companyAddress}
              onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* إعدادات الأمان */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Shield className="h-5 w-5 mr-2" />
            إعدادات الأمان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">مهلة انتهاء الجلسة (دقيقة)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordPolicy">سياسة كلمة المرور</Label>
              <Select 
                value={settings.passwordPolicy} 
                onValueChange={(value) => handleSettingChange('passwordPolicy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weak">ضعيفة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="strong">قوية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loginAttempts">محاولات تسجيل الدخول المسموحة</Label>
              <Input
                id="loginAttempts"
                type="number"
                value={settings.loginAttempts}
                onChange={(e) => handleSettingChange('loginAttempts', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="twoFactorAuth"
              checked={settings.twoFactorAuth}
              onCheckedChange={(value) => handleSettingChange('twoFactorAuth', value)}
            />
            <Label htmlFor="twoFactorAuth">
              تفعيل المصادقة الثنائية
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات النظام */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Globe className="h-5 w-5 mr-2" />
            إعدادات النظام
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">اللغة الافتراضية</Label>
              <Select 
                value={settings.defaultLanguage} 
                onValueChange={(value) => handleSettingChange('defaultLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">العملة الافتراضية</Label>
              <Select 
                value={settings.defaultCurrency} 
                onValueChange={(value) => handleSettingChange('defaultCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">ريال سعودي</SelectItem>
                  <SelectItem value="USD">دولار أمريكي</SelectItem>
                  <SelectItem value="EUR">يورو</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
              <Select 
                value={settings.dateFormat} 
                onValueChange={(value) => handleSettingChange('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">يوم/شهر/سنة</SelectItem>
                  <SelectItem value="mm/dd/yyyy">شهر/يوم/سنة</SelectItem>
                  <SelectItem value="yyyy-mm-dd">سنة-شهر-يوم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeZone">المنطقة الزمنية</Label>
              <Select 
                value={settings.timeZone} 
                onValueChange={(value) => handleSettingChange('timeZone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Riyadh">الرياض</SelectItem>
                  <SelectItem value="Asia/Dubai">دبي</SelectItem>
                  <SelectItem value="Asia/Kuwait">الكويت</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات التنبيهات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Bell className="h-5 w-5 mr-2" />
            إعدادات التنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
              />
              <Label htmlFor="emailNotifications">تنبيهات البريد الإلكتروني</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
              />
              <Label htmlFor="smsNotifications">تنبيهات الرسائل النصية</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceAlerts"
                checked={settings.maintenanceAlerts}
                onCheckedChange={(value) => handleSettingChange('maintenanceAlerts', value)}
              />
              <Label htmlFor="maintenanceAlerts">تنبيهات الصيانة</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="contractExpiry"
                checked={settings.contractExpiry}
                onCheckedChange={(value) => handleSettingChange('contractExpiry', value)}
              />
              <Label htmlFor="contractExpiry">تنبيهات انتهاء العقود</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات النسخ الاحتياطي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Database className="h-5 w-5 mr-2" />
            النسخ الاحتياطي والاستعادة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(value) => handleSettingChange('autoBackup', value)}
              />
              <Label htmlFor="autoBackup">النسخ الاحتياطي التلقائي</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">تكرار النسخ</Label>
              <Select 
                value={settings.backupFrequency} 
                onValueChange={(value) => handleSettingChange('backupFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">كل ساعة</SelectItem>
                  <SelectItem value="daily">يومياً</SelectItem>
                  <SelectItem value="weekly">أسبوعياً</SelectItem>
                  <SelectItem value="monthly">شهرياً</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupRetention">فترة الاحتفاظ (أيام)</Label>
              <Input
                id="backupRetention"
                type="number"
                value={settings.backupRetention}
                onChange={(e) => handleSettingChange('backupRetention', e.target.value)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              تصدير الإعدادات
            </Button>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              استيراد الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* حفظ الإعدادات */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={loadSettings} disabled={loading}>
          إعادة تحميل
        </Button>
        <Button onClick={handleSave} disabled={loading} className="min-w-32">
          {loading ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
        </Button>
      </div>
    </div>
  );
};

export default SystemSettings;