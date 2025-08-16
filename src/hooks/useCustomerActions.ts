
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';

export const useCustomerActions = () => {
  const { toast } = useToast();

  const handleBlacklistToggle = async (customer: Customer, onUpdate: () => void) => {
    console.log('🔄 Toggling blacklist for customer:', customer.id, 'Current status:', customer.blacklisted);
    
    try {
      const newBlacklistStatus = !customer.blacklisted;
      
      const { error } = await supabase
        .from('customers')
        .update({ 
          blacklisted: newBlacklistStatus,
          blacklist_reason: newBlacklistStatus ? 'تم الإدراج في القائمة السوداء' : null,
          blacklist_date: newBlacklistStatus ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', customer.id);

      if (error) {
        console.error('❌ Error updating blacklist:', error);
        throw error;
      }

      console.log('✅ Blacklist status updated successfully');
      
      toast({
        title: "تم التحديث",
        description: newBlacklistStatus 
          ? "تم إضافة العميل للقائمة السوداء" 
          : "تم إزالة العميل من القائمة السوداء"
      });

      onUpdate();
    } catch (error) {
      console.error('💥 Error in handleBlacklistToggle:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة العميل",
        variant: "destructive"
      });
    }
  };

  const handleActivateToggle = async (customer: Customer, onUpdate: () => void) => {
    console.log('🔄 Toggling activation for customer:', customer.id, 'Current status:', customer.is_active);
    
    try {
      const newActiveStatus = !customer.is_active;
      
      const { error } = await supabase
        .from('customers')
        .update({ is_active: newActiveStatus })
        .eq('id', customer.id);

      if (error) {
        console.error('❌ Error updating activation:', error);
        throw error;
      }

      console.log('✅ Activation status updated successfully');
      
      toast({
        title: "تم التحديث",
        description: newActiveStatus 
          ? "تم تفعيل العميل" 
          : "تم إلغاء تفعيل العميل"
      });

      onUpdate();
    } catch (error) {
      console.error('💥 Error in handleActivateToggle:', error);
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
