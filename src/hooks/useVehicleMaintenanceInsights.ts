
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

const fetchNextPrediction = async (vehicleId: string) => {
  const { data, error } = await supabase
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

  const lastMaintenanceQuery = useQuery({
    queryKey: ['vehicle-last-maintenance', vehicleId],
    queryFn: () => fetchLastMaintenance(vehicleId as string),
    enabled: !!vehicleId,
  });

  const nextPredictionQuery = useQuery({
    queryKey: ['vehicle-next-prediction', vehicleId],
    queryFn: () => fetchNextPrediction(vehicleId as string),
    enabled: !!vehicleId,
  });

  const generatePredictions = useMutation({
    mutationKey: ['generate-maintenance-predictions', vehicleId],
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('generate_maintenance_predictions', {
        p_vehicle_id: vehicleId,
      });
      if (error) {
        // Let the error bubble up for the UI to handle
        throw error;
      }
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
