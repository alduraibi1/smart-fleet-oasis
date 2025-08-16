
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type LastMaintenance = {
  id: string;
  total_cost: number | null;
  completed_date: string | null;
};

type Prediction = {
  id: string;
  prediction_type: string;
  predicted_date: string | null;
  predicted_mileage: number | null;
  confidence_score: number | null;
  recommendations: any;
  status: string;
};

const fetchLastMaintenance = async (vehicleId: string) => {
  const { data, error } = await supabase
    .from('vehicle_maintenance')
    .select('id,total_cost,completed_date,status')
    .eq('vehicle_id', vehicleId)
    .eq('status', 'completed')
    .order('completed_date', { ascending: false })
    .limit(1);

  if (error) throw error;
  return (data?.[0] as LastMaintenance | undefined) ?? undefined;
};

// NOTE: نستخدم cast إلى any لأن جدول maintenance_predictions غير معرف في types حالياً
const fetchNextPrediction = async (vehicleId: string) => {
  const { data, error } = await (supabase as any)
    .from('maintenance_predictions')
    .select('id,prediction_type,predicted_date,predicted_mileage,confidence_score,recommendations,status')
    .eq('vehicle_id', vehicleId)
    .eq('status', 'active')
    .order('predicted_date', { ascending: true })
    .limit(1);

  if (error) throw error;
  return (data?.[0] as Prediction | undefined) ?? undefined;
};

export const useVehicleMaintenanceInsights = (vehicleId?: string) => {
  const queryClient = useQueryClient();

  const lastMaintenanceQuery = useQuery<LastMaintenance | undefined>({
    queryKey: ['vehicle-last-maintenance', vehicleId],
    queryFn: () => fetchLastMaintenance(vehicleId as string),
    enabled: !!vehicleId,
  });

  const nextPredictionQuery = useQuery<Prediction | undefined>({
    queryKey: ['vehicle-next-prediction', vehicleId],
    queryFn: () => fetchNextPrediction(vehicleId as string),
    enabled: !!vehicleId,
  });

  const generatePredictions = useMutation({
    mutationKey: ['generate-maintenance-predictions', vehicleId],
    mutationFn: async () => {
      if (!vehicleId) return;
      // NOTE: نستخدم cast إلى any لأن الدالة غير معرفة في types حالياً
      const { data, error } = await (supabase as any).rpc('generate_maintenance_predictions', {
        p_vehicle_id: vehicleId,
      });
      if (error) {
        console.log('Prediction generation failed', error);
        throw error;
      }
      console.log('Prediction generation result', data);
      return data;
    },
    onError: (error: unknown) => {
      console.log('Prediction generation failed', error);
    },
    onSettled: async () => {
      // Refresh prediction & last maintenance after generation
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vehicle-next-prediction', vehicleId] }),
        queryClient.invalidateQueries({ queryKey: ['vehicle-last-maintenance', vehicleId] }),
      ]);
    },
  });

  return {
    lastMaintenance: lastMaintenanceQuery.data,
    lastLoading: lastMaintenanceQuery.isLoading,
    prediction: nextPredictionQuery.data,
    predictionLoading: nextPredictionQuery.isLoading,
    generatePredictions,
  };
};
