import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: '8 أحرف على الأقل', test: (p) => p.length >= 8 },
  { label: 'حرف كبير واحد على الأقل', test: (p) => /[A-Z]/.test(p) },
  { label: 'حرف صغير واحد على الأقل', test: (p) => /[a-z]/.test(p) },
  { label: 'رقم واحد على الأقل', test: (p) => /\d/.test(p) },
  { label: 'رمز خاص واحد على الأقل', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthProps) {
  const { strength, score, metRequirements } = useMemo(() => {
    const metReqs = requirements.map(req => req.test(password));
    const score = metReqs.filter(Boolean).length;
    
    let strength: 'ضعيف' | 'متوسط' | 'جيد' | 'قوي' | 'ممتاز' = 'ضعيف';
    if (score === 0) strength = 'ضعيف';
    else if (score <= 2) strength = 'ضعيف';
    else if (score === 3) strength = 'متوسط';
    else if (score === 4) strength = 'جيد';
    else if (score === 5) strength = 'ممتاز';
    
    return { strength, score, metRequirements: metReqs };
  }, [password]);

  const getStrengthColor = () => {
    switch (strength) {
      case 'ضعيف': return 'text-destructive';
      case 'متوسط': return 'text-orange-500';
      case 'جيد': return 'text-yellow-500';
      case 'ممتاز': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getProgressColor = () => {
    switch (strength) {
      case 'ضعيف': return 'bg-destructive';
      case 'متوسط': return 'bg-orange-500';
      case 'جيد': return 'bg-yellow-500';
      case 'ممتاز': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">قوة كلمة المرور</span>
          <span className={cn("text-sm font-medium", getStrengthColor())}>
            {strength}
          </span>
        </div>
        <Progress 
          value={(score / requirements.length) * 100} 
          className={cn("h-2", getProgressColor())}
        />
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">المتطلبات:</span>
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
              {metRequirements[index] ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span 
                className={cn(
                  "text-sm",
                  metRequirements[index] 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-muted-foreground"
                )}
              >
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  const metRequirements = requirements.map(req => {
    const passes = req.test(password);
    if (!passes) {
      errors.push(req.label);
    }
    return passes;
  });

  const score = metRequirements.filter(Boolean).length;
  const isValid = score >= 4; // Require at least 4 out of 5 criteria

  return { isValid, errors, score };
}