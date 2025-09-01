import { AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AccountLockoutWarningProps {
  remainingAttempts: number;
  lockoutTimeRemaining?: number;
  onResetPassword?: () => void;
}

export function AccountLockoutWarning({ 
  remainingAttempts, 
  lockoutTimeRemaining,
  onResetPassword 
}: AccountLockoutWarningProps) {
  if (lockoutTimeRemaining && lockoutTimeRemaining > 0) {
    const minutes = Math.ceil(lockoutTimeRemaining / 60);
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>تم قفل الحساب مؤقتاً</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>تم قفل حسابك لمدة {minutes} دقيقة بسبب محاولات دخول متكررة فاشلة.</p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3 w-3" />
            <span>سيتم إلغاء القفل خلال {minutes} دقيقة</span>
          </div>
          {onResetPassword && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onResetPassword}
              className="mt-2"
            >
              إعادة تعيين كلمة المرور
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (remainingAttempts <= 3 && remainingAttempts > 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>تحذير أمني</AlertTitle>
        <AlertDescription>
          متبقي {remainingAttempts} محاولة قبل قفل الحساب مؤقتاً.
          تأكد من صحة بيانات الدخول.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}