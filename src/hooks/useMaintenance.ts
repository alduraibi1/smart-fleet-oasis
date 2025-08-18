import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  mechanic_id?: string;
  template_id?: string;
  maintenance_type: string;
  description?: string;
  scheduled_date?: string;
  completed_date?: string;
  status: string;
  parts_used?: any;
  oils_used?: any;
  labor_hours?: number;
  labor_cost?: number;
  parts_cost?: number;
  total_cost?: number;
  cost?: number;
  notes?: string;
  warranty_until?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  vehicles?: {
    plate_number: string;
    brand: string;
    model: string;
  };
  mechanics?: {
    name: string;
  } | null;
}

export interface MaintenanceTemplate {
  id: string;
  name: string;
  description?: string;
  maintenance_type: string;
  estimated_duration_hours?: number;
  estimated_cost?: number;
  required_parts?: any;
  checklist_items?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  vehicle_id: string;
  template_id?: string;
  maintenance_type: string;
  scheduled_date: string;
  scheduled_mileage?: number;
  priority: string;
  status: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  vehicles?: {
    plate_number: string;
    brand: string;
    model: string;
  };
  maintenance_templates?: {
    name: string;
    estimated_cost?: number;
  };
}

export interface Mechanic {
  id: string;
  name: string;
  employee_id?: string;
  phone?: string;
  email?: string;
  specializations?: string[];
  hourly_rate?: number;
  is_active: boolean;
  hire_date?: string;
  created_at: string;
  updated_at: string;
}

export const useMaintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [templates, setTemplates] = useState<MaintenanceTemplate[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // جلب سجلات الصيانة
  const fetchMaintenanceRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_maintenance')
        .select(`
          *,
          vehicles (plate_number, brand, model),
          mechanics (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Handle the case where mechanics might not exist or join might fail
      const processedData = (data || []).map(record => {
        const mechanicsData = record.mechanics;
        
        // Use a single comprehensive check
        if (mechanicsData && typeof mechanicsData === 'object' && 'name' in mechanicsData && typeof mechanicsData.name === 'string') {
          return {
            ...record,
            mechanics: { name: mechanicsData.name }
          };
        }
        
        // Default case for null, undefined, or invalid structure
        return {
          ...record,
          mechanics: null
        };
      });
      
      setMaintenanceRecords(processedData);
    } catch (error) {
      console.error('خطأ في جلب سجلات الصيانة:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب سجلات الصيانة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب قوالب الصيانة
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('خطأ في جلب قوالب الصيانة:', error);
    }
  };

  // جلب جدولة الصيانة
  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          vehicles (plate_number, brand, model),
          maintenance_templates (name, estimated_cost)
        `)
        .order('scheduled_date');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('خطأ في جلب جدولة الصيانة:', error);
    }
  };

  // جلب الميكانيكيين
  const fetchMechanics = async () => {
    try {
      const { data, error } = await supabase
        .from('mechanics')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setMechanics(data || []);
    } catch (error) {
      console.error('خطأ في جلب الميكانيكيين:', error);
    }
  };

  // إضافة سجل صيانة جديد
  const addMaintenanceRecord = async (maintenanceData: Partial<MaintenanceRecord>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = {
        vehicle_id: maintenanceData.vehicle_id!,
        maintenance_type: maintenanceData.maintenance_type!,
        mechanic_id: maintenanceData.mechanic_id,
        template_id: maintenanceData.template_id,
        description: maintenanceData.description,
        scheduled_date: maintenanceData.scheduled_date,
        completed_date: maintenanceData.completed_date,
        status: maintenanceData.status || 'scheduled',
        parts_used: maintenanceData.parts_used,
        oils_used: maintenanceData.oils_used,
        labor_hours: maintenanceData.labor_hours || 0,
        labor_cost: maintenanceData.labor_cost || 0,
        parts_cost: maintenanceData.parts_cost || 0,
        cost: (maintenanceData.labor_cost || 0) + (maintenanceData.parts_cost || 0),
        notes: maintenanceData.notes,
        warranty_until: maintenanceData.warranty_until,
        images: maintenanceData.images,
        created_by: user?.id
      };
      
      const { data, error } = await supabase
        .from('vehicle_maintenance')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة سجل الصيانة بنجاح",
      });

      await fetchMaintenanceRecords();
      return data;
    } catch (error) {
      console.error('خطأ في إضافة سجل الصيانة:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة سجل الصيانة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // تحديث سجل صيانة
  const updateMaintenanceRecord = async (id: string, updates: Partial<MaintenanceRecord>) => {
    try {
      const { error } = await supabase
        .from('vehicle_maintenance')
        .update({
          ...updates,
          total_cost: (updates.labor_cost || 0) + (updates.parts_cost || 0),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث سجل الصيانة بنجاح",
      });

      await fetchMaintenanceRecords();
    } catch (error) {
      console.error('خطأ في تحديث سجل الصيانة:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث سجل الصيانة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // حذف سجل صيانة
  const deleteMaintenanceRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_maintenance')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف سجل الصيانة بنجاح",
      });

      await fetchMaintenanceRecords();
    } catch (error) {
      console.error('خطأ في حذف سجل الصيانة:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف سجل الصيانة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // إضافة جدولة صيانة
  const addMaintenanceSchedule = async (scheduleData: Partial<MaintenanceSchedule>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = {
        vehicle_id: scheduleData.vehicle_id!,
        maintenance_type: scheduleData.maintenance_type!,
        scheduled_date: scheduleData.scheduled_date!,
        template_id: scheduleData.template_id,
        scheduled_mileage: scheduleData.scheduled_mileage,
        priority: scheduleData.priority || 'medium',
        status: scheduleData.status || 'scheduled',
        notes: scheduleData.notes,
        created_by: user?.id
      };
      
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة جدولة الصيانة بنجاح",
      });

      await fetchSchedules();
      return data;
    } catch (error) {
      console.error('خطأ في إضافة جدولة الصيانة:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة جدولة الصيانة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // إضافة ميكانيكي جديد
  const addMechanic = async (mechanicData: Partial<Mechanic>) => {
    try {
      const insertData = {
        name: mechanicData.name!,
        employee_id: mechanicData.employee_id,
        phone: mechanicData.phone,
        email: mechanicData.email,
        specializations: mechanicData.specializations,
        hourly_rate: mechanicData.hourly_rate || 0,
        is_active: mechanicData.is_active !== false,
        hire_date: mechanicData.hire_date
      };
      
      const { data, error } = await supabase
        .from('mechanics')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الميكانيكي بنجاح",
      });

      await fetchMechanics();
      return data;
    } catch (error) {
      console.error('خطأ في إضافة الميكانيكي:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الميكانيكي",
        variant: "destructive",
      });
      throw error;
    }
  };

  // حساب إحصائيات الصيانة
  const getMaintenanceStats = () => {
    const totalRecords = maintenanceRecords.length;
    const completedRecords = maintenanceRecords.filter(record => record.status === 'completed').length;
    const pendingRecords = maintenanceRecords.filter(record => record.status === 'scheduled' || record.status === 'in_progress').length;
    const totalCost = maintenanceRecords.reduce((sum, record) => sum + (record.total_cost || record.cost || 0), 0);
    const averageCost = totalRecords > 0 ? totalCost / totalRecords : 0;

    return {
      totalRecords,
      completedRecords,
      pendingRecords,
      totalCost,
      averageCost
    };
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchMaintenanceRecords();
    fetchTemplates();
    fetchSchedules();
    fetchMechanics();
  }, []);

  return {
    maintenanceRecords,
    templates,
    schedules,
    mechanics,
    loading,
    fetchMaintenanceRecords,
    fetchTemplates,
    fetchSchedules,
    fetchMechanics,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    addMaintenanceSchedule,
    addMechanic,
    getMaintenanceStats
  };
};
