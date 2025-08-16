
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemSettingsData {
  id?: string;
  companyName: string;
  defaultCreditLimit: number;
  registrationExpiryWarningDays: number;
  maintenanceDueWarningDays: number;
  maxContractDays: number;
  currency: string;
  taxRate: number;
  overduePaymentWarningDays: number;
  created_at?: string;
  updated_at?: string;
}

export const useSystemSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings query
  const { data: settings, isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async (): Promise<SystemSettingsData> => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Return default settings if none exist
      if (!data) {
        return {
          companyName: 'شركة تأجير السيارات',
          defaultCreditLimit: 5000,
          registrationExpiryWarningDays: 30,
          maintenanceDueWarningDays: 7,
          maxContractDays: 365,
          currency: 'SAR',
          taxRate: 15,
          overduePaymentWarningDays: 3,
        };
      }

      return data;
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettingsData) => {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert(newSettings)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ إعدادات النظام بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const updateSetting = (key: keyof SystemSettingsData, value: any) => {
    if (settings) {
      const updatedSettings = { ...settings, [key]: value };
      saveSettingsMutation.mutate(updatedSettings);
    }
  };

  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
  };

  const exportSettings = () => {
    if (settings) {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'system-settings.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const importSettings = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        saveSettingsMutation.mutate(importedSettings);
      } catch (error) {
        toast({
          title: "خطأ في الاستيراد",
          description: "فشل في قراءة الملف",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return {
    settings: settings || {
      companyName: 'شركة تأجير السيارات',
      defaultCreditLimit: 5000,
      registrationExpiryWarningDays: 30,
      maintenanceDueWarningDays: 7,
      maxContractDays: 365,
      currency: 'SAR',
      taxRate: 15,
      overduePaymentWarningDays: 3,
    },
    isLoading,
    saveSettings: saveSettingsMutation.mutate,
    isSaving: saveSettingsMutation.isPending,
    updateSetting,
    refreshSettings,
    exportSettings,
    importSettings,
  };
};
