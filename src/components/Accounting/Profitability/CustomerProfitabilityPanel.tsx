
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCustomersList, useCustomerProfitability } from './hooks/useProfitability';

export default function CustomerProfitabilityPanel() {
  const { toast } = useToast();
  const { data: customers, isLoading: listLoading, error: listError } = useCustomersList();

  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [start, setStart] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0,10);
  });
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0,10));

  const startDate = useMemo(() => start ? new Date(start) : undefined, [start]);
  const endDate = useMemo(() => end ? new Date(end) : undefined, [end]);

  const { data, isLoading, error } = useCustomerProfitability(customerId, startDate, endDate);

  if (listError) {
    console.error(listError);
    toast({ title: 'خطأ في جلب العملاء', description: String(listError), variant: 'destructive' });
  }
  if (error) {
    console.error(error);
    toast({ title: 'خطأ في حساب ربحية العميل', description: String(error), variant: 'destructive' });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>اختيار العميل ونطاق التاريخ</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">العميل</label>
            {listLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={setCustomerId} value={customerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}{c.phone ? ` - ${c.phone}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">تاريخ البداية</label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">تاريخ النهاية</label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نتائج الربحية</CardTitle>
        </CardHeader>
        <CardContent>
          {!customerId ? (
            <p className="text-muted-foreground text-center py-6">اختر عميلًا ونطاق تاريخ لعرض النتائج</p>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : !data ? (
            <p className="text-muted-foreground text-center py-6">لا توجد بيانات للفترة المحددة</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard title="إجمالي العقود" value={data.total_contracts} />
                <SummaryCard title="إجمالي الإيرادات" value={formatCurrency(data.total_revenue)} />
                <SummaryCard title="المدفوع" value={formatCurrency(data.total_paid)} />
                <SummaryCard title="المتبقي" value={formatCurrency(data.outstanding_amount)} emphasis />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard label="أيام التأجير" value={data.total_rental_days} />
                <MetricCard label="متوسط قيمة العقد" value={formatCurrency(data.average_contract_value)} />
                <MetricCard label="متوسط المعدل اليومي" value={formatCurrency(data.average_daily_rate)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard label="قيمة العميل المتوقعة (CLV)" value={formatCurrency(data.customer_lifetime_value)} />
                <MetricCard label="انضباط الدفع" value={`${(data.payment_behavior_score || 0).toFixed(0)}%`} />
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">تصنيف الربحية</p>
                  <p className="text-xl font-semibold">{data.profitability_rank}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, emphasis = false }: { title: string; value: string | number; emphasis?: boolean }) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {emphasis && <Badge variant="secondary">مهم</Badge>}
        </div>
        <p className={`mt-2 text-2xl font-bold ${emphasis ? 'text-primary' : ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(amount || 0);
}
