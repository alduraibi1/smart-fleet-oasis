import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type DuplicateResult = {
  isDuplicate: boolean;
  owner?: { id: string; name: string; phone?: string; national_id?: string } | null;
  checking: boolean;
  error?: string | null;
};

export function useOwnerDuplicateCheck(excludeId?: string) {
  const [phoneDuplicate, setPhoneDuplicate] = useState<DuplicateResult>({ isDuplicate: false, checking: false });
  const [idDuplicate, setIdDuplicate] = useState<DuplicateResult>({ isDuplicate: false, checking: false });

  const phoneValueRef = useRef<string>('');
  const idValueRef = useRef<string>('');
  const phoneTimerRef = useRef<number | null>(null);
  const idTimerRef = useRef<number | null>(null);

  const clearTimer = (ref: React.MutableRefObject<number | null>) => {
    if (ref.current) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const checkPhone = useCallback((value: string) => {
    phoneValueRef.current = value?.trim() || '';
    clearTimer(phoneTimerRef);
    
    // debounce
    phoneTimerRef.current = window.setTimeout(async () => {
      const current = phoneValueRef.current;
      if (!current) {
        setPhoneDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      // Validate phone format before checking (10 digits starting with 05)
      const cleaned = current.replace(/\D/g, '');
      if (cleaned.length !== 10 || !cleaned.startsWith('05')) {
        setPhoneDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      setPhoneDuplicate(prev => ({ ...prev, checking: true, error: null }));
      
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const queryPromise = supabase
          .from('vehicle_owners')
          .select('id,name,phone')
          .eq('phone', cleaned)
          .limit(1);

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        if (error) {
          setPhoneDuplicate({ isDuplicate: false, checking: false, error: error.message });
          return;
        }
        
        const match = (data || []).find(c => (excludeId ? c.id !== excludeId : true));
        setPhoneDuplicate({
          isDuplicate: !!match,
          owner: match ? { id: match.id, name: match.name, phone: match.phone } : null,
          checking: false,
          error: null
        });
      } catch (error) {
        setPhoneDuplicate({ 
          isDuplicate: false, 
          checking: false, 
          error: error instanceof Error ? error.message : 'خطأ في التحقق' 
        });
      }
    }, 400);
  }, [excludeId]);

  const checkNationalId = useCallback((value: string) => {
    idValueRef.current = value?.trim() || '';
    clearTimer(idTimerRef);
    
    // debounce
    idTimerRef.current = window.setTimeout(async () => {
      const current = idValueRef.current;
      if (!current) {
        setIdDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      // Only check if ID has minimum length
      if (current.length < 10) {
        setIdDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      setIdDuplicate(prev => ({ ...prev, checking: true, error: null }));
      
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const queryPromise = supabase
          .from('vehicle_owners')
          .select('id,name,national_id')
          .eq('national_id', current)
          .limit(1);

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        if (error) {
          setIdDuplicate({ isDuplicate: false, checking: false, error: error.message });
          return;
        }
        
        const match = (data || []).find(c => (excludeId ? c.id !== excludeId : true));
        setIdDuplicate({
          isDuplicate: !!match,
          owner: match ? { id: match.id, name: match.name, national_id: match.national_id } : null,
          checking: false,
          error: null
        });
      } catch (error) {
        setIdDuplicate({ 
          isDuplicate: false, 
          checking: false, 
          error: error instanceof Error ? error.message : 'خطأ في التحقق' 
        });
      }
    }, 400);
  }, [excludeId]);

  useEffect(() => {
    return () => {
      clearTimer(phoneTimerRef);
      clearTimer(idTimerRef);
    };
  }, []);

  return {
    phoneDuplicate,
    idDuplicate,
    checkPhone,
    checkNationalId,
  };
}
