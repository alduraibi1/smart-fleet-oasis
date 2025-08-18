
import { AlertTriangle, Phone, MessageSquare, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCustomerArrears } from '@/hooks/useCustomerArrears';
import { useCustomerArrearsActions } from '@/hooks/useCustomerArrearsActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  threshold?: number;
}

export default function CustomerArrearsAlerts({ threshold = 1500 }: Props) {
  const { data, isLoading, error } = useCustomerArrears(threshold);
  const { createArrearsNotification, generateCollectionActions, loading: actionLoading } = useCustomerArrearsActions();
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

  const handleContactCustomer = (customer: any) => {
    if (customer.phone) {
      window.open(`tel:${customer.phone}`, '_self');
    } else {
      toast({
        title: 'رقم الهاتف غير متوفر',
        description: `لا يوجد رقم هاتف مسجل للعميل ${customer.name}`,
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = (customer: any) => {
    if (customer.phone) {
      const message = `مرحباً ${customer.name}، يتوجب عليكم سداد المتأخرات المستحقة بقيمة ${(customer.outstanding_balance || 0).toLocaleString()} ريال. يرجى التواصل معنا في أقرب وقت.`;
      window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      toast({
        title: 'رقم الهاتف غير متوفر',
        description: `لا يوجد رقم هاتف مسجل للعميل ${customer.name}`,
        variant: 'destructive',
      });
    }
  };

  const handleActionSelect = async (customer: any, actionType: string) => {
    const overdueDays = getOverdueDays(customer.oldest_overdue_date);
    
    switch (actionType) {
      case 'contact_customer':
        handleContactCustomer(customer);
        break;
      case 'send_message':
        handleSendMessage(customer);
        break;
      case 'create_notification':
        await createArrearsNotification(customer.id, customer.name, customer.outstanding_balance);
        break;
      default:
        toast({
          title: 'إجراء مطلوب',
          description: `تم تحديد إجراء: ${actionType} للعميل ${customer.name}`,
          variant: 'destructive',
        });
    }
  };

  const getUrgencyLevel = (overdueDays: number | null) => {
    if (!overdueDays) return 'منخفض';
    if (overdueDays >= 30) return 'عاجل جداً';
    if (overdueDays >= 15) return 'عاجل';
    if (overdueDays >= 7) return 'مهم';
    return 'متوسط';
  };

  const getUrgencyColor = (overdueDays: number | null) => {
    if (!overdueDays) return 'secondary';
    if (overdueDays >= 30) return 'destructive';
    if (overdueDays >= 15) return 'destructive';
    if (overdueDays >= 7) return 'default';
    return 'secondary';
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          عملاء متعثرون في السداد ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.slice(0, 5).map((row) => {
          const overdueDays = getOverdueDays(row.oldest_overdue_date);
          const actions = generateCollectionActions(row.outstanding_balance, overdueDays || 0);
          
          return (
            <div key={row.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{row.name || row.id}</span>
                  <Badge variant={getUrgencyColor(overdueDays) as any} className="text-xs">
                    {getUrgencyLevel(overdueDays)}
                  </Badge>
                </div>
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
                <Badge variant="destructive" className="text-xs">
                  تجاوز {threshold.toLocaleString()} ريال
                </Badge>
                
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleContactCustomer(row)}
                    className="p-2"
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleSendMessage(row)}
                    className="p-2"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="destructive" disabled={actionLoading}>
                        اتخاذ إجراء
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action, index) => (
                        <DropdownMenuItem 
                          key={index}
                          onClick={() => handleActionSelect(row, action.action)}
                          className="flex flex-col items-start"
                        >
                          <span className="font-medium">{action.title}</span>
                          <span className="text-xs text-muted-foreground">{action.description}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem 
                        onClick={() => handleActionSelect(row, 'create_notification')}
                      >
                        <FileText className="h-4 w-4 ml-2" />
                        تسجيل إجراء متابعة
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
        
        {data.length > 5 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            و{data.length - 5} عميل آخر لديهم متأخرات تتطلب متابعة
          </div>
        )}
      </CardContent>
    </Card>
  );
}
