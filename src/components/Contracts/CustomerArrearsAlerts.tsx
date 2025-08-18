
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerArrears } from '@/hooks/useCustomerArrears';

interface Props {
  threshold?: number;
}

export default function CustomerArrearsAlerts({ threshold = 1500 }: Props) {
  const { data, isLoading, error } = useCustomerArrears(threshold);

  if (isLoading || error) return null;
  if (!data || data.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          عملاء متعثرون في السداد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.slice(0, 5).map((row) => (
          <div key={row.id} className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{row.name || row.id}</span>
              <span className="text-muted-foreground">
                متأخرات: {Number(row.outstanding_balance || 0).toLocaleString()} ريال
              </span>
              {row.overdue_contracts > 0 && (
                <span className="text-xs text-muted-foreground">
                  عقود متأخرة: {row.overdue_contracts}
                </span>
              )}
            </div>
            <Badge variant="destructive">
              تجاوز الحد {threshold.toLocaleString()} ريال
            </Badge>
          </div>
        ))}
        {data.length > 5 && (
          <div className="text-xs text-muted-foreground">
            و{data.length - 5} عميل آخر لديهم متأخرات
          </div>
        )}
      </CardContent>
    </Card>
  );
}
