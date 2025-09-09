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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      // First, verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح",
      });

      return { success: true };
    } catch (error: any) {
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