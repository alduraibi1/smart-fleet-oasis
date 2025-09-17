import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Lock, Key, Shield, Eye, EyeOff, Activity, AlertTriangle } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/Security/PasswordStrengthIndicator';
import { SecurityMonitor } from '@/components/Security/SecurityMonitor';

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  
  // Use secure authentication hook
  const { 
    loading, 
    passwordRequirements, 
    validatePassword, 
    secureChangePassword 
  } = useSecureAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ في التأكيد",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
        variant: "destructive",
      });
      return;
    }

    // Validate password using secure requirements
    if (passwordRequirements) {
      const validation = validatePassword(newPassword, passwordRequirements);
      if (!validation.isValid) {
        toast({
          title: "كلمة مرور ضعيفة",
          description: validation.errors.join('\n'),
          variant: "destructive",
        });
        return;
      }
    }

    const result = await secureChangePassword(currentPassword, newPassword);
    
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Tabs defaultValue="password" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="password" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          كلمة المرور
        </TabsTrigger>
        <TabsTrigger value="monitor" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          مراقبة الأمان
        </TabsTrigger>
      </TabsList>

      <TabsContent value="password" className="space-y-6">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              تغيير كلمة المرور
            </CardTitle>
            <CardDescription>
              تحديث كلمة المرور للحفاظ على أمان حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="أدخل كلمة المرور الحالية"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {newPassword && passwordRequirements && (
                  <PasswordStrengthIndicator 
                    password={newPassword} 
                    requirements={passwordRequirements}
                  />
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              ميزات الأمان المفعلة
            </CardTitle>
            <CardDescription>
              الميزات الأمنية المطبقة على حسابك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <h4 className="font-medium text-success">الحماية من التسريبات</h4>
                  <p className="text-sm text-muted-foreground">
                    يتم فحص كلمة المرور ضد قواعد بيانات التسريبات المعروفة
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <h4 className="font-medium text-success">الحماية من المحاولات المتكررة</h4>
                  <p className="text-sm text-muted-foreground">
                    يتم قفل الحساب مؤقتاً عند محاولات الدخول الفاشلة المتكررة
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium text-primary">تسجيل الأنشطة الأمنية</h4>
                  <p className="text-sm text-muted-foreground">
                    يتم تسجيل جميع الأنشطة الأمنية لمراجعتها
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <h4 className="font-medium text-warning">المصادقة الثنائية</h4>
                  <p className="text-sm text-muted-foreground">
                    قريباً - ستتمكن من تفعيل المصادقة الثنائية لحماية إضافية
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="monitor">
        <SecurityMonitor />
      </TabsContent>
    </Tabs>
  );
}