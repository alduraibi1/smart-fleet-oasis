
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type DuplicateResult = {
  isDuplicate: boolean;
  customer?: { id: string; name: string; phone?: string; national_id?: string } | null;
  checking: boolean;
  error?: string | null;
};

export function useCustomerDuplicateCheck(excludeId?: string) {
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

  const checkPhone = (value: string) => {
    phoneValueRef.current = value?.trim() || '';
    clearTimer(phoneTimerRef);
    // debounce
    phoneTimerRef.current = window.setTimeout(async () => {
      const current = phoneValueRef.current;
      if (!current) {
        setPhoneDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      setPhoneDuplicate(prev => ({ ...prev, checking: true, error: null }));
      const query = supabase
        .from('customers')
        .select('id,name,phone')
        .eq('phone', current)
        .limit(1);

      const { data, error } = await query;
      if (error) {
        setPhoneDuplicate({ isDuplicate: false, checking: false, error: error.message });
        return;
      }
      const match = (data || []).find(c => (excludeId ? c.id !== excludeId : true));
      setPhoneDuplicate({
        isDuplicate: !!match,
        customer: match ? { id: match.id, name: match.name, phone: match.phone } : null,
        checking: false,
        error: null
      });
    }, 400);
  };

  const checkNationalId = (value: string) => {
    idValueRef.current = value?.trim() || '';
    clearTimer(idTimerRef);
    // debounce
    idTimerRef.current = window.setTimeout(async () => {
      const current = idValueRef.current;
      if (!current) {
        setIdDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      setIdDuplicate(prev => ({ ...prev, checking: true, error: null }));
      const query = supabase
        .from('customers')
        .select('id,name,national_id')
        .eq('national_id', current)
        .limit(1);

      const { data, error } = await query;
      if (error) {
        setIdDuplicate({ isDuplicate: false, checking: false, error: error.message });
        return;
      }
      const match = (data || []).find(c => (excludeId ? c.id !== excludeId : true));
      setIdDuplicate({
        isDuplicate: !!match,
        customer: match ? { id: match.id, name: match.name, national_id: match.national_id } : null,
        checking: false,
        error: null
      });
    }, 400);
  };

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
