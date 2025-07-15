import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Contract {
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
  
  // Relations
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    national_id: string;
    license_number: string;
    license_expiry: string;
  };
  vehicle?: {
    id: string;
    plate_number: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    daily_rate: number;
  };
}

export interface ContractStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  completed: number;
  totalRevenue: number;
  avgContractValue: number;
  monthlyRevenue: number;
}

export interface ContractFilters {
  search?: string;
  status?: string;
  contractType?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  vehicleId?: string;
  page?: number;
  limit?: number;
}

export interface CreateContractData {
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  deposit_amount?: number;
  insurance_amount?: number;
  additional_charges?: number;
  discount_amount?: number;
  payment_method?: string;
  payment_status?: string;
  pickup_location?: string;
  return_location?: string;
  mileage_start?: number;
  fuel_level_start?: string;
  notes?: string;
  terms_conditions?: string;
}

// Cache للبيانات
const contractsCache = new Map<string, { data: Contract[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20); // Pagination size
  const { toast } = useToast();

  // Memoized stats calculation
  const stats = useMemo<ContractStats>(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'active').length,
      expired: contracts.filter(c => c.status === 'expired').length,
      pending: contracts.filter(c => c.status === 'pending').length,
      completed: contracts.filter(c => c.status === 'completed').length,
      totalRevenue: contracts
        .filter(c => c.status === 'active' || c.status === 'completed')
        .reduce((sum, c) => sum + c.total_amount, 0),
      avgContractValue: contracts.length > 0 
        ? contracts.reduce((sum, c) => sum + c.total_amount, 0) / contracts.length 
        : 0,
      monthlyRevenue: contracts
        .filter(c => {
          const contractDate = new Date(c.created_at);
          return contractDate.getMonth() === currentMonth && 
                 contractDate.getFullYear() === currentYear &&
                 (c.status === 'active' || c.status === 'completed');
        })
        .reduce((sum, c) => sum + c.total_amount, 0),
    };
  }, [contracts]);

  // Generate unique contract number
  const generateContractNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CR-${year}${month}-${random}`;
  }, []);

  // Check cache validity
  const isCacheValid = useCallback((cacheKey: string) => {
    const cached = contractsCache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
  }, []);

  // Generate cache key
  const generateCacheKey = useCallback((filters?: ContractFilters) => {
    return JSON.stringify(filters || {});
  }, []);

  // Optimized fetch with pagination and caching
  const fetchContracts = useCallback(async (filters?: ContractFilters, useCache = true) => {
    const cacheKey = generateCacheKey(filters);
    
    // Check cache first
    if (useCache && isCacheValid(cacheKey)) {
      const cached = contractsCache.get(cacheKey)!;
      setContracts(cached.data);
      return;
    }

    setLoading(true);
    try {
      const page = filters?.page || currentPage;
      const limit = filters?.limit || pageSize;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Count query for pagination
      let countQuery = supabase
        .from('rental_contracts')
        .select('*', { count: 'exact', head: true });

      // Apply filters to count query
      if (filters?.search) {
        countQuery = countQuery.or(`contract_number.ilike.%${filters.search}%`);
      }
      if (filters?.status && filters.status !== 'all') {
        countQuery = countQuery.eq('status', filters.status);
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Main query with optimized selection
      let query = supabase
        .from('rental_contracts')
        .select(`
          id,
          contract_number,
          customer_id,
          vehicle_id,
          start_date,
          end_date,
          actual_return_date,
          daily_rate,
          total_amount,
          deposit_amount,
          insurance_amount,
          additional_charges,
          discount_amount,
          payment_method,
          payment_status,
          paid_amount,
          remaining_amount,
          pickup_location,
          return_location,
          mileage_start,
          mileage_end,
          fuel_level_start,
          fuel_level_end,
          status,
          notes,
          terms_conditions,
          customer_signature,
          employee_signature,
          signed_at,
          created_at,
          updated_at,
          created_by,
          customer:customers!inner(
            id,
            name,
            phone,
            email,
            national_id,
            license_number,
            license_expiry
          ),
          vehicle:vehicles!inner(
            id,
            plate_number,
            brand,
            model,
            year,
            color,
            daily_rate
          )
        `)
        .range(from, to)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`contract_number.ilike.%${filters.search}%`);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('end_date', filters.endDate);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.vehicleId) {
        query = query.eq('vehicle_id', filters.vehicleId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const contractsData = (data || []).map(contract => ({
        ...contract,
        customer: contract.customer || undefined,
        vehicle: contract.vehicle || undefined,
      })) as Contract[];

      setContracts(contractsData);
      
      // Cache the results
      contractsCache.set(cacheKey, {
        data: contractsData,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب العقود',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, generateCacheKey, isCacheValid, toast]);

  // Debounced search function
  const searchContracts = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (searchTerm: string, filters?: Omit<ContractFilters, 'search'>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          fetchContracts({ ...filters, search: searchTerm, page: 1 }, false);
        }, 300);
      };
    })(),
    [fetchContracts]
  );

  // Optimized create contract
  const createContract = useCallback(async (contractData: CreateContractData) => {
    try {
      const contractNumber = generateContractNumber();
      
      const paidAmount = contractData.deposit_amount || 0;
      const remainingAmount = contractData.total_amount - paidAmount;

      const newContract = {
        ...contractData,
        contract_number: contractNumber,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        deposit_amount: contractData.deposit_amount || 0,
        insurance_amount: contractData.insurance_amount || 0,
        additional_charges: contractData.additional_charges || 0,
        discount_amount: contractData.discount_amount || 0,
        payment_method: contractData.payment_method || 'cash',
        payment_status: contractData.payment_status || 'pending',
        status: 'active',
      };

      const { data, error } = await supabase
        .from('rental_contracts')
        .insert([newContract])
        .select(`
          *,
          customer:customers(
            id,
            name,
            phone,
            email,
            national_id,
            license_number,
            license_expiry
          ),
          vehicle:vehicles(
            id,
            plate_number,
            brand,
            model,
            year,
            color,
            daily_rate
          )
        `)
        .single();

      if (error) throw error;

      // Update vehicle status
      await supabase
        .from('vehicles')
        .update({ status: 'rented' })
        .eq('id', contractData.vehicle_id);

      const newContractData = {
        ...data,
        customer: data.customer || undefined,
        vehicle: data.vehicle || undefined,
      } as Contract;

      // Update local state
      setContracts(prev => [newContractData, ...prev.slice(0, pageSize - 1)]);
      
      // Clear cache
      contractsCache.clear();

      toast({
        title: 'تم بنجاح',
        description: `تم إنشاء العقد ${contractNumber} بنجاح`,
      });

      return data;
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء العقد',
        variant: 'destructive',
      });
      throw error;
    }
  }, [generateContractNumber, pageSize, toast]);

  // Optimized update contract
  const updateContract = useCallback(async (id: string, updates: Partial<Contract>) => {
    try {
      const { data, error } = await supabase
        .from('rental_contracts')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          customer:customers(
            id,
            name,
            phone,
            email,
            national_id,
            license_number,
            license_expiry
          ),
          vehicle:vehicles(
            id,
            plate_number,
            brand,
            model,
            year,
            color,
            daily_rate
          )
        `)
        .single();

      if (error) throw error;

      const updatedContract = {
        ...data,
        customer: data.customer || undefined,
        vehicle: data.vehicle || undefined,
      } as Contract;

      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? { ...contract, ...updatedContract } : contract
        )
      );

      // Clear cache
      contractsCache.clear();

      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث العقد بنجاح',
      });

      return data;
    } catch (error) {
      console.error('Error updating contract:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث العقد',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Pagination handlers
  const nextPage = useCallback(() => {
    const maxPage = Math.ceil(totalCount / pageSize);
    if (currentPage < maxPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalCount, pageSize]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    const maxPage = Math.ceil(totalCount / pageSize);
    if (page >= 1 && page <= maxPage) {
      setCurrentPage(page);
    }
  }, [totalCount, pageSize]);

  // Load contracts when page changes
  useEffect(() => {
    fetchContracts({ page: currentPage });
  }, [currentPage, fetchContracts]);

  return {
    contracts,
    loading,
    stats,
    totalCount,
    currentPage,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    fetchContracts,
    searchContracts,
    createContract,
    updateContract,
    nextPage,
    prevPage,
    goToPage,
    // Additional utility functions can be added here
    refreshCache: () => contractsCache.clear(),
    cacheSize: contractsCache.size,
  };
};