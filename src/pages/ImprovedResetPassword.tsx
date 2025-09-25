import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Car, Key, Loader2, CheckCircle, AlertTriangle, Shield, Clock } from 'lucide-react';
import { PasswordStrengthIndicator, validatePassword } from '@/components/ui/password-strength-indicator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ImprovedResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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
        .select('id, expires_at, used_at, email, otp_code')
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
        setTokenError('انتهت صلاحية هذا الرابط (60 دقيقة). يرجى طلب رابط جديد');
      } else {
        setIsValidToken(true);
        setResetEmail(data.email);
        // Show OTP input if OTP code exists
        setShowOtpInput(!!data.otp_code);
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

    if (showOtpInput && (!otpCode || otpCode.length !== 6)) {
      toast({
        title: "رمز التحقق مطلوب",
        description: "يرجى إدخال رمز التحقق المكون من 6 أرقام",
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

      // Update user password via Supabase Auth Admin API with OTP verification
      const { error: updateError } = await supabase.functions.invoke('reset-password', {
        body: { 
          email: resetEmail, 
          newPassword: password,
          tokenHash: hashString,
          otpCode: showOtpInput ? otpCode : undefined
        }
      });

      if (updateError) {
        // Handle specific error types
        if (updateError.message?.includes('OTP')) {
          toast({
            title: "رمز التحقق غير صحيح",
            description: "يرجى التحقق من رمز التحقق والمحاولة مرة أخرى",
            variant: "destructive",
          });
          return;
        }
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
        description: "تم تحديث كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth');
      }, 3000);

    } catch (error: any) {
      console.error('Reset error:', error);
      let errorMessage = "حدث خطأ أثناء تحديث كلمة المرور";
      
      if (error.message?.includes('expired')) {
        errorMessage = "انتهت صلاحية رابط إعادة التعيين";
      } else if (error.message?.includes('invalid')) {
        errorMessage = "رابط إعادة التعيين غير صالح";
      } else if (error.message?.includes('used')) {
        errorMessage = "تم استخدام هذا الرابط من قبل";
      }
      
      toast({
        title: "خطأ في التحديث",
        description: errorMessage,
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
              الدرايبي - CarRent Pro
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
            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50">
                <Clock className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>ملاحظة:</strong> روابط إعادة تعيين كلمة المرور صالحة لمدة 60 دقيقة فقط من وقت الإرسال
                </AlertDescription>
              </Alert>
              
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
              الدرايبي - CarRent Pro
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
            الدرايبي - CarRent Pro
          </h1>
          <p className="text-muted-foreground">إعادة تعيين كلمة المرور</p>
        </div>

        <Card className="card-premium shadow-strong">
          <CardHeader>
            <CardTitle className="text-center">كلمة مرور جديدة</CardTitle>
            <CardDescription className="text-center">
              {showOtpInput 
                ? 'أدخل رمز التحقق من البريد الإلكتروني وكلمة المرور الجديدة'
                : 'أدخل كلمة المرور الجديدة لحسابك'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showOtpInput && (
              <Alert className="mb-6 border-primary/20 bg-primary/5">
                <Shield className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  <strong>تحقق أمني:</strong> تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني {resetEmail}
                </AlertDescription>
              </Alert>
            )}

            <Alert className="mb-6">
              <Key className="h-4 w-4" />
              <AlertDescription>
                اختر كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز خاصة
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              {showOtpInput && (
                <div className="space-y-2">
                  <Label htmlFor="otpCode">رمز التحقق (6 أرقام)</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required={showOtpInput}
                    placeholder="123456"
                    disabled={loading}
                    className="text-center text-lg tracking-widest font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    تحقق من بريدك الإلكتروني للحصول على رمز التحقق
                  </p>
                </div>
              )}

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
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-destructive">كلمة المرور وتأكيدها غير متطابقين</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-glow"
                disabled={
                  loading || 
                  !validatePassword(password).isValid || 
                  password !== confirmPassword ||
                  (showOtpInput && otpCode.length !== 6)
                }
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

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                بمجرد تحديث كلمة المرور، سيتم إبطال جميع جلسات الدخول الأخرى لحمايتك
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}