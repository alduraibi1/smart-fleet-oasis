
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, LogIn, UserPlus, User, Building, Users, Shield, AlertTriangle, Mail, Phone, Lock } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/Auth/PasswordStrengthIndicator';
import { AccountLockoutWarning } from '@/components/Auth/AccountLockoutWarning';
import { SessionTimeoutWarning } from '@/components/Auth/SessionTimeoutWarning';
import { ImprovedPasswordResetForm } from '@/components/Auth/ImprovedPasswordResetForm';
import { SuperAdminForm } from '@/components/Auth/SuperAdminForm';
import { useFailedLoginTracking } from '@/hooks/useFailedLoginTracking';
import { useSecureSession } from '@/hooks/useSecureSession';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AuthSkeleton } from '@/components/ui/skeleton-loader';
import { SmoothTransition, AnimatedContainer } from '@/components/ui/smooth-transition';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Safe auth hook usage with error handling
  let user = null;
  let authLoading = true;
  try {
    const authData = useAuth();
    user = authData.user;
    authLoading = authData.loading;
  } catch (error) {
    console.log('Auth context not ready yet, proceeding without user data');
  }
  
  const { loading: secureLoading, passwordRequirements, loadPasswordRequirements, validatePassword, secureSignUp, secureSignIn } = useSecureAuth();
  const { trackFailedAttempt, isBlocked, remainingAttempts, lockoutTimeRemaining, clearAttempts } = useFailedLoginTracking(email);
  const { sessionSecurity, sessionWarnings, initializeSecureSession } = useSecureSession();

  // Load password requirements on component mount
  useEffect(() => {
    loadPasswordRequirements();
  }, [loadPasswordRequirements]);

  // Form validation effect
  useEffect(() => {
    const validateForm = () => {
      if (isLogin) {
        // For login: only email and password are required
        return email.trim() !== '' && password.trim() !== '';
      } else {
        // For signup: all fields are required
        return (
          email.trim() !== '' && 
          password.trim() !== '' && 
          fullName.trim() !== '' && 
          phone.trim() !== '' && 
          userType && ['employee', 'owner', 'partner'].includes(userType)
        );
      }
    };

    setIsFormValid(validateForm());
  }, [isLogin, email, password, fullName, phone, userType]);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <AnimatedContainer>
          <AuthSkeleton />
        </AnimatedContainer>
      </div>
    );
  }

  // Redirect if already authenticated
  if (user && !authLoading) {
    navigate('/');
    return null;
  }

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <SmoothTransition type="slideUp" className="w-full max-w-md space-y-8">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-variant rounded-2xl shadow-glow mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Car className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
              CarRent Pro
            </h1>
          </motion.div>
          <ImprovedPasswordResetForm onBack={() => setShowForgotPassword(false)} />
        </SmoothTransition>
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
    // Safe error message extraction with null checks
    let errorMessage = '';
    if (error && typeof error === 'object') {
      const m = (error as any).message ?? (error as any).msg ?? '';
      errorMessage = typeof m === 'string' ? m : '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    const msg = errorMessage.toLowerCase();
    
    if (msg.includes('captcha verification process failed') || msg.includes('captcha')) {
      return 'مشكلة في التحقق الأمني. يرجى المحاولة لاحقاً أو التواصل مع الإدارة';
    }
    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
      return 'بيانات الدخول غير صحيحة';
    }
    if (msg.includes('email address is invalid') || msg.includes('invalid_email')) {
      return 'صيغة البريد الإلكتروني غير صحيحة';
    }
    if (msg.includes('user already registered') || msg.includes('already exists')) {
      return 'البريد الإلكتروني مسجل مسبقاً';
    }
    if (msg.includes('rate limit') || msg.includes('too_many_requests')) {
      return 'تم تجاوز الحد المسموح من المحاولات، حاول لاحقاً';
    }
    if (msg.includes('otp')) {
      return 'انتهت صلاحية رمز التحقق أو غير صالح';
    }
    if (msg.includes('unexpected_failure') || msg.includes('server_error')) {
      return 'خطأ في الخادم، يرجى المحاولة لاحقاً';
    }
    
    // Return the original error message or a fallback
    return errorMessage || 'حدث خطأ غير متوقع';
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
                    <EnhancedInput
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="أدخل اسمك الكامل"
                      leftIcon={<User className="h-4 w-4" />}
                      showValidation={!!fullName}
                      isValid={fullName ? !formErrors.fullName : undefined}
                      validationMessage={formErrors.fullName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <EnhancedInput
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="05xxxxxxxx"
                      leftIcon={<Phone className="h-4 w-4" />}
                      showValidation={!!phone}
                      isValid={phone ? !formErrors.phone : undefined}
                      validationMessage={formErrors.phone}
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
                <EnhancedInput
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@company.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  showValidation={!!email}
                  isValid={email ? !formErrors.email : undefined}
                  validationMessage={formErrors.email}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <EnhancedInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                />
                {!isLogin && password && passwordRequirements && (
                  <PasswordStrengthIndicator 
                    password={password} 
                    requirements={passwordRequirements}
                  />
                )}
              </div>

              <InteractiveButton 
                type="submit" 
                variant="premium"
                className="w-full"
                loading={loading}
                loadingText="جاري المعالجة..."
                disabled={
                  loading || 
                  secureLoading ||
                  isBlocked || 
                  (!isLogin && passwordRequirements && !validatePassword(password, passwordRequirements).isValid) || 
                  !isFormValid
                }
                animation="scale"
              >
                {isLogin ? (
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
              </InteractiveButton>
            </form>

            <div className="space-y-2">
              {isLogin && (
                <InteractiveButton
                  variant="ghost"
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full"
                  disabled={loading}
                  animation="slide"
                >
                  نسيت كلمة المرور؟
                </InteractiveButton>
              )}
              
              <InteractiveButton
                variant="outline"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormErrors({});
                }}
                className="w-full"
                disabled={loading}
                animation="scale"
              >
                {isLogin 
                  ? 'لا تملك حساب؟ إنشاء حساب جديد'
                  : 'لديك حساب؟ تسجيل الدخول'
                }
              </InteractiveButton>
              
              <div className="pt-4 border-t border-border/50">
                <InteractiveButton
                  variant="ghost"
                  onClick={() => setShowSuperAdminForm(true)}
                  className="w-full text-xs"
                  disabled={loading}
                  animation="scale"
                >
                  <Users className="h-3 w-3 mr-2" />
                  إنشاء المستخدم الإداري الأول
                </InteractiveButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
