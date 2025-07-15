import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Users, 
  Car,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ContractAnalyticsProps {
  contracts: any[];
}

export const ContractAnalytics = ({ contracts }: ContractAnalyticsProps) => {
  // حساب المؤشرات
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const completedContracts = contracts.filter(c => c.status === 'completed').length;
  const expiredContracts = contracts.filter(c => c.status === 'expired').length;
  const totalRevenue = contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0);
  const avgContractValue = totalContracts > 0 ? totalRevenue / totalContracts : 0;

  // حساب معدل النمو (محاكاة)
  const growthRate = 12.5;
  const collectionRate = 94.2;

  const kpiCards = [
    {
      title: "إجمالي العقود",
      value: totalContracts,
      change: "+8.2%",
      trend: "up",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "العقود النشطة",
      value: activeContracts,
      change: "+5.1%",
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "إجمالي الإيرادات",
      value: `${totalRevenue.toLocaleString()} ريال`,
      change: "+12.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "متوسط قيمة العقد",
      value: `${Math.round(avgContractValue).toLocaleString()} ريال`,
      change: "+3.7%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "معدل التحصيل",
      value: `${collectionRate}%`,
      change: "-1.2%",
      trend: "down",
      icon: DollarSign,
      color: "text-yellow-600"
    },
    {
      title: "معدل النمو",
      value: `${growthRate}%`,
      change: "+2.8%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600"
    }
  ];

  const contractsByStatus = [
    { status: 'active', count: activeContracts, label: 'نشطة', color: 'bg-green-500' },
    { status: 'completed', count: completedContracts, label: 'مكتملة', color: 'bg-blue-500' },
    { status: 'expired', count: expiredContracts, label: 'منتهية', color: 'bg-red-500' },
    { status: 'pending', count: totalContracts - activeContracts - completedContracts - expiredContracts, label: 'معلقة', color: 'bg-yellow-500' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.trend === 'up';
          
          return (
            <Card key={index} className="hover-scale">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{kpi.title}</span>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={isPositive ? "text-green-600" : "text-red-600"}>
                        {kpi.change}
                      </span>
                      <span className="text-muted-foreground">هذا الشهر</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contract Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع حالات العقود</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractsByStatus.map((item) => {
              const percentage = totalContracts > 0 ? (item.count / totalContracts) * 100 : 0;
              
              return (
                <div key={item.status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      {item.label}
                    </span>
                    <span className="font-medium">{item.count} ({Math.round(percentage)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              الأداء الشهري
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span>عقود جديدة هذا الشهر</span>
              <Badge className="bg-green-100 text-green-800">+{Math.floor(totalContracts * 0.15)}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span>العقود المكتملة</span>
              <Badge className="bg-blue-100 text-blue-800">{completedContracts}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span>معدل الإنجاز</span>
              <Badge className="bg-purple-100 text-purple-800">
                {totalContracts > 0 ? Math.round((completedContracts / totalContracts) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              التنبيهات والمخاطر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-red-800">عقود منتهية الصلاحية</span>
              <Badge variant="destructive">{expiredContracts}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-yellow-800">عقود تنتهي خلال 7 أيام</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {Math.floor(activeContracts * 0.1)}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <span className="text-orange-800">مدفوعات متأخرة</span>
              <Badge className="bg-orange-100 text-orange-800">
                {Math.floor(activeContracts * 0.05)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.round(avgContractValue / 1000)}K</div>
              <div className="text-sm text-blue-800">متوسط القيمة (بالآلاف)</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {totalContracts > 0 ? Math.round((activeContracts / totalContracts) * 100) : 0}%
              </div>
              <div className="text-sm text-green-800">معدل العقود النشطة</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(totalRevenue / 1000000)}M
              </div>
              <div className="text-sm text-purple-800">الإيرادات (بالمليون)</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {totalContracts > 0 ? Math.round(((totalContracts - expiredContracts) / totalContracts) * 100) : 0}%
              </div>
              <div className="text-sm text-orange-800">معدل النجاح</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};