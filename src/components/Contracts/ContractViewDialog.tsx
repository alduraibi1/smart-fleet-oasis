
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Car, DollarSign, Clock } from 'lucide-react';

interface ContractViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
}

export const ContractViewDialog = ({ open, onOpenChange, contract }: ContractViewDialogProps) => {
  if (!contract) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      expired: 'destructive',
      pending: 'outline',
      cancelled: 'destructive'
    } as const;
    
    const labels = {
      active: 'نشط',
      completed: 'مكتمل',
      expired: 'منتهي',
      pending: 'معلق',
      cancelled: 'ملغي'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>تفاصيل العقد - {contract.contract_number}</span>
            {getStatusBadge(contract.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* معلومات العميل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>الاسم:</strong> {contract.customer?.name}</div>
              <div><strong>الهاتف:</strong> {contract.customer?.phone}</div>
              <div><strong>البريد:</strong> {contract.customer?.email || 'غير محدد'}</div>
              <div><strong>رقم الهوية:</strong> {contract.customer?.national_id}</div>
            </CardContent>
          </Card>

          {/* معلومات المركبة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                معلومات المركبة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>المركبة:</strong> {contract.vehicle?.brand} {contract.vehicle?.model}</div>
              <div><strong>السنة:</strong> {contract.vehicle?.year}</div>
              <div><strong>رقم اللوحة:</strong> {contract.vehicle?.plate_number}</div>
              <div><strong>اللون:</strong> {contract.vehicle?.color}</div>
            </CardContent>
          </Card>

          {/* تفاصيل العقد */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                تفاصيل العقد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>تاريخ البداية:</strong> {contract.start_date}</div>
              <div><strong>تاريخ النهاية:</strong> {contract.end_date}</div>
              {contract.actual_return_date && (
                <div><strong>تاريخ الإرجاع الفعلي:</strong> {contract.actual_return_date}</div>
              )}
              <div><strong>الأجرة اليومية:</strong> {contract.daily_rate?.toLocaleString()} ر.س</div>
            </CardContent>
          </Card>

          {/* المعلومات المالية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                المعلومات المالية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>المبلغ الإجمالي:</strong> {contract.total_amount?.toLocaleString()} ر.س</div>
              <div><strong>المبلغ المدفوع:</strong> {contract.paid_amount?.toLocaleString()} ر.س</div>
              <div><strong>المبلغ المتبقي:</strong> {contract.remaining_amount?.toLocaleString()} ر.س</div>
              <div><strong>مبلغ التأمين:</strong> {contract.deposit_amount?.toLocaleString()} ر.س</div>
            </CardContent>
          </Card>
        </div>

        {contract.notes && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{contract.notes}</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
