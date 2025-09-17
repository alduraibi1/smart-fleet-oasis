import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { PasswordStrengthIndicator, validatePassword } from '@/components/ui/password-strength-indicator';

interface SuperAdminFormProps {
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function SuperAdminForm({ onBack, loading, setLoading }: SuperAdminFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const { toast } = useToast();

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!fullName.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال الاسم الكامل",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال البريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }

    if (!password || !validatePassword(password).isValid) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "يرجى إدخال كلمة مرور قوية",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-super-admin', {
        body: {
          email: email.trim(),
          password: password,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'فشل في إنشاء المستخدم الإداري');
      }

      if (data?.success) {
        toast({
          title: "تم إنشاء المستخدم الإداري بنجاح",
          description: `تم إنشاء الحساب الإداري للمستخدم: ${fullName}`,
        });
        
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
        
        // Go back to login form
        onBack();
      } else {
        throw new Error(data?.error || 'فشل في إنشاء المستخدم الإداري');
      }
    } catch (error: any) {
      console.error('Create super admin error:', error);
      toast({
        title: "خطأ في إنشاء المستخدم الإداري",
        description: error.message || 'حدث خطأ غير متوقع',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-premium shadow-strong">
      <CardHeader>
        <CardTitle className="text-center">إنشاء المستخدم الإداري الأول</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center text-sm text-muted-foreground">
          هذا النموذج مخصص لإنشاء أول مستخدم إداري في النظام لتجاوز قيود التحقق الأمني
        </div>
        
        <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminFullName">الاسم الكامل</Label>
            <Input
              id="adminFullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="أدخل الاسم الكامل للمستخدم الإداري"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">البريد الإلكتروني</Label>
            <Input
              id="adminEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPhone">رقم الهاتف (اختياري)</Label>
            <Input
              id="adminPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adminPassword">كلمة المرور</Label>
            <Input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            {password && (
              <PasswordStrengthIndicator password={password} />
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full btn-glow btn-scale"
            disabled={loading || !validatePassword(password).isValid || !fullName || !email}
          >
            {loading ? (
              "جاري إنشاء المستخدم الإداري..."
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                إنشاء المستخدم الإداري
              </>
            )}
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full text-sm"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة إلى تسجيل الدخول
        </Button>
      </CardContent>
    </Card>
  );
}