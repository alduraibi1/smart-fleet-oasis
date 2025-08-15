
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VehicleOption {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
}

export interface OwnerOption {
  id: string;
  name: string;
}

export interface CustomerOption {
  id: string;
  name: string;
  phone: string | null;
}

export interface VehicleProfitabilityResult {
  vehicle_id: string;
  vehicle_info: any;
  total_revenue: number;
  rental_revenue: number;
  additional_charges: number;
  total_expenses: number;
  maintenance_costs: number;
  fuel_costs: number;
  insurance_costs: number;
  depreciation_costs: number;
  distributed_hr_costs: number;
  owner_commission: number;
  other_expenses: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  roi: number;
  utilization_rate: number;
  total_rental_days: number;
  average_daily_rate: number;
  break_even_days: number;
}

export interface OwnerProfitabilityResult {
  owner_id: string;
  owner_info: any;
  vehicle_count: number;
  total_revenue: number;
  owner_share: number;
  company_share: number;
  total_expenses: number;
  maintenance_expenses: number;
  distributed_hr_costs: number;
  other_expenses: number;
  net_profit: number;
  profit_margin: number;
  roi: number;
  avg_revenue_per_vehicle: number;
  utilization_rate: number;
  vehicles_details: any;
}

export interface CustomerProfitabilityResult {
  customer_id: string;
  customer_info: any;
  total_contracts: number;
  total_revenue: number;
  total_paid: number;
  outstanding_amount: number;
  total_rental_days: number;
  average_contract_value: number;
  average_daily_rate: number;
  customer_lifetime_value: number;
  payment_behavior_score: number;
  preferred_vehicle_types: any;
  seasonal_patterns: any;
  profitability_rank: string;
}

// Helpers
const toISO = (d: Date) => d.toISOString().slice(0, 10);

// Lists
export const useVehiclesList = () => {
  return useQuery({
    queryKey: ['vehicles-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, plate_number, brand, model')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as VehicleOption[];
    },
  });
};

export const useOwnersList = () => {
  return useQuery({
    queryKey: ['owners-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_owners')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []) as OwnerOption[];
    },
  });
};

export const useCustomersList = () => {
  return useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as CustomerOption[];
    },
  });
};

// RPC hooks
export const useVehicleProfitability = (vehicleId?: string, start?: Date, end?: Date) => {
  return useQuery({
    queryKey: ['vehicle-profitability', vehicleId, start ? toISO(start) : null, end ? toISO(end) : null],
    enabled: !!vehicleId && !!start && !!end,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_vehicle_profitability' as any, {
        p_vehicle_id: vehicleId,
        p_start_date: toISO(start!),
        p_end_date: toISO(end!),
      });
      if (error) throw error;
      return (data?.[0] || null) as VehicleProfitabilityResult | null;
    },
    meta: {
      onError: (err: unknown) => {
        console.error('Vehicle profitability error', err);
      },
    },
  });
};

export const useOwnerProfitability = (ownerId?: string, start?: Date, end?: Date) => {
  return useQuery({
    queryKey: ['owner-profitability', ownerId, start ? toISO(start) : null, end ? toISO(end) : null],
    enabled: !!ownerId && !!start && !!end,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_owner_profitability' as any, {
        p_owner_id: ownerId,
        p_start_date: toISO(start!),
        p_end_date: toISO(end!),
      });
      if (error) throw error;
      return (data?.[0] || null) as OwnerProfitabilityResult | null;
    },
    meta: {
      onError: (err: unknown) => {
        console.error('Owner profitability error', err);
      },
    },
  });
};

export const useCustomerProfitability = (customerId?: string, start?: Date, end?: Date) => {
  return useQuery({
    queryKey: ['customer-profitability', customerId, start ? toISO(start) : null, end ? toISO(end) : null],
    enabled: !!customerId && !!start && !!end,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_customer_profitability' as any, {
        p_customer_id: customerId,
        p_start_date: toISO(start!),
        p_end_date: toISO(end!),
      });
      if (error) throw error;
      return (data?.[0] || null) as CustomerProfitabilityResult | null;
    },
    meta: {
      onError: (err: unknown) => {
        console.error('Customer profitability error', err);
      },
    },
  });
};
