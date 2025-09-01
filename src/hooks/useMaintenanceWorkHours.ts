import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceWorkHour {
  id: string;
  maintenance_id: string;
  mechanic_id: string;
  start_time: string;
  end_time?: string;
  break_hours: number;
  total_hours?: number;
  hourly_rate: number;
  total_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  mechanic?: {
    name: string;
    hourly_rate: number;
  };
}

export interface MechanicEfficiencyReport {
  mechanic_id: string;
  mechanic_name: string;
  total_work_hours: number;
  total_jobs_completed: number;
  average_job_duration: number;
  total_earnings: number;
  efficiency_score: number;
  jobs_this_month: number;
  hours_this_month: number;
}

export const useMaintenanceWorkHours = () => {
  const [workHours, setWorkHours] = useState<MaintenanceWorkHour[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch work hours for a maintenance record
  const fetchWorkHours = async (maintenanceId: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_work_hours')
        .select(`
          *,
          mechanics(name, hourly_rate)
        `)
        .eq('maintenance_id', maintenanceId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setWorkHours(data || []);
    } catch (error) {
      console.error('Error fetching work hours:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب ساعات العمل",
        variant: "destructive",
      });
    }
  };

  // Start work session
  const startWorkSession = async (maintenanceId: string, mechanicId: string) => {
    try {
      setLoading(true);

      // Get mechanic's hourly rate
      const { data: mechanic, error: mechanicError } = await supabase
        .from('mechanics')
        .select('hourly_rate')
        .eq('id', mechanicId)
        .single();

      if (mechanicError) throw mechanicError;

      const { data, error } = await supabase
        .from('maintenance_work_hours')
        .insert([{
          maintenance_id: maintenanceId,
          mechanic_id: mechanicId,
          start_time: new Date().toISOString(),
          break_hours: 0,
          hourly_rate: mechanic.hourly_rate || 50
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم بدء جلسة العمل",
        description: "تم تسجيل بداية العمل بنجاح",
      });

      await fetchWorkHours(maintenanceId);
      return data;
    } catch (error) {
      console.error('Error starting work session:', error);
      toast({
        title: "خطأ",
        description: "فشل في بدء جلسة العمل",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // End work session
  const endWorkSession = async (workHourId: string, breakHours: number = 0) => {
    try {
      setLoading(true);

      const { data: workHour, error: fetchError } = await supabase
        .from('maintenance_work_hours')
        .select('*')
        .eq('id', workHourId)
        .single();

      if (fetchError) throw fetchError;

      const endTime = new Date();
      const startTime = new Date(workHour.start_time);
      const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      const totalHours = Math.max(0, (totalMinutes / 60) - breakHours);
      const totalCost = totalHours * workHour.hourly_rate;

      const { error } = await supabase
        .from('maintenance_work_hours')
        .update({
          end_time: endTime.toISOString(),
          break_hours: breakHours,
          total_hours: totalHours,
          total_cost: totalCost
        })
        .eq('id', workHourId);

      if (error) throw error;

      toast({
        title: "تم إنهاء جلسة العمل",
        description: `تم تسجيل ${totalHours.toFixed(2)} ساعة عمل`,
      });

      await fetchWorkHours(workHour.maintenance_id);
    } catch (error) {
      console.error('Error ending work session:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنهاء جلسة العمل",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update work hours
  const updateWorkHours = async (workHourId: string, updates: Partial<MaintenanceWorkHour>) => {
    try {
      setLoading(true);

      // If updating times, recalculate total hours and cost
      if (updates.start_time || updates.end_time || updates.break_hours !== undefined) {
        const { data: current, error: fetchError } = await supabase
          .from('maintenance_work_hours')
          .select('*')
          .eq('id', workHourId)
          .single();

        if (fetchError) throw fetchError;

        const startTime = new Date(updates.start_time || current.start_time);
        const endTime = updates.end_time ? new Date(updates.end_time) : 
                      current.end_time ? new Date(current.end_time) : null;

        if (endTime) {
          const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
          const breakHours = updates.break_hours !== undefined ? updates.break_hours : current.break_hours;
          const totalHours = Math.max(0, (totalMinutes / 60) - breakHours);
          const hourlyRate = updates.hourly_rate || current.hourly_rate;
          
          updates.total_hours = totalHours;
          updates.total_cost = totalHours * hourlyRate;
        }
      }

      const { error } = await supabase
        .from('maintenance_work_hours')
        .update(updates)
        .eq('id', workHourId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث ساعات العمل بنجاح",
      });

      // Refresh data
      const { data: workHour } = await supabase
        .from('maintenance_work_hours')
        .select('maintenance_id')
        .eq('id', workHourId)
        .single();

      if (workHour) {
        await fetchWorkHours(workHour.maintenance_id);
      }
    } catch (error) {
      console.error('Error updating work hours:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث ساعات العمل",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete work hours
  const deleteWorkHours = async (workHourId: string) => {
    try {
      setLoading(true);

      const { data: workHour } = await supabase
        .from('maintenance_work_hours')
        .select('maintenance_id')
        .eq('id', workHourId)
        .single();

      const { error } = await supabase
        .from('maintenance_work_hours')
        .delete()
        .eq('id', workHourId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف سجل ساعات العمل",
      });

      if (workHour) {
        await fetchWorkHours(workHour.maintenance_id);
      }
    } catch (error) {
      console.error('Error deleting work hours:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف ساعات العمل",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get mechanic efficiency reports
  const getMechanicEfficiencyReports = async (): Promise<MechanicEfficiencyReport[]> => {
    try {
      const { data, error } = await supabase
        .from('maintenance_work_hours')
        .select(`
          mechanic_id,
          maintenance_id,
          total_hours,
          total_cost,
          created_at,
          mechanics(name),
          vehicle_maintenance!inner(id, status)
        `)
        .not('end_time', 'is', null);

      if (error) throw error;

      // Group by mechanic and calculate efficiency metrics
      const mechanicStats: { [key: string]: any } = {};

      for (const record of data || []) {
        const mechanicId = record.mechanic_id;
        if (!mechanicStats[mechanicId]) {
          mechanicStats[mechanicId] = {
            mechanic_id: mechanicId,
            mechanic_name: record.mechanics?.name || 'غير محدد',
            total_work_hours: 0,
            total_jobs_completed: new Set(),
            total_earnings: 0,
            jobs_this_month: new Set(),
            hours_this_month: 0
          };
        }

        mechanicStats[mechanicId].total_work_hours += record.total_hours || 0;
        mechanicStats[mechanicId].total_earnings += record.total_cost || 0;
        
        if (record.vehicle_maintenance?.status === 'completed') {
          mechanicStats[mechanicId].total_jobs_completed.add(record.maintenance_id);
        }

        // This month calculations
        const recordDate = new Date(record.created_at);
        const now = new Date();
        if (recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()) {
          mechanicStats[mechanicId].hours_this_month += record.total_hours || 0;
          if (record.vehicle_maintenance?.status === 'completed') {
            mechanicStats[mechanicId].jobs_this_month.add(record.maintenance_id);
          }
        }
      }

      // Convert to final report format
      const reports: MechanicEfficiencyReport[] = Object.values(mechanicStats).map((stats: any) => {
        const jobsCompleted = stats.total_jobs_completed.size;
        const averageJobDuration = jobsCompleted > 0 ? stats.total_work_hours / jobsCompleted : 0;
        
        // Simple efficiency score: jobs per hour worked
        const efficiencyScore = stats.total_work_hours > 0 ? (jobsCompleted / stats.total_work_hours) * 10 : 0;

        return {
          mechanic_id: stats.mechanic_id,
          mechanic_name: stats.mechanic_name,
          total_work_hours: stats.total_work_hours,
          total_jobs_completed: jobsCompleted,
          average_job_duration: averageJobDuration,
          total_earnings: stats.total_earnings,
          efficiency_score: Math.min(10, efficiencyScore), // Cap at 10
          jobs_this_month: stats.jobs_this_month.size,
          hours_this_month: stats.hours_this_month
        };
      });

      return reports.sort((a, b) => b.efficiency_score - a.efficiency_score);
    } catch (error) {
      console.error('Error getting mechanic efficiency reports:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب تقارير كفاءة الميكانيكيين",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    workHours,
    loading,
    fetchWorkHours,
    startWorkSession,
    endWorkSession,
    updateWorkHours,
    deleteWorkHours,
    getMechanicEfficiencyReports
  };
};