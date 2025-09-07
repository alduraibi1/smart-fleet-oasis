
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Car, LogIn, UserPlus, User, Building, Users } from 'lucide-react';
import { PasswordStrengthIndicator, validatePassword } from '@/components/ui/password-strength-indicator';
import { AccountLockoutWarning } from '@/components/Auth/AccountLockoutWarning';
import { SessionTimeoutWarning } from '@/components/Auth/SessionTimeoutWarning';
import { useLoginAttempts } from '@/hooks/useLoginAttempts';

const userTypes = [
  { value: 'employee', label: 'موظف', icon: User, description: 'موظف في الشركة' },
  { value: 'owner', label: 'مالك مركبة', icon: Car, description: 'مالك مركبات للإيجار' },
  { value: 'partner', label: 'شريك', icon: Building, description: 'شريك في الشركة' }
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    isLocked, 
    lockoutTimeRemaining, 
    remainingAttempts, 
    addFailedAttempt, 
    clearAttempts 
  } = useLoginAttempts(email);

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
    
    // Check if account is locked
    if (isLocked) {
      toast({
        title: "الحساب مقفل مؤقتاً",
        description: "يرجى الانتظار قبل المحاولة مرة أخرى",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        // Clear failed attempts on successful login
        clearAttempts();

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في نظام إدارة تأجير المركبات",
        });

        navigate('/');
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

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              phone: phone,
              user_type: userType
            }
          }
        });

        if (error) throw error;

        toast({
          title: "تم إرسال طلب التسجيل",
          description: "سيتم مراجعة طلبك من قبل الإدارة وستصلك رسالة تأكيد قريباً",
        });
      }
    } catch (error: any) {
      // Add failed attempt for login errors (not signup)
      if (isLogin && error?.message?.toLowerCase().includes('invalid login credentials')) {
        addFailedAttempt();
      }
      
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
            {/* Session timeout warning for authenticated users */}
            <SessionTimeoutWarning />
            
            {/* Account lockout warning */}
            {isLogin && (
              <AccountLockoutWarning 
                remainingAttempts={remainingAttempts}
                lockoutTimeRemaining={lockoutTimeRemaining}
              />
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
                    <Select value={userType} onValueChange={setUserType} required>
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
                {!isLogin && password && (
                  <PasswordStrengthIndicator password={password} />
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-glow btn-scale"
                disabled={loading || isLocked || (!isLogin && !validatePassword(password).isValid) || (!isLogin && (!fullName || !phone || !userType))}
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
