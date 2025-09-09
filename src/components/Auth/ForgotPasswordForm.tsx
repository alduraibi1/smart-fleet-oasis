import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

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
        throw error;
      }

      setSent(true);
      toast({
        title: "تم إرسال الرسالة",
        description: "إذا كان البريد الإلكتروني موجود في نظامنا، ستصلك رسالة إعادة تعيين كلمة المرور",
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
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary text-center">
              إذا لم تجد الرسالة في البريد الوارد، تحقق من مجلد الرسائل غير المرغوب فيها
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة لتسجيل الدخول
          </Button>
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