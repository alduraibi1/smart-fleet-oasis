
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useCustomerArrearsActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createArrearsNotification = async (customerId: string, customerName: string, outstandingBalance: number) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('create_smart_notification', {
        p_title: 'إجراء متابعة متأخرات',
        p_message: `تم اتخاذ إجراء متابعة للعميل ${customerName} بمتأخرات ${outstandingBalance.toLocaleString()} ريال`,
        p_type: 'payment_follow_up',
        p_category: 'payments',
        p_priority: 'high',
        p_reference_type: 'customer',
        p_reference_id: customerId,
        p_reference_data: {
          outstanding_balance: outstandingBalance,
          action_taken: 'follow_up_initiated',
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: 'تم تسجيل الإجراء',
        description: `تم تسجيل إجراء المتابعة للعميل ${customerName}`,
      });

    } catch (error) {
      console.error('خطأ في إنشاء تنبيه المتأخرات:', error);
      toast({
        title: 'خطأ في التسجيل',
        description: 'فشل في تسجيل إجراء المتابعة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCollectionActions = (outstandingBalance: number, overdueDays: number) => {
    const actions = [];

    if (overdueDays >= 30) {
      actions.push({
        action: 'legal_collection',
        title: 'إجراءات التحصيل القانوني',
        description: 'بدء إجراءات التحصيل القانوني نظراً لتجاوز 30 يوم',
        priority: 'urgent'
      });
    }

    if (overdueDays >= 15) {
      actions.push({
        action: 'vehicle_repossession',
        title: 'سحب المركبة',
        description: 'سحب المركبة وإنهاء العقد',
        priority: 'high'
      });
    }

    if (overdueDays >= 7) {
      actions.push({
        action: 'final_notice',
        title: 'إنذار نهائي',
        description: 'إرسال إنذار نهائي قبل اتخاذ إجراءات أخرى',
        priority: 'high'
      });
    }

    actions.push({
      action: 'contact_customer',
      title: 'التواصل مع العميل',
      description: 'محاولة التواصل والوصول لتسوية ودية',
      priority: 'medium'
    });

    return actions;
  };

  return {
    loading,
    createArrearsNotification,
    generateCollectionActions
  };
};
