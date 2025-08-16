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
        bank_account_number: customer.bank_account_number || '',
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
    console.log('🚀 Starting addCustomer function with data:', customerData);
    
    try {
      // التأكد من وجود البيانات الأساسية
      if (!customerData.name || !customerData.phone || !customerData.national_id) {
        console.error('❌ Missing required fields:', {
          name: customerData.name,
          phone: customerData.phone,
          national_id: customerData.national_id
        });
        
        throw new Error('الحقول الأساسية مطلوبة: الاسم، الهاتف، رقم الهوية');
      }
      
      // إعداد البيانات للإدراج - استخدام البيانات كما هي من النموذج
      const processedData = {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || '',
        national_id: customerData.national_id,
        nationality: customerData.nationality || 'سعودي',
        city: customerData.city || '',
        address: customerData.address || '',
        license_number: customerData.license_number || '',
        license_expiry: customerData.license_expiry || null,
        gender: customerData.gender || 'male',
        marital_status: customerData.marital_status || 'single',
        date_of_birth: customerData.date_of_birth || null,
        license_type: customerData.license_type || 'private',
        license_issue_date: customerData.license_issue_date || null,
        international_license: customerData.international_license || false,
        international_license_expiry: customerData.international_license_expiry || null,
        country: customerData.country || 'السعودية',
        district: customerData.district || '',
        postal_code: customerData.postal_code || '',
        address_type: customerData.address_type || 'residential',
        preferred_language: customerData.preferred_language || 'ar',
        marketing_consent: customerData.marketing_consent || false,
        sms_notifications: customerData.sms_notifications !== false,
        email_notifications: customer.email_notifications !== false,
        customer_source: customerData.customer_source || 'website',
        job_title: customerData.job_title || '',
        company: customerData.company || '',
        work_phone: customerData.work_phone || '',
        monthly_income: customerData.monthly_income || 0,
        bank_name: customerData.bank_name || '',
        bank_account_number: customerData.bank_account_number || '',
        credit_limit: customerData.credit_limit || 0,
        payment_terms: customerData.payment_terms || 'immediate',
        preferred_payment_method: customerData.preferred_payment_method || 'cash',
        emergency_contact_name: customerData.emergency_contact_name || '',
        emergency_contact_phone: customerData.emergency_contact_phone || '',
        emergency_contact_relation: customerData.emergency_contact_relation || '',
        has_insurance: customerData.has_insurance || false,
        insurance_company: customerData.insurance_company || '',
        insurance_policy_number: customerData.insurance_policy_number || '',
        insurance_expiry: customerData.insurance_expiry || null,
        notes: customerData.notes || '',
        is_active: true,
        blacklisted: false,
        rating: 5,
        total_rentals: 0
      };

      console.log('📝 Final processed data for database:', processedData);

      const { data, error } = await supabase
        .from('customers')
        .insert(processedData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Customer added successfully:', data);
      await refetch();
      
      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة العميل الجديد بنجاح"
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('💥 Error in addCustomer function:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في إضافة العميل",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
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

  const addToBlacklist = async (id: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          blacklisted: true,
          blacklist_reason: reason,
          blacklist_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      await refetch();
      return { success: true };
    } catch (error) {
      console.error('Error adding customer to blacklist:', error);
      return { success: false, error };
    }
  };

  const removeFromBlacklist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ 
          blacklisted: false,
          blacklist_reason: null,
          blacklist_date: null
        })
        .eq('id', id);

      if (error) throw error;

      await refetch();
      return { success: true };
    } catch (error) {
      console.error('Error removing customer from blacklist:', error);
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
    deleteCustomer,
    addToBlacklist,
    removeFromBlacklist
  };
};
