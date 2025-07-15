import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMaintenance } from "@/hooks/useMaintenance";
import { Calendar, Clock, Wrench, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export const MaintenanceScheduleTable = () => {
  const { schedules } = useMaintenance();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'overdue':
        return 'destructive';
      case 'in_progress':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          جدولة الصيانة
        </CardTitle>
        <CardDescription>
          عرض وإدارة جدولة الصيانة المجدولة والمكتملة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد جدولة صيانة</p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {schedule.vehicles?.plate_number} - {schedule.vehicles?.brand} {schedule.vehicles?.model}
                      </h3>
                      {getStatusIcon(schedule.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      نوع الصيانة: {schedule.maintenance_type}
                    </p>
                    {schedule.maintenance_templates && (
                      <p className="text-sm text-muted-foreground">
                        القالب: {schedule.maintenance_templates.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(schedule.priority) as any}>
                      {schedule.priority === 'urgent' ? 'عاجل' :
                       schedule.priority === 'high' ? 'عالي' :
                       schedule.priority === 'medium' ? 'متوسط' : 'منخفض'}
                    </Badge>
                    <Badge variant={getStatusColor(schedule.status) as any}>
                      {schedule.status === 'scheduled' ? 'مجدول' :
                       schedule.status === 'in_progress' ? 'جاري' :
                       schedule.status === 'completed' ? 'مكتمل' :
                       schedule.status === 'cancelled' ? 'ملغي' : 'متأخر'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>التاريخ المجدول: {new Date(schedule.scheduled_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {schedule.scheduled_mileage && (
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span>العداد: {schedule.scheduled_mileage.toLocaleString()}</span>
                    </div>
                  )}
                  {schedule.maintenance_templates?.estimated_cost && (
                    <div className="flex items-center gap-2">
                      <span>التكلفة المتوقعة: {schedule.maintenance_templates.estimated_cost.toLocaleString()} ريال</span>
                    </div>
                  )}
                </div>

                {schedule.notes && (
                  <div className="text-sm text-muted-foreground">
                    <strong>ملاحظات:</strong> {schedule.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};