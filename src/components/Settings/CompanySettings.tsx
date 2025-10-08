import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useToast } from '@/hooks/use-toast';
import { Building2, Upload, FileText, DollarSign, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const CompanySettings = () => {
  const { settings, updateSettings, uploadFile, loading } = useSystemSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(settings?.companyLogoUrl || '');
  const [sealPreview, setSealPreview] = useState(settings?.companySealUrl || '');

  if (loading || !settings) {
    return <div>جاري التحميل...</div>;
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'خطأ',
        description: 'حجم الملف يجب أن يكون أقل من 2 ميجابايت',
        variant: 'destructive',
      });
      return;
    }

    const url = await uploadFile(file, 'logos');
    if (url) {
      setLogoPreview(url);
      await updateSettings({ ...settings, companyLogoUrl: url });
    }
  };

  const handleSealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'خطأ',
        description: 'حجم الملف يجب أن يكون أقل من 2 ميجابايت',
        variant: 'destructive',
      });
      return;
    }

    const url = await uploadFile(file, 'seals');
    if (url) {
      setSealPreview(url);
      await updateSettings({ ...settings, companySealUrl: url });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const updatedSettings = {
      ...settings,
      companyName: formData.get('companyName') as string,
      companyAddress: formData.get('companyAddress') as string,
      companyPhone: formData.get('companyPhone') as string,
      companyEmail: formData.get('companyEmail') as string,
      bankName: formData.get('bankName') as string,
      bankIban: formData.get('bankIban') as string,
      contractTerms: formData.get('contractTerms') as string,
      vatEnabled: formData.get('vatEnabled') === 'on',
      vatPercentage: parseFloat(formData.get('vatPercentage') as string) || 15,
    };

    await updateSettings(updatedSettings);
    setSaving(false);
  };

  const restoreDefaultTerms = () => {
    const defaultTerms = 'لم يتم إضافة بنود العقد بعد. يمكنك إضافتها من إعدادات الشركة.';
    updateSettings({ ...settings, contractTerms: defaultTerms });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* البيانات الأساسية */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>البيانات الأساسية</CardTitle>
          </div>
          <CardDescription>معلومات الشركة الأساسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">اسم الشركة</Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={settings.companyName}
                required
              />
            </div>
            <div>
              <Label htmlFor="companyPhone">الهاتف</Label>
              <Input
                id="companyPhone"
                name="companyPhone"
                defaultValue={settings.companyPhone}
                dir="ltr"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
              <Input
                id="companyEmail"
                name="companyEmail"
                type="email"
                defaultValue={settings.companyEmail}
                dir="ltr"
                required
              />
            </div>
            <div>
              <Label htmlFor="companyAddress">العنوان</Label>
              <Input
                id="companyAddress"
                name="companyAddress"
                defaultValue={settings.companyAddress}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* البيانات الرسمية */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>البيانات الرسمية</CardTitle>
          </div>
          <CardDescription>المعلومات الرسمية والقانونية للشركة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="taxNumber">الرقم الضريبي</Label>
              <Input
                id="taxNumber"
                value={settings.taxNumber}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="commercialRegistration">السجل التجاري</Label>
              <Input
                id="commercialRegistration"
                value={settings.commercialRegistration}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="licenseNumber">رقم الترخيص</Label>
              <Input
                id="licenseNumber"
                value={settings.licenseNumber}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* البيانات المصرفية */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>البيانات المصرفية</CardTitle>
          </div>
          <CardDescription>معلومات الحساب البنكي للشركة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">اسم البنك</Label>
              <Input
                id="bankName"
                name="bankName"
                defaultValue={settings.bankName}
                placeholder="مثال: البنك الأهلي السعودي"
              />
            </div>
            <div>
              <Label htmlFor="bankIban">رقم الحساب / IBAN</Label>
              <Input
                id="bankIban"
                name="bankIban"
                defaultValue={settings.bankIban}
                placeholder="SA00 0000 0000 0000 0000 0000"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الشعار والختم */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <CardTitle>الشعار والختم</CardTitle>
          </div>
          <CardDescription>
            صور الشعار والختم الرسمي للشركة (الحد الأقصى: 2 ميجابايت)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* رفع الشعار */}
            <div className="space-y-3">
              <Label>شعار الشركة</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center space-y-3">
                {logoPreview && (
                  <div className="flex justify-center">
                    <img
                      src={logoPreview}
                      alt="شعار الشركة"
                      className="max-h-32 object-contain"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  PNG أو JPG (حد أقصى: 2MB)
                </p>
              </div>
            </div>

            {/* رفع الختم */}
            <div className="space-y-3">
              <Label>ختم الشركة</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center space-y-3">
                {sealPreview && (
                  <div className="flex justify-center">
                    <img
                      src={sealPreview}
                      alt="ختم الشركة"
                      className="max-h-32 object-contain"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/png"
                  onChange={handleSealUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  PNG بخلفية شفافة (حد أقصى: 2MB)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات الضريبة */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الضريبة</CardTitle>
          <CardDescription>
            تفعيل ونسبة ضريبة القيمة المضافة (VAT)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="vatEnabled">تفعيل الضريبة افتراضياً</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        سيظهر خيار الضريبة في نموذج إنشاء العقد. يمكن للموظف
                        اختيار تضمين الضريبة أو عدم تضمينها لكل عقد
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                سيظهر خيار الضريبة عند إنشاء كل عقد
              </p>
            </div>
            <Switch
              id="vatEnabled"
              name="vatEnabled"
              defaultChecked={settings.vatEnabled}
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor="vatPercentage">نسبة الضريبة (%)</Label>
            <Input
              id="vatPercentage"
              name="vatPercentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={settings.vatPercentage}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground mt-1">
              النسبة الرسمية في السعودية: 15%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* بنود العقد */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>بنود وشروط العقد</CardTitle>
              <CardDescription>
                البنود القانونية التي ستظهر في جميع العقود المطبوعة
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={restoreDefaultTerms}
            >
              استعادة النص الافتراضي
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            id="contractTerms"
            name="contractTerms"
            defaultValue={settings.contractTerms}
            rows={12}
            className="font-arabic"
            placeholder="أدخل بنود وشروط العقد هنا..."
          />
          <p className="text-sm text-muted-foreground mt-2">
            يمكنك إضافة أو تعديل البنود حسب احتياجك. ستظهر هذه البنود في جميع
            العقود المطبوعة.
          </p>
        </CardContent>
      </Card>

      {/* زر الحفظ */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </form>
  );
};