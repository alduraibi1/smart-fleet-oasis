
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, LogIn, UserPlus, User, Building, Users, Shield, AlertTriangle } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/Auth/PasswordStrengthIndicator';
import { AccountLockoutWarning } from '@/components/Auth/AccountLockoutWarning';
import { SessionTimeoutWarning } from '@/components/Auth/SessionTimeoutWarning';
import { ImprovedPasswordResetForm } from '@/components/Auth/ImprovedPasswordResetForm';
import { SuperAdminForm } from '@/components/Auth/SuperAdminForm';
import { useFailedLoginTracking } from '@/hooks/useFailedLoginTracking';
import { useSecureSession } from '@/hooks/useSecureSession';

const userTypes = [
  { value: 'employee', label: 'موظف', icon: User, description: 'موظف في الشركة' },
  { value: 'owner', label: 'مالك مركبة', icon: Car, description: 'مالك مركبات للإيجار' },
  { value: 'partner', label: 'شريك', icon: Building, description: 'شريك في الشركة' }
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSuperAdminForm, setShowSuperAdminForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'employee' | 'partner' | 'owner'>('employee');
  const [loading, setLoading] = useState(false);
  const [superAdminLoading, setSuperAdminLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { loading: secureLoading, passwordRequirements, loadPasswordRequirements, validatePassword, secureSignUp, secureSignIn } = useSecureAuth();
  const { trackFailedAttempt, isBlocked, remainingAttempts, lockoutTimeRemaining, clearAttempts } = useFailedLoginTracking(email);
  const { sessionSecurity, sessionWarnings, initializeSecureSession } = useSecureSession();

  // Load password requirements on component mount
  useEffect(() => {
    loadPasswordRequirements();
  }, [loadPasswordRequirements]);

  // Redirect if already authenticated
  if (user) {
    navigate('/');
    return null;
  }

  // Show forgot password form
  if (showForgotPassword) {
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
          <ImprovedPasswordResetForm onBack={() => setShowForgotPassword(false)} />
        </div>
      </div>
    );
  }

  // Show super admin creation form
  if (showSuperAdminForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-variant rounded-2xl shadow-glow mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
              إنشاء المستخدم الإداري الأول
            </h1>
          </div>
          <SuperAdminForm 
            onBack={() => setShowSuperAdminForm(false)}
            loading={superAdminLoading}
            setLoading={setSuperAdminLoading}
          />
        </div>
      </div>
    );
  }

  const mapAuthError = (error: any): string => {
    const msg = (error?.message || '').toLowerCase();
    if (msg.includes('captcha verification process failed') || msg.includes('captcha')) {
      return 'مشكلة في التحقق الأمني. يرجى المحاولة لاحقاً أو التواصل مع الإدارة';
    }
    if (msg.includes('invalid login credentials')) return 'بيانات الدخول غير صحيحة';
    if (msg.includes('email address is invalid')) return 'صيغة البريد الإلكتروني غير صحيحة';
    if (msg.includes('user already registered') || msg.includes('already exists')) return 'البريد الإلكتروني مسجل مسبقاً';
    if (msg.includes('rate limit')) return 'تم تجاوز الحد المسموح من المحاولات، حاول لاحقاً';
    if (msg.includes('otp')) return 'انتهت صلاحية رمز التحقق أو غير صالح';
    if (msg.includes('unexpected_failure')) return 'خطأ في الخادم، يرجى المحاولة لاحقاً';
    return error?.message || 'حدث خطأ غير متوقع';
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isBlocked) {
      const minutes = Math.ceil(lockoutTimeRemaining / 60);
      toast({
        title: "الحساب مقفل مؤقتاً",
        description: `تم حظر المحاولات لمدة ${minutes} دقيقة بسبب المحاولات المتكررة الفاشلة`,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        // Use secure sign in
        const result = await secureSignIn(email, password);
        
      if (result.success) {
        // Initialize secure session after successful login
        await initializeSecureSession();
        // Clear failed attempts on successful login
        clearAttempts();
        navigate('/');
      } else {
        // Track failed attempt with specific reason
        const reason = result.error || 'Invalid credentials';
        const trackResult = await trackFailedAttempt(reason);
        
        // Show appropriate error message
        const errorMsg = mapAuthError({ message: reason });
        toast({
          title: "فشل في تسجيل الدخول",
          description: trackResult.blocked 
            ? `تم حظر المحاولات لمدة 15 دقيقة بسبب المحاولات المتكررة الفاشلة`
            : `${errorMsg}. ${remainingAttempts - 1} محاولات متبقية`,
          variant: "destructive",
        });
      }
      } else {
        // Validate required fields for signup
        if (!fullName.trim()) {
          toast({
            title: "خطأ في البيانات",
            description: "يرجى إدخال الاسم الكامل",
            variant: "destructive",
          });
          return;
        }

        if (!phone.trim()) {
          toast({
            title: "خطأ في البيانات", 
            description: "يرجى إدخال رقم الهاتف",
            variant: "destructive",
          });
          return;
        }

        if (!userType) {
          toast({
            title: "خطأ في البيانات",
            description: "يرجى اختيار نوع المستخدم",
            variant: "destructive",
          });
          return;
        }

        // Use secure sign up with validation
        const result = await secureSignUp(email, password, fullName);
        if (result.success) {
          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: "يرجى انتظار موافقة الإدارة على حسابك",
          });
          // Switch to login view
          setIsLogin(true);
        } else {
          const errorMsg = mapAuthError({ message: result.error });
          toast({
            title: "فشل في إنشاء الحساب",
            description: errorMsg,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // For login attempts, track the failure if it's a credential error
      if (isLogin && error?.message) {
        const reason = error.message;
        const trackResult = await trackFailedAttempt(reason);
        
        const errorMsg = mapAuthError(error);
        toast({
          title: "فشل في تسجيل الدخول",
          description: trackResult.blocked 
            ? `تم حظر المحاولات لمدة 15 دقيقة`
            : `${errorMsg}. ${Math.max(0, remainingAttempts - 1)} محاولات متبقية`,
          variant: "destructive",
        });
      } else {
        // For signup errors or other issues
        const errorMsg = mapAuthError(error);
        toast({
          title: isLogin ? "فشل في تسجيل الدخول" : "فشل في إنشاء الحساب",
          description: errorMsg,
          variant: "destructive",
        });
      }
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
            {/* Session timeout warning for authenticated users */}
            <SessionTimeoutWarning />
            
            {/* Account lockout warning */}
            {isLogin && (
              <AccountLockoutWarning 
                remainingAttempts={remainingAttempts}
                lockoutTimeRemaining={lockoutTimeRemaining}
                onResetPassword={() => setShowForgotPassword(true)}
              />
            )}

            {/* Session security warnings */}
            {sessionWarnings.length > 0 && (
              <div className="space-y-2">
                {sessionWarnings.map((warning, index) => (
                  <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">{warning}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              {/* Signup additional fields */}
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="05xxxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType">نوع المستخدم</Label>
                    <Select value={userType} onValueChange={(value: 'employee' | 'partner' | 'owner') => setUserType(value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المستخدم" />
                      </SelectTrigger>
                      <SelectContent>
                        {userTypes.map((type) => {
                          const IconComponent = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-primary" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{type.label}</span>
                                  <span className="text-xs text-muted-foreground">{type.description}</span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

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
                {!isLogin && password && passwordRequirements && (
                  <PasswordStrengthIndicator 
                    password={password} 
                    requirements={passwordRequirements}
                  />
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-glow btn-scale"
                disabled={
                  loading || 
                  secureLoading ||
                  isBlocked || 
                  (!isLogin && passwordRequirements && !validatePassword(password, passwordRequirements).isValid) || 
                  (!isLogin && (!fullName || !phone || !userType))
                }
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

            <div className="space-y-2">
              {isLogin && (
                <Button
                  variant="ghost"
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full text-sm text-primary hover:text-primary-variant"
                  disabled={loading}
                >
                  نسيت كلمة المرور؟
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-sm"
                disabled={loading}
              >
                {isLogin 
                  ? 'لا تملك حساب؟ إنشاء حساب جديد'
                  : 'لديك حساب؟ تسجيل الدخول'
                }
              </Button>
              
              <div className="pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={() => setShowSuperAdminForm(true)}
                  className="w-full text-xs text-muted-foreground hover:text-primary"
                  disabled={loading}
                >
                  <Users className="h-3 w-3 mr-2" />
                  إنشاء المستخدم الإداري الأول
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
