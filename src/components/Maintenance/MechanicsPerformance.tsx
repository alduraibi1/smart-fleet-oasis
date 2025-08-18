
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Award,
  Star,
  Wrench,
  Calendar
} from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';

export const MechanicsPerformance = () => {
  const { mechanics, maintenanceRecords } = useMaintenance();

  // حساب إحصائيات الأداء لكل ميكانيكي
  const mechanicsWithStats = mechanics.map(mechanic => {
    const mechanicRecords = maintenanceRecords.filter(
      record => record.mechanic_id === mechanic.id && record.status === 'completed'
    );
    
    const totalJobs = mechanicRecords.length;
    const avgCompletionTime = totalJobs > 0 
      ? mechanicRecords.reduce((sum, record) => {
          if (record.completed_date && record.scheduled_date) {
            const days = Math.abs(
              new Date(record.completed_date).getTime() - 
              new Date(record.scheduled_date).getTime()
            ) / (1000 * 60 * 60 * 24);
            return sum + days;
          }
          return sum;
        }, 0) / totalJobs 
      : 0;

    const totalCost = mechanicRecords.reduce((sum, record) => 
      sum + (record.total_cost || record.cost || 0), 0
    );
    
    const avgCostPerJob = totalJobs > 0 ? totalCost / totalJobs : 0;
    
    // تقييم الأداء
    const performanceScore = Math.min(100, Math.max(0, 
      (totalJobs * 10) + // النشاط
      (avgCompletionTime < 2 ? 30 : avgCompletionTime < 5 ? 20 : 10) + // السرعة
      (avgCostPerJob < 1000 ? 20 : avgCostPerJob < 2000 ? 15 : 10) // الكفاءة
    ));

    return {
      ...mechanic,
      stats: {
        totalJobs,
        avgCompletionTime,
        avgCostPerJob,
        totalCost,
        performanceScore,
        efficiency: Math.round((totalJobs / (totalJobs + 1)) * 100), // مؤشر كفاءة مبسط
        onTimeRate: Math.round(Math.random() * 30 + 70) // معدل الالتزام بالوقت (موك داتا)
      }
    };
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return 'ممتاز';
    if (score >= 60) return 'جيد';
    return 'يحتاج تحسين';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">تقييم أداء الميكانيكيين</h3>
          <p className="text-muted-foreground">متابعة وتحليل أداء فريق الصيانة</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Award className="h-4 w-4" />
          تقرير الأداء الشهري
        </Button>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الميكانيكيين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mechanics.length}</div>
            <div className="text-xs text-muted-foreground">
              {mechanics.filter(m => m.is_active).length} نشط
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط المهام/الميكانيكي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mechanics.length > 0 
                ? Math.round(maintenanceRecords.filter(r => r.status === 'completed').length / mechanics.length)
                : 0
              }
            </div>
            <div className="text-xs text-muted-foreground">هذا الشهر</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط الأداء العام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mechanicsWithStats.length > 0
                ? Math.round(mechanicsWithStats.reduce((sum, m) => sum + m.stats.performanceScore, 0) / mechanicsWithStats.length)
                : 0
              }%
            </div>
            <div className="text-xs text-muted-foreground">درجة الأداء</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل الالتزام بالوقت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <div className="text-xs text-muted-foreground">المهام المكتملة في الوقت</div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الميكانيكيين مع الأداء */}
      <div className="grid gap-4">
        {mechanicsWithStats.map((mechanic) => (
          <Card key={mechanic.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {mechanic.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{mechanic.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {mechanic.employee_id && (
                        <span>#{mechanic.employee_id}</span>
                      )}
                      {mechanic.specializations && mechanic.specializations.length > 0 && (
                        <span>• {mechanic.specializations[0]}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getPerformanceColor(mechanic.stats.performanceScore)}`}>
                    {mechanic.stats.performanceScore}%
                  </div>
                  <Badge variant={mechanic.stats.performanceScore >= 80 ? 'default' : 
                               mechanic.stats.performanceScore >= 60 ? 'secondary' : 'destructive'}>
                    {getPerformanceLabel(mechanic.stats.performanceScore)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <CheckCircle className="h-3 w-3" />
                    المهام المكتملة
                  </div>
                  <div className="text-xl font-bold">{mechanic.stats.totalJobs}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    متوسط الوقت
                  </div>
                  <div className="text-xl font-bold">{mechanic.stats.avgCompletionTime.toFixed(1)} يوم</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-3 w-3" />
                    الكفاءة
                  </div>
                  <div className="text-xl font-bold">{mechanic.stats.efficiency}%</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Star className="h-3 w-3" />
                    الالتزام
                  </div>
                  <div className="text-xl font-bold">{mechanic.stats.onTimeRate}%</div>
                </div>
              </div>

              {/* شريط التقدم للأداء العام */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>الأداء العام</span>
                  <span>{mechanic.stats.performanceScore}%</span>
                </div>
                <Progress value={mechanic.stats.performanceScore} className="h-2" />
              </div>

              {/* معلومات إضافية */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>متوسط التكلفة: {mechanic.stats.avgCostPerJob.toFixed(0)} ريال</span>
                  <span>إجمالي التكلفة: {mechanic.stats.totalCost.toFixed(0)} ريال</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    التفاصيل
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    الجدولة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mechanics.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">لا يوجد ميكانيكيين</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإضافة ميكانيكيين لمتابعة أدائهم</p>
            <Button>
              <User className="h-4 w-4 mr-2" />
              إضافة ميكانيكي
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
