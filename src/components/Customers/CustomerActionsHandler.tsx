
import React from 'react';
import { Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CustomerActionsHandlerProps {
  customer: Customer;
  onUpdate: () => void;
}

export const CustomerActionsHandler: React.FC<CustomerActionsHandlerProps> = ({
  customer,
  onUpdate
}) => {
  const { toast } = useToast();

  const handleBlacklistToggle = async () => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          blacklisted: !customer.blacklisted,
          blacklist_reason: !customer.blacklisted ? 'تم الإدراج في القائمة السوداء' : null
        })
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: customer.blacklisted 
          ? "تم إزالة العميل من القائمة السوداء" 
          : "تم إضافة العميل للقائمة السوداء"
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating customer blacklist:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة العميل",
        variant: "destructive"
      });
    }
  };

  const handleActivateToggle = async () => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: !customer.is_active })
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: customer.is_active 
          ? "تم إلغاء تفعيل العميل" 
          : "تم تفعيل العميل"
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة العميل",
        variant: "destructive"
      });
    }
  };

  return {
    handleBlacklistToggle,
    handleActivateToggle
  };
};
