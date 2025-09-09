import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Car, Key, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { PasswordStrengthIndicator, validatePassword } from '@/components/ui/password-strength-indicator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setTokenError('رابط غير صالح أو منتهي الصلاحية');
      setValidating(false);
      return;
    }

    try {
      // Hash the token to match database
      const tokenHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(token)
      );
      const hashString = Array.from(new Uint8Array(tokenHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { data, error } = await supabase
        .from('password_reset_requests')
        .select('id, expires_at, used_at, email')
        .eq('token_hash', hashString)
        .maybeSingle();

      if (error) {
        console.error('Token validation error:', error);
        setTokenError('خطأ في النظام، حاول لاحقاً');
      } else if (!data) {
        setTokenError('رابط غير صالح أو منتهي الصلاحية');
      } else if (data.used_at) {
        setTokenError('تم استخدام هذا الرابط من قبل');
      } else if (new Date(data.expires_at) < new Date()) {
        setTokenError('انتهت صلاحية هذا الرابط');
      } else {
        setIsValidToken(true);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setTokenError('خطأ في النظام، حاول لاحقاً');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "كلمة مرور ضعيفة",
        description: passwordValidation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "خطأ في التأكيد",
        description: "كلمة المرور وتأكيدها غير متطابقين",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Hash the token
      const tokenHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(token!)
      );
      const hashString = Array.from(new Uint8Array(tokenHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Get user email from token
      const { data: resetData, error: fetchError } = await supabase
        .from('password_reset_requests')
        .select('email')
        .eq('token_hash', hashString)
        .single();

      if (fetchError || !resetData) {
        throw new Error('رابط غير صالح');
      }

      // Update user password via Supabase Auth Admin API
      const { error: updateError } = await supabase.functions.invoke('reset-password', {
        body: { 
          email: resetData.email, 
          newPassword: password,
          tokenHash: hashString
        }
      });

      if (updateError) {
        throw updateError;
      }

      // Mark token as used
      await supabase
        .from('password_reset_requests')
        .update({ used_at: new Date().toISOString() })
        .eq('token_hash', hashString);

      setSuccess(true);
      toast({
        title: "تم تحديث كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);

    } catch (error: any) {
      console.error('Reset error:', error);
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-premium shadow-strong">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">جاري التحقق من الرابط...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
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
          </div>

          <Card className="card-premium shadow-strong">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-2xl mb-4 mx-auto">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>رابط غير صالح</CardTitle>
              <CardDescription>{tokenError}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                العودة لتسجيل الدخول
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
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
          </div>

          <Card className="card-premium shadow-strong">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-2xl mb-4 mx-auto">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle>تم تحديث كلمة المرور</CardTitle>
              <CardDescription>
                تم تحديث كلمة المرور بنجاح. سيتم توجيهك لصفحة تسجيل الدخول...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full btn-glow"
              >
                تسجيل الدخول الآن
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <p className="text-muted-foreground">إعادة تعيين كلمة المرور</p>
        </div>

        <Card className="card-premium shadow-strong">
          <CardHeader>
            <CardTitle className="text-center">كلمة مرور جديدة</CardTitle>
            <CardDescription className="text-center">
              أدخل كلمة المرور الجديدة لحسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <Key className="h-4 w-4" />
              <AlertDescription>
                اختر كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
                {password && <PasswordStrengthIndicator password={password} />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-glow"
                disabled={loading || !validatePassword(password).isValid || password !== confirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    تحديث كلمة المرور
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}