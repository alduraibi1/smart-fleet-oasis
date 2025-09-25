import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FailedLoginState {
  isBlocked: boolean;
  remainingAttempts: number;
  blockDurationMinutes: number;
  lockoutTimeRemaining: number;
}

export function useFailedLoginTracking(email: string) {
  const [state, setState] = useState<FailedLoginState>({
    isBlocked: false,
    remainingAttempts: 5,
    blockDurationMinutes: 0,
    lockoutTimeRemaining: 0
  });
  const [loading, setLoading] = useState(false);

  // Check current block status
  const checkBlockStatus = useCallback(async () => {
    if (!email) return;
    
    try {
      const { data, error } = await supabase
        .from('failed_login_attempts')
        .select('blocked_until, attempt_time')
        .eq('ip_address', 'current') // This will be handled by RLS in the future
        .gte('attempt_time', new Date(Date.now() - 15 * 60 * 1000).toISOString())
        .order('attempt_time', { ascending: false });

      if (error) {
        console.error('Error checking block status:', error);
        return;
      }

      const now = new Date();
      const recentAttempts = data || [];
      let isCurrentlyBlocked = false;
      let timeRemaining = 0;

      // Check if there's an active block
      for (const attempt of recentAttempts) {
        if (attempt.blocked_until) {
          const blockUntil = new Date(attempt.blocked_until);
          if (blockUntil > now) {
            isCurrentlyBlocked = true;
            timeRemaining = Math.ceil((blockUntil.getTime() - now.getTime()) / 1000);
            break;
          }
        }
      }

      setState({
        isBlocked: isCurrentlyBlocked,
        remainingAttempts: Math.max(0, 5 - recentAttempts.length),
        blockDurationMinutes: timeRemaining > 0 ? Math.ceil(timeRemaining / 60) : 0,
        lockoutTimeRemaining: timeRemaining
      });

    } catch (error) {
      console.error('Error in checkBlockStatus:', error);
    }
  }, [email]);

  // Track failed login attempt
  const trackFailedAttempt = useCallback(async (reason?: string): Promise<{ blocked: boolean; attempts_count: number }> => {
    if (!email) return { blocked: false, attempts_count: 0 };

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('track-failed-login', {
        body: { 
          email, 
          reason: reason || 'Invalid credentials',
          user_agent: navigator.userAgent 
        }
      });

      if (error) {
        console.error('Error tracking failed attempt:', error);
        return { blocked: false, attempts_count: 0 };
      }

      // Update local state based on response
      if (data?.blocked) {
        setState(prev => ({
          ...prev,
          isBlocked: true,
          blockDurationMinutes: data.block_duration_minutes || 15,
          lockoutTimeRemaining: (data.block_duration_minutes || 15) * 60,
          remainingAttempts: 0
        }));
      } else {
        setState(prev => ({
          ...prev,
          remainingAttempts: Math.max(0, 5 - (data?.attempts_count || 0))
        }));
      }

      return { 
        blocked: data?.blocked || false, 
        attempts_count: data?.attempts_count || 0 
      };

    } catch (error) {
      console.error('Error in trackFailedAttempt:', error);
      return { blocked: false, attempts_count: 0 };
    } finally {
      setLoading(false);
    }
  }, [email]);

  // Clear attempts (called on successful login)
  const clearAttempts = useCallback(async () => {
    try {
      // Clear from database
      await supabase.rpc('clear_failed_login_attempts', { p_email: email });
      
      // Clear local state
      setState({
        isBlocked: false,
        remainingAttempts: 5,
        blockDurationMinutes: 0,
        lockoutTimeRemaining: 0
      });
    } catch (error) {
      console.error('Error clearing failed attempts:', error);
    }
  }, [email]);

  // Check status when email changes
  useEffect(() => {
    checkBlockStatus();
  }, [checkBlockStatus]);

  // Set up countdown timer for lockout
  useEffect(() => {
    if (state.lockoutTimeRemaining > 0) {
      const timer = setInterval(() => {
        setState(prev => {
          const newTimeRemaining = Math.max(0, prev.lockoutTimeRemaining - 1);
          return {
            ...prev,
            lockoutTimeRemaining: newTimeRemaining,
            isBlocked: newTimeRemaining > 0,
            blockDurationMinutes: newTimeRemaining > 0 ? Math.ceil(newTimeRemaining / 60) : 0
          };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.lockoutTimeRemaining]);

  return {
    ...state,
    loading,
    trackFailedAttempt,
    clearAttempts,
    checkBlockStatus
  };
}