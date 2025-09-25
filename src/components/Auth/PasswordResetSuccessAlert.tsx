import { CheckCircle, Clock, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PasswordResetSuccessAlertProps {
  email: string;
  showOtpInfo?: boolean;
}

export function PasswordResetSuccessAlert({ email, showOtpInfo = true }: PasswordResetSuccessAlertProps) {
  return (
    <div className="space-y-4">
      {/* Success confirmation */}
      <Alert className="border-success/20 bg-success/5">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertDescription className="text-success">
          <strong>تم إرسال الرسالة بنجاح!</strong><br />
          تم إرسال رسالة إعادة تعيين كلمة المرور إلى: <strong>{email}</strong>
        </AlertDescription>
      </Alert>

      {/* Security and timing info */}
      <Alert className="border-primary/20 bg-primary/5">
        <Clock className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          <strong>معلومات مهمة:</strong><br />
          • صلاحية الرابط: 60 دقيقة من وقت الإرسال<br />
          • تحقق من مجلد "الرسائل غير المرغوب فيها" إذا لم تجد الرسالة<br />
          {showOtpInfo && '• ستجد رمز تحقق مكون من 6 أرقام في الرسالة للحماية الإضافية'}
        </AlertDescription>
      </Alert>

      {/* Security notice */}
      <Alert className="border-amber-200 bg-amber-50">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>تحذير أمني:</strong> لا تشارك رابط إعادة التعيين أو رمز التحقق مع أي شخص. إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة.
        </AlertDescription>
      </Alert>
    </div>
  );
}