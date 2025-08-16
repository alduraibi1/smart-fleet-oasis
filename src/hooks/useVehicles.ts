import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, VehicleFilters, VehicleStats } from '@/types/vehicles';
import { useToast } from '@/hooks/use-toast';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<VehicleStats>({
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    out_of_service: 0,
    total_value: 0,
    avg_daily_rate: 0,
  });
  const { toast } = useToast();

  // Helper: compute expiry status across any of the three fields
  const getAnyExpiryStatus = (v: Vehicle, warningDays = 30) => {
    const toDate = (s?: string) => (s ? new Date(s) : undefined);
    const today = new Date(); today.setHours(0,0,0,0);
    const within = (d?: string) => {
      if (!d) return 'valid' as const;
      const date = new Date(d); date.setHours(0,0,0,0);
      const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000*60*60*24));
      if (diffDays < 0) return 'expired' as const;
      if (diffDays <= warningDays) return 'warning' as const;
      return 'valid' as const;
    };
    // Evaluate each
    const statuses = [
      within(v.registration_expiry),
      within(v.insurance_expiry),
      within(v.inspection_expiry),
    ];
    // Return the "worst" status
    if (statuses.includes('expired')) return 'expired' as const;
    if (statuses.includes('warning')) return 'warning' as const;
    return 'valid' as const;
  };

  // Fetch vehicles with optional filters
  const fetchVehicles = async (filters?: VehicleFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          owner:vehicle_owners(*)
        `);

      // Apply filters
      if (filters?.search) {
        query = query.or(`plate_number.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.brand) {
        query = query.eq('brand', filters.brand);
      }
      if (filters?.fuel_type) {
        query = query.eq('fuel_type', filters.fuel_type);
      }
      if (filters?.transmission) {
        query = query.eq('transmission', filters.transmission);
      }
      if (filters?.minPrice) {
        query = query.gte('daily_rate', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('daily_rate', filters.maxPrice);
      }
      if (filters?.minYear) {
        query = query.gte('year', filters.minYear);
      }
      if (filters?.maxYear) {
        query = query.lte('year', filters.maxYear);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const vehiclesData = (data || []).map(vehicle => ({
        ...vehicle,
        owner: vehicle.owner || undefined,
      })) as Vehicle[];

      // Client-side expiry window filter to keep PostgREST simple and reliable
      let filtered = vehiclesData;
      if (filters?.expiryWindow) {
        // Use 30 by default; UI uses system settings but we keep hook decoupled.
        const warningDays = 30;
        filtered = vehiclesData.filter(v => getAnyExpiryStatus(v, warningDays) === filters.expiryWindow);
      }

      setVehicles(filtered);
      calculateStats(filtered);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات المركبات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (vehicleData: Vehicle[]) => {
    const stats: VehicleStats = {
      total: vehicleData.length,
      available: vehicleData.filter(v => v.status === 'available').length,
      rented: vehicleData.filter(v => v.status === 'rented').length,
      maintenance: vehicleData.filter(v => v.status === 'maintenance').length,
      out_of_service: vehicleData.filter(v => v.status === 'out_of_service').length,
      total_value: vehicleData.reduce((sum, v) => sum + v.daily_rate, 0),
      avg_daily_rate: vehicleData.length > 0 
        ? vehicleData.reduce((sum, v) => sum + v.daily_rate, 0) / vehicleData.length 
        : 0,
    };
    setStats(stats);
  };

  // Add new vehicle
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select()
        .single();

      if (error) throw error;

      const newVehicle = data as Vehicle;
      setVehicles(prev => [newVehicle, ...prev]);
      calculateStats([newVehicle, ...vehicles]);
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المركبة بنجاح",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المركبة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update vehicle
  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedVehicle = data as Vehicle;
      const updatedVehicles = vehicles.map(v => v.id === id ? { ...v, ...updatedVehicle } : v);
      setVehicles(updatedVehicles);
      calculateStats(updatedVehicles);
      
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات المركبة بنجاح",
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات المركبة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete vehicle
  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVehicles(prev => prev.filter(v => v.id !== id));
      calculateStats(vehicles.filter(v => v.id !== id));
      
      toast({
        title: "تم بنجاح",
        description: "تم حذف المركبة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المركبة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get unique brands for filter
  const getBrands = () => {
    return [...new Set(vehicles.map(v => v.brand))].sort();
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    loading,
    stats,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getBrands,
  };
};
