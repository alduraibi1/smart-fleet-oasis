
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemSettingsData {
  // إعدادات عامة
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  
  // إعدادات الأمان
  sessionTimeout: number;
  passwordPolicy: 'weak' | 'medium' | 'strong';
  twoFactorAuth: boolean;
  loginAttempts: number;
  
  // إعدادات النظام
  defaultLanguage: 'ar' | 'en';
  defaultCurrency: 'SAR' | 'USD' | 'EUR';
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  timeZone: string;
  
  // إعدادات التنبيهات
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceAlerts: boolean;
  contractExpiry: boolean;
  
  // إعدادات النسخ الاحتياطي
  autoBackup: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  backupRetention: number;

  // إعدادات العمل
  defaultCreditLimit: number;
  registrationExpiryWarningDays: number;
  contractExpiryWarningDays: number;
  maintenanceReminderDays: number;
}

const defaultSettings: SystemSettingsData = {
  companyName: 'شركة تأجير المركبات',
  companyEmail: 'info@company.com',
  companyPhone: '+966 11 234 5678',
  companyAddress: 'الرياض، المملكة العربية السعودية',
  sessionTimeout: 30,
  passwordPolicy: 'strong',
  twoFactorAuth: false,
  loginAttempts: 5,
  defaultLanguage: 'ar',
  defaultCurrency: 'SAR',
  dateFormat: 'dd/mm/yyyy',
  timeZone: 'Asia/Riyadh',
  emailNotifications: true,
  smsNotifications: false,
  maintenanceAlerts: true,
  contractExpiry: true,
  autoBackup: true,
  backupFrequency: 'daily',
  backupRetention: 30,
  defaultCreditLimit: 5000,
  registrationExpiryWarningDays: 30,
  contractExpiryWarningDays: 7,
  maintenanceReminderDays: 5,
};

export function useSystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب الإعدادات
  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async (): Promise<SystemSettingsData> => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching settings:', error);
        return defaultSettings;
      }

      // تحويل البيانات من قاعدة البيانات إلى كائن الإعدادات
      const settingsMap = data.reduce((acc, item) => {
        acc[item.setting_key] = item.setting_value;
        return acc;
      }, {} as Record<string, any>);

      return { ...defaultSettings, ...settingsMap };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // حفظ الإعدادات
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettingsData) => {
      // حذف الإعدادات القديمة
      await supabase
        .from('system_settings')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // dummy condition to delete all

      // إدراج الإعدادات الجديدة
      const settingsArray = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        description: getSettingDescription(key),
        is_active: true,
      }));

      const { error } = await supabase
        .from('system_settings')
        .insert(settingsArray);

      if (error) throw error;
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حفظ إعدادات النظام بنجاح',
      });
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ إعدادات النظام',
        variant: 'destructive',
      });
    },
  });

  return {
    settings: settings || defaultSettings,
    isLoading,
    saveSettings: saveSettingsMutation.mutate,
    isSaving: saveSettingsMutation.isPending,
  };
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    companyName: 'اسم الشركة',
    companyEmail: 'البريد الإلكتروني للشركة',
    companyPhone: 'رقم هاتف الشركة',
    companyAddress: 'عنوان الشركة',
    sessionTimeout: 'مهلة انتهاء الجلسة بالدقائق',
    passwordPolicy: 'سياسة كلمة المرور',
    twoFactorAuth: 'تفعيل المصادقة الثنائية',
    loginAttempts: 'عدد محاولات تسجيل الدخول المسموحة',
    defaultLanguage: 'اللغة الافتراضية',
    defaultCurrency: 'العملة الافتراضية',
    dateFormat: 'تنسيق التاريخ',
    timeZone: 'المنطقة الزمنية',
    emailNotifications: 'تنبيهات البريد الإلكتروني',
    smsNotifications: 'تنبيهات الرسائل النصية',
    maintenanceAlerts: 'تنبيهات الصيانة',
    contractExpiry: 'تنبيهات انتهاء العقود',
    autoBackup: 'النسخ الاحتياطي التلقائي',
    backupFrequency: 'تكرار النسخ الاحتياطي',
    backupRetention: 'فترة الاحتفاظ بالنسخ الاحتياطي بالأيام',
    defaultCreditLimit: 'الحد الائتماني الافتراضي',
    registrationExpiryWarningDays: 'أيام التحذير قبل انتهاء التسجيل',
    contractExpiryWarningDays: 'أيام التحذير قبل انتهاء العقد',
    maintenanceReminderDays: 'أيام تذكير الصيانة',
  };
  
  return descriptions[key] || key;
}
