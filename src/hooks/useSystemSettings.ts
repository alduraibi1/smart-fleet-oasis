
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AutoSyncSettings } from './useAutoSync';

export interface SystemSettingsData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxNumber: string;
  commercialRegistration?: string;
  licenseNumber?: string;
  bankName?: string;
  bankIban?: string;
  contractTerms?: string;
  vatEnabled?: boolean;
  vatPercentage?: number;
  companyLogoUrl?: string;
  companySealUrl?: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  timezone: string;
  backupFrequency: string;
  maintenanceReminder: number;
  contractExpiryWarning: number;
  contractExpiryWarningDays: number;
  registrationExpiryWarning: number;
  registrationExpiryWarningDays: number;
  lowStockAlert: number;
  autoBackup: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  defaultCreditLimit: number;
  requireDeposit: boolean;
  defaultDepositAmount: number;
  autoSync?: AutoSyncSettings;
}

const defaultSettings: SystemSettingsData = {
  companyName: 'اسم الشركة',
  companyAddress: 'عنوان الشركة',
  companyPhone: '+966500000000',
  companyEmail: 'info@example.com',
  taxNumber: '30009167800003',
  commercialRegistration: '4030175252',
  licenseNumber: '38/00006704',
  bankName: '',
  bankIban: '',
  contractTerms: 'لم يتم إضافة بنود العقد بعد. يمكنك إضافتها من إعدادات الشركة.',
  vatEnabled: false,
  vatPercentage: 15,
  companyLogoUrl: '/company/logo.png',
  companySealUrl: '/company/seal.png',
  currency: 'SAR',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  language: 'ar',
  timezone: 'Asia/Riyadh',
  backupFrequency: 'daily',
  maintenanceReminder: 30,
  contractExpiryWarning: 90,
  contractExpiryWarningDays: 30,
  registrationExpiryWarning: 60,
  registrationExpiryWarningDays: 30,
  lowStockAlert: 10,
  autoBackup: true,
  emailNotifications: true,
  smsNotifications: false,
  defaultCreditLimit: 10000,
  requireDeposit: true,
  defaultDepositAmount: 1000,
};

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    // For now, use localStorage until we fix database structure
    const storedSettings = localStorage.getItem('systemSettings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      const completeSettings = { ...defaultSettings, ...parsedSettings };
      setSettings(completeSettings);
    } else {
      setSettings(defaultSettings);
      localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
    }
    setLoading(false);
  };

  const updateSettings = (newSettings: SystemSettingsData) => {
    // For now, use localStorage until we fix database structure
    setSettings(newSettings);
    localStorage.setItem('systemSettings', JSON.stringify(newSettings));
    toast({
      title: 'تم التحديث',
      description: 'تم تحديث إعدادات النظام بنجاح',
    });
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفع الملف',
        variant: 'destructive',
      });
      return null;
    }
  };

  return { settings, setSettings, updateSettings, uploadFile, loading };
};