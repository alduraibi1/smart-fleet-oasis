
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign,
  Users,
  Wrench,
  Star
} from 'lucide-react';

export const MaintenanceKPIDashboard = () => {
  // Mock KPI data - in real implementation, this would come from API
  const kpiData = {
    efficiency: {
      current: 87.5,
      target: 90,
      trend: 'up',
      change: '+5.2%'
    },
    avgCompletionTime: {
      current: 2.4,
      target: 2.0,
      trend: 'down',
      change: '-0.3h'
    },
    customerSatisfaction: {
      current: 4.6,
      target: 4.5,
      trend: 'up',
      change: '+0.2'
    },
    costPerService: {
      current: 425,
      target: 400,
      trend: 'up',
      change: '+12%'
    },
    onTimeCompletion: {
      current: 92,
      target: 95,
      trend: 'up',
      change: '+3%'
    },
    firstTimeRight: {
      current: 89,
      target: 92,
      trend: 'stable',
      change: '0%'
    }
  };

  const mechanicPerformance = [
    { name: 'أحمد محمد', completedJobs: 24, avgTime: 2.1, satisfaction: 4.8, efficiency: 95 },
    { name: 'خالد عبدالله', completedJobs: 18, avgTime: 2.3, satisfaction: 4.5, efficiency: 88 },
    { name: 'محمد علي', completedJobs: 22, avgTime: 2.0, satisfaction: 4.7, efficiency: 92 },
    { name: 'سعد الشمري', completedJobs: 16, avgTime: 2.6, satisfaction: 4.3, efficiency: 82 }
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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">كفاءة الصيانة</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.efficiency.current}%</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(kpiData.efficiency.trend)}
              <span className={`text-sm ${getTrendColor(kpiData.efficiency.trend)}`}>
                {kpiData.efficiency.change}
              </span>
              <span className="text-sm text-muted-foreground">من الشهر الماضي</span>
            </div>
            <Progress value={kpiData.efficiency.current} className="mt-3" />
            <div className="text-xs text-muted-foreground mt-1">
              الهدف: {kpiData.efficiency.target}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت الإنجاز</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.avgCompletionTime.current}ساعة</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(kpiData.avgCompletionTime.trend)}
              <span className={`text-sm ${getTrendColor(kpiData.avgCompletionTime.trend)}`}>
                {kpiData.avgCompletionTime.change}
              </span>
              <span className="text-sm text-muted-foreground">تحسن</span>
            </div>
            <Progress value={(kpiData.avgCompletionTime.target / kpiData.avgCompletionTime.current) * 100} className="mt-3" />
            <div className="text-xs text-muted-foreground mt-1">
              الهدف: {kpiData.avgCompletionTime.target} ساعة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رضا العملاء</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.customerSatisfaction.current}/5</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(kpiData.customerSatisfaction.trend)}
              <span className={`text-sm ${getTrendColor(kpiData.customerSatisfaction.trend)}`}>
                {kpiData.customerSatisfaction.change}
              </span>
              <span className="text-sm text-muted-foreground">نقطة</span>
            </div>
            <Progress value={(kpiData.customerSatisfaction.current / 5) * 100} className="mt-3" />
            <div className="text-xs text-muted-foreground mt-1">
              الهدف: {kpiData.customerSatisfaction.target}/5
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تكلفة الخدمة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.costPerService.current} ر.س</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(kpiData.costPerService.trend)}
              <span className={`text-sm ${getTrendColor(kpiData.costPerService.trend)}`}>
                {kpiData.costPerService.change}
              </span>
              <span className="text-sm text-muted-foreground">من الشهر الماضي</span>
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              الهدف: {kpiData.costPerService.target} ر.س
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإنجاز في الوقت</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.onTimeCompletion.current}%</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(kpiData.onTimeCompletion.trend)}
              <span className={`text-sm ${getTrendColor(kpiData.onTimeCompletion.trend)}`}>
                {kpiData.onTimeCompletion.change}
              </span>
            </div>
            <Progress value={kpiData.onTimeCompletion.current} className="mt-3" />
            <div className="text-xs text-muted-foreground mt-1">
              الهدف: {kpiData.onTimeCompletion.target}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإنجاز من المرة الأولى</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.firstTimeRight.current}%</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(kpiData.firstTimeRight.trend)}
              <span className={`text-sm ${getTrendColor(kpiData.firstTimeRight.trend)}`}>
                {kpiData.firstTimeRight.change}
              </span>
            </div>
            <Progress value={kpiData.firstTimeRight.current} className="mt-3" />
            <div className="text-xs text-muted-foreground mt-1">
              الهدف: {kpiData.firstTimeRight.target}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mechanic Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>أداء الميكانيكيين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mechanicPerformance.map((mechanic, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{mechanic.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {mechanic.completedJobs} مهمة مكتملة
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{mechanic.avgTime}ساعة</div>
                    <div className="text-muted-foreground">متوسط الوقت</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {mechanic.satisfaction}
                    </div>
                    <div className="text-muted-foreground">رضا العملاء</div>
                  </div>
                  <div className="text-center">
                    <Badge variant={mechanic.efficiency >= 90 ? 'default' : 'secondary'}>
                      {mechanic.efficiency}% كفاءة
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
