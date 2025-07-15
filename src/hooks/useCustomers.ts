import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Customer, CustomerStats, CustomerFilters } from '@/types/index';

export type { Customer } from '@/types/index';

export interface CustomerGuarantor {
  id: string;
  customer_id: string;
  name: string;
  name_english?: string;
  phone: string;
  phone_secondary?: string;
  email?: string;
  national_id: string;
  nationality: string;
  date_of_birth?: string;
  relation: string;
  job_title?: string;
  company?: string;
  work_phone?: string;
  monthly_income?: number;
  address?: string;
  city?: string;
  district?: string;
  postal_code?: string;
  country: string;
  license_number?: string;
  license_expiry?: string;
  bank_name?: string;
  account_number?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerDocument {
  id: string;
  customer_id: string;
  document_type: string;
  document_name: string;
  file_url?: string;
  file_name?: string;
  expiry_date?: string;
  status: string;
  notes?: string;
  uploaded_by?: string;
  upload_date: string;
  created_at: string;
  updated_at: string;
}

export interface RentalContract {
  id: string;
  contract_number: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  actual_return_date?: string;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  insurance_amount: number;
  additional_charges: number;
  discount_amount: number;
  payment_method: string;
  payment_status: string;
  paid_amount: number;
  remaining_amount: number;
  pickup_location?: string;
  return_location?: string;
  mileage_start?: number;
  mileage_end?: number;
  fuel_level_start?: string;
  fuel_level_end?: string;
  status: string;
  notes?: string;
  terms_conditions?: string;
  customer_signature?: string;
  employee_signature?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // علاقات
  customer?: Customer;
  vehicle?: any;
}

// دالة تحويل البيانات من قاعدة البيانات إلى الشكل المطلوب
const transformCustomerData = (dbCustomer: any): Customer => {
  return {
    ...dbCustomer,
    // إضافة الحقول للتوافق مع المكونات الحالية
    nationalId: dbCustomer.national_id || '',
    licenseNumber: dbCustomer.license_number || '',
    licenseExpiry: dbCustomer.license_expiry ? new Date(dbCustomer.license_expiry) : new Date(),
    totalRentals: dbCustomer.total_rentals || 0,
    blacklistReason: dbCustomer.blacklist_reason,
    blacklistDate: dbCustomer.blacklist_date ? new Date(dbCustomer.blacklist_date) : undefined,
    documents: [], // سيتم جلبها بشكل منفصل
    
    // إضافة القيم الافتراضية للحقول المطلوبة
    nationality: dbCustomer.nationality || 'سعودي',
    gender: dbCustomer.gender || 'male',
    marital_status: dbCustomer.marital_status || 'single',
    license_type: dbCustomer.license_type || 'private',
    international_license: dbCustomer.international_license || false,
    country: dbCustomer.country || 'السعودية',
    address_type: dbCustomer.address_type || 'residential',
    preferred_language: dbCustomer.preferred_language || 'ar',
    marketing_consent: dbCustomer.marketing_consent || false,
    sms_notifications: dbCustomer.sms_notifications !== false,
    email_notifications: dbCustomer.email_notifications !== false,
    customer_source: dbCustomer.customer_source || 'website',
    credit_limit: dbCustomer.credit_limit || 0,
    payment_terms: dbCustomer.payment_terms || 'immediate',
    preferred_payment_method: dbCustomer.preferred_payment_method || 'cash',
    has_insurance: dbCustomer.has_insurance || false,
    is_active: dbCustomer.is_active !== false,
    blacklisted: dbCustomer.blacklisted || false,
    total_rentals: dbCustomer.total_rentals || 0,
    rating: dbCustomer.rating || 5,
  };
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    blacklisted: 0,
    newThisMonth: 0,
    averageRating: 0,
    totalRentals: 0,
    averageRentalValue: 0,
  });
  const { toast } = useToast();

  // جلب العملاء
  const fetchCustomers = async (filters?: CustomerFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      // تطبيق الفلاتر
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters?.rating) {
        query = query.gte('rating', filters.rating);
      }
      if (filters?.status === 'active') {
        query = query.eq('is_active', true);
      } else if (filters?.status === 'inactive') {
        query = query.eq('is_active', false);
      }
      if (filters?.blacklisted !== undefined) {
        query = query.eq('blacklisted', filters.blacklisted);
      }
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.customer_source) {
        query = query.eq('customer_source', filters.customer_source);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedCustomers = (data || []).map(transformCustomerData);
      setCustomers(transformedCustomers);
      calculateStats(transformedCustomers);
    } catch (error) {
      console.error('خطأ في جلب العملاء:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في جلب العملاء',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات
  const calculateStats = (customerData: Customer[]) => {
    const total = customerData.length;
    const active = customerData.filter(c => c.is_active).length;
    const inactive = total - active;
    const blacklisted = customerData.filter(c => c.blacklisted).length;
    
    // العملاء الجدد هذا الشهر
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = customerData.filter(c => {
      const createdDate = new Date(c.created_at);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    const averageRating = total > 0 ? customerData.reduce((sum, c) => sum + c.rating, 0) / total : 0;
    const totalRentals = customerData.reduce((sum, c) => sum + c.total_rentals, 0);
    const averageRentalValue = 0; // يتم حسابها من العقود

    setStats({
      total,
      active,
      inactive,
      blacklisted,
      newThisMonth,
      averageRating,
      totalRentals,
      averageRentalValue,
    });
  };

  // إضافة عميل جديد
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => [transformCustomerData(data), ...prev]);
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة العميل بنجاح',
      });

      return data;
    } catch (error) {
      console.error('خطأ في إضافة العميل:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة العميل',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // تحديث عميل
  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id ? { ...customer, ...data } : customer
        )
      );

      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث العميل بنجاح',
      });

      return data;
    } catch (error) {
      console.error('خطأ في تحديث العميل:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث العميل',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // حذف عميل
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف العميل بنجاح',
      });
    } catch (error) {
      console.error('خطأ في حذف العميل:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف العميل',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // إضافة عميل للقائمة السوداء
  const blacklistCustomer = async (id: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          blacklisted: true,
          blacklist_reason: reason,
          blacklist_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id 
            ? { 
                ...customer, 
                blacklisted: true, 
                blacklist_reason: reason,
                blacklist_date: new Date().toISOString().split('T')[0]
              }
            : customer
        )
      );

      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة العميل للقائمة السوداء',
      });
    } catch (error) {
      console.error('خطأ في إضافة العميل للقائمة السوداء:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة العميل للقائمة السوداء',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // إزالة عميل من القائمة السوداء
  const removeFromBlacklist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          blacklisted: false,
          blacklist_reason: null,
          blacklist_date: null,
        })
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => 
        prev.map(customer => 
          customer.id === id 
            ? { 
                ...customer, 
                blacklisted: false, 
                blacklist_reason: undefined,
                blacklist_date: undefined
              }
            : customer
        )
      );

      toast({
        title: 'تم بنجاح',
        description: 'تم إزالة العميل من القائمة السوداء',
      });
    } catch (error) {
      console.error('خطأ في إزالة العميل من القائمة السوداء:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إزالة العميل من القائمة السوداء',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // جلب عميل بواسطة ID
  const getCustomerById = async (id: string): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return transformCustomerData(data);
    } catch (error) {
      console.error('خطأ في جلب العميل:', error);
      return null;
    }
  };

  // جلب عقود العميل
  const getCustomerContracts = async (customerId: string): Promise<RentalContract[]> => {
    try {
      const { data, error } = await supabase
        .from('rental_contracts')
        .select(`
          *,
          customer:customers(*),
          vehicle:vehicles(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('خطأ في جلب عقود العميل:', error);
      return [];
    }
  };

  // جلب وثائق العميل
  const getCustomerDocuments = async (customerId: string): Promise<CustomerDocument[]> => {
    try {
      const { data, error } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('خطأ في جلب وثائق العميل:', error);
      return [];
    }
  };

  // إضافة وثيقة للعميل
  const addCustomerDocument = async (documentData: Omit<CustomerDocument, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customer_documents')
        .insert([documentData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة الوثيقة بنجاح',
      });

      return data;
    } catch (error) {
      console.error('خطأ في إضافة الوثيقة:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة الوثيقة',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    stats,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    blacklistCustomer,
    removeFromBlacklist,
    getCustomerById,
    getCustomerContracts,
    getCustomerDocuments,
    addCustomerDocument,
  };
};