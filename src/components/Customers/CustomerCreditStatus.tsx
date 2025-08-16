
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Customer } from '@/types/customer';
import { CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

interface CustomerCreditStatusProps {
  customer: Customer;
  usedCredit?: number;
}

export function CustomerCreditStatus({ customer, usedCredit = 0 }: CustomerCreditStatusProps) {
  const creditLimit = customer.credit_limit || 0;
  const availableCredit = Math.max(0, creditLimit - usedCredit);
  const usagePercentage = creditLimit > 0 ? (usedCredit / creditLimit) * 100 : 0;

  const getCreditStatus = () => {
    if (usagePercentage >= 90) return { status: 'critical', color: 'destructive', icon: AlertTriangle };
    if (usagePercentage >= 70) return { status: 'warning', color: 'secondary', icon: AlertTriangle };
    return { status: 'good', color: 'default', icon: CheckCircle };
  };

  const { status, color, icon: Icon } = getCreditStatus();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" />
          الحالة الائتمانية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">الحد الائتماني</span>
          <span className="font-medium">{creditLimit.toLocaleString()} ريال</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">المبلغ المستخدم</span>
          <span className="font-medium">{usedCredit.toLocaleString()} ريال</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">المتاح</span>
          <span className="font-medium text-green-600">{availableCredit.toLocaleString()} ريال</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>نسبة الاستخدام</span>
            <Badge variant={color} className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {usagePercentage.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        {status === 'critical' && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            تحذير: تم استنفاد الحد الائتماني تقريباً
          </div>
        )}
        
        {status === 'warning' && (
          <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
            تنبيه: اقتراب من حد الائتمان المسموح
          </div>
        )}
      </CardContent>
    </Card>
  );
}
