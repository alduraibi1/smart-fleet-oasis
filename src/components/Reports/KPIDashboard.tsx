
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  Car,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export function KPIDashboard() {
  // بيانات وهمية للمؤشرات
  const kpis = [
    {
      title: "معدل الاستخدام",
      current: 87.5,
      target: 90,
      unit: "%",
      trend: "up",
      change: "+5.2%",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: Car,
      status: "good"
    },
    {
      title: "الإيراد الشهري",
      current: 245000,
      target: 250000,
      unit: "ريال",
      trend: "up",
      change: "+12.3%",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: DollarSign,
      status: "excellent"
    },
    {
      title: "رضا العملاء",
      current: 4.6,
      target: 4.5,
      unit: "/5",
      trend: "up",
      change: "+0.2",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: Users,
      status: "excellent"
    },
    {
      title: "متوسط مدة العقد",
      current: 28,
      target: 30,
      unit: "يوم",
      trend: "down",
      change: "-2 أيام",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      icon: Calendar,
      status: "warning"
    },
    {
      title: "معدل التحصيل",
      current: 94.2,
      target: 95,
      unit: "%",
      trend: "stable",
      change: "0%",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: CheckCircle,
      status: "good"
    },
    {
      title: "وقت الاستجابة",
      current: 2.4,
      target: 2.0,
      unit: "ساعة",
      trend: "down",
      change: "+0.4h",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: Clock,
      status: "needs_attention"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">جيد</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">تحذير</Badge>;
      case 'needs_attention':
        return <Badge className="bg-red-100 text-red-800">يحتاج انتباه</Badge>;
      default:
        return <Badge variant="outline">عادي</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const progressValue = (kpi.current / kpi.target) * 100;
          
          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{kpi.title}</span>
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {kpi.current.toLocaleString()} {kpi.unit}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      الهدف: {kpi.target.toLocaleString()} {kpi.unit}
                    </div>
                  </div>
                  {getStatusBadge(kpi.status)}
                </div>
                
                <div className="space-y-2">
                  <Progress value={Math.min(progressValue, 100)} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {Math.round(progressValue)}% من الهدف
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(kpi.trend)}
                      <span className={`
                        ${kpi.trend === 'up' ? 'text-green-600' : 
                          kpi.trend === 'down' ? 'text-red-600' : 
                          'text-gray-600'}
                      `}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ملخص الأداء العام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  مؤشرات ممتازة
                </span>
                <Badge className="bg-green-100 text-green-800">2</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  مؤشرات جيدة
                </span>
                <Badge className="bg-blue-100 text-blue-800">2</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  تحتاج تحسين
                </span>
                <Badge className="bg-yellow-100 text-yellow-800">1</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  تحتاج انتباه عاجل
                </span>
                <Badge className="bg-red-100 text-red-800">1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              الاتجاهات الحالية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>الإيرادات</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">اتجاه صاعد</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>الاستخدام</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">تحسن مستمر</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>رضا العملاء</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 text-sm font-medium">ممتاز</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>وقت الاستجابة</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 text-sm font-medium">يحتاج تحسين</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
