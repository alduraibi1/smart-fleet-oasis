
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Bell, ArrowLeft } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import VehicleReturnDialog from './VehicleReturnDialog';

interface ExpiryAlert {
  contract: any;
  daysUntilExpiry: number;
  isOverdue: boolean;
}

export default function ContractExpiryAlerts() {
  const { contracts } = useContracts();
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);

  useEffect(() => {
    const today = new Date();
    const activeContracts = contracts.filter(c => c.status === 'active');
    
    const upcomingExpiries = activeContracts.map(contract => {
      const endDate = new Date(contract.end_date);
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        contract,
        daysUntilExpiry: diffDays,
        isOverdue: diffDays < 0,
      };
    }).filter(alert => alert.daysUntilExpiry <= 7) // إظهار التنبيهات للعقود التي تنتهي خلال 7 أيام أو منتهية
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    setAlerts(upcomingExpiries);
  }, [contracts]);

  if (alerts.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            تنبيهات انتهاء العقود
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            لا توجد عقود تنتهي قريباً
          </p>
        </CardContent>
      </Card>
    );
  }

  const overdueCount = alerts.filter(a => a.isOverdue).length;
  const upcomingCount = alerts.filter(a => !a.isOverdue).length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          تنبيهات انتهاء العقود
          <Badge variant="destructive" className="mr-auto">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              يوجد {overdueCount} عقد منتهي ولم يتم إرجاع المركبة بعد
            </AlertDescription>
          </Alert>
        )}

        {upcomingCount > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              يوجد {upcomingCount} عقد سينتهي خلال الأيام القادمة
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.contract.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                alert.isOverdue 
                  ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' 
                  : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">
                    {alert.contract.customer?.name || 'عميل غير محدد'}
                  </h4>
                  <Badge 
                    variant={alert.isOverdue ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {alert.isOverdue 
                      ? `متأخر ${Math.abs(alert.daysUntilExpiry)} يوم`
                      : `${alert.daysUntilExpiry} يوم متبقي`
                    }
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span>{alert.contract.vehicle?.brand} {alert.contract.vehicle?.model}</span>
                  <span className="mx-2">•</span>
                  <span>{alert.contract.vehicle?.plate_number}</span>
                  <span className="mx-2">•</span>
                  <span>انتهاء: {new Date(alert.contract.end_date).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              
              <VehicleReturnDialog 
                contractId={alert.contract.id}
                trigger={
                  <Button 
                    size="sm" 
                    variant={alert.isOverdue ? "destructive" : "outline"}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4 ml-1" />
                    إرجاع المركبة
                  </Button>
                }
              />
            </div>
          ))}
        </div>

        {alerts.length > 5 && (
          <p className="text-sm text-muted-foreground text-center">
            و {alerts.length - 5} تنبيهات أخرى...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
