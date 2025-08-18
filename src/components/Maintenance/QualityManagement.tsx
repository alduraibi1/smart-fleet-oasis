
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  ClipboardCheck,
  TrendingUp,
  Award,
  FileText,
  Users
} from 'lucide-react';

export const QualityManagement = () => {
  // Mock quality data
  const qualityMetrics = {
    overallScore: 94.2,
    inspectionsPassed: 87,
    customerSatisfaction: 4.6,
    reworkRate: 3.2
  };

  const recentInspections = [
    {
      id: 1,
      vehicle: 'أ ب ج 1234 - كامري 2020',
      mechanic: 'أحمد محمد',
      workType: 'تغيير زيت',
      inspectionDate: '2024-01-15',
      inspector: 'محمد علي',
      overallScore: 95,
      checksPassed: 18,
      checksFailed: 1,
      status: 'approved',
      notes: 'عمل ممتاز، ملاحظة بسيطة على تنظيف المنطقة'
    },
    {
      id: 2,
      vehicle: 'د هـ و 5678 - كورولا 2019',
      mechanic: 'علي أحمد',
      workType: 'صيانة فرامل',
      inspectionDate: '2024-01-14',
      inspector: 'سالم محمد',
      overallScore: 88,
      checksPassed: 15,
      checksFailed: 3,
      status: 'requires_rework',
      notes: 'يحتاج إعادة فحص ضغط الفرامل'
    },
    {
      id: 3,
      vehicle: 'ز ح ط 9012 - اكورد 2021',
      mechanic: 'محمد علي',
      workType: 'فحص شامل',
      inspectionDate: '2024-01-13',
      inspector: 'أحمد محمد',
      overallScore: 98,
      checksPassed: 22,
      checksFailed: 0,
      status: 'approved',
      notes: 'عمل متميز'
    }
  ];

  const qualityChecklists = [
    {
      id: 1,
      name: 'فحص تغيير الزيت',
      category: 'صيانة دورية',
      itemsCount: 15,
      lastUpdated: '2024-01-10',
      isActive: true
    },
    {
      id: 2,
      name: 'فحص الفرامل',
      category: 'أنظمة الأمان',
      itemsCount: 12,
      lastUpdated: '2024-01-08',
      isActive: true
    },
    {
      id: 3,
      name: 'الفحص الشامل',
      category: 'فحص دوري',
      itemsCount: 25,
      lastUpdated: '2024-01-05',
      isActive: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'requires_rework':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'مُعتمد';
      case 'requires_rework':
        return 'يحتاج إعادة عمل';
      case 'pending':
        return 'قيد المراجعة';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">إدارة الجودة</h3>
          <p className="text-muted-foreground">
            مراقبة وتحسين جودة الخدمات المقدمة
          </p>
        </div>
        <Button className="gap-2">
          <ClipboardCheck className="h-4 w-4" />
          إجراء فحص جودة
        </Button>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              نقاط الجودة الإجمالية
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{qualityMetrics.overallScore}%</div>
            <Progress value={qualityMetrics.overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل نجاح الفحوصات
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{qualityMetrics.inspectionsPassed}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2.1% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              رضا العملاء
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{qualityMetrics.customerSatisfaction}/5</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-3 w-3 ${star <= Math.floor(qualityMetrics.customerSatisfaction) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل إعادة العمل
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{qualityMetrics.reworkRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              -0.8% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quality Inspections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            فحوصات الجودة الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInspections.map((inspection) => (
              <Card key={inspection.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{inspection.vehicle}</h4>
                    <p className="text-sm text-muted-foreground">
                      {inspection.workType} - {inspection.mechanic}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      فحص بواسطة: {inspection.inspector}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusColor(inspection.status) as any} className="mb-2">
                      {getStatusLabel(inspection.status)}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {new Date(inspection.inspectionDate).toLocaleDateString('ar')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{inspection.overallScore}%</div>
                    <div className="text-sm text-muted-foreground">النقاط الإجمالية</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{inspection.checksPassed}</div>
                    <div className="text-sm text-muted-foreground">فحوصات نجحت</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{inspection.checksFailed}</div>
                    <div className="text-sm text-muted-foreground">فحوصات فشلت</div>
                  </div>
                </div>

                {inspection.notes && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{inspection.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    عرض التفاصيل
                  </Button>
                  {inspection.status === 'requires_rework' && (
                    <Button size="sm" variant="default">
                      طلب إعادة عمل
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Checklists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            قوائم فحص الجودة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qualityChecklists.map((checklist) => (
              <Card key={checklist.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{checklist.name}</h4>
                    <p className="text-sm text-muted-foreground">{checklist.category}</p>
                  </div>
                  <Badge variant={checklist.isActive ? 'default' : 'secondary'}>
                    {checklist.isActive ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>عدد البنود:</span>
                    <span className="font-medium">{checklist.itemsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>آخر تحديث:</span>
                    <span className="text-muted-foreground">
                      {new Date(checklist.lastUpdated).toLocaleDateString('ar')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    تعديل
                  </Button>
                  <Button size="sm" variant="default" className="flex-1">
                    استخدام
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
