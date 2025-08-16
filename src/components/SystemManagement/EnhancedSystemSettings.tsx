
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Settings, Database, Shield, Bell, Globe, Download, Upload, Building2 } from 'lucide-react';
import { useSystemSettings, SystemSettingsData } from '@/hooks/useSystemSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EnhancedSystemSettings = () => {
  const { settings, isLoading, saveSettings, isSaving } = useSystemSettings();
  const [localSettings, setLocalSettings] = useState<SystemSettingsData>(settings);

  // تحديث الإعدادات المحلية عند تغيير الإعدادات من الخادم
  useState(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (key: keyof SystemSettingsData, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    saveSettings(localSettings);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system-settings.json';
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setLocalSettings(importedSettings);
        } catch (error) {
          console.error('خطأ في استيراد الإعدادات:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إعدادات الشركة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Building2 className="h-5 w-5 mr-2" />
            إعدادات الشركة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">اسم الشركة</Label>
              <Input
                id="companyName"
                value={localSettings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
              <Input
                id="companyEmail"
                type="email"
                value={localSettings.companyEmail}
                onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">رقم الهاتف</Label>
              <Input
                id="companyPhone"
                value={localSettings.companyPhone}
                onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">العنوان</Label>
            <Textarea
              id="companyAddress"
              value={localSettings.companyAddress}
              onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* إعدادات العمل */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Settings className="h-5 w-5 mr-2" />
            إعدادات العمل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCreditLimit">الحد الائتماني الافتراضي (ريال)</Label>
              <Input
                id="defaultCreditLimit"
                type="number"
                value={localSettings.defaultCreditLimit}
                onChange={(e) => handleSettingChange('defaultCreditLimit', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationExpiryWarningDays">أيام التحذير قبل انتهاء التسجيل</Label>
              <Input
                id="registrationExpiryWarningDays"
                type="number"
                value={localSettings.registrationExpiryWarningDays}
                onChange={(e) => handleSettingChange('registrationExpiryWarningDays', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractExpiryWarningDays">أيام التحذير قبل انتهاء العقد</Label>
              <Input
                id="contractExpiryWarningDays"
                type="number"
                value={localSettings.contractExpiryWarningDays}
                onChange={(e) => handleSettingChange('contractExpiryWarningDays', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceReminderDays">أيام تذكير الصيانة</Label>
              <Input
                id="maintenanceReminderDays"
                type="number"
                value={localSettings.maintenanceReminderDays}
                onChange={(e) => handleSettingChange('maintenanceReminderDays', parseInt(e.target.value) || 0)}
              />
            </div>
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
                value={localSettings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordPolicy">سياسة كلمة المرور</Label>
              <Select 
                value={localSettings.passwordPolicy} 
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
                value={localSettings.loginAttempts}
                onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="twoFactorAuth"
              checked={localSettings.twoFactorAuth}
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
                value={localSettings.defaultLanguage} 
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
                value={localSettings.defaultCurrency} 
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
                value={localSettings.dateFormat} 
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
                value={localSettings.timeZone} 
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
                checked={localSettings.emailNotifications}
                onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
              />
              <Label htmlFor="emailNotifications">تنبيهات البريد الإلكتروني</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="smsNotifications"
                checked={localSettings.smsNotifications}
                onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
              />
              <Label htmlFor="smsNotifications">تنبيهات الرسائل النصية</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceAlerts"
                checked={localSettings.maintenanceAlerts}
                onCheckedChange={(value) => handleSettingChange('maintenanceAlerts', value)}
              />
              <Label htmlFor="maintenanceAlerts">تنبيهات الصيانة</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="contractExpiry"
                checked={localSettings.contractExpiry}
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
                checked={localSettings.autoBackup}
                onCheckedChange={(value) => handleSettingChange('autoBackup', value)}
              />
              <Label htmlFor="autoBackup">النسخ الاحتياطي التلقائي</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">تكرار النسخ</Label>
              <Select 
                value={localSettings.backupFrequency} 
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
                value={localSettings.backupRetention}
                onChange={(e) => handleSettingChange('backupRetention', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              تصدير الإعدادات
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
              id="import-settings"
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('import-settings')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              استيراد الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* تحذير هام */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>تنبيه:</strong> تأكد من حفظ الإعدادات بعد أي تعديلات. بعض الإعدادات قد تتطلب إعادة تسجيل الدخول لتصبح نافذة.
        </AlertDescription>
      </Alert>

      {/* حفظ الإعدادات */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          className="min-w-32"
          disabled={isSaving}
        >
          {isSaving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedSystemSettings;
