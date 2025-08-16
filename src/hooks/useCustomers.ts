
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
        nationalId: customer.national_id || '', // للتوافق مع الكود القديم
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
        updated_at: customer.updated_at,
        
        // إضافة الحقول المطلوبة
        gender: customer.gender || 'male',
        marital_status: customer.marital_status || 'single',
        date_of_birth: customer.date_of_birth,
        license_number: customer.license_number || '',
        licenseNumber: customer.license_number || '', // للتوافق
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
        account_number: customer.account_number || '',
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
        tags: customer.tags || [],
        last_rental_date: customer.last_rental_date,
        blacklist_date: customer.blacklist_date ? new Date(customer.blacklist_date) : undefined,
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
      // تحويل التواريخ إلى نصوص
      const processedData = {
        ...customerData,
        license_expiry: customerData.license_expiry 
          ? (typeof customerData.license_expiry === 'string' 
              ? customerData.license_expiry 
              : customerData.license_expiry.toISOString().split('T')[0])
          : null,
        date_of_birth: customerData.date_of_birth
          ? (typeof customerData.date_of_birth === 'string' 
              ? customerData.date_of_birth 
              : customerData.date_of_birth.toISOString().split('T')[0])
          : null,
        license_issue_date: customerData.license_issue_date
          ? (typeof customerData.license_issue_date === 'string' 
              ? customerData.license_issue_date 
              : customerData.license_issue_date.toISOString().split('T')[0])
          : null,
        international_license_expiry: customerData.international_license_expiry
          ? (typeof customerData.international_license_expiry === 'string' 
              ? customerData.international_license_expiry 
              : customerData.international_license_expiry.toISOString().split('T')[0])
          : null,
        insurance_expiry: customerData.insurance_expiry
          ? (typeof customerData.insurance_expiry === 'string' 
              ? customerData.insurance_expiry 
              : customerData.insurance_expiry.toISOString().split('T')[0])
          : null,
        last_rental_date: customerData.last_rental_date
          ? (typeof customerData.last_rental_date === 'string' 
              ? customerData.last_rental_date 
              : customerData.last_rental_date.toISOString().split('T')[0])
          : null,
        blacklist_date: customerData.blacklist_date
          ? (typeof customerData.blacklist_date === 'string' 
              ? customerData.blacklist_date 
              : customerData.blacklist_date.toISOString().split('T')[0])
          : null,
      };

      // إزالة الحقول المؤقتة
      const { nationalId, licenseExpiry, totalRentals, blacklistReason, licenseNumber, documents, ...cleanData } = processedData;

      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...cleanData,
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
      // تحويل التواريخ إلى نصوص
      const processedData = {
        ...customerData,
        license_expiry: customerData.license_expiry 
          ? (typeof customerData.license_expiry === 'string' 
              ? customerData.license_expiry 
              : customerData.license_expiry.toISOString().split('T')[0])
          : null,
      };

      // إزالة الحقول المؤقتة
      const { nationalId, licenseExpiry, totalRentals, blacklistReason, licenseNumber, documents, ...cleanData } = processedData;

      const { data, error } = await supabase
        .from('customers')
        .update(cleanData)
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
