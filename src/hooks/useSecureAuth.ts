import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordRequirements {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
}

export function useSecureAuth() {
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements | null>(null);
  const { toast } = useToast();

  // Load password requirements
  const loadPasswordRequirements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('password_requirements')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPasswordRequirements(data);
        return data;
      }
    } catch (error) {
      console.error('Failed to load password requirements:', error);
      // Use defaults if loading fails
      const defaults: PasswordRequirements = {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: true
      };
      setPasswordRequirements(defaults);
      return defaults;
    }
  }, []);

  // Validate password against requirements
  const validatePassword = useCallback((password: string, requirements: PasswordRequirements): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < requirements.min_length) {
      errors.push(`كلمة المرور يجب أن تكون ${requirements.min_length} أحرف على الأقل`);
    }

    if (requirements.require_uppercase && !/[A-Z]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
    }

    if (requirements.require_lowercase && !/[a-z]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
    }

    if (requirements.require_numbers && !/[0-9]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
    }

    if (requirements.require_symbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Secure sign up with password validation
  const secureSignUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      // Load requirements if not already loaded
      const requirements = passwordRequirements || await loadPasswordRequirements();
      
      // Validate password
      const validation = validatePassword(password, requirements);
      if (!validation.isValid) {
        toast({
          title: "كلمة مرور ضعيفة",
          description: validation.errors.join('\n'),
          variant: "destructive",
        });
        return { success: false, errors: validation.errors };
      }

      // Sign up with Supabase
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Log security audit event
      if (data.user) {
        await logSecurityEvent('user_signup', 'user', data.user.id, true);
      }

      toast({
        title: "تم إنشاء الحساب",
        description: "تم إنشاء حسابك بنجاح. يرجى التحقق من بريدك الإلكتروني للتفعيل.",
      });

      return { success: true, user: data.user };
    } catch (error: any) {
      await logSecurityEvent('user_signup', 'user', null, false, error.message);
      
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [passwordRequirements, loadPasswordRequirements, validatePassword, toast]);

  // Secure sign in with enhanced security logging
  const secureSignIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log failed login attempt (skip captcha-related failures and server errors)
        const msg = typeof error.message === 'string' ? error.message : '';
        const isSystemError = msg.toLowerCase().includes('captcha') || 
                             msg.toLowerCase().includes('unexpected_failure') ||
                             msg.toLowerCase().includes('500') ||
                             msg.toLowerCase().includes('server');
        
        if (!isSystemError) {
          await logFailedLoginAttempt(email, msg || 'signin_failed');
        }
        throw error;
      }

      if (data.user) {
        await logSecurityEvent('user_signin', 'user', data.user.id, true);
      }

      return { success: true, user: data.user, session: data.session };
    } catch (error: any) {
      const rawMsg = error?.message;
      const msg = typeof rawMsg === 'string' ? rawMsg.toLowerCase() : '';
      toast({
        title: "خطأ في تسجيل الدخول",
        description: msg.includes('captcha') ? 'فشل التحقق الأمني (Captcha). يرجى المحاولة لاحقاً أو تعطيل التحقق مؤقتاً من إعدادات Supabase.' : (rawMsg || 'خطأ في البريد الإلكتروني أو كلمة المرور'),
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Secure password change with validation
  const secureChangePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const requirements = passwordRequirements || await loadPasswordRequirements();
      
      // Validate new password
      const validation = validatePassword(newPassword, requirements);
      if (!validation.isValid) {
        toast({
          title: "كلمة مرور ضعيفة",
          description: validation.errors.join('\n'),
          variant: "destructive",
        });
        return { success: false, errors: validation.errors };
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      await logSecurityEvent('password_change', 'user', user.id, true);

      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح",
      });

      return { success: true };
    } catch (error: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await logSecurityEvent('password_change', 'user', user.id, false, error.message);
      }
      
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [passwordRequirements, loadPasswordRequirements, validatePassword, toast]);

  // Log failed login attempts
  const logFailedLoginAttempt = async (email: string, reason: string) => {
    try {
      await supabase.functions.invoke('track-failed-login', {
        body: { 
          email, 
          reason,
          user_agent: navigator.userAgent 
        }
      });
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  };

  // Log security events
  const logSecurityEvent = async (
    actionType: string, 
    resourceType: string, 
    resourceId: string | null, 
    success: boolean,
    failureReason?: string
  ) => {
    try {
      await supabase.functions.invoke('log-security-event', {
        body: {
          action_type: actionType,
          resource_type: resourceType,
          resource_id: resourceId,
          success,
          failure_reason: failureReason,
          user_agent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  return {
    loading,
    passwordRequirements,
    loadPasswordRequirements,
    validatePassword,
    secureSignUp,
    secureSignIn,
    secureChangePassword,
  };
}