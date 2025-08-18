
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCustomerAccountSummary } from '@/hooks/useCustomerAccountSummary';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, RefreshCcw, Phone, MessageSquare } from 'lucide-react';

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

  const handleContactCustomer = () => {
    if (data?.phone) {
      window.open(`tel:${data.phone}`, '_self');
    } else {
      toast({
        title: 'رقم الهاتف غير متوفر',
        description: 'لا يوجد رقم هاتف مسجل لهذا العميل',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = () => {
    if (data?.phone) {
      const message = `مرحباً، يتوجب عليكم سداد المتأخرات المستحقة بقيمة ${(data.outstanding_balance || 0).toLocaleString()} ريال. يرجى التواصل معنا في أقرب وقت.`;
      window.open(`https://wa.me/${data.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      toast({
        title: 'رقم الهاتف غير متوفر',
        description: 'لا يوجد رقم هاتف مسجل لهذا العميل',
        variant: 'destructive',
      });
    }
  };

  const handleAction = () => {
    if (onActionClick) {
      onActionClick();
      return;
    }
    
    if (isOverdue) {
      toast({
        title: 'إجراءات مطلوبة',
        description: 'اقتراحات: التواصل مع العميل، سحب المركبة، إنهاء العقد، أو بدء إجراءات التحصيل القانوني.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'حساب العميل سليم',
        description: 'حساب العميل ضمن الحدود الطبيعية ولا يحتاج إجراءات خاصة.',
      });
    }
  };

  const getRiskStatusText = (status: string) => {
    switch (status) {
      case 'high_risk':
        return 'مخاطر عالية';
      case 'medium_risk':
        return 'مخاطر متوسطة';
      case 'low_risk':
        return 'مخاطر منخفضة';
      default:
        return status || 'غير محدد';
    }
  };

  const getRiskStatusVariant = (status: string) => {
    switch (status) {
      case 'high_risk':
        return 'destructive';
      case 'medium_risk':
        return 'default';
      case 'low_risk':
        return 'secondary';
      default:
        return 'outline';
    }
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
          ملخص حساب العميل
          {isLoading && <span className="text-xs text-muted-foreground">جارِ التحميل...</span>}
          {error && <span className="text-xs text-destructive">تعذر تحميل البيانات</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data ? (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">إجمالي المتعاقد</span>
                <span className="font-medium">
                  {Number(data.total_contracted || 0).toLocaleString()} ريال
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">إجمالي المدفوع</span>
                <span className="font-medium text-green-600">
                  {Number(data.total_paid || 0).toLocaleString()} ريال
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">الرصيد المعلق</span>
              <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                {Number(data.outstanding_balance || 0).toLocaleString()} ريال
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">عقود نشطة</span>
                <span className="font-medium">{data.active_contracts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">عقود متأخرة</span>
                <span className={`font-medium ${(data.overdue_contracts || 0) > 0 ? 'text-destructive' : ''}`}>
                  {data.overdue_contracts || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">حالة المخاطر</span>
              <Badge variant={getRiskStatusVariant(data.risk_status || 'low_risk') as any}>
                {getRiskStatusText(data.risk_status || 'low_risk')}
              </Badge>
            </div>

            {isOverdue && overdueDays > 0 && (
              <div className="p-2 bg-destructive/10 rounded-md">
                <div className="text-xs text-destructive font-medium">
                  ⚠️ متأخر منذ {overdueDays} يوم بعد انتهاء فترة السماح (14 يوم)
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCcw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              
              {isOverdue && (
                <>
                  <Button variant="outline" size="sm" onClick={handleContactCustomer}>
                    <Phone className="h-4 w-4 ml-2" />
                    اتصال
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSendMessage}>
                    <MessageSquare className="h-4 w-4 ml-2" />
                    رسالة
                  </Button>
                </>
              )}
              
              <Button 
                size="sm" 
                variant={isOverdue ? 'destructive' : 'default'}
                onClick={handleAction}
              >
                {isOverdue ? 'اتخاذ إجراء' : 'عرض التفاصيل'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            لا توجد بيانات حساب متاحة لهذا العميل.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CustomerAccountSummaryCard;
