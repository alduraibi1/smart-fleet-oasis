
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContractIntegration } from '@/hooks/useContractIntegration';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { 
  Plus, 
  Car, 
  FileText, 
  Bell, 
  Wrench,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export const QuickActions = () => {
  const { runAllChecks } = useSmartNotifications();
  const { notifications } = useSmartNotifications();
  const [isRunningChecks, setIsRunningChecks] = useState(false);

  const handleRunChecks = async () => {
    setIsRunningChecks(true);
    await runAllChecks();
    setIsRunningChecks(false);
  };

  const urgentNotifications = notifications.filter(n => n.priority === 'urgent' && !n.read);
  const warningNotifications = notifications.filter(n => n.type === 'warning' && !n.read);

  return (
    <div className="space-y-6">
      {/* الإجراءات السريعة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="flex flex-col items-center gap-2 h-20">
              <Plus className="h-5 w-5" />
              <span className="text-sm">عقد جديد</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Car className="h-5 w-5" />
              <span className="text-sm">إضافة سيارة</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm">تسجيل دفعة</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={handleRunChecks}
              disabled={isRunningChecks}
            >
              <Bell className="h-5 w-5" />
              <span className="text-sm">
                {isRunningChecks ? 'جاري الفحص...' : 'فحص التنبيهات'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* التنبيهات العاجلة */}
      {urgentNotifications.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات عاجلة ({urgentNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentNotifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-destructive">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  عاجل
                </Badge>
              </div>
            ))}
            {urgentNotifications.length > 3 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  عرض جميع التنبيهات العاجلة ({urgentNotifications.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* التنبيهات التحذيرية */}
      {warningNotifications.length > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-warning">
              <Clock className="h-5 w-5" />
              تنبيهات تحتاج متابعة ({warningNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {warningNotifications.slice(0, 2).map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                <Clock className="h-4 w-4 text-warning mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-warning">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                <Badge variant="outline" className="text-warning border-warning/30">
                  تحذير
                </Badge>
              </div>
            ))}
            {warningNotifications.length > 2 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  عرض جميع التحذيرات ({warningNotifications.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* حالة النظام */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            حالة النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>النظام المالي</span>
              <Badge className="bg-success/10 text-success border-success/30">يعمل</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>التنبيهات الذكية</span>
              <Badge className="bg-success/10 text-success border-success/30">نشط</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>الربط التلقائي</span>
              <Badge className="bg-success/10 text-success border-success/30">متصل</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>آخر فحص</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleTimeString('ar-SA')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
