import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, VehicleFilters, VehicleStats, VehicleInspectionPoints } from '@/types/vehicle';
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

  // Fetch vehicles with optional filters
  const fetchVehicles = async (filters?: VehicleFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          owner:vehicle_owners(*),
          inspectionPoints:vehicle_inspection_points(*)
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
        inspectionPoints: Array.isArray(vehicle.inspectionPoints) 
          ? vehicle.inspectionPoints[0] 
          : vehicle.inspectionPoints,
      })) as Vehicle[];

      setVehicles(vehiclesData);
      calculateStats(vehiclesData);
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

  // Add new vehicle with images and inspection data
  const addVehicle = async (
    vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>,
    images?: File[],
    inspectionData?: any
  ) => {
    try {
      // الحصول على معرف المستخدم الحالي لاستخدامه في created_by
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id;

      // تنظيف owner_id إذا كانت قيمة غير صالحة
      const cleanOwnerId = (vehicleData as any).owner_id && (vehicleData as any).owner_id !== 'current-user'
        ? (vehicleData as any).owner_id
        : undefined;

      // تحويل البيانات لتتوافق مع مخطط قاعدة البيانات
      const dbVehicleData = {
        plate_number: (vehicleData as any).plate_number,
        brand: (vehicleData as any).brand,
        model: (vehicleData as any).model,
        year: (vehicleData as any).year,
        color: (vehicleData as any).color,
        status: (vehicleData as any).status,
        daily_rate: (vehicleData as any).daily_rate,
        min_daily_rate: (vehicleData as any).min_daily_rate || (vehicleData as any).daily_rate * 0.8,
        max_daily_rate: (vehicleData as any).max_daily_rate || (vehicleData as any).daily_rate * 1.2,
        mileage: (vehicleData as any).mileage,
        vin: (vehicleData as any).vin,
        engine_number: (vehicleData as any).engine_number,
        fuel_type: (vehicleData as any).fuel_type,
        transmission: (vehicleData as any).transmission,
        seating_capacity: (vehicleData as any).seating_capacity,
        registration_expiry: (vehicleData as any).registration_expiry,
        inspection_expiry: (vehicleData as any).inspection_expiry,
        insurance_expiry: (vehicleData as any).insurance_expiry,
        insurance_company: (vehicleData as any).insurance_company,
        insurance_policy_number: (vehicleData as any).insurance_policy_number,
        owner_id: cleanOwnerId,
        notes: (vehicleData as any).notes,
        created_by: currentUserId || undefined,
      };

      const { data, error } = await supabase
        .from('vehicles')
        .insert([dbVehicleData])
        .select()
        .single();

      if (error) throw error;

      const newVehicle = data as Vehicle;

      // رفع الصور إذا وجدت
      if (images && images.length > 0) {
        try {
          const uploadPromises = images.map(async (image, index) => {
            const fileExt = image.name.split('.').pop();
            const fileName = `${newVehicle.id}/${Date.now()}-${index}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('vehicle-images')
              .upload(fileName, image, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) throw uploadError;

            // الحصول على الرابط العام للصورة
            const { data: { publicUrl } } = supabase.storage
              .from('vehicle-images')
              .getPublicUrl(fileName);

            return {
              vehicle_id: newVehicle.id,
              url: publicUrl,
              type: index === 0 ? 'exterior' : 'other',
              upload_date: new Date().toISOString(),
              uploaded_by: currentUserId,
            };
          });

          const imageRecords = await Promise.all(uploadPromises);

          // حفظ بيانات الصور في جدول vehicle_images
          const { error: imagesError } = await supabase
            .from('vehicle_images')
            .insert(imageRecords);

          if (imagesError) {
            console.error('Error saving image records:', imagesError);
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast({
            title: "تحذير",
            description: "تم إضافة المركبة لكن حدث خطأ أثناء رفع بعض الصور",
            variant: "destructive",
          });
        }
      }

      // حفظ بيانات الفحص إذا وجدت
      if (inspectionData && Object.keys(inspectionData).length > 0) {
        try {
          const { error: inspectionError } = await supabase
            .from('vehicle_inspection_points')
            .insert([{
              vehicle_id: newVehicle.id,
              ...inspectionData,
              created_by: currentUserId,
            }]);

          if (inspectionError) {
            console.error('Error saving inspection data:', inspectionError);
          }
        } catch (inspectionError) {
          console.error('Error saving inspection:', inspectionError);
        }
      }

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
  const updateVehicle = async (
    id: string, 
    vehicleData: Partial<Vehicle>, 
    images?: File[], 
    inspectionData?: Partial<VehicleInspectionPoints>
  ): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // رفع الصور الجديدة إن وجدت
      if (images && images.length > 0) {
        try {
          for (const image of images) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${id}/${Date.now()}-${Math.random()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
              .from('vehicle-images')
              .upload(fileName, image, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Error uploading image:', uploadError);
            }
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast({
            title: "تحذير",
            description: "تم تحديث المركبة لكن حدث خطأ أثناء رفع بعض الصور",
            variant: "destructive",
          });
        }
      }

      // تحديث نقاط الفحص إن وجدت
      if (inspectionData && Object.keys(inspectionData).length > 0) {
        try {
          const { error: inspectionError } = await supabase
            .from('vehicle_inspection_points')
            .upsert({
              vehicle_id: id,
              ...inspectionData,
              updated_at: new Date().toISOString(),
            });

          if (inspectionError) {
            console.error('Error updating inspection:', inspectionError);
          }
        } catch (inspectionError) {
          console.error('Error updating inspection:', inspectionError);
        }
      }

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

  // Fetch on mount
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
