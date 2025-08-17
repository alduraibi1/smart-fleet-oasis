
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMaintenance } from "@/hooks/useMaintenance";
import { Wrench, Clock, CheckCircle, DollarSign, AlertCircle, Calendar } from "lucide-react";

export const MaintenanceStats = () => {
  const { getMaintenanceStats, maintenanceRecords } = useMaintenance();
  
  const stats = getMaintenanceStats();
  
  // إحصائيات إضافية
  const inProgressRecords = maintenanceRecords.filter(record => record.status === 'in_progress').length;
  const urgentRecords = maintenanceRecords.filter(record => record.priority === 'urgent').length;
  const thisMonthRecords = maintenanceRecords.filter(record => {
    const recordDate = new Date(record.created_at);
    const now = new Date();
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
  }).length;

  const statsCards = [
    {
      title: "إجمالي السجلات",
      value: stats.totalRecords,
      description: "جميع سجلات الصيانة",
      icon: Wrench,
      color: "text-blue-600"
    },
    {
      title: "مكتملة",
      value: stats.completedRecords,
      description: "صيانات منجزة",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "قيد التنفيذ",
      value: inProgressRecords,
      description: "صيانات جارية",
      icon: Clock,
      color: "text-amber-600",
      badge: inProgressRecords > 0 ? "نشط" : undefined,
      badgeVariant: "secondary" as const
    },
    {
      title: "معلقة",
      value: stats.pendingRecords,
      description: "تحتاج متابعة",
      icon: AlertCircle,
      color: "text-red-600",
      badge: stats.pendingRecords > 0 ? "مطلوب" : undefined,
      badgeVariant: "destructive" as const
    }
  ];

  const additionalStats = [
    {
      title: "التكلفة الإجمالية",
      value: `${stats.totalCost.toFixed(2)} ر.س`,
      description: "إجمالي تكاليف الصيانة",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "متوسط التكلفة",
      value: `${stats.averageCost.toFixed(2)} ر.س`,
      description: "متوسط تكلفة الصيانة",
      icon: BarChart3,
      color: "text-indigo-600"
    },
    {
      title: "عاجلة",
      value: urgentRecords,
      description: "صيانات عاجلة",
      icon: AlertCircle,
      color: "text-red-600",
      badge: urgentRecords > 0 ? "عاجل" : undefined,
      badgeVariant: "destructive" as const
    },
    {
      title: "هذا الشهر",
      value: thisMonthRecords,
      description: "صيانات الشهر الحالي",
      icon: Calendar,
      color: "text-cyan-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* إحصائيات الحالة */}
      <div>
        <h3 className="text-lg font-semibold mb-4">حالة الصيانة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {stat.badge && (
                    <Badge variant={stat.badgeVariant}>
                      {stat.badge}
                    </Badge>
                  )}
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* إحصائيات إضافية */}
      <div>
        <h3 className="text-lg font-semibold mb-4">إحصائيات أخرى</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {stat.badge && (
                    <Badge variant={stat.badgeVariant}>
                      {stat.badge}
                    </Badge>
                  )}
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ملخص سريع */}
      {stats.totalRecords > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">ملخص الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalRecords > 0 ? Math.round((stats.completedRecords / stats.totalRecords) * 100) : 0}%
                </div>
                <div className="text-muted-foreground">معدل الإنجاز</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {urgentRecords}
                </div>
                <div className="text-muted-foreground">حالات عاجلة</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {thisMonthRecords}
                </div>
                <div className="text-muted-foreground">صيانات هذا الشهر</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// تصدير BarChart3 إذا لم يكن متاحاً
import { BarChart3 } from "lucide-react";
