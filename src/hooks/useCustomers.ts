
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

      // تحويل البيانات للتوافق مع النوع المطلوب - مبسط ونظيف
      const transformedCustomers: Customer[] = (data || []).map(customer => ({
        // الحقول الأساسية
        id: customer.id,
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        national_id: customer.national_id || '',
        nationality: customer.nationality || 'سعودي',
        city: customer.city || '',
        address: customer.address || '',
        
        // معلومات الرخصة
        license_number: customer.license_number || '',
        license_expiry: customer.license_expiry,
        license_type: customer.license_type || 'private',
        license_issue_date: customer.license_issue_date,
        
        // المعلومات الشخصية
        gender: customer.gender || 'male',
        marital_status: customer.marital_status || 'single',
        date_of_birth: customer.date_of_birth,
        
        // معلومات الاتصال والعنوان
        country: customer.country || 'السعودية',
        district: customer.district || '',
        postal_code: customer.postal_code || '',
        address_type: customer.address_type || 'residential',
        
        // التفضيلات
        preferred_language: customer.preferred_language || 'ar',
        marketing_consent: customer.marketing_consent || false,
        sms_notifications: customer.sms_notifications !== false,
        email_notifications: customer.email_notifications !== false,
        
        // معلومات إضافية
        customer_source: customer.customer_source || 'website',
        job_title: customer.job_title || '',
        company: customer.company || '',
        work_phone: customer.work_phone || '',
        monthly_income: customer.monthly_income || 0,
        
        // المعلومات المصرفية
        bank_name: customer.bank_name || '',
        bank_account_number: customer.bank_account_number || '',
        credit_limit: customer.credit_limit || 0,
        payment_terms: customer.payment_terms || 'immediate',
        preferred_payment_method: customer.preferred_payment_method || 'cash',
        
        // جهات الاتصال للطوارئ
        emergency_contact_name: customer.emergency_contact_name || '',
        emergency_contact_phone: customer.emergency_contact_phone || '',
        emergency_contact_relation: customer.emergency_contact_relation || '',
        
        // معلومات التأمين
        has_insurance: customer.has_insurance || false,
        insurance_company: customer.insurance_company || '',
        insurance_policy_number: customer.insurance_policy_number || '',
        insurance_expiry: customer.insurance_expiry,
        
        // الرخصة الدولية
        international_license: customer.international_license || false,
        international_license_expiry: customer.international_license_expiry,
        
        // حالة العميل
        is_active: customer.is_active ?? true,
        blacklisted: customer.blacklisted || false,
        blacklist_reason: customer.blacklist_reason || '',
        blacklist_date: customer.blacklist_date || '',
        rating: customer.rating || 5,
        total_rentals: customer.total_rentals || 0,
        last_rental_date: customer.last_rental_date,
        
        // الملاحظات والوثائق
        notes: customer.notes || '',
        documents: [], // Default empty array
        tags: [], // Default empty array
        
        // التواريخ
        created_at: customer.created_at,
        updated_at: customer.updated_at,
        
        // الحقول المكررة للتوافق (سيتم إزالتها لاحقاً)
        nationalId: customer.national_id || '',
        licenseExpiry: customer.license_expiry ? new Date(customer.license_expiry) : new Date(),
        totalRentals: customer.total_rentals || 0,
        blacklistReason: customer.blacklist_reason,
        blacklistDate: customer.blacklist_date ? new Date(customer.blacklist_date) : undefined,
        licenseNumber: customer.license_number || ''
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
    console.log('🚀 Starting addCustomer with data:', customerData);
    
    try {
      // التحقق من البيانات الأساسية
      if (!customerData.name || !customerData.phone || !customerData.national_id) {
        console.error('❌ Missing required fields');
        throw new Error('الحقول الأساسية مطلوبة: الاسم، الهاتف، رقم الهوية');
      }
      
      // إعداد البيانات للإدراج - تطابق schema قاعدة البيانات بالضبط
      const processedData = {
        // الحقول الأساسية
        name: customerData.name.trim(),
        phone: customerData.phone.trim(),
        email: customerData.email?.trim() || '',
        national_id: customerData.national_id.trim(),
        nationality: customerData.nationality || 'سعودي',
        
        // العنوان
        city: customerData.city?.trim() || '',
        address: customerData.address?.trim() || '',
        country: customerData.country || 'السعودية',
        district: customerData.district?.trim() || '',
        postal_code: customerData.postal_code?.trim() || '',
        address_type: customerData.address_type || 'residential',
        
        // الرخصة
        license_number: customerData.license_number?.trim() || '',
        license_expiry: customerData.license_expiry || null,
        license_type: customerData.license_type || 'private',
        license_issue_date: customerData.license_issue_date || null,
        international_license: customerData.international_license || false,
        international_license_expiry: customerData.international_license_expiry || null,
        
        // المعلومات الشخصية
        gender: customerData.gender || 'male',
        marital_status: customerData.marital_status || 'single',
        date_of_birth: customerData.date_of_birth || null,
        
        // التفضيلات
        preferred_language: customerData.preferred_language || 'ar',
        marketing_consent: customerData.marketing_consent || false,
        sms_notifications: customerData.sms_notifications !== false,
        email_notifications: customerData.email_notifications !== false,
        
        // معلومات العمل
        customer_source: customerData.customer_source || 'website',
        job_title: customerData.job_title?.trim() || '',
        company: customerData.company?.trim() || '',
        work_phone: customerData.work_phone?.trim() || '',
        monthly_income: customerData.monthly_income || 0,
        
        // المعلومات المصرفية
        bank_name: customerData.bank_name?.trim() || '',
        bank_account_number: customerData.bank_account_number?.trim() || '',
        credit_limit: customerData.credit_limit || 0,
        payment_terms: customerData.payment_terms || 'immediate',
        preferred_payment_method: customerData.preferred_payment_method || 'cash',
        
        // جهات الاتصال للطوارئ
        emergency_contact_name: customerData.emergency_contact_name?.trim() || '',
        emergency_contact_phone: customerData.emergency_contact_phone?.trim() || '',
        emergency_contact_relation: customerData.emergency_contact_relation?.trim() || '',
        
        // التأمين
        has_insurance: customerData.has_insurance || false,
        insurance_company: customerData.insurance_company?.trim() || '',
        insurance_policy_number: customerData.insurance_policy_number?.trim() || '',
        insurance_expiry: customerData.insurance_expiry || null,
        
        // الملاحظات
        notes: customerData.notes?.trim() || '',
        
        // القيم الافتراضية
        is_active: true,
        blacklisted: false,
        rating: 5,
        total_rentals: 0
      };

      console.log('📝 Processed data for database:', processedData);

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
      console.error('💥 Error in addCustomer:', error);
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
      // تنظيف البيانات وإزالة الحقول المكررة
      const cleanData = {
        name: customerData.name?.trim(),
        phone: customerData.phone?.trim(),
        email: customerData.email?.trim() || '',
        national_id: customerData.national_id?.trim(),
        nationality: customerData.nationality,
        city: customerData.city?.trim(),
        address: customerData.address?.trim(),
        license_number: customerData.license_number?.trim(),
        license_expiry: customerData.license_expiry,
        license_type: customerData.license_type,
        license_issue_date: customerData.license_issue_date,
        gender: customerData.gender,
        marital_status: customerData.marital_status,
        date_of_birth: customerData.date_of_birth,
        country: customerData.country,
        district: customerData.district?.trim(),
        postal_code: customerData.postal_code?.trim(),
        address_type: customerData.address_type,
        preferred_language: customerData.preferred_language,
        marketing_consent: customerData.marketing_consent,
        sms_notifications: customerData.sms_notifications,
        email_notifications: customerData.email_notifications,
        customer_source: customerData.customer_source,
        job_title: customerData.job_title?.trim(),
        company: customerData.company?.trim(),
        work_phone: customerData.work_phone?.trim(),
        monthly_income: customerData.monthly_income,
        bank_name: customerData.bank_name?.trim(),
        bank_account_number: customerData.bank_account_number?.trim(),
        credit_limit: customerData.credit_limit,
        payment_terms: customerData.payment_terms,
        preferred_payment_method: customerData.preferred_payment_method,
        emergency_contact_name: customerData.emergency_contact_name?.trim(),
        emergency_contact_phone: customerData.emergency_contact_phone?.trim(),
        emergency_contact_relation: customerData.emergency_contact_relation?.trim(),
        has_insurance: customerData.has_insurance,
        insurance_company: customerData.insurance_company?.trim(),
        insurance_policy_number: customerData.insurance_policy_number?.trim(),
        insurance_expiry: customerData.insurance_expiry,
        international_license: customerData.international_license,
        international_license_expiry: customerData.international_license_expiry,
        notes: customerData.notes?.trim()
      };

      // إزالة القيم undefined
      const processedData = Object.fromEntries(
        Object.entries(cleanData).filter(([_, value]) => value !== undefined)
      );

      const { data, error } = await supabase
        .from('customers')
        .update(processedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await refetch();
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات العميل بنجاح"
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error updating customer:', error);
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
