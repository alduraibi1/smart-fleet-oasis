
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CurrentLocation {
  id: string;
  vehicle_id: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  last_updated: string | null;
  is_tracked: boolean;
}

export interface LocationHistoryItem {
  id: string;
  vehicle_id: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  speed: number | null;
  direction: number | null;
  fuel_level: number | null;
  engine_status: string | null;
  recorded_at: string;
  source: string | null;
}

export const useVehicleLocation = (vehicleId?: string) => {
  const [current, setCurrent] = useState<CurrentLocation | null>(null);
  const [history, setHistory] = useState<LocationHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    if (!vehicleId) return;
    setLoading(true);
    try {
      // Current location
      const { data: currentData, error: currentErr } = await supabase
        .from('vehicle_location')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .maybeSingle();

      if (currentErr) {
        console.error('Error fetching current location:', currentErr);
      }

      if (currentData) {
        setCurrent(currentData as unknown as CurrentLocation);
      } else {
        setCurrent(null);
      }

      // History (last 10 points)
      const { data: historyData, error: historyErr } = await supabase
        .from('vehicle_location_history')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('recorded_at', { ascending: false })
        .limit(10);

      if (historyErr) {
        console.error('Error fetching location history:', historyErr);
      }

      setHistory((historyData || []) as unknown as LocationHistoryItem[]);
    } catch (e) {
      console.error('useVehicleLocation fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  return {
    current,
    history,
    loading,
    refresh: fetchData,
  };
};
