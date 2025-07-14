import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Owner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  national_id?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  vehicle_count?: number;
}

export interface OwnerStats {
  total: number;
  active: number;
  inactive: number;
  total_vehicles: number;
  avg_vehicles_per_owner: number;
}

export interface OwnerFilters {
  search?: string;
  is_active?: boolean;
}

export const useOwners = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<OwnerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    total_vehicles: 0,
    avg_vehicles_per_owner: 0,
  });
  const { toast } = useToast();

  // Fetch owners with optional filters and vehicle counts
  const fetchOwners = async (filters?: OwnerFilters) => {
    setLoading(true);
    try {
      let query = supabase
        .from('vehicle_owners')
        .select(`
          *,
          vehicles:vehicles(count)
        `);

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,national_id.ilike.%${filters.search}%`);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const ownersData = (data || []).map(owner => ({
        ...owner,
        vehicle_count: owner.vehicles?.[0]?.count || 0,
      })) as Owner[];

      setOwners(ownersData);
      calculateStats(ownersData);
    } catch (error) {
      console.error('Error fetching owners:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات الملاك",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (ownerData: Owner[]) => {
    const totalVehicles = ownerData.reduce((sum, owner) => sum + (owner.vehicle_count || 0), 0);
    const stats: OwnerStats = {
      total: ownerData.length,
      active: ownerData.filter(o => o.is_active).length,
      inactive: ownerData.filter(o => !o.is_active).length,
      total_vehicles: totalVehicles,
      avg_vehicles_per_owner: ownerData.length > 0 ? totalVehicles / ownerData.length : 0,
    };
    setStats(stats);
  };

  // Add new owner
  const addOwner = async (ownerData: Omit<Owner, 'id' | 'created_at' | 'updated_at' | 'vehicle_count'>) => {
    try {
      const { data, error } = await supabase
        .from('vehicle_owners')
        .insert([ownerData])
        .select()
        .single();

      if (error) throw error;

      const newOwner = { ...data, vehicle_count: 0 } as Owner;
      setOwners(prev => [newOwner, ...prev]);
      calculateStats([newOwner, ...owners]);
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المالك بنجاح",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding owner:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المالك",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update owner
  const updateOwner = async (id: string, ownerData: Partial<Owner>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('vehicle_owners')
        .update(ownerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedOwner = data as Owner;
      const updatedOwners = owners.map(o => o.id === id ? { ...o, ...updatedOwner } : o);
      setOwners(updatedOwners);
      calculateStats(updatedOwners);
      
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات المالك بنجاح",
      });
    } catch (error) {
      console.error('Error updating owner:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات المالك",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete owner
  const deleteOwner = async (id: string) => {
    try {
      // Check if owner has vehicles
      const owner = owners.find(o => o.id === id);
      if (owner && owner.vehicle_count && owner.vehicle_count > 0) {
        toast({
          title: "لا يمكن الحذف",
          description: "لا يمكن حذف مالك لديه مركبات مرتبطة. يرجى نقل المركبات أولاً.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('vehicle_owners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOwners(prev => prev.filter(o => o.id !== id));
      calculateStats(owners.filter(o => o.id !== id));
      
      toast({
        title: "تم بنجاح",
        description: "تم حذف المالك بنجاح",
      });
    } catch (error) {
      console.error('Error deleting owner:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المالك",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get owner by ID
  const getOwnerById = async (id: string): Promise<Owner | null> => {
    try {
      const { data, error } = await supabase
        .from('vehicle_owners')
        .select(`
          *,
          vehicles:vehicles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        vehicle_count: data.vehicles?.length || 0,
      } as Owner;
    } catch (error) {
      console.error('Error fetching owner:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  return {
    owners,
    loading,
    stats,
    fetchOwners,
    addOwner,
    updateOwner,
    deleteOwner,
    getOwnerById,
  };
};