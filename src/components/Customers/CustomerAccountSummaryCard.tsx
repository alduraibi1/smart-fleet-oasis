
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCustomerAccountSummary } from '@/hooks/useCustomerAccountSummary';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';

interface Props {
  customerId: string;
  className?: string;
  onActionClick?: () => void;
}

export function CustomerAccountSummaryCard({ customerId, className, onActionClick }: Props) {
  const { data, isLoading, error, refetch } = useCustomerAccountSummary(customerId);
  const { toast } = useToast();

  if (!customerId) return null;

  const overdueDays = data?.oldest_overdue_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date().getTime() - new Date(data.oldest_overdue_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ) - 14
      )
    : 0;

  const isOverdue = (data?.outstanding_balance || 0) > 1500 && (data?.overdue_contracts || 0) > 0;

  const handleAction = () => {
    if (onActionClick) {
      onActionClick();
      return;
    }
    toast({
      title: isOverdue ? 'إجراء مطلوب' : 'لا توجد متأخرات كبيرة',
      description: isOverdue
        ? 'اقتراحات: سحب المركبة، إنهاء العقد، أو بدء إجراءات التحصيل.'
        : 'حساب العميل ضمن الحدود الطبيعية.',
      // variant per design tokens via shadcn
      variant: isOverdue ? 'destructive' : 'default',
    });
  };

  return (
    <Card className={`${className || ''} ${isOverdue ? 'border-destructive bg-destructive/5' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {isOverdue ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          حساب العميل
          {isLoading && <span className="text-xs text-muted-foreground">جارِ التحميل...</span>}
          {error && <span className="text-xs text-destructive">تعذر تحميل البيانات</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الرصيد المعلق</span>
              <span className="font-medium">
                {Number(data.outstanding_balance || 0).toLocaleString()} ريال
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">عقود متأخرة</span>
              <span className="font-medium">{data.overdue_contracts || 0}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">حالة المخاطر</span>
              <Badge
                variant={isOverdue ? 'destructive' : 'secondary'}
                className={isOverdue ? '' : 'text-muted-foreground'}
              >
                {data.risk_status || 'low_risk'}
              </Badge>
            </div>

            {isOverdue && overdueDays > 0 && (
              <div className="text-xs text-muted-foreground">
                متأخر منذ {overdueDays} يوم تقريباً بعد فترة السماح (14 يوم)
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCcw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              <Button size="sm" className={isOverdue ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''} onClick={handleAction}>
                اتخاذ إجراء
              </Button>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">لا توجد بيانات حساب متاحة لهذا العميل.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default CustomerAccountSummaryCard;
