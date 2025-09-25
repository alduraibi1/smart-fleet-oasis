import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Shield, ShieldCheck, Smartphone, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorAuthProps {
  userId: string;
  onComplete?: (enabled: boolean) => void;
}

export function TwoFactorAuth({ userId, onComplete }: TwoFactorAuthProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const { toast } = useToast();

  // Check if 2FA is already enabled
  useEffect(() => {
    check2FAStatus();
  }, [userId]);

  const check2FAStatus = async () => {
    // For now, we'll use a simpler check since user_2fa_settings table doesn't exist
    // This would need to be implemented with the proper database schema
    try {
      // Placeholder - implement when 2FA tables are created
      setIs2FAEnabled(false);
    } catch (error) {
      setIs2FAEnabled(false);
    }
  };

  const setup2FA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: { user_id: userId }
      });

      if (error) throw error;

      setSecret(data.secret);
      setQrCode(data.qr_code);
      setBackupCodes(data.backup_codes);
      setStep('verify');
    } catch (error: any) {
      toast({
        title: 'خطأ في إعداد المصادقة الثنائية',
        description: error.message || 'حدث خطأ أثناء إعداد المصادقة الثنائية',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'رمز غير صحيح',
        description: 'يرجى إدخال رمز مكون من 6 أرقام',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-setup', {
        body: { 
          user_id: userId,
          verification_code: verificationCode,
          secret: secret
        }
      });

      if (error) throw error;

      setIs2FAEnabled(true);
      setStep('enabled');
      onComplete?.(true);
      
      toast({
        title: 'تم تفعيل المصادقة الثنائية',
        description: 'تم تفعيل المصادقة الثنائية بنجاح لحسابك',
      });
    } catch (error: any) {
      toast({
        title: 'رمز التحقق غير صحيح',
        description: 'يرجى التأكد من الرمز والمحاولة مرة أخرى',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('disable-2fa', {
        body: { user_id: userId }
      });

      if (error) throw error;

      setIs2FAEnabled(false);
      setStep('setup');
      onComplete?.(false);
      
      toast({
        title: 'تم إلغاء المصادقة الثنائية',
        description: 'تم إلغاء تفعيل المصادقة الثنائية',
      });
    } catch (error: any) {
      toast({
        title: 'خطأ في إلغاء المصادقة الثنائية',
        description: error.message || 'حدث خطأ أثناء إلغاء المصادقة الثنائية',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'enabled') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <CardTitle>المصادقة الثنائية مفعلة</CardTitle>
          <CardDescription>
            حسابك محمي بالمصادقة الثنائية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              تم تفعيل طبقة حماية إضافية لحسابك. ستحتاج لرمز من تطبيق المصادقة عند تسجيل الدخول.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">الحالة</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              مفعل
            </Badge>
          </div>

          <Button 
            variant="outline" 
            onClick={disable2FA}
            disabled={loading}
            className="w-full"
          >
            إلغاء تفعيل المصادقة الثنائية
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Smartphone className="h-12 w-12 text-blue-500 mx-auto mb-2" />
          <CardTitle>تفعيل المصادقة الثنائية</CardTitle>
          <CardDescription>
            امسح رمز QR أو أدخل الرمز السري في تطبيق المصادقة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="text-center">
              <img src={qrCode} alt="QR Code" className="mx-auto mb-4 border rounded" />
              <div className="text-xs text-gray-500 mb-4">
                الرمز السري: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="verification-code">رمز التحقق من التطبيق</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
          </div>

          {backupCodes.length > 0 && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <div className="mb-2 font-medium">رموز النسخ الاحتياطي:</div>
                <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-gray-100 p-1 rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-amber-600">
                  احفظ هذه الرموز في مكان آمن. يمكن استخدام كل رمز مرة واحدة فقط.
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setStep('setup')}
              disabled={loading}
              className="flex-1"
            >
              رجوع
            </Button>
            <Button 
              onClick={verify2FA}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1"
            >
              تفعيل
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <CardTitle>المصادقة الثنائية</CardTitle>
        <CardDescription>
          أضف طبقة حماية إضافية لحسابك
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <QrCode className="h-4 w-4" />
          <AlertDescription>
            المصادقة الثنائية تحمي حسابك حتى لو تم اختراق كلمة المرور. ستحتاج لتطبيق مصادقة مثل Google Authenticator أو Authy.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">الحالة</span>
            <Badge variant="secondary">غير مفعل</Badge>
          </div>
        </div>

        <Button 
          onClick={setup2FA}
          disabled={loading}
          className="w-full"
        >
          <Shield className="h-4 w-4 mr-2" />
          تفعيل المصادقة الثنائية
        </Button>
      </CardContent>
    </Card>
  );
}