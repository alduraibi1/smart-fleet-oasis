import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeCustomers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // الاستماع للتحديثات الفورية على جدول العملاء
    const customersChannel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Customer database change:', payload);
          
          // تحديث البيانات في الذاكرة التخزينية
          queryClient.invalidateQueries({ queryKey: ['customers'] });
          
          // إظهار إشعار للمستخدم
          switch (payload.eventType) {
            case 'INSERT':
              toast({
                title: "عميل جديد",
                description: "تم إضافة عميل جديد للنظام",
                duration: 3000,
              });
              break;
            case 'UPDATE':
              toast({
                title: "تحديث بيانات العميل",
                description: "تم تحديث بيانات العميل بنجاح",
                duration: 3000,
              });
              break;
            case 'DELETE':
              toast({
                title: "حذف عميل",
                description: "تم حذف العميل من النظام",
                duration: 3000,
              });
              break;
          }
        }
      )
      .subscribe();

    // الاستماع للتحديثات على وثائق العملاء
    const documentsChannel = supabase
      .channel('customer-documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_documents'
        },
        (payload) => {
          console.log('Customer documents change:', payload);
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
      )
      .subscribe();

    // تنظيف الاشتراكات عند إلغاء تحميل المكون
    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(documentsChannel);
    };
  }, [queryClient, toast]);

  return {
    // يمكن إضافة وظائف أخرى هنا إذا لزم الأمر
  };
};