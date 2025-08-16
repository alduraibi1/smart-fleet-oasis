
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSystemSettings, SystemSettingsData } from '@/hooks/useSystemSettings';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Shield, 
  Globe, 
  Bell, 
  Database, 
  DollarSign,
  Save,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';

export function EnhancedSystemSettings() {
  const { settings, isLoading, saveSettings, isSaving } = useSystemSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<SystemSettingsData>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: keyof SystemSettingsData, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'system-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير إعدادات النظام بنجاح',
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setLocalSettings(importedSettings);
          setHasChanges(true);
          toast({
            title: 'تم الاستيراد',
            description: 'تم استيراد إعدادات النظام بنجاح',
          });
        } catch (error) {
          toast({
            title: 'خطأ',
            description: 'فشل في استيراد الملف',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  if (isLoading) {
    return <div className="p-6">جاري تحميل الإعدادات...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إعدادات النظام المتقدمة</h2>
          <p className="text-muted-foreground">إدارة شاملة لجميع إعدادات النظام</p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-settings"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-settings')?.click()}
          >
            <Upload className="h-4 w-4 ml-2" />
            استيراد
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          
          {hasChanges && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
              
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 ml-2" />
                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">تغييرات غير محفوظة</Badge>
            <span className="text-sm text-orange-700">
              لديك تغييرات غير محفوظة. لا تنس حفظها.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              إعدادات الشركة
            </CardTitle>
            <CardDescription>المعلومات الأساسية للشركة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">اسم الشركة</Label>
              <Input
                id="companyName"
                value={localSettings.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
              <Input
                id="companyEmail"
                type="email"
                value={localSettings.companyEmail}
                onChange={(e) => handleInputChange('companyEmail', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="companyPhone">رقم الهاتف</Label>
              <Input
                id="companyPhone"
                value={localSettings.companyPhone}
                onChange={(e) => handleInputChange('companyPhone', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="companyAddress">العنوان</Label>
              <Input
                id="companyAddress"
                value={localSettings.companyAddress}
                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              إعدادات الأمان
            </CardTitle>
            <CardDescription>إعدادات الحماية والمصادقة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">مهلة انتهاء الجلسة (دقيقة)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={localSettings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="passwordPolicy">سياسة كلمة المرور</Label>
              <Select 
                value={localSettings.passwordPolicy}
                onValueChange={(value) => handleInputChange('passwordPolicy', value)}
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
            
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorAuth">المصادقة الثنائية</Label>
              <Switch
                id="twoFactorAuth"
                checked={localSettings.twoFactorAuth}
                onCheckedChange={(checked) => handleInputChange('twoFactorAuth', checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="loginAttempts">عدد محاولات تسجيل الدخول</Label>
              <Input
                id="loginAttempts"
                type="number"
                value={localSettings.loginAttempts}
                onChange={(e) => handleInputChange('loginAttempts', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              إعدادات النظام
            </CardTitle>
            <CardDescription>اللغة والعملة والمنطقة الزمنية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultLanguage">اللغة الافتراضية</Label>
              <Select 
                value={localSettings.defaultLanguage}
                onValueChange={(value) => handleInputChange('defaultLanguage', value)}
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
            
            <div>
              <Label htmlFor="defaultCurrency">العملة الافتراضية</Label>
              <Select 
                value={localSettings.defaultCurrency}
                onValueChange={(value) => handleInputChange('defaultCurrency', value)}
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
            
            <div>
              <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
              <Select 
                value={localSettings.dateFormat}
                onValueChange={(value) => handleInputChange('dateFormat', value)}
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
            
            <div>
              <Label htmlFor="timeZone">المنطقة الزمنية</Label>
              <Input
                id="timeZone"
                value={localSettings.timeZone}
                onChange={(e) => handleInputChange('timeZone', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              إعدادات التنبيهات
            </CardTitle>
            <CardDescription>إعدادات الإشعارات والتنبيهات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">إشعارات البريد الإلكتروني</Label>
              <Switch
                id="emailNotifications"
                checked={localSettings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications">إشعارات الرسائل النصية</Label>
              <Switch
                id="smsNotifications"
                checked={localSettings.smsNotifications}
                onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceAlerts">تنبيهات الصيانة</Label>
              <Switch
                id="maintenanceAlerts"
                checked={localSettings.maintenanceAlerts}
                onCheckedChange={(checked) => handleInputChange('maintenanceAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="contractExpiry">تنبيهات انتهاء العقود</Label>
              <Switch
                id="contractExpiry"
                checked={localSettings.contractExpiry}
                onCheckedChange={(checked) => handleInputChange('contractExpiry', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              إعدادات العمل
            </CardTitle>
            <CardDescription>الإعدادات التشغيلية والمالية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultCreditLimit">الحد الائتماني الافتراضي</Label>
              <Input
                id="defaultCreditLimit"
                type="number"
                value={localSettings.defaultCreditLimit}
                onChange={(e) => handleInputChange('defaultCreditLimit', parseFloat(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="registrationExpiryWarningDays">أيام التحذير قبل انتهاء التسجيل</Label>
              <Input
                id="registrationExpiryWarningDays"
                type="number"
                value={localSettings.registrationExpiryWarningDays}
                onChange={(e) => handleInputChange('registrationExpiryWarningDays', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="contractExpiryWarningDays">أيام التحذير قبل انتهاء العقد</Label>
              <Input
                id="contractExpiryWarningDays"
                type="number"
                value={localSettings.contractExpiryWarningDays}
                onChange={(e) => handleInputChange('contractExpiryWarningDays', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="maintenanceReminderDays">أيام تذكير الصيانة</Label>
              <Input
                id="maintenanceReminderDays"
                type="number"
                value={localSettings.maintenanceReminderDays}
                onChange={(e) => handleInputChange('maintenanceReminderDays', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              إعدادات النسخ الاحتياطي
            </CardTitle>
            <CardDescription>إعدادات حفظ البيانات واستعادتها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoBackup">النسخ الاحتياطي التلقائي</Label>
              <Switch
                id="autoBackup"
                checked={localSettings.autoBackup}
                onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="backupFrequency">تكرار النسخ الاحتياطي</Label>
              <Select 
                value={localSettings.backupFrequency}
                onValueChange={(value) => handleInputChange('backupFrequency', value)}
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
            
            <div>
              <Label htmlFor="backupRetention">فترة الاحتفاظ (أيام)</Label>
              <Input
                id="backupRetention"
                type="number"
                value={localSettings.backupRetention}
                onChange={(e) => handleInputChange('backupRetention', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
