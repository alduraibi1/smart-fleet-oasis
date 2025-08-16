
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerFormData } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';
import { 
  convertFormDataToDatabase, 
  convertDatabaseToCustomer, 
  validateCustomerData 
} from '@/utils/customerUtils';

export const useCustomersNew = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    console.log('🔄 Fetching customers...');
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      console.log('✅ Raw data from database:', data);
      
      const transformedCustomers = (data || []).map(convertDatabaseToCustomer);
      console.log('✅ Transformed customers:', transformedCustomers);
      
      setCustomers(transformedCustomers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      console.error('❌ Error fetching customers:', err);
      setError(errorMessage);
      
      toast({
        title: "خطأ في تحميل البيانات",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (formData: CustomerFormData) => {
    console.log('🚀 Adding new customer:', formData);
    
    try {
      // Validate data
      const validationErrors = validateCustomerData(formData);
      if (validationErrors.length > 0) {
        toast({
          title: "بيانات غير صحيحة", 
          description: validationErrors.join(', '),
          variant: "destructive"
        });
        return { success: false, error: validationErrors.join(', ') };
      }

      // Convert to database format
      const databaseData = convertFormDataToDatabase(formData);
      console.log('📝 Database data:', databaseData);

      // Insert into database
      const { data, error } = await supabase
        .from('customers')
        .insert(databaseData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Customer added successfully:', data);
      
      // Add to local state immediately for better UX
      const newCustomer = convertDatabaseToCustomer(data);
      setCustomers(prev => [newCustomer, ...prev]);
      
      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة العميل الجديد بنجاح"
      });
      
      return { success: true, data: newCustomer };
    } catch (error) {
      console.error('💥 Error adding customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في إضافة العميل",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const updateCustomer = async (id: string, formData: CustomerFormData) => {
    console.log('🔄 Updating customer:', id, formData);
    
    try {
      // Validate data
      const validationErrors = validateCustomerData(formData);
      if (validationErrors.length > 0) {
        toast({
          title: "بيانات غير صحيحة",
          description: validationErrors.join(', '),
          variant: "destructive"
        });
        return { success: false, error: validationErrors.join(', ') };
      }

      // Convert to database format
      const databaseData = convertFormDataToDatabase(formData);
      console.log('📝 Update database data:', databaseData);

      const { data, error } = await supabase
        .from('customers')
        .update(databaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Customer updated successfully:', data);
      
      // Update local state
      const updatedCustomer = convertDatabaseToCustomer(data);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات العميل بنجاح"
      });
      
      return { success: true, data: updatedCustomer };
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في التحديث",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const deleteCustomer = async (id: string) => {
    console.log('🗑️ Deleting customer:', id);
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('✅ Customer deleted successfully');
      
      // Update local state
      setCustomers(prev => prev.filter(c => c.id !== id));
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف العميل بنجاح"
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في الحذف",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const addToBlacklist = async (id: string, reason: string) => {
    console.log('⚫ Adding to blacklist:', id, reason);
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          blacklisted: true,
          blacklist_reason: reason,
          blacklist_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('✅ Added to blacklist successfully');
      
      // Refresh data
      await fetchCustomers();
      
      toast({
        title: "تم إضافة العميل للقائمة السوداء",
        description: "تم إضافة العميل للقائمة السوداء بنجاح"
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding to blacklist:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في إضافة العميل للقائمة السوداء",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const removeFromBlacklist = async (id: string) => {
    console.log('⚪ Removing from blacklist:', id);
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          blacklisted: false,
          blacklist_reason: null,
          blacklist_date: null
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('✅ Removed from blacklist successfully');
      
      // Refresh data
      await fetchCustomers();
      
      toast({
        title: "تم إزالة العميل من القائمة السوداء",
        description: "تم إزالة العميل من القائمة السوداء بنجاح"
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error removing from blacklist:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في إزالة العميل من القائمة السوداء",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const refetch = async () => {
    await fetchCustomers();
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    refetch,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addToBlacklist,
    removeFromBlacklist
  };
};
