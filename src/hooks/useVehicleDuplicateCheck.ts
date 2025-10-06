import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type DuplicateResult = {
  isDuplicate: boolean;
  vehicle?: { id: string; plate_number?: string; vin?: string } | null;
  checking: boolean;
  error?: string | null;
};

export function useVehicleDuplicateCheck(excludeId?: string) {
  const [plateDuplicate, setPlateDuplicate] = useState<DuplicateResult>({ isDuplicate: false, checking: false });
  const [vinDuplicate, setVinDuplicate] = useState<DuplicateResult>({ isDuplicate: false, checking: false });

  const plateValueRef = useRef<string>('');
  const vinValueRef = useRef<string>('');
  const plateTimerRef = useRef<number | null>(null);
  const vinTimerRef = useRef<number | null>(null);

  const clearTimer = (ref: React.MutableRefObject<number | null>) => {
    if (ref.current) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const checkPlateNumber = (value: string) => {
    plateValueRef.current = value?.trim() || '';
    clearTimer(plateTimerRef);
    
    plateTimerRef.current = window.setTimeout(async () => {
      const current = plateValueRef.current;
      if (!current) {
        setPlateDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      // الحد الأدنى للتحقق: 3 أحرف على الأقل
      if (current.length < 3) {
        setPlateDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      setPlateDuplicate(prev => ({ ...prev, checking: true, error: null }));
      
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const queryPromise = supabase
          .from('vehicles')
          .select('id,plate_number')
          .eq('plate_number', current)
          .limit(1);

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        if (error) {
          setPlateDuplicate({ isDuplicate: false, checking: false, error: error.message });
          return;
        }
        
        const match = (data || []).find(v => (excludeId ? v.id !== excludeId : true));
        setPlateDuplicate({
          isDuplicate: !!match,
          vehicle: match ? { id: match.id, plate_number: match.plate_number } : null,
          checking: false,
          error: null
        });
      } catch (error) {
        setPlateDuplicate({ 
          isDuplicate: false, 
          checking: false, 
          error: error instanceof Error ? error.message : 'خطأ في التحقق' 
        });
      }
    }, 400);
  };

  const checkVIN = (value: string) => {
    vinValueRef.current = value?.trim() || '';
    clearTimer(vinTimerRef);
    
    vinTimerRef.current = window.setTimeout(async () => {
      const current = vinValueRef.current;
      if (!current) {
        setVinDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      // الحد الأدنى للتحقق: 5 أحرف على الأقل
      if (current.length < 5) {
        setVinDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      setVinDuplicate(prev => ({ ...prev, checking: true, error: null }));
      
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const queryPromise = supabase
          .from('vehicles')
          .select('id,vin')
          .eq('vin', current)
          .limit(1);

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        if (error) {
          setVinDuplicate({ isDuplicate: false, checking: false, error: error.message });
          return;
        }
        
        const match = (data || []).find(v => (excludeId ? v.id !== excludeId : true));
        setVinDuplicate({
          isDuplicate: !!match,
          vehicle: match ? { id: match.id, vin: match.vin } : null,
          checking: false,
          error: null
        });
      } catch (error) {
        setVinDuplicate({ 
          isDuplicate: false, 
          checking: false, 
          error: error instanceof Error ? error.message : 'خطأ في التحقق' 
        });
      }
    }, 400);
  };

  useEffect(() => {
    return () => {
      clearTimer(plateTimerRef);
      clearTimer(vinTimerRef);
    };
  }, []);

  return {
    plateDuplicate,
    vinDuplicate,
    checkPlateNumber,
    checkVIN,
  };
}
