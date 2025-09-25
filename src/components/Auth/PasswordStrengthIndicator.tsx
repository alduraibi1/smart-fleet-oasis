import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PasswordRequirements {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  requirements: PasswordRequirements;
  className?: string;
}

export function PasswordStrengthIndicator({ 
  password, 
  requirements, 
  className = "" 
}: PasswordStrengthIndicatorProps) {
  const analysis = useMemo(() => {
    const checks = [
      {
        label: `الطول (${requirements.min_length}+ أحرف)`,
        passed: password.length >= requirements.min_length,
        required: true
      },
      {
        label: 'حرف كبير (A-Z)',
        passed: /[A-Z]/.test(password),
        required: requirements.require_uppercase
      },
      {
        label: 'حرف صغير (a-z)',
        passed: /[a-z]/.test(password),
        required: requirements.require_lowercase
      },
      {
        label: 'رقم (0-9)',
        passed: /[0-9]/.test(password),
        required: requirements.require_numbers
      },
      {
        label: 'رمز خاص (!@#$%)',
        passed: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        required: requirements.require_symbols
      }
    ].filter(check => check.required);

    const passedCount = checks.filter(check => check.passed).length;
    const totalChecks = checks.length;
    const percentage = totalChecks > 0 ? (passedCount / totalChecks) * 100 : 0;
    
    let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
    let strengthLabel = 'ضعيفة';
    let strengthColor = 'destructive';

    if (percentage === 100) {
      // Additional checks for very strong passwords
      const hasVariety = password.length >= 12;
      const hasComplexity = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password);
      
      if (hasVariety && hasComplexity) {
        strength = 'very-strong';
        strengthLabel = 'قوية جداً';
        strengthColor = 'default';
      } else {
        strength = 'strong';
        strengthLabel = 'قوية';
        strengthColor = 'secondary';
      }
    } else if (percentage >= 80) {
      strength = 'medium';
      strengthLabel = 'متوسطة';
      strengthColor = 'outline';
    }

    return {
      checks,
      passedCount,
      totalChecks,
      percentage,
      strength,
      strengthLabel,
      strengthColor,
      isValid: percentage === 100
    };
  }, [password, requirements]);

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">قوة كلمة المرور</span>
          <Badge variant={analysis.strengthColor as any}>
            {analysis.strengthLabel}
          </Badge>
        </div>
        <Progress 
          value={analysis.percentage} 
          className="h-2"
        />
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        {analysis.checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {check.passed ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={check.passed ? 'text-green-600' : 'text-gray-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {/* Security Tips */}
      {analysis.percentage < 100 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">نصائح لتقوية كلمة المرور:</p>
              <ul className="space-y-1 text-xs">
                {!analysis.checks.find(c => c.label.includes('الطول'))?.passed && (
                  <li>• استخدم {requirements.min_length} أحرف على الأقل</li>
                )}
                {requirements.require_symbols && !analysis.checks.find(c => c.label.includes('رمز'))?.passed && (
                  <li>• أضف رموز خاصة مثل !@#$%</li>
                )}
                {password.length < 12 && (
                  <li>• كلمات المرور الطويلة أكثر أماناً</li>
                )}
                <li>• تجنب المعلومات الشخصية الواضحة</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}