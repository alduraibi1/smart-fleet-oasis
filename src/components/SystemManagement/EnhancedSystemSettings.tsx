import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Settings, Save, Download, Upload, RefreshCw } from 'lucide-react';

export function EnhancedSystemSettings() {
  const { toast } = useToast();
  const {
    settings,
    isLoading,
    updateSetting,
    refreshSettings,
    exportSettings,
    importSettings
  } = useSystemSettings();

  const [localSettings, setLocalSettings] = useState(settings);

  const handleInputChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSwitchChange = (key: string, checked: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleNumberInputChange = (key: string, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRefresh = async () => {
    try {
      await refreshSettings();
      toast({
        title: "تم التحديث",
        description: "تم تحديث الإعدادات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الإعدادات",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      await exportSettings();
      toast({
        title: "تم التصدير",
        description: "تم تصدير الإعدادات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصدير الإعدادات",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importSettings(file);
      toast({
        title: "تم الاستيراد",
        description: "تم استيراد الإعدادات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء استيراد الإعدادات",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      for (const [key, value] of Object.entries(localSettings)) {
        if (settings[key] !== value) {
          await updateSetting(key, value);
        }
      }
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold">إعدادات النظام المتقدمة</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الأعمال</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultCreditLimit">الحد الائتماني الافتراضي</Label>
              <Input
                id="defaultCreditLimit"
                type="number"
                value={localSettings.defaultCreditLimit || 0}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  defaultCreditLimit: Number(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label htmlFor="maxContractDays">الحد الأقصى لأيام العقد</Label>
              <Input
                id="maxContractDays"
                type="number"
                value={localSettings.maxContractDays || 30}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  maxContractDays: Number(e.target.value)
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الإشعارات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contractExpiryWarningDays">تحذير انتهاء العقد (أيام)</Label>
              <Input
                id="contractExpiryWarningDays"
                type="number"
                value={localSettings.contractExpiryWarningDays || 7}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  contractExpiryWarningDays: Number(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label htmlFor="registrationExpiryWarningDays">تحذير انتهاء التسجيل (أيام)</Label>
              <Input
                id="registrationExpiryWarningDays"
                type="number"
                value={localSettings.registrationExpiryWarningDays || 30}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  registrationExpiryWarningDays: Number(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label htmlFor="maintenanceDueWarningDays">تحذير موعد الصيانة (أيام)</Label>
              <Input
                id="maintenanceDueWarningDays"
                type="number"
                value={localSettings.maintenanceDueWarningDays || 15}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  maintenanceDueWarningDays: Number(e.target.value)
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedSystemSettings;
