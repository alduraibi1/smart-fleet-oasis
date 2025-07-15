import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Customer, CustomerStats, CustomerFilters } from '@/types/index';

// دالة تحويل البيانات من قاعدة البيانات إلى الشكل المطلوب
const transformCustomerData = (dbCustomer: any): Customer => {
  return {
    ...dbCustomer,
    nationalId: dbCustomer.national_id || '',
    licenseNumber: dbCustomer.license_number || '',
    licenseExpiry: dbCustomer.license_expiry ? new Date(dbCustomer.license_expiry) : new Date(),
    totalRentals: dbCustomer.total_rentals || 0,
    blacklistReason: dbCustomer.blacklist_reason,
    blacklistDate: dbCustomer.blacklist_date ? new Date(dbCustomer.blacklist_date) : undefined,
    documents: [],
    
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

// حساب الإحصائيات
const calculateStats = (customers: Customer[]): CustomerStats => {
  const total = customers.length;
  const active = customers.filter(c => c.is_active).length;
  const inactive = total - active;
  const blacklisted = customers.filter(c => c.blacklisted).length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newThisMonth = customers.filter(c => {
    const createdDate = new Date(c.created_at);
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
  }).length;

  const averageRating = total > 0 ? customers.reduce((sum, c) => sum + c.rating, 0) / total : 0;
  const totalRentals = customers.reduce((sum, c) => sum + c.total_rentals, 0);

  return {
    total,
    active,
    inactive,
    blacklisted,
    newThisMonth,
    averageRating,
    totalRentals,
    averageRentalValue: 0,
  };
};

// جلب العملاء مع التصفح
const fetchCustomers = async (filters: CustomerFilters & { page?: number; pageSize?: number }) => {
  const { page = 0, pageSize = 20, ...restFilters } = filters;
  
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  // تطبيق الفلاتر
  if (restFilters.search) {
    query = query.or(`name.ilike.%${restFilters.search}%,phone.ilike.%${restFilters.search}%,email.ilike.%${restFilters.search}%`);
  }
  if (restFilters.rating) {
    query = query.gte('rating', restFilters.rating);
  }
  if (restFilters.status === 'active') {
    query = query.eq('is_active', true);
  } else if (restFilters.status === 'inactive') {
    query = query.eq('is_active', false);
  }
  if (restFilters.blacklisted !== undefined) {
    query = query.eq('blacklisted', restFilters.blacklisted);
  }
  if (restFilters.city) {
    query = query.eq('city', restFilters.city);
  }
  if (restFilters.customer_source) {
    query = query.eq('customer_source', restFilters.customer_source);
  }

  const { data, error, count } = await query;
  
  if (error) throw error;

  const transformedCustomers = (data || []).map(transformCustomerData);
  
  return {
    customers: transformedCustomers,
    total: count || 0,
    hasMore: (page + 1) * pageSize < (count || 0),
    page,
    pageSize,
  };
};

// جلب جميع العملاء للإحصائيات
const fetchAllCustomersForStats = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*');
    
  if (error) throw error;
  return (data || []).map(transformCustomerData);
};

// Hook للعملاء مع التصفح
export const useCustomersPaginated = (filters: CustomerFilters = {}, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['customers', 'paginated', filters],
    queryFn: ({ pageParam = 0 }) => 
      fetchCustomers({ ...filters, page: pageParam as number, pageSize }),
    getNextPageParam: (lastPage: any) => 
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook للعملاء العادي
export const useCustomers = (filters: CustomerFilters = {}) => {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => fetchCustomers({ ...filters, page: 0, pageSize: 1000 }),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook للإحصائيات
export const useCustomersStats = () => {
  return useQuery({
    queryKey: ['customers', 'stats'],
    queryFn: async (): Promise<CustomerStats> => {
      const customers = await fetchAllCustomersForStats();
      return calculateStats(customers);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook لعميل واحد
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async (): Promise<Customer | null> => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return transformCustomerData(data);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

// Hook لعقود العميل
export const useCustomerContracts = (customerId: string) => {
  return useQuery({
    queryKey: ['customer', customerId, 'contracts'],
    queryFn: async () => {
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
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook لوثائق العميل
export const useCustomerDocuments = (customerId: string) => {
  return useQuery({
    queryKey: ['customer', customerId, 'documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_documents')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutations للعمليات
export const useCustomerMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addCustomer = useMutation({
    mutationFn: async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;
      return transformCustomerData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة العميل بنجاح',
      });
    },
    onError: (error) => {
      console.error('خطأ في إضافة العميل:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة العميل',
        variant: 'destructive',
      });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Customer> }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return transformCustomerData(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.setQueryData(['customer', data.id], data);
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث العميل بنجاح',
      });
    },
    onError: (error) => {
      console.error('خطأ في تحديث العميل:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث العميل',
        variant: 'destructive',
      });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف العميل بنجاح',
      });
    },
    onError: (error) => {
      console.error('خطأ في حذف العميل:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف العميل',
        variant: 'destructive',
      });
    },
  });

  const blacklistCustomer = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('customers')
        .update({
          blacklisted: true,
          blacklist_reason: reason,
          blacklist_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', id);

      if (error) throw error;
      return { id, reason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة العميل للقائمة السوداء',
      });
    },
    onError: (error) => {
      console.error('خطأ في إضافة العميل للقائمة السوداء:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة العميل للقائمة السوداء',
        variant: 'destructive',
      });
    },
  });

  const removeFromBlacklist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .update({
          blacklisted: false,
          blacklist_reason: null,
          blacklist_date: null,
        })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إزالة العميل من القائمة السوداء',
      });
    },
    onError: (error) => {
      console.error('خطأ في إزالة العميل من القائمة السوداء:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إزالة العميل من القائمة السوداء',
        variant: 'destructive',
      });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<Customer> }) => {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .in('id', ids);

      if (error) throw error;
      return { ids, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث العملاء المحددين بنجاح',
      });
    },
    onError: (error) => {
      console.error('خطأ في التحديث المجمع:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث العملاء المحددين',
        variant: 'destructive',
      });
    },
  });

  return {
    addCustomer,
    updateCustomer,
    deleteCustomer,
    blacklistCustomer,
    removeFromBlacklist,
    bulkUpdate,
  };
};

// Hook للتحديثات المباشرة
export const useCustomersRealtime = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['customers', 'realtime'],
    queryFn: async () => {
      // إعداد التحديثات المباشرة
      const channel = supabase
        .channel('customers-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'customers',
          },
          (payload) => {
            console.log('Customer change detected:', payload);
            queryClient.invalidateQueries({ queryKey: ['customers'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
    staleTime: Infinity,
  });
};