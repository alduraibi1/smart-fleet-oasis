import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirements {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  requirements?: PasswordRequirements;
  className?: string;
}

export function PasswordStrengthIndicator({ 
  password, 
  requirements = {
    min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_symbols: true
  },
  className 
}: PasswordStrengthIndicatorProps) {
  const checks = [
    {
      label: `على الأقل ${requirements.min_length} أحرف`,
      met: password.length >= requirements.min_length,
      required: true
    },
    {
      label: 'حرف كبير واحد على الأقل (A-Z)',
      met: /[A-Z]/.test(password),
      required: requirements.require_uppercase
    },
    {
      label: 'حرف صغير واحد على الأقل (a-z)',
      met: /[a-z]/.test(password),
      required: requirements.require_lowercase
    },
    {
      label: 'رقم واحد على الأقل (0-9)',
      met: /[0-9]/.test(password),
      required: requirements.require_numbers
    },
    {
      label: 'رمز خاص واحد على الأقل (!@#$%^&*)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      required: requirements.require_symbols
    }
  ].filter(check => check.required);

  const metRequirements = checks.filter(check => check.met).length;
  const totalRequirements = checks.length;
  const strengthPercentage = totalRequirements > 0 ? (metRequirements / totalRequirements) * 100 : 0;

  const getStrengthColor = () => {
    if (strengthPercentage < 40) return 'bg-destructive';
    if (strengthPercentage < 80) return 'bg-warning';
    return 'bg-success';
  };

  const getStrengthText = () => {
    if (strengthPercentage < 40) return 'ضعيفة';
    if (strengthPercentage < 80) return 'متوسطة';
    return 'قوية';
  };

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-foreground">قوة كلمة المرور</span>
          <span className={cn('font-medium', {
            'text-destructive': strengthPercentage < 40,
            'text-warning': strengthPercentage >= 40 && strengthPercentage < 80,
            'text-success': strengthPercentage >= 80
          })}>
            {getStrengthText()}
          </span>
        </div>
        <Progress 
          value={strengthPercentage} 
          className={cn('h-2', getStrengthColor())}
        />
      </div>

      <div className="space-y-2">
        {checks.map((check, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 text-sm"
          >
            {check.met ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={cn(
              check.met ? 'text-success' : 'text-muted-foreground'
            )}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}