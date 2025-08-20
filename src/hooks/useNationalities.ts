
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Nationality {
  id: string;
  code: string;
  name_ar: string;
  name_en?: string;
  id_prefix?: string;
  id_length: number;
  id_validation_regex?: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface NationalityFormData {
  code: string;
  name_ar: string;
  name_en?: string;
  id_prefix?: string;
  id_length: number;
  id_validation_regex?: string;
  is_active: boolean;
  priority: number;
}

export const useNationalities = () => {
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNationalities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('nationalities')
        .select('*')
        .order('priority', { ascending: true })
        .order('name_ar', { ascending: true });

      if (fetchError) throw fetchError;

      setNationalities(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      console.error('Error fetching nationalities:', err);
      setError(errorMessage);
      
      toast({
        title: "خطأ في تحميل البيانات",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addNationality = async (formData: NationalityFormData) => {
    try {
      const { data, error } = await supabase
        .from('nationalities')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;

      await fetchNationalities();
      
      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة الجنسية الجديدة بنجاح"
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error adding nationality:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في إضافة الجنسية",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const updateNationality = async (id: string, formData: Partial<NationalityFormData>) => {
    try {
      const { data, error } = await supabase
        .from('nationalities')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchNationalities();
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الجنسية بنجاح"
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error updating nationality:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في تحديث الجنسية",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const deleteNationality = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nationalities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchNationalities();
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الجنسية بنجاح"
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting nationality:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      
      toast({
        title: "خطأ في حذف الجنسية",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const getActiveNationalities = () => {
    return nationalities.filter(n => n.is_active);
  };

  const getNationalityByCode = (code: string) => {
    return nationalities.find(n => n.code === code);
  };

  useEffect(() => {
    fetchNationalities();
  }, []);

  return {
    nationalities,
    loading,
    error,
    refetch: fetchNationalities,
    addNationality,
    updateNationality,
    deleteNationality,
    getActiveNationalities,
    getNationalityByCode
  };
};
