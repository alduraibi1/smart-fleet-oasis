import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionSecurity {
  sessionId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  loginTime: Date;
  lastActivity: Date;
  isSecure: boolean;
}

export function useSecureSession() {
  const [sessionSecurity, setSessionSecurity] = useState<SessionSecurity | null>(null);
  const [sessionWarnings, setSessionWarnings] = useState<string[]>([]);
  const { toast } = useToast();

  // Generate device fingerprint
  const generateFingerprint = useCallback((): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillText('Device fingerprint', 10, 10);
    }

    const fingerprint = {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: navigator.languages?.join(','),
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      canvas: canvas.toDataURL(),
      webgl: getWebGLFingerprint(),
      fonts: detectFonts(),
      plugins: Array.from(navigator.plugins).map(p => p.name).join(',')
    };

    return btoa(JSON.stringify(fingerprint));
  }, []);

  // Get WebGL fingerprint
  const getWebGLFingerprint = (): string => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
                 canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      if (!gl) return '';

      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      return `${vendor}~${renderer}`;
    } catch {
      return '';
    }
  };

  // Detect installed fonts
  const detectFonts = (): string => {
    const fonts = [
      'Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia',
      'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
      'Arial Black', 'Impact', 'Tahoma', 'Geneva'
    ];

    const detectedFonts: string[] = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    // Get baseline measurements
    context.font = `${testSize} monospace`;
    const baselineWidth = context.measureText(testString).width;

    fonts.forEach(font => {
      context.font = `${testSize} ${font}, monospace`;
      const width = context.measureText(testString).width;
      if (width !== baselineWidth) {
        detectedFonts.push(font);
      }
    });

    return detectedFonts.join(',');
  };

  // Initialize secure session
  const initializeSecureSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fingerprint = generateFingerprint();
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const sessionInfo: SessionSecurity = {
        sessionId: session.access_token.substring(0, 16),
        deviceFingerprint: fingerprint,
        ipAddress: ip,
        userAgent: navigator.userAgent,
        loginTime: new Date(session.user.created_at),
        lastActivity: new Date(),
        isSecure: location.protocol === 'https:'
      };

      setSessionSecurity(sessionInfo);

      // Check for security issues
      const warnings = validateSessionSecurity(sessionInfo);
      setSessionWarnings(warnings);

      // Log session creation
      await supabase.functions.invoke('track-session', {
        body: {
          user_id: session.user.id,
          device_fingerprint: fingerprint,
          ip_address: ip,
          user_agent: navigator.userAgent,
          session_start: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Failed to initialize secure session:', error);
    }
  }, [generateFingerprint]);

  // Validate session security
  const validateSessionSecurity = (session: SessionSecurity): string[] => {
    const warnings: string[] = [];

    // Check HTTPS
    if (!session.isSecure) {
      warnings.push('الاتصال غير مشفر (HTTP). استخدم HTTPS للأمان الأفضل.');
    }

    // Check session age
    const sessionAge = Date.now() - session.loginTime.getTime();
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    if (sessionAge > maxSessionAge) {
      warnings.push('الجلسة قديمة. يُنصح بتسجيل دخول جديد.');
    }

    // Check inactivity
    const inactivityTime = Date.now() - session.lastActivity.getTime();
    const maxInactivity = 2 * 60 * 60 * 1000; // 2 hours
    if (inactivityTime > maxInactivity) {
      warnings.push('عدم نشاط طويل. يُنصح بإعادة المصادقة.');
    }

    return warnings;
  };

  // Update last activity
  const updateActivity = useCallback(async () => {
    if (!sessionSecurity) return;

    const updatedSession = {
      ...sessionSecurity,
      lastActivity: new Date()
    };

    setSessionSecurity(updatedSession);

    // Update in database
    try {
      await supabase.functions.invoke('update-session-activity', {
        body: {
          session_id: updatedSession.sessionId,
          last_activity: updatedSession.lastActivity.toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, [sessionSecurity]);

  // Detect suspicious activity
  const detectSuspiciousActivity = useCallback(async () => {
    if (!sessionSecurity) return;

    try {
      const currentFingerprint = generateFingerprint();
      
      // Check if device fingerprint changed significantly
      if (currentFingerprint !== sessionSecurity.deviceFingerprint) {
        const warningMsg = 'تم اكتشاف تغيير في خصائص الجهاز. قد يكون هناك نشاط مشبوه.';
        setSessionWarnings(prev => [...prev, warningMsg]);
        
        toast({
          title: 'تحذير أمني',
          description: warningMsg,
          variant: 'destructive'
        });

        // Log suspicious activity
        await supabase.functions.invoke('log-security-event', {
          body: {
            action_type: 'device_fingerprint_changed',
            resource_type: 'session',
            resource_id: sessionSecurity.sessionId,
            success: false,
            failure_reason: 'Device fingerprint mismatch',
            additional_data: {
              original_fingerprint: sessionSecurity.deviceFingerprint.substring(0, 50),
              new_fingerprint: currentFingerprint.substring(0, 50)
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to detect suspicious activity:', error);
    }
  }, [sessionSecurity, generateFingerprint, toast]);

  // Terminate session securely
  const terminateSession = useCallback(async () => {
    try {
      if (sessionSecurity) {
        await supabase.functions.invoke('terminate-session', {
          body: {
            session_id: sessionSecurity.sessionId,
            reason: 'user_initiated'
          }
        });
      }

      await supabase.auth.signOut();
      setSessionSecurity(null);
      setSessionWarnings([]);
      
      toast({
        title: 'تم تسجيل الخروج',
        description: 'تم إنهاء الجلسة بأمان',
      });
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  }, [sessionSecurity, toast]);

  // Setup activity monitoring
  useEffect(() => {
    let activityTimer: NodeJS.Timeout;
    let suspiciousActivityTimer: NodeJS.Timeout;

    if (sessionSecurity) {
      // Update activity every 5 minutes
      activityTimer = setInterval(updateActivity, 5 * 60 * 1000);
      
      // Check for suspicious activity every minute
      suspiciousActivityTimer = setInterval(detectSuspiciousActivity, 60 * 1000);
    }

    return () => {
      clearInterval(activityTimer);
      clearInterval(suspiciousActivityTimer);
    };
  }, [sessionSecurity, updateActivity, detectSuspiciousActivity]);

  // Initialize on component mount
  useEffect(() => {
    initializeSecureSession();
  }, [initializeSecureSession]);

  return {
    sessionSecurity,
    sessionWarnings,
    initializeSecureSession,
    updateActivity,
    detectSuspiciousActivity,
    terminateSession,
    generateFingerprint
  };
}