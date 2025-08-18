
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  DollarSign,
  CheckCircle,
  X,
  Bell
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FinancialAlert {
  id: string;
  type: 'cash_flow' | 'overdue_payment' | 'budget_exceeded' | 'low_balance' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  amount?: number;
  entityName?: string;
  daysOverdue?: number;
  createdAt: string;
  isResolved: boolean;
}

export function FinancialAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['financial-alerts'],
    queryFn: async (): Promise<FinancialAlert[]> => {
      // في التطبيق الحقيقي، ستأتي هذه البيانات من قاعدة البيانات
      // هنا نقوم بمحاكاة التنبيهات المالية
      
      const mockAlerts: FinancialAlert[] = [
        {
          id: '1',
          type: 'overdue_payment',
          severity: 'high',
          title: 'مدفوعات متأخرة',
          description: 'يوجد 3 مدفوعات متأخرة تحتاج متابعة فورية',
          amount: 45000,
          daysOverdue: 7,
          createdAt: new Date().toISOString(),
          isResolved: false
        },
        {
          id: '2',
          type: 'cash_flow',
          severity: 'medium',
          title: 'تدفق نقدي منخفض',
          description: 'التدفق النقدي لهذا الشهر أقل من المتوقع بنسبة 15%',
          amount: 12000,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isResolved: false
        },
        {
          id: '3',
          type: 'budget_exceeded',
          severity: 'critical',
          title: 'تجاوز الميزانية',
          description: 'مصروفات الصيانة تجاوزت الميزانية المحددة بنسبة 25%',
          amount: 8500,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isResolved: false
        },
        {
          id: '4',
          type: 'low_balance',
          severity: 'medium',
          title: 'رصيد منخفض',
          description: 'رصيد الحساب الجاري وصل إلى الحد الأدنى المسموح',
          amount: 5000,
          entityName: 'الحساب الجاري - البنك الأهلي',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isResolved: false
        },
        {
          id: '5',
          type: 'unusual_activity',
          severity: 'low',
          title: 'نشاط غير معتاد',
          description: 'زيادة غير متوقعة في مصروفات الوقود هذا الأسبوع',
          amount: 3200,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          isResolved: true
        }
      ];

      return mockAlerts.sort((a, b) => {
        // ترتيب حسب الأولوية ثم التاريخ
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (type: string, severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="h-4 w-4" />;
    
    switch (type) {
      case 'cash_flow': return <TrendingDown className="h-4 w-4" />;
      case 'overdue_payment': return <Clock className="h-4 w-4" />;
      case 'budget_exceeded': return <DollarSign className="h-4 w-4" />;
      case 'low_balance': return <DollarSign className="h-4 w-4" />;
      case 'unusual_activity': return <Bell className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-SA');
  };

  const activeAlerts = alerts?.filter(alert => !alert.isResolved) || [];
  const resolvedAlerts = alerts?.filter(alert => alert.isResolved) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>التنبيهات المالية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            جاري التحميل...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات التنبيهات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {alerts?.filter(a => a.severity === 'critical' && !a.isResolved).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">حرجة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {alerts?.filter(a => a.severity === 'high' && !a.isResolved).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">عالية</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {alerts?.filter(a => a.severity === 'medium' && !a.isResolved).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">متوسطة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {resolvedAlerts.length}
            </div>
            <div className="text-sm text-muted-foreground">محلولة</div>
          </CardContent>
        </Card>
      </div>

      {/* التنبيهات النشطة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            التنبيهات النشطة ({activeAlerts.length})
          </CardTitle>
          <CardDescription>
            التنبيهات التي تحتاج إلى متابعة فورية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
              <p>لا توجد تنبيهات نشطة حالياً</p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.type, alert.severity)}
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {alert.title}
                        <Badge variant="outline" className="ml-auto">
                          {alert.severity === 'critical' ? 'حرج' :
                           alert.severity === 'high' ? 'عالي' :
                           alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-1">
                        {alert.description}
                        {alert.amount && (
                          <div className="mt-2 font-semibold">
                            المبلغ: {formatCurrency(alert.amount)}
                          </div>
                        )}
                        {alert.entityName && (
                          <div className="mt-1 text-sm">
                            {alert.entityName}
                          </div>
                        )}
                        {alert.daysOverdue && (
                          <div className="mt-1 text-sm text-red-600">
                            متأخر {alert.daysOverdue} يوم
                          </div>
                        )}
                        <div className="mt-2 text-xs text-muted-foreground">
                          {formatDate(alert.createdAt)}
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>

      {/* التنبيهات المحلولة */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              التنبيهات المحلولة ({resolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(alert.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
