import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type DuplicateResult = {
  isDuplicate: boolean;
  owner?: { id: string; name: string; phone?: string; national_id?: string; commercial_registration?: string; tax_number?: string } | null;
  checking: boolean;
  error?: string | null;
};

export function useOwnerDuplicateCheck(excludeId?: string) {
  const [phoneDuplicate, setPhoneDuplicate] = useState<DuplicateResult>({ isDuplicate: false, checking: false });
  const [idDuplicate, setIdDuplicate] = useState<DuplicateResult>({ isDuplicate: false, checking: false });
  const [commercialRegDuplicate, setCommercialRegDuplicate] = useState<DuplicateResult>({ isDuplicate: false, checking: false });
  const [taxNumberDuplicate, setTaxNumberDuplicate] = useState<DuplicateResult>({ isDuplicate: false, checking: false });

  const phoneValueRef = useRef<string>('');
  const idValueRef = useRef<string>('');
  const commercialRegValueRef = useRef<string>('');
  const taxNumberValueRef = useRef<string>('');
  
  const phoneTimerRef = useRef<number | null>(null);
  const idTimerRef = useRef<number | null>(null);
  const commercialRegTimerRef = useRef<number | null>(null);
  const taxNumberTimerRef = useRef<number | null>(null);

  const clearTimer = (ref: React.MutableRefObject<number | null>) => {
    if (ref.current) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const checkPhone = useCallback((value: string) => {
    phoneValueRef.current = value?.trim() || '';
    clearTimer(phoneTimerRef);
    
    phoneTimerRef.current = window.setTimeout(async () => {
      const current = phoneValueRef.current;
      if (!current) {
        setPhoneDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      const cleaned = current.replace(/\D/g, '');
      if (cleaned.length !== 10 || !cleaned.startsWith('05')) {
        setPhoneDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      setPhoneDuplicate(prev => ({ ...prev, checking: true, error: null }));
      
      try {
        const { data, error } = await supabase
          .from('vehicle_owners')
          .select('id,name,phone')
          .eq('phone', cleaned)
          .limit(1);
        
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
    
    idTimerRef.current = window.setTimeout(async () => {
      const current = idValueRef.current;
      if (!current || current.length < 10) {
        setIdDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      setIdDuplicate(prev => ({ ...prev, checking: true, error: null }));
      
      try {
        const { data, error } = await supabase
          .from('vehicle_owners')
          .select('id,name,national_id')
          .eq('national_id', current)
          .limit(1);
        
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

  const checkCommercialRegistration = useCallback((value: string) => {
    commercialRegValueRef.current = value?.trim() || '';
    clearTimer(commercialRegTimerRef);
    
    commercialRegTimerRef.current = window.setTimeout(async () => {
      const current = commercialRegValueRef.current;
      if (!current) {
        setCommercialRegDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      setCommercialRegDuplicate(prev => ({ ...prev, checking: true, error: null }));
      
      try {
        const { data, error } = await supabase
          .from('vehicle_owners')
          .select('id,name,commercial_registration')
          .eq('commercial_registration', current)
          .eq('owner_type', 'company')
          .limit(1);
        
        if (error) {
          setCommercialRegDuplicate({ isDuplicate: false, checking: false, error: error.message });
          return;
        }
        
        const match = (data || []).find(c => (excludeId ? c.id !== excludeId : true));
        setCommercialRegDuplicate({
          isDuplicate: !!match,
          owner: match ? { id: match.id, name: match.name, commercial_registration: match.commercial_registration } : null,
          checking: false,
          error: null
        });
      } catch (error) {
        setCommercialRegDuplicate({ 
          isDuplicate: false, 
          checking: false, 
          error: error instanceof Error ? error.message : 'خطأ في التحقق' 
        });
      }
    }, 400);
  }, [excludeId]);

  const checkTaxNumber = useCallback((value: string) => {
    taxNumberValueRef.current = value?.trim() || '';
    clearTimer(taxNumberTimerRef);
    
    taxNumberTimerRef.current = window.setTimeout(async () => {
      const current = taxNumberValueRef.current;
      if (!current) {
        setTaxNumberDuplicate({ isDuplicate: false, checking: false });
        return;
      }
      
      setTaxNumberDuplicate(prev => ({ ...prev, checking: true, error: null }));
      
      try {
        const { data, error } = await supabase
          .from('vehicle_owners')
          .select('id,name,tax_number')
          .eq('tax_number', current)
          .eq('owner_type', 'company')
          .limit(1);
        
        if (error) {
          setTaxNumberDuplicate({ isDuplicate: false, checking: false, error: error.message });
          return;
        }
        
        const match = (data || []).find(c => (excludeId ? c.id !== excludeId : true));
        setTaxNumberDuplicate({
          isDuplicate: !!match,
          owner: match ? { id: match.id, name: match.name, tax_number: match.tax_number } : null,
          checking: false,
          error: null
        });
      } catch (error) {
        setTaxNumberDuplicate({ 
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
      clearTimer(commercialRegTimerRef);
      clearTimer(taxNumberTimerRef);
    };
  }, []);

  return {
    phoneDuplicate,
    idDuplicate,
    commercialRegDuplicate,
    taxNumberDuplicate,
    checkPhone,
    checkNationalId,
    checkCommercialRegistration,
    checkTaxNumber,
  };
}
