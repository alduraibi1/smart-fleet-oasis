import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCustomersList, useCustomerProfitability } from './hooks/useProfitability';
import { ExportControls } from './components/ExportControls';
import { AdvancedFilters } from './components/AdvancedFilters';
import { SmartKPIs } from './components/SmartKPIs';

export default function CustomerProfitabilityPanel() {
  const { toast } = useToast();
  const { data: customers, isLoading: listLoading, error: listError } = useCustomersList();

  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [start, setStart] = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0,10);
  });
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0,10));

  const [filters, setFilters] = useState({
    dateRange: {},
    quickPeriod: 'last_30_days',
    contractTypes: [],
    vehicleStatuses: [],
    customerTypes: [],
    amountThreshold: 0
  });

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

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    if (newFilters.dateRange.from) {
      setStart(newFilters.dateRange.from.toISOString().slice(0, 10));
    }
    if (newFilters.dateRange.to) {
      setEnd(newFilters.dateRange.to.toISOString().slice(0, 10));
    }
  };

  const selectedCustomer = customers?.find(c => c.id === customerId);
  const reportTitle = selectedCustomer 
    ? `تقرير ربحية العميل - ${selectedCustomer.name}`
    : 'تقرير ربحية العميل';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>اختيار العميل ونطاق التاريخ</span>
            {data && (
              <ExportControls 
                data={data} 
                reportType="customer" 
                title={reportTitle}
              />
            )}
          </CardTitle>
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
                      {c.name} - {c.phone}
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

      <AdvancedFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={() => {
          console.log('Applying filters:', filters);
        }}
      />

      {data && <SmartKPIs data={data} reportType="customer" />}

      <Card>
        <CardHeader>
          <CardTitle>نتائج الربحية</CardTitle>
        </CardHeader>
        <CardContent>
          {!customerId ? (
            <p className="text-muted-foreground text-center py-6">اختر عميلاً ونطاق تاريخ لعرض النتائج</p>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : !data ? (
            <p className="text-muted-foreground text-center py-6">لا توجد بيانات للفترة المحددة</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard title="إجمالي الإيرادات" value={formatCurrency(data.total_revenue)} />
                <SummaryCard title="إجمالي المدفوع" value={formatCurrency(data.total_paid)} />
                <SummaryCard title="المبلغ المتبقي" value={formatCurrency(data.outstanding_amount)} />
                <SummaryCard 
                  title="تصنيف الربحية" 
                  value={data.profitability_rank} 
                  emphasis={data.profitability_rank === 'Premium'} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard label="عدد العقود" value={data.total_contracts} />
                <MetricCard label="أيام التأجير" value={data.total_rental_days} />
                <MetricCard label="متوسط قيمة العقد" value={formatCurrency(data.average_contract_value)} />
                <MetricCard label="المعدل اليومي" value={formatCurrency(data.average_daily_rate)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard label="قيمة العميل مدى الحياة" value={formatCurrency(data.customer_lifetime_value)} />
                <MetricCard label="نقاط السلوك المالي" value={`${(data.payment_behavior_score || 0).toFixed(1)}%`} />
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
