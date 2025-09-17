import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendResetEmail = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "تم إرسال الرسالة",
        description: "إذا كان البريد الإلكتروني موجود في نظامنا، ستصلك رسالة إعادة تعيين كلمة المرور",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال طلب إعادة التعيين",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, newPassword: string, tokenHash: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('reset-password', {
        body: { email, newPassword, tokenHash }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "تم تحديث كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث كلمة المرور",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Deprecated: Use useSecureAuth.secureChangePassword instead
  const changePassword = async (currentPassword: string, newPassword: string) => {
    console.warn('usePasswordReset.changePassword is deprecated. Use useSecureAuth.secureChangePassword instead.');
    
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('المستخدم غير مسجل الدخول');
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      // Update password with proper validation
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Log security event
      await supabase.functions.invoke('log-security-event', {
        body: {
          action_type: 'password_change',
          resource_type: 'user',
          resource_id: user.id,
          success: true
        }
      });

      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح",
      });

      return { success: true };
    } catch (error: any) {
      // Log failed password change attempt
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.functions.invoke('log-security-event', {
            body: {
              action_type: 'password_change',
              resource_type: 'user',
              resource_id: user.id,
              success: false,
              failure_reason: error.message
            }
          });
        }
      } catch (logError) {
        console.error('Failed to log security event:', logError);
      }

      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sendResetEmail,
    resetPassword,
    changePassword,
  };
}