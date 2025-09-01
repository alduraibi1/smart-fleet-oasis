
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Car, LogIn, UserPlus } from 'lucide-react';
import { PasswordStrengthIndicator, validatePassword } from '@/components/ui/password-strength-indicator';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    navigate('/');
    return null;
  }

  const mapAuthError = (error: any): string => {
    const msg = (error?.message || '').toLowerCase();
    if (msg.includes('invalid login credentials')) return 'بيانات الدخول غير صحيحة';
    if (msg.includes('email address is invalid')) return 'صيغة البريد الإلكتروني غير صحيحة';
    if (msg.includes('user already registered') || msg.includes('already exists')) return 'البريد الإلكتروني مسجل مسبقاً';
    if (msg.includes('rate limit')) return 'تم تجاوز الحد المسموح من المحاولات، حاول لاحقاً';
    if (msg.includes('otp')) return 'انتهت صلاحية رمز التحقق أو غير صالح';
    return error?.message || 'حدث خطأ غير متوقع';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في نظام إدارة تأجير المركبات",
        });

        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يرجى تفقد بريدك الإلكتروني لتأكيد الحساب",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في المصادقة",
        description: mapAuthError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-variant rounded-2xl shadow-glow mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
            CarRent Pro
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'تسجيل الدخول إلى حسابك' : 'إنشاء حساب جديد'}
          </p>
        </div>

        <Card className="card-premium shadow-strong">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@company.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                {!isLogin && password && (
                  <PasswordStrengthIndicator password={password} />
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-glow btn-scale"
                disabled={loading || (!isLogin && !validatePassword(password).isValid)}
              >
                {loading ? (
                  "جاري المعالجة..."
                ) : isLogin ? (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    تسجيل الدخول
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    إنشاء حساب
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin 
                  ? 'لا تملك حساب؟ إنشاء حساب جديد'
                  : 'لديك حساب؟ تسجيل الدخول'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
