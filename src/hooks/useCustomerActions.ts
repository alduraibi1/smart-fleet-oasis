
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';

export const useCustomerActions = () => {
  const { toast } = useToast();

  const handleBlacklistToggle = async (customer: Customer, onUpdate: () => void) => {
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

  const handleActivateToggle = async (customer: Customer, onUpdate: () => void) => {
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
