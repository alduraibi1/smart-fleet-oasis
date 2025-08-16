
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Wrench,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';

export const AIMaintenancePredictions = () => {
  // Mock AI prediction data
  const predictions = [
    {
      id: 1,
      vehiclePlate: 'أ ب ج 1234',
      vehicleType: 'كامري 2020',
      predictionType: 'oil_change',
      predictedDate: '2024-02-15',
      confidence: 87,
      factors: ['عالي الاستخدام', 'ظروف صحراوية', 'صيانة منتظمة'],
      estimatedCost: 200,
      priority: 'medium',
      recommendations: ['استخدام زيت مقاوم للحرارة', 'فحص الفلتر']
    },
    {
      id: 2,
      vehiclePlate: 'د هـ و 5678',
      vehicleType: 'كورولا 2019',
      predictionType: 'brake_service',
      predictedDate: '2024-02-20',
      confidence: 92,
      factors: ['قيادة مدينة', 'فترات توقف طويلة', 'عمر الفرامل'],
      estimatedCost: 450,
      priority: 'high',
      recommendations: ['فحص أقراص الفرامل', 'استبدال السائل']
    },
    {
      id: 3,
      vehiclePlate: 'ز ح ط 9012',
      vehicleType: 'اكورد 2021',
      predictionType: 'transmission_service',
      predictedDate: '2024-03-01',
      confidence: 78,
      factors: ['قيادة سريعة', 'حمولة ثقيلة', 'ارتفاع درجة الحرارة'],
      estimatedCost: 800,
      priority: 'high',
      recommendations: ['فحص السائل', 'تنظيف الفلتر', 'معايرة النظام']
    }
  ];

  const healthScores = [
    { vehicle: 'أ ب ج 1234', score: 85, trend: 'stable', riskFactors: ['عمر المركبة', 'عدد الكيلومترات'] },
    { vehicle: 'د هـ و 5678', score: 72, trend: 'declining', riskFactors: ['تكرار الأعطال', 'تكلفة الصيانة العالية'] },
    { vehicle: 'ز ح ط 9012', score: 91, trend: 'improving', riskFactors: ['لا توجد مخاطر كبيرة'] }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالي';
      case 'medium':
        return 'متوسط';
      default:
        return 'منخفض';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'oil_change':
        return 'تغيير الزيت';
      case 'brake_service':
        return 'صيانة الفرامل';
      case 'transmission_service':
        return 'صيانة ناقل الحركة';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            التنبؤ الذكي للصيانة
          </h3>
          <p className="text-muted-foreground">
            توقعات مدعومة بالذكاء الاصطناعي لاحتياجات الصيانة المستقبلية
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث التنبؤات
        </Button>
      </div>

      {/* AI Predictions Cards */}
      <div className="grid gap-6">
        {predictions.map((prediction) => (
          <Card key={prediction.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {prediction.vehiclePlate} - {prediction.vehicleType}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {getTypeLabel(prediction.predictionType)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(prediction.priority) as any}>
                    {getPriorityLabel(prediction.priority)}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      دقة التنبؤ: {prediction.confidence}%
                    </div>
                    <Progress value={prediction.confidence} className="w-20 h-2 mt-1" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">التاريخ المتوقع</div>
                    <div className="font-medium">
                      {new Date(prediction.predictedDate).toLocaleDateString('ar')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">التكلفة المتوقعة</div>
                    <div className="font-medium">{prediction.estimatedCost} ر.س</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">درجة الثقة</div>
                    <div className="font-medium">{prediction.confidence}%</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">العوامل المؤثرة:</h4>
                <div className="flex flex-wrap gap-2">
                  {prediction.factors.map((factor, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">التوصيات:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {prediction.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-current" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="default">
                  جدولة الصيانة
                </Button>
                <Button size="sm" variant="outline">
                  عرض التفاصيل
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vehicle Health Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            درجات صحة المركبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthScores.map((vehicle, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{vehicle.vehicle}</h4>
                    <p className="text-sm text-muted-foreground">
                      اتجاه الصحة: {vehicle.trend === 'improving' ? 'تحسن' : 
                                     vehicle.trend === 'declining' ? 'تراجع' : 'مستقر'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{vehicle.score}</div>
                    <div className="text-sm text-muted-foreground">درجة الصحة</div>
                    <Progress value={vehicle.score} className="w-20 mt-1" />
                  </div>
                  <div className="text-right max-w-xs">
                    <div className="text-sm font-medium mb-1">عوامل الخطر:</div>
                    <div className="text-xs text-muted-foreground">
                      {vehicle.riskFactors.join('، ')}
                    </div>
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
