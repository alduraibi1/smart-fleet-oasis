
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VehiclePerformance {
  id: string;
  plateNumber: string;
  model: string;
  revenue: number;
  utilization: number;
  contracts: number;
}

export const useTopVehicles = () => {
  const [topVehicles, setTopVehicles] = useState<VehiclePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopVehicles = async () => {
    try {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, plate_number, brand, model')
        .eq('is_active', true);

      if (!vehicles) return;

      const vehiclePerformance: VehiclePerformance[] = [];

      for (const vehicle of vehicles) {
        const { data: contracts } = await supabase
          .from('rental_contracts')
          .select('id, total_amount')
          .eq('vehicle_id', vehicle.id);

        const contractIds = contracts?.map(c => c.id) || [];
        
        let receipts: any[] = [];
        if (contractIds.length > 0) {
          const { data: receiptsData } = await supabase
            .from('payment_receipts')
            .select('amount')
            .in('contract_id', contractIds)
            .eq('status', 'confirmed');
          
          receipts = receiptsData || [];
        }

        const contractsCount = contracts?.length || 0;
        const revenue = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
        const utilization = contractsCount > 0 ? Math.min((contractsCount / 10) * 100, 100) : 0;

        vehiclePerformance.push({
          id: vehicle.id,
          plateNumber: vehicle.plate_number || '',
          model: `${vehicle.brand || ''} ${vehicle.model || ''}`.trim(),
          revenue,
          utilization,
          contracts: contractsCount,
        });
      }

      const sortedVehicles = vehiclePerformance
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopVehicles(sortedVehicles);
    } catch (error) {
      console.error('Error fetching top vehicles:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTopVehicles();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    topVehicles,
    loading,
    refetch: fetchTopVehicles,
  };
};
