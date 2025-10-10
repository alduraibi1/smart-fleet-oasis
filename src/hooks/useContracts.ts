import { useState, useEffect } from 'react';
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
  vat_included?: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // PDF URLs
  contract_pdf_url?: string;
  invoice_pdf_url?: string;
  handover_pdf_url?: string;
  return_pdf_url?: string;
  
  // Relations
  customer?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    national_id: string;
    license_number: string;
    license_expiry: string;
    nationality?: string;
    date_of_birth?: string;
    address?: string;
  };
  vehicle?: {
    id: string;
    plate_number: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    daily_rate: number;
    vin?: string;
  };
  
  // For print templates compatibility
  customers?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    national_id: string;
    license_number: string;
    license_expiry: string;
    nationality?: string;
    date_of_birth?: string;
    address?: string;
  };
  vehicles?: {
    id: string;
    plate_number: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    daily_rate: number;
    vin?: string;
  };
}

export interface ContractStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
  completed: number;
  totalRevenue: number;
  remainingAmount: number;
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
  vat_included?: boolean;
}

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ContractStats>({
    total: 0,
    active: 0,
    expired: 0,
    pending: 0,
    completed: 0,
    totalRevenue: 0,
    remainingAmount: 0,
    avgContractValue: 0,
    monthlyRevenue: 0,
  });
  const { toast } = useToast();

  // Generate unique contract number using RPC
  const generateContractNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_contract_number');
      if (error) {
        console.error('Error generating contract number:', error);
        // Fallback to client-side generation
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        return `CR-${year}-${random}`;
      }
      return data;
    } catch (error) {
      console.error('Error calling generate_contract_number RPC:', error);
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      return `CR-${year}-${random}`;
    }
  };

  // Fetch contracts with relations
  const fetchContracts = async (filters?: ContractFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('rental_contracts')
        .select(`
          *,
          customer:customers(
            id,
            name,
            phone,
            email,
            national_id,
            license_number,
            license_expiry,
            nationality,
            date_of_birth,
            address
          ),
          vehicle:vehicles(
            id,
            plate_number,
            brand,
            model,
            year,
            color,
            daily_rate,
            vin
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(`contract_number.ilike.%${filters.search}%`);
      }
      if (filters?.status) {
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

      const contractsData = (data || []).map(contract => {
        const customer = contract.customer || undefined;
        const vehicle = contract.vehicle || undefined;
        
        return {
          ...contract,
          customer,
          vehicle,
          // Add compatibility for print templates
          customers: customer,
          vehicles: vehicle,
        };
      }) as Contract[];

      setContracts(contractsData);
      calculateStats(contractsData);
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
  };

  // Calculate statistics
  const calculateStats = (contractsData: Contract[]) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const stats: ContractStats = {
      total: contractsData.length,
      active: contractsData.filter(c => c.status === 'active').length,
      expired: contractsData.filter(c => c.status === 'expired').length,
      pending: contractsData.filter(c => c.status === 'pending').length,
      completed: contractsData.filter(c => c.status === 'completed').length,
      totalRevenue: contractsData
        .filter(c => c.status === 'active' || c.status === 'completed')
        .reduce((sum, c) => sum + (c.paid_amount || 0), 0),
      remainingAmount: contractsData
        .filter(c => c.status === 'active' || c.status === 'pending')
        .reduce((sum, c) => sum + (c.remaining_amount || 0), 0),
      avgContractValue: contractsData.length > 0 
        ? contractsData.reduce((sum, c) => sum + c.total_amount, 0) / contractsData.length 
        : 0,
      monthlyRevenue: contractsData
        .filter(c => {
          const contractDate = new Date(c.created_at);
          return contractDate.getMonth() === currentMonth && 
                 contractDate.getFullYear() === currentYear &&
                 (c.status === 'active' || c.status === 'completed');
        })
        .reduce((sum, c) => sum + (c.paid_amount || 0), 0),
    };

    setStats(stats);
  };

  // Create new contract
  const createContract = async (contractData: CreateContractData) => {
    try {
      // التحقق المسبق: مدة العقد لا تقل عن 90 يوم
      const start = new Date(contractData.start_date);
      const end = new Date(contractData.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      console.log('[createContract] duration days:', days);
      if (isNaN(days) || days < 90) {
        toast({
          title: 'مدة العقد غير كافية',
          description: 'لا يمكن إنشاء عقد لمدة أقل من 90 يوماً',
          variant: 'destructive',
        });
        throw new Error('Contract duration must be at least 90 days');
      }

      const contractNumber = await generateContractNumber();

      // حساب الوديعة: حد أدنى 1000 ريال
      const deposit = Math.max(1000, contractData.deposit_amount ?? 1000);
      // Calculate paid and remaining amounts
      const paidAmount = deposit;
      const remainingAmount = Math.max(0, contractData.total_amount - paidAmount);

      const newContract = {
        ...contractData,
        contract_number: contractNumber,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        deposit_amount: deposit,
        insurance_amount: contractData.insurance_amount || 0,
        additional_charges: contractData.additional_charges || 0,
        discount_amount: contractData.discount_amount || 0,
        payment_method: contractData.payment_method || 'cash',
        payment_status: contractData.payment_status || 'pending',
        status: 'active',
      };

      console.log('[createContract] payload:', newContract);

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
            license_expiry,
            nationality,
            date_of_birth,
            address
          ),
          vehicle:vehicles(
            id,
            plate_number,
            brand,
            model,
            year,
            color,
            daily_rate,
            vin
          )
        `)
        .single();

      if (error) throw error;

      // Update vehicle status to rented
      await supabase
        .from('vehicles')
        .update({ status: 'rented' })
        .eq('id', contractData.vehicle_id);

      const customer = data.customer || undefined;
      const vehicle = data.vehicle || undefined;
      
      const newContractData = {
        ...data,
        customer,
        vehicle,
        customers: customer,
        vehicles: vehicle,
      } as Contract;

      setContracts(prev => [newContractData, ...prev]);
      calculateStats([newContractData, ...contracts]);

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
  };

  // Update contract
  const updateContract = async (id: string, updates: Partial<Contract>) => {
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
            license_expiry,
            nationality,
            date_of_birth,
            address
          ),
          vehicle:vehicles(
            id,
            plate_number,
            brand,
            model,
            year,
            color,
            daily_rate,
            vin
          )
        `)
        .single();

      if (error) throw error;

      const customer = data.customer || undefined;
      const vehicle = data.vehicle || undefined;
      
      const updatedContract = {
        ...data,
        customer,
        vehicle,
        customers: customer,
        vehicles: vehicle,
      } as Contract;

      setContracts(prev => 
        prev.map(contract => 
          contract.id === id ? { ...contract, ...updatedContract } : contract
        )
      );

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
  };

  // Complete contract (vehicle return)
  const completeContract = async (id: string, returnData: {
    actual_return_date: string;
    mileage_end?: number;
    fuel_level_end?: string;
    additional_charges?: number;
    notes?: string;
  }) => {
    try {
      const contract = contracts.find(c => c.id === id);
      if (!contract) throw new Error('Contract not found');

      const finalAmount = contract.total_amount + (returnData.additional_charges || 0);
      const remainingAmount = finalAmount - contract.paid_amount;

      const updates = {
        ...returnData,
        status: 'completed',
        total_amount: finalAmount,
        remaining_amount: remainingAmount,
        additional_charges: (contract.additional_charges || 0) + (returnData.additional_charges || 0),
      };

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
            license_expiry,
            nationality,
            date_of_birth,
            address
          ),
          vehicle:vehicles(
            id,
            plate_number,
            brand,
            model,
            year,
            color,
            daily_rate,
            vin
          )
        `)
        .single();

      if (error) throw error;

      // Update vehicle status to available
      await supabase
        .from('vehicles')
        .update({ 
          status: 'available',
          mileage: returnData.mileage_end || contract.mileage_start || 0
        })
        .eq('id', contract.vehicle_id);

      // استرداد الوديعة إذا لم تكن هناك أضرار
      const depositRefund = contract.deposit_amount || 0;
      const damagesCost = returnData.additional_charges || 0;
      const refundAmount = Math.max(0, depositRefund - damagesCost);

      if (refundAmount > 0) {
        // توليد رقم سند الصرف
        const { data: voucherNumber, error: voucherNumError } = await supabase
          .rpc('generate_voucher_number');

        if (!voucherNumError && voucherNumber) {
          // الحصول على معلومات المستخدم
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // إنشاء سند صرف لاسترداد الوديعة
            const { error: voucherError } = await supabase.from('payment_vouchers').insert({
              voucher_number: voucherNumber,
              recipient_type: 'customer',
              recipient_id: contract.customer_id,
              recipient_name: contract.customer?.name || data.customer?.name || 'عميل',
              amount: refundAmount,
              payment_method: contract.payment_method || 'cash',
              payment_date: returnData.actual_return_date,
              expense_category: 'deposit_refund',
              expense_type: 'refund',
              contract_id: contract.id,
              vehicle_id: contract.vehicle_id,
              description: `استرداد وديعة - العقد ${contract.contract_number}`,
              status: 'pending_approval',
              requested_by: user.id,
              issued_by: user.id,
              notes: damagesCost > 0 
                ? `تم خصم ${damagesCost.toLocaleString()} ر.س قيمة الأضرار من الوديعة. المبلغ المسترد: ${refundAmount.toLocaleString()} ر.س` 
                : `استرداد كامل للوديعة - لا توجد أضرار. المبلغ المسترد: ${refundAmount.toLocaleString()} ر.س`
            });

            if (!voucherError) {
              // تحديث رسالة النجاح لتشمل معلومات الاسترداد
              toast({
                title: '✅ تم إكمال العقد',
                description: `تم إرجاع المركبة بنجاح. مبلغ الاسترداد: ${refundAmount.toLocaleString()} ر.س`,
              });
            }
          }
        }
      }

      const customer = data.customer || undefined;
      const vehicle = data.vehicle || undefined;
      
      const updatedContract = {
        ...data,
        customer,
        vehicle,
        customers: customer,
        vehicles: vehicle,
      } as Contract;

      setContracts(prev => 
        prev.map(c => c.id === id ? updatedContract : c)
      );

      toast({
        title: 'تم بنجاح',
        description: 'تم إكمال العقد وإرجاع المركبة بنجاح',
      });

      return data;
    } catch (error) {
      console.error('Error completing contract:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إكمال العقد',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Cancel contract
  const cancelContract = async (id: string, reason: string) => {
    try {
      const contract = contracts.find(c => c.id === id);
      if (!contract) throw new Error('Contract not found');

      const { error } = await supabase
        .from('rental_contracts')
        .update({
          status: 'cancelled',
          notes: `${contract.notes || ''}\n\nسبب الإلغاء: ${reason}`,
        })
        .eq('id', id);

      if (error) throw error;

      // Update vehicle status to available
      await supabase
        .from('vehicles')
        .update({ status: 'available' })
        .eq('id', contract.vehicle_id);

      setContracts(prev => 
        prev.map(c => 
          c.id === id 
            ? { ...c, status: 'cancelled', notes: `${c.notes || ''}\n\nسبب الإلغاء: ${reason}` }
            : c
        )
      );

      toast({
        title: 'تم بنجاح',
        description: 'تم إلغاء العقد بنجاح',
      });
    } catch (error) {
      console.error('Error cancelling contract:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إلغاء العقد',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Get contract by ID
  const getContractById = async (id: string): Promise<Contract | null> => {
    try {
      const { data, error } = await supabase
        .from('rental_contracts')
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
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        customer: data.customer || undefined,
        vehicle: data.vehicle || undefined,
      } as Contract;
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  };

  // Get expired contracts (for notifications)
  const getExpiredContracts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('rental_contracts')
        .select(`
          *,
          customer:customers(name, phone),
          vehicle:vehicles(brand, model, plate_number)
        `)
        .lte('end_date', today)
        .eq('status', 'active');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching expired contracts:', error);
      return [];
    }
  };

  // Get contracts expiring soon (for notifications)
  const getExpiringContracts = async (daysAhead: number = 3) => {
    try {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('rental_contracts')
        .select(`
          *,
          customer:customers(name, phone),
          vehicle:vehicles(brand, model, plate_number)
        `)
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', futureDate.toISOString().split('T')[0])
        .eq('status', 'active');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  return {
    contracts,
    loading,
    stats,
    fetchContracts,
    createContract,
    updateContract,
    completeContract,
    cancelContract,
    getContractById,
    getExpiredContracts,
    getExpiringContracts,
  };
};
