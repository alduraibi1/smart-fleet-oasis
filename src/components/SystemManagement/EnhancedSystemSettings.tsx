import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useSystemSettings, SystemSettingsData } from '@/hooks/useSystemSettings';

const systemSettingsSchema = z.object({
  companyName: z.string().min(2, {
    message: "اسم الشركة مطلوب.",
  }),
  companyAddress: z.string().min(2, {
    message: "عنوان الشركة مطلوب.",
  }),
  companyPhone: z.string().min(2, {
    message: "رقم هاتف الشركة مطلوب.",
  }),
  companyEmail: z.string().email({
    message: "بريد إلكتروني صحيح مطلوب.",
  }),
  taxNumber: z.string().min(2, {
    message: "الرقم الضريبي مطلوب.",
  }),
  currency: z.string().min(1, {
    message: "العملة مطلوبة.",
  }),
  dateFormat: z.string().min(2, {
    message: "تنسيق التاريخ مطلوب.",
  }),
  timeFormat: z.string().min(2, {
    message: "تنسيق الوقت مطلوب.",
  }),
  language: z.string().min(2, {
    message: "اللغة مطلوبة.",
  }),
  timezone: z.string().min(2, {
    message: "المنطقة الزمنية مطلوبة.",
  }),
  backupFrequency: z.string().min(2, {
    message: "تكرار النسخ الاحتياطي مطلوب.",
  }),
  maintenanceReminder: z.number().min(1, {
    message: "تذكير الصيانة مطلوب.",
  }),
  contractExpiryWarning: z.number().min(1, {
    message: "تحذير انتهاء العقد مطلوب.",
  }),
  contractExpiryWarningDays: z.number().min(1, {
    message: "أيام تحذير انتهاء العقد مطلوبة.",
  }),
  registrationExpiryWarning: z.number().min(1, {
    message: "تحذير انتهاء التسجيل مطلوب.",
  }),
  lowStockAlert: z.number().min(1, {
    message: "تنبيه المخزون المنخفض مطلوب.",
  }),
  autoBackup: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  defaultCreditLimit: z.number().min(0, {
    message: "الحد الائتماني الافتراضي مطلوب.",
  }),
  requireDeposit: z.boolean(),
  defaultDepositAmount: z.number().min(0, {
    message: "مبلغ الإيداع الافتراضي مطلوب.",
  }),
});

export default function EnhancedSystemSettings() {
  const { settings, updateSettings, loading } = useSystemSettings();
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);

  const form = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      taxNumber: '',
      currency: '',
      dateFormat: '',
      timeFormat: '',
      language: '',
      timezone: '',
      backupFrequency: '',
      maintenanceReminder: 30,
      contractExpiryWarning: 30,
      contractExpiryWarningDays: 30,
      registrationExpiryWarning: 30,
      lowStockAlert: 10,
      autoBackup: true,
      emailNotifications: true,
      smsNotifications: false,
      defaultCreditLimit: 1000,
      requireDeposit: false,
      defaultDepositAmount: 100,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const handleInputChange = (field: keyof SystemSettingsData, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const onSubmit = async (data: z.infer<typeof systemSettingsSchema>) => {
    try {
      await updateSettings(data);
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات النظام بنجاح.",
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast({
        title: "فشل",
        description: "فشل في تحديث إعدادات النظام.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الشركة</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم الشركة" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('companyName', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان الشركة</FormLabel>
                      <FormControl>
                        <Input placeholder="عنوان الشركة" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('companyAddress', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم هاتف الشركة</FormLabel>
                      <FormControl>
                        <Input placeholder="رقم هاتف الشركة" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('companyPhone', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني للشركة</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="البريد الإلكتروني للشركة" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('companyEmail', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرقم الضريبي</FormLabel>
                      <FormControl>
                        <Input placeholder="الرقم الضريبي" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('taxNumber', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العملة</FormLabel>
                      <FormControl>
                        <Input placeholder="العملة" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('currency', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تنسيق التاريخ</FormLabel>
                      <FormControl>
                        <Input placeholder="تنسيق التاريخ" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('dateFormat', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تنسيق الوقت</FormLabel>
                      <FormControl>
                        <Input placeholder="تنسيق الوقت" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('timeFormat', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اللغة</FormLabel>
                      <FormControl>
                        <Input placeholder="اللغة" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('language', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المنطقة الزمنية</FormLabel>
                      <FormControl>
                        <Input placeholder="المنطقة الزمنية" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('timezone', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backupFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تكرار النسخ الاحتياطي</FormLabel>
                      <FormControl>
                        <Input placeholder="تكرار النسخ الاحتياطي" {...field} disabled={!isEditMode} onChange={(e) => {
                          field.onChange(e);
                          handleInputChange('backupFrequency', e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maintenanceReminder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تذكير الصيانة (بالأيام)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value));
                            handleInputChange('maintenanceReminder', parseInt(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractExpiryWarning"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تحذير انتهاء العقود (بالأيام)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value));
                            handleInputChange('contractExpiryWarning', parseInt(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractExpiryWarningDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تحذير انتهاء العقود (بالأيام)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value));
                            handleInputChange('contractExpiryWarningDays', parseInt(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationExpiryWarning"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تحذير انتهاء التسجيل (بالأيام)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value));
                            handleInputChange('registrationExpiryWarning', parseInt(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockAlert"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تنبيه المخزون المنخفض</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value));
                            handleInputChange('lowStockAlert', parseInt(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultCreditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحد الائتماني الافتراضي</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value));
                            handleInputChange('defaultCreditLimit', parseInt(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultDepositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مبلغ الإيداع الافتراضي</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={!isEditMode}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value));
                            handleInputChange('defaultDepositAmount', parseInt(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="autoBackup"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">النسخ الاحتياطي التلقائي</FormLabel>
                        <FormDescription>
                          سيتم النسخ الاحتياطي للبيانات تلقائيًا.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleInputChange('autoBackup', checked);
                          }}
                          disabled={!isEditMode}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">إشعارات البريد الإلكتروني</FormLabel>
                        <FormDescription>
                          سيتم إرسال الإشعارات عبر البريد الإلكتروني.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleInputChange('emailNotifications', checked);
                          }}
                          disabled={!isEditMode}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">إشعارات الرسائل النصية</FormLabel>
                        <FormDescription>
                          سيتم إرسال الإشعارات عبر الرسائل النصية.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleInputChange('smsNotifications', checked);
                          }}
                          disabled={!isEditMode}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireDeposit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">طلب إيداع</FormLabel>
                        <FormDescription>
                          سيتم طلب إيداع افتراضي.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleInputChange('requireDeposit', checked);
                          }}
                          disabled={!isEditMode}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {!isEditMode ? (
                <Button onClick={() => setIsEditMode(true)}>تعديل الإعدادات</Button>
              ) : (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setIsEditMode(false);
                    if (settings) {
                      form.reset(settings);
                    }
                  }}>
                    إلغاء
                  </Button>
                  <Button type="submit">حفظ التغييرات</Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

type FormDescription = ({ children }: { children: React.ReactNode; }) => JSX.Element;
const FormDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <p className="text-sm text-muted-foreground">
      {children}
    </p>
  );
};
