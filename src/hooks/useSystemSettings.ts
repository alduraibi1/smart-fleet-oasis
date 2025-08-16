import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface SystemSettingsData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxNumber: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  timezone: string;
  backupFrequency: string;
  maintenanceReminder: number;
  contractExpiryWarning: number;
  contractExpiryWarningDays: number; // Add this missing property
  registrationExpiryWarning: number;
  lowStockAlert: number;
  autoBackup: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  defaultCreditLimit: number;
  requireDeposit: boolean;
  defaultDepositAmount: number;
}

const defaultSettings: SystemSettingsData = {
  companyName: 'اسم الشركة',
  companyAddress: 'عنوان الشركة',
  companyPhone: '+966500000000',
  companyEmail: 'info@example.com',
  taxNumber: '1234567890',
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
  const { toast } = useToast();

  useEffect(() => {
    const storedSettings = localStorage.getItem('systemSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings(defaultSettings);
      localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
    }
  }, []);

  const updateSettings = (newSettings: SystemSettingsData) => {
    setSettings(newSettings);
    localStorage.setItem('systemSettings', JSON.stringify(newSettings));
    toast({
      title: 'تم التحديث',
      description: 'تم تحديث إعدادات النظام بنجاح',
    });
  };

  return { settings, updateSettings };
};
