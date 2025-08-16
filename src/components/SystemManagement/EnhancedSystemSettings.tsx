import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useSystemSettings, SystemSettingsData } from '@/hooks/useSystemSettings';
import { Building, Globe, Bell, DollarSign, Shield, Database } from 'lucide-react';

const EnhancedSystemSettings = () => {
  const { settings, updateSettings, loading } = useSystemSettings();
  const [formData, setFormData] = useState<Partial<SystemSettingsData>>({});

  // Initialize form data when settings load
  useState(() => {
    if (settings && Object.keys(formData).length === 0) {
      setFormData(settings);
    }
  });

  if (loading || !settings) {
    return <div className="p-6">جارِ تحميل الإعدادات...</div>;
  }

  const handleInputChange = (field: keyof SystemSettingsData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Merge with current settings to ensure all required fields are present
    const updatedSettings: SystemSettingsData = {
      ...settings,
      ...formData,
    };
    updateSettings(updatedSettings);
  };

  const currentData = { ...settings, ...formData };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إعدادات النظام المتقدمة</h1>
          <p className="text-muted-foreground">إدارة شاملة لجميع إعدادات النظام</p>
        </div>
        <Button onClick={handleSave}>
          حفظ الإعدادات
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company">الشركة</TabsTrigger>
          <TabsTrigger value="system">النظام</TabsTrigger>
          <TabsTrigger value="notifications">التنبيهات</TabsTrigger>
          <TabsTrigger value="financial">المالية</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                معلومات الشركة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input
                    id="companyName"
                    value={currentData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                  <Input
                    id="taxNumber"
                    value={currentData.taxNumber}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">رقم الهاتف</Label>
                  <Input
                    id="companyPhone"
                    value={currentData.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={currentData.companyEmail}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="companyAddress">عنوان الشركة</Label>
                <Input
                  id="companyAddress"
                  value={currentData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                إعدادات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">العملة</Label>
                  <Input
                    id="currency"
                    value={currentData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                  <Input
                    id="dateFormat"
                    value={currentData.dateFormat}
                    onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timeFormat">تنسيق الوقت</Label>
                  <Input
                    id="timeFormat"
                    value={currentData.timeFormat}
                    onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="language">اللغة</Label>
                  <Select onValueChange={(value) => handleInputChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللغة" defaultValue={currentData.language} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Input
                    id="timezone"
                    value={currentData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                إعدادات التنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="emailNotifications">تنبيهات البريد الإلكتروني</Label>
                  <Switch
                    id="emailNotifications"
                    checked={currentData.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <Label htmlFor="smsNotifications">تنبيهات الرسائل النصية</Label>
                  <Switch
                    id="smsNotifications"
                    checked={currentData.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                الإعدادات المالية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultCreditLimit">الحد الائتماني الافتراضي</Label>
                  <Input
                    id="defaultCreditLimit"
                    type="number"
                    value={String(currentData.defaultCreditLimit)}
                    onChange={(e) => handleInputChange('defaultCreditLimit', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="requireDeposit">طلب دفعة مقدمة</Label>
                  <Select onValueChange={(value) => handleInputChange('requireDeposit', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر" defaultValue={String(currentData.requireDeposit)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">نعم</SelectItem>
                      <SelectItem value="false">لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultDepositAmount">مبلغ الدفعة المقدمة الافتراضي</Label>
                  <Input
                    id="defaultDepositAmount"
                    type="number"
                    value={String(currentData.defaultDepositAmount)}
                    onChange={(e) => handleInputChange('defaultDepositAmount', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                إعدادات الأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="maintenanceReminder">تذكير بالصيانة (أيام)</Label>
                  <Input
                    id="maintenanceReminder"
                    type="number"
                    value={String(currentData.maintenanceReminder)}
                    onChange={(e) => handleInputChange('maintenanceReminder', Number(e.target.value))}
                  />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <Label htmlFor="contractExpiryWarning">التحذير من انتهاء العقد (أيام)</Label>
                  <Input
                    id="contractExpiryWarning"
                    type="number"
                    value={String(currentData.contractExpiryWarning)}
                    onChange={(e) => handleInputChange('contractExpiryWarning', Number(e.target.value))}
                  />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <Label htmlFor="registrationExpiryWarning">التحذير من انتهاء التسجيل (أيام)</Label>
                  <Input
                    id="registrationExpiryWarning"
                    type="number"
                    value={String(currentData.registrationExpiryWarning)}
                    onChange={(e) => handleInputChange('registrationExpiryWarning', Number(e.target.value))}
                  />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <Label htmlFor="lowStockAlert">تنبيه انخفاض المخزون</Label>
                  <Input
                    id="lowStockAlert"
                    type="number"
                    value={String(currentData.lowStockAlert)}
                    onChange={(e) => handleInputChange('lowStockAlert', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                إعدادات النسخ الاحتياطي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="autoBackup">النسخ الاحتياطي التلقائي</Label>
                  <Switch
                    id="autoBackup"
                    checked={currentData.autoBackup}
                    onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
                  />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <Label htmlFor="backupFrequency">تكرار النسخ الاحتياطي</Label>
                  <Select onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التكرار" defaultValue={currentData.backupFrequency} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يوميًا</SelectItem>
                      <SelectItem value="weekly">أسبوعيًا</SelectItem>
                      <SelectItem value="monthly">شهريًا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSystemSettings;
