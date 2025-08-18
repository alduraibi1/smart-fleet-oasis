
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Star,
  AlertTriangle,
  TrendingUp,
  FileText,
  Award,
  Target,
  BarChart3,
  Users
} from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';

export const QualityManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { maintenanceRecords, mechanics } = useMaintenance();

  // Mock quality data - في النظام الحقيقي ستحسب من البيانات الفعلية
  const qualityMetrics = {
    overallScore: 94.2,
    customerSatisfaction: 96.8,
    firstTimeFixRate: 87.5,
    averageRepairTime: 2.3,
    reworkRate: 4.2,
    warrantyClaimRate: 2.1
  };

  const qualityChecks = [
    {
      id: 1,
      vehiclePlate: 'أ ب ج 1234',
      mechanicName: 'أحمد محمد',
      checkDate: '2024-01-15',
      score: 95,
      criteria: {
        workmanship: 98,
        timeliness: 92,
        cleanliness: 95,
        documentation: 94,
        customerService: 96
      },
      issues: [],
      status: 'passed'
    },
    {
      id: 2,
      vehiclePlate: 'د هـ و 5678',
      mechanicName: 'محمد أحمد',
      checkDate: '2024-01-14',
      score: 78,
      criteria: {
        workmanship: 85,
        timeliness: 70,
        cleanliness: 80,
        documentation: 75,
        customerService: 80
      },
      issues: ['تأخير في التسليم', 'عدم اكتمال التوثيق'],
      status: 'needs_improvement'
    },
    {
      id: 3,
      vehiclePlate: 'ز ح ط 9012',
      mechanicName: 'سالم عبدالله',
      checkDate: '2024-01-13',
      score: 88,
      criteria: {
        workmanship: 90,
        timeliness: 88,
        cleanliness: 85,
        documentation: 90,
        customerService: 87
      },
      issues: ['تحسين النظافة مطلوب'],
      status: 'good'
    }
  ];

  const mechanicPerformance = mechanics.map(mechanic => {
    const mechanicChecks = qualityChecks.filter(check => check.mechanicName === mechanic.name);
    const avgScore = mechanicChecks.length > 0 
      ? mechanicChecks.reduce((sum, check) => sum + check.score, 0) / mechanicChecks.length 
      : 0;
    
    return {
      id: mechanic.id,
      name: mechanic.name,
      avgScore: Math.round(avgScore),
      totalChecks: mechanicChecks.length,
      passedChecks: mechanicChecks.filter(c => c.status === 'passed').length,
      rating: avgScore >= 90 ? 'excellent' : avgScore >= 80 ? 'good' : 'needs_improvement'
    };
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'default';
      case 'good': return 'secondary';
      case 'needs_improvement': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'passed': return 'ممتاز';
      case 'good': return 'جيد';
      case 'needs_improvement': return 'يحتاج تحسين';
      default: return status;
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent': return <Award className="h-4 w-4 text-yellow-500" />;
      case 'good': return <Star className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            إدارة الجودة
          </h3>
          <p className="text-muted-foreground">
            مراقبة وتحسين جودة خدمات الصيانة
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            تقرير الجودة
          </Button>
          <Button size="sm">
            <Target className="h-4 w-4 mr-2" />
            فحص جودة جديد
          </Button>
        </div>
      </div>

      {/* Quality KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{qualityMetrics.overallScore}%</div>
              <div className="text-xs text-muted-foreground">النتيجة العامة</div>
              <Progress value={qualityMetrics.overallScore} className="mt-2 h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{qualityMetrics.customerSatisfaction}%</div>
              <div className="text-xs text-muted-foreground">رضا العملاء</div>
              <Progress value={qualityMetrics.customerSatisfaction} className="mt-2 h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{qualityMetrics.firstTimeFixRate}%</div>
              <div className="text-xs text-muted-foreground">إصلاح من المرة الأولى</div>
              <Progress value={qualityMetrics.firstTimeFixRate} className="mt-2 h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{qualityMetrics.averageRepairTime}</div>
              <div className="text-xs text-muted-foreground">متوسط وقت الإصلاح (أيام)</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{qualityMetrics.reworkRate}%</div>
              <div className="text-xs text-muted-foreground">معدل إعادة العمل</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{qualityMetrics.warrantyClaimRate}%</div>
              <div className="text-xs text-muted-foreground">مطالبات الضمان</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="checks">فحوصات الجودة</TabsTrigger>
          <TabsTrigger value="performance">أداء الفنيين</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quality Trends Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                اتجاهات الجودة
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>سيتم عرض مخططات اتجاهات الجودة هنا</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Quality Issues */}
          <Card>
            <CardHeader>
              <CardTitle>المشاكل الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {qualityChecks
                  .filter(check => check.issues.length > 0)
                  .map((check) => (
                    <div key={check.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{check.vehiclePlate} - {check.mechanicName}</div>
                        <div className="text-sm text-muted-foreground">
                          {check.issues.join('، ')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(check.checkDate).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getScoreColor(check.score)}`}>
                          {check.score}%
                        </span>
                        <Badge variant={getStatusColor(check.status) as any}>
                          {getStatusLabel(check.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>فحوصات الجودة الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityChecks.map((check) => (
                  <Card key={check.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{check.vehiclePlate}</h4>
                          <p className="text-sm text-muted-foreground">
                            الفني: {check.mechanicName} • {new Date(check.checkDate).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${getScoreColor(check.score)}`}>
                            {check.score}%
                          </span>
                          <Badge variant={getStatusColor(check.status) as any}>
                            {getStatusLabel(check.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">جودة العمل</div>
                          <div className="font-medium">{check.criteria.workmanship}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">الالتزام بالوقت</div>
                          <div className="font-medium">{check.criteria.timeliness}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">النظافة</div>
                          <div className="font-medium">{check.criteria.cleanliness}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">التوثيق</div>
                          <div className="font-medium">{check.criteria.documentation}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">خدمة العملاء</div>
                          <div className="font-medium">{check.criteria.customerService}%</div>
                        </div>
                      </div>

                      {check.issues.length > 0 && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <h5 className="font-medium text-sm mb-2">المشاكل المحددة:</h5>
                          <ul className="text-sm space-y-1">
                            {check.issues.map((issue, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء الفنيين في الجودة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mechanicPerformance.map((mechanic) => (
                  <Card key={mechanic.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{mechanic.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {mechanic.totalChecks} فحص جودة
                          </p>
                        </div>
                        {getRatingIcon(mechanic.rating)}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>متوسط النتيجة</span>
                            <span className={`font-medium ${getScoreColor(mechanic.avgScore)}`}>
                              {mechanic.avgScore}%
                            </span>
                          </div>
                          <Progress value={mechanic.avgScore} className="h-2" />
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">معدل النجاح:</span>
                          <span className="font-medium">
                            {mechanic.totalChecks > 0 
                              ? Math.round((mechanic.passedChecks / mechanic.totalChecks) * 100)
                              : 0}%
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">التقييم:</span>
                          <Badge variant={
                            mechanic.rating === 'excellent' ? 'default' :
                            mechanic.rating === 'good' ? 'secondary' : 'destructive'
                          }>
                            {mechanic.rating === 'excellent' ? 'ممتاز' :
                             mechanic.rating === 'good' ? 'جيد' : 'يحتاج تحسين'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
