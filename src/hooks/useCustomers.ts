
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCustomers = async () => {
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

      // تحويل البيانات للتوافق مع النوع المطلوب
      const transformedCustomers: Customer[] = (data || []).map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        national_id: customer.national_id,
        nationalId: customer.national_id, // للتوافق مع الكود القديم
        nationality: customer.nationality || 'سعودي',
        city: customer.city || '',
        address: customer.address || '',
        license_expiry: customer.license_expiry,
        licenseExpiry: customer.license_expiry || '', // للتوافق مع الكود القديم
        is_active: customer.is_active ?? true,
        blacklisted: customer.blacklisted || false,
        blacklist_reason: customer.blacklist_reason,
        blacklistReason: customer.blacklist_reason, // للتوافق مع الكود القديم
        rating: customer.rating || 5,
        total_rentals: customer.total_rentals || 0,
        totalRentals: customer.total_rentals || 0, // للتوافق مع الكود القديم
        created_at: customer.created_at,
        updated_at: customer.updated_at
      }));

      setCustomers(transformedCustomers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      console.error('Error fetching customers:', err);
      
      toast({
        title: "خطأ في تحميل البيانات",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchCustomers();
  };

  const addCustomer = async (customerData: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email || null,
          national_id: customerData.national_id || customerData.nationalId,
          nationality: customerData.nationality || 'سعودي',
          city: customerData.city || null,
          address: customerData.address || null,
          license_expiry: customerData.license_expiry || customerData.licenseExpiry || null,
          is_active: true,
          blacklisted: false
        })
        .select()
        .single();

      if (error) throw error;

      await refetch();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding customer:', error);
      return { success: false, error };
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email || null,
          national_id: customerData.national_id || customerData.nationalId,
          nationality: customerData.nationality,
          city: customerData.city || null,
          address: customerData.address || null,
          license_expiry: customerData.license_expiry || customerData.licenseExpiry || null,
          is_active: customerData.is_active,
          blacklisted: customerData.blacklisted,
          blacklist_reason: customerData.blacklist_reason || customerData.blacklistReason
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await refetch();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error };
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await refetch();
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error };
    }
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
    deleteCustomer
  };
};
