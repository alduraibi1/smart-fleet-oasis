import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";

export function MaintenanceStats() {
  // Mock data - in real app, this would come from API
  const stats = {
    pending: 12,
    inProgress: 8,
    completed: 45,
    overdue: 3,
    monthlyRevenue: 15420,
    avgCost: 850
  };

  const statCards = [
    {
      title: "الصيانات المعلقة",
      value: stats.pending,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "+2 من الأسبوع الماضي"
    },
    {
      title: "قيد التنفيذ",
      value: stats.inProgress,
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "حاليًا في الورشة"
    },
    {
      title: "مكتملة هذا الشهر",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+5 من الشهر الماضي"
    },
    {
      title: "متأخرة",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: "تحتاج متابعة فورية"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
      
      {/* Financial Stats */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            الإحصائيات المالية
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">تكلفة الصيانة الشهرية</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.monthlyRevenue.toLocaleString()} ر.س
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">متوسط تكلفة الصيانة</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.avgCost} ر.س
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}