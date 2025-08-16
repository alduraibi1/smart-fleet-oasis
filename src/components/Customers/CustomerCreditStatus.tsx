
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CustomerCreditStatusProps {
  creditLimit: number;
  currentCredit: number;
  className?: string;
}

export function CustomerCreditStatus({ 
  creditLimit, 
  currentCredit, 
  className 
}: CustomerCreditStatusProps) {
  const usagePercentage = creditLimit > 0 ? (currentCredit / creditLimit) * 100 : 0;
  
  const getStatusInfo = () => {
    if (usagePercentage >= 100) {
      return {
        variant: "destructive" as const,
        icon: XCircle,
        text: "تجاوز الحد",
        color: "text-destructive"
      };
    } else if (usagePercentage >= 80) {
      return {
        variant: "secondary" as const,
        icon: AlertTriangle,
        text: "قارب النفاد",
        color: "text-orange-600"
      };
    } else {
      return {
        variant: "default" as const,
        icon: CheckCircle,
        text: "ضمن الحد",
        color: "text-green-600"
      };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">الحد الائتماني</span>
          <Badge variant={status.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.text}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>المستخدم: {currentCredit.toLocaleString()} ر.س</span>
            <span>الحد الأقصى: {creditLimit.toLocaleString()} ر.س</span>
          </div>
        </div>
        
        <div className="text-xs">
          <span className="text-muted-foreground">المتبقي: </span>
          <span className={`font-medium ${status.color}`}>
            {Math.max(creditLimit - currentCredit, 0).toLocaleString()} ر.س
          </span>
        </div>
      </div>
    </div>
  );
}
