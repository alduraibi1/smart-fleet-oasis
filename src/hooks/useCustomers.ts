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
        nationalId: customer.national_id || '',
        nationality: customer.nationality || 'سعودي',
        city: customer.city || '',
        address: customer.address || '',
        license_expiry: customer.license_expiry,
        licenseExpiry: customer.license_expiry ? new Date(customer.license_expiry) : new Date(),
        is_active: customer.is_active ?? true,
        blacklisted: customer.blacklisted || false,
        blacklist_reason: customer.blacklist_reason,
        blacklistReason: customer.blacklist_reason,
        rating: customer.rating || 5,
        total_rentals: customer.total_rentals || 0,
        totalRentals: customer.total_rentals || 0,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
        
        // إضافة الحقول المطلوبة
        gender: customer.gender || 'male',
        marital_status: customer.marital_status || 'single',
        date_of_birth: customer.date_of_birth,
        license_number: customer.license_number || '',
        licenseNumber: customer.license_number || '',
        license_type: customer.license_type || 'private',
        license_issue_date: customer.license_issue_date,
        international_license: customer.international_license || false,
        international_license_expiry: customer.international_license_expiry,
        country: customer.country || 'السعودية',
        district: customer.district || '',
        postal_code: customer.postal_code || '',
        address_type: customer.address_type || 'residential',
        preferred_language: customer.preferred_language || 'ar',
        marketing_consent: customer.marketing_consent || false,
        sms_notifications: customer.sms_notifications !== false,
        email_notifications: customer.email_notifications !== false,
        customer_source: customer.customer_source || 'website',
        job_title: customer.job_title || '',
        company: customer.company || '',
        work_phone: customer.work_phone || '',
        monthly_income: customer.monthly_income || 0,
        bank_name: customer.bank_name || '',
        account_number: customer.bank_account_number || '',
        credit_limit: customer.credit_limit || 0,
        payment_terms: customer.payment_terms || 'immediate',
        preferred_payment_method: customer.preferred_payment_method || 'cash',
        emergency_contact_name: customer.emergency_contact_name || '',
        emergency_contact_phone: customer.emergency_contact_phone || '',
        emergency_contact_relation: customer.emergency_contact_relation || '',
        has_insurance: customer.has_insurance || false,
        insurance_company: customer.insurance_company || '',
        insurance_policy_number: customer.insurance_policy_number || '',
        insurance_expiry: customer.insurance_expiry,
        notes: customer.notes || '',
        tags: [], // Default empty array since customer_tags doesn't exist in database
        last_rental_date: customer.last_rental_date,
        blacklist_date: customer.blacklist_date || '',
        blacklistDate: customer.blacklist_date ? new Date(customer.blacklist_date) : undefined,
        documents: []
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
      // تحويل التواريخ إلى نصوص وإزالة الحقول المؤقتة
      const { nationalId, licenseExpiry, totalRentals, blacklistReason, licenseNumber, documents, blacklistDate, ...cleanData } = customerData;
      
      // إزالة national_id من cleanData لأنه موجود في المعاملات المستبعدة
      const processedData = {
        ...cleanData,
        name: cleanData.name || '', // Required field
        phone: cleanData.phone || '', // Required field
        national_id: customerData.national_id || customerData.nationalId || '', // Required field
        license_expiry: cleanData.license_expiry 
          ? (typeof cleanData.license_expiry === 'string' 
              ? cleanData.license_expiry 
              : new Date(cleanData.license_expiry).toISOString().split('T')[0])
          : null,
        date_of_birth: cleanData.date_of_birth
          ? (typeof cleanData.date_of_birth === 'string' 
              ? cleanData.date_of_birth 
              : new Date(cleanData.date_of_birth).toISOString().split('T')[0])
          : null,
        license_issue_date: cleanData.license_issue_date
          ? (typeof cleanData.license_issue_date === 'string' 
              ? cleanData.license_issue_date 
              : new Date(cleanData.license_issue_date).toISOString().split('T')[0])
          : null,
        international_license_expiry: cleanData.international_license_expiry
          ? (typeof cleanData.international_license_expiry === 'string' 
              ? cleanData.international_license_expiry 
              : new Date(cleanData.international_license_expiry).toISOString().split('T')[0])
          : null,
        insurance_expiry: cleanData.insurance_expiry
          ? (typeof cleanData.insurance_expiry === 'string' 
              ? cleanData.insurance_expiry 
              : new Date(cleanData.insurance_expiry).toISOString().split('T')[0])
          : null,
        last_rental_date: cleanData.last_rental_date
          ? (typeof cleanData.last_rental_date === 'string' 
              ? cleanData.last_rental_date 
              : new Date(cleanData.last_rental_date).toISOString().split('T')[0])
          : null,
        blacklist_date: cleanData.blacklist_date
          ? (typeof cleanData.blacklist_date === 'string' 
              ? cleanData.blacklist_date 
              : new Date(cleanData.blacklist_date).toISOString().split('T')[0])
          : null,
        license_number: customerData.license_number || customerData.licenseNumber || '',
        is_active: true,
        blacklisted: false
      };

      const { data, error } = await supabase
        .from('customers')
        .insert(processedData)
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
      // تحويل التواريخ إلى نصوص وإزالة الحقول المؤقتة
      const { nationalId, licenseExpiry, totalRentals, blacklistReason, licenseNumber, documents, blacklistDate, ...cleanData } = customerData;

      const processedData = {
        ...cleanData,
        license_expiry: cleanData.license_expiry 
          ? (typeof cleanData.license_expiry === 'string' 
              ? cleanData.license_expiry 
              : new Date(cleanData.license_expiry).toISOString().split('T')[0])
          : null,
      };

      const { data, error } = await supabase
        .from('customers')
        .update(processedData)
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
