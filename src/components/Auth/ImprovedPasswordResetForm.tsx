import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail, Loader2, Clock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImprovedPasswordResetFormProps {
  onBack: () => void;
}

export function ImprovedPasswordResetForm({ onBack }: ImprovedPasswordResetFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const { toast } = useToast();

  const startResendCountdown = () => {
    setCanResend(false);
    setResendCountdown(60);
    
    const timer = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال بريد إلكتروني صالح",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        // Handle rate limiting
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          toast({
            title: "تم تجاوز الحد المسموح",
            description: "تم تجاوز الحد المسموح من طلبات إعادة التعيين. حاول لاحقاً",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setSent(true);
      startResendCountdown();
      toast({
        title: "تم إرسال الرسالة",
        description: "إذا كان البريد الإلكتروني موجود في نظامنا، ستصلك رسالة إعادة تعيين كلمة المرور خلال دقائق قليلة",
      });

    } catch (error: any) {
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال طلب إعادة التعيين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      startResendCountdown();
      toast({
        title: "تم إعادة الإرسال",
        description: "تم إرسال رسالة جديدة إلى بريدك الإلكتروني",
      });

    } catch (error: any) {
      toast({
        title: "خطأ في إعادة الإرسال",
        description: error.message || "حدث خطأ أثناء إعادة الإرسال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="card-premium shadow-strong">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-variant rounded-2xl shadow-glow mb-4 mx-auto">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle>تم إرسال الرسالة</CardTitle>
          <CardDescription>
            تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-primary/20 bg-primary/5">
            <Clock className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>مدة صلاحية الرابط: 60 دقيقة</strong><br />
              إذا لم تجد الرسالة في البريد الوارد، تحقق من مجلد الرسائل غير المرغوب فيها
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={!canResend || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : canResend ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  إعادة إرسال الرسالة
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  إعادة الإرسال خلال {resendCountdown} ثانية
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة لتسجيل الدخول
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-premium shadow-strong">
      <CardHeader>
        <CardTitle className="text-center">نسيت كلمة المرور؟</CardTitle>
        <CardDescription className="text-center">
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            <strong>ملاحظة أمنية:</strong> ستتلقى رسالة تأكيد حتى لو لم يكن البريد الإلكتروني مسجلاً في النظام لحمايتك من التتبع
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">البريد الإلكتروني</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@company.com"
              disabled={loading}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full btn-glow"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                إرسال رابط إعادة التعيين
              </>
            )}
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة لتسجيل الدخول
        </Button>
      </CardContent>
    </Card>
  );
}