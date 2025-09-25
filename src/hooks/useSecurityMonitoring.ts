import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  success: boolean;
  failure_reason?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  user_id?: string;
  additional_data?: any;
}

interface SessionInfo {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_activity: string;
  is_active: boolean;
  expires_at?: string;
  session_token?: string;
  device_info?: any;
  location_info?: any;
}

export function useSecurityMonitoring() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Monitor security events
  const loadSecurityEvents = useCallback(async (limit: number = 50) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setSecurityEvents((data as SecurityEvent[]) || []);
    } catch (error) {
      console.error('Failed to load security events:', error);
      toast({
        title: 'خطأ في تحميل الأحداث الأمنية',
        description: 'لا يمكن تحميل سجل الأحداث الأمنية',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Monitor active sessions
  const loadActiveSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setActiveSessions((data as SessionInfo[]) || []);
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    }
  }, []);

  // Check for suspicious activity
  const checkSuspiciousActivity = useCallback(async () => {
    try {
      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      // Check for multiple failed logins
      const { data: failedLogins, error: failedError } = await supabase
        .from('failed_login_attempts')
        .select('*')
        .gte('attempt_time', fifteenMinutesAgo.toISOString());

      if (failedError) throw failedError;

      const suspiciousIPs = new Map<string, number>();
      failedLogins?.forEach(attempt => {
        const ipAddress = attempt.ip_address?.toString() || 'unknown';
        const count = suspiciousIPs.get(ipAddress) || 0;
        suspiciousIPs.set(ipAddress, count + 1);
      });

      // Alert for IPs with more than 5 failed attempts
      for (const [ip, count] of suspiciousIPs) {
        if (count >= 5) {
          toast({
            title: 'تحذير أمني',
            description: `تم رصد ${count} محاولات دخول فاشلة من عنوان IP: ${ip}`,
            variant: 'destructive'
          });
        }
      }

      return { suspiciousIPs: Array.from(suspiciousIPs.entries()) };
    } catch (error) {
      console.error('Failed to check suspicious activity:', error);
      return { suspiciousIPs: [] };
    }
  }, [toast]);

  // Terminate session
  const terminateSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false, terminated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'تم إنهاء الجلسة',
        description: 'تم إنهاء الجلسة بنجاح',
      });

      // Reload sessions
      await loadActiveSessions();
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast({
        title: 'خطأ في إنهاء الجلسة',
        description: 'لا يمكن إنهاء الجلسة المحددة',
        variant: 'destructive'
      });
    }
  }, [toast, loadActiveSessions]);

  // Get client fingerprint for device tracking
  const getClientFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Security fingerprint', 10, 10);
    
    const fingerprint = {
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      canvas: canvas.toDataURL()
    };

    return btoa(JSON.stringify(fingerprint));
  }, []);

  // Log security event with enhanced data
  const logEnhancedSecurityEvent = useCallback(async (
    actionType: string,
    resourceType: string,
    resourceId: string | null,
    success: boolean,
    additionalData?: any
  ) => {
    try {
      const fingerprint = getClientFingerprint();
      
      await supabase.functions.invoke('log-security-event', {
        body: {
          action_type: actionType,
          resource_type: resourceType,
          resource_id: resourceId,
          success,
          additional_data: {
            ...additionalData,
            client_fingerprint: fingerprint,
            timestamp: new Date().toISOString()
          },
          user_agent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Failed to log enhanced security event:', error);
    }
  }, [getClientFingerprint]);

  // Real-time monitoring setup
  useEffect(() => {
    const channel = supabase
      .channel('security-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_audit_log'
        },
        (payload) => {
          const newEvent = payload.new as SecurityEvent;
          setSecurityEvents(prev => [newEvent, ...prev.slice(0, 49)]);

          // Show critical security alerts
          if (!newEvent.success && ['login_failed', 'suspicious_activity'].includes(newEvent.action_type)) {
            toast({
              title: 'تحذير أمني',
              description: `نشاط مشبوه: ${newEvent.action_type}`,
              variant: 'destructive'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    securityEvents,
    activeSessions,
    loading,
    loadSecurityEvents,
    loadActiveSessions,
    checkSuspiciousActivity,
    terminateSession,
    logEnhancedSecurityEvent,
    getClientFingerprint
  };
}