import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCustomerArrears } from '@/hooks/useCustomerArrears';

interface Props {
  threshold?: number;
}

export default function CustomerArrearsAlerts({ threshold = 1500 }: Props) {
  const { data, isLoading, error } = useCustomerArrears(threshold);
  const { toast } = useToast();

  if (isLoading || error) return null;
  if (!data || data.length === 0) return null;

  const getOverdueDays = (oldest_overdue_date: string | null) => {
    if (!oldest_overdue_date) return null;
    const days = Math.ceil(
      (new Date().getTime() - new Date(oldest_overdue_date).getTime()) / (1000 * 60 * 60 * 24)
    ) - 14;
    return days > 0 ? days : 0;
  };

  const handleAction = (customerName?: string) => {
    toast({
      title: 'إجراء مطلوب',
      description: `اقتراحات لـ ${customerName || 'العميل'}: سحب المركبة، إنهاء العقد، أو بدء إجراءات التحصيل.`,
      variant: 'destructive',
    });
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          عملاء متعثرون في السداد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.slice(0, 5).map((row) => {
          const overdueDays = getOverdueDays(row.oldest_overdue_date);
          return (
            <div key={row.id} className="flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="font-medium">{row.name || row.id}</span>
                <span className="text-muted-foreground">
                  متأخرات: {Number(row.outstanding_balance || 0).toLocaleString()} ريال
                </span>
                {row.overdue_contracts > 0 && (
                  <span className="text-xs text-muted-foreground">
                    عقود متأخرة: {row.overdue_contracts}
                    {typeof overdueDays === 'number' && overdueDays > 0 && (
                      <> — متأخر منذ {overdueDays} يوم</>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">
                  تجاوز الحد {threshold.toLocaleString()} ريال
                </Badge>
                <Button size="xs" variant="outline" onClick={() => handleAction(row.name)}>
                  اتخاذ إجراء
                </Button>
              </div>
            </div>
          );
        })}
        {data.length > 5 && (
          <div className="text-xs text-muted-foreground">
            و{data.length - 5} عميل آخر لديهم متأخرات
          </div>
        )}
      </CardContent>
    </Card>
  );
}
