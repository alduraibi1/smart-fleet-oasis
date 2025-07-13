import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, Download, ArrowRight, CheckCircle, Clock, AlertTriangle, Users, FileText, RefreshCw } from "lucide-react";

export function ContractLifecycle() {
  const [selectedContract, setSelectedContract] = useState("C001");

  // Contract lifecycle stages
  const lifecycleStages = [
    { 
      id: 1, 
      name: "إعداد العرض", 
      description: "تحضير العرض المبدئي للعميل",
      duration: "1-2 يوم",
      status: "completed",
      completedAt: "2024-01-15T10:30:00"
    },
    { 
      id: 2, 
      name: "مراجعة العميل", 
      description: "مراجعة العميل للعرض وطلب التعديلات",
      duration: "2-3 أيام",
      status: "completed",
      completedAt: "2024-01-17T14:15:00"
    },
    { 
      id: 3, 
      name: "الموافقة النهائية", 
      description: "موافقة العميل على الشروط والأحكام",
      duration: "1 يوم",
      status: "completed",
      completedAt: "2024-01-18T09:45:00"
    },
    { 
      id: 4, 
      name: "إعداد العقد", 
      description: "صياغة العقد النهائي بالتفاصيل المتفق عليها",
      duration: "1 يوم",
      status: "completed",
      completedAt: "2024-01-19T11:20:00"
    },
    { 
      id: 5, 
      name: "التوقيع الإلكتروني", 
      description: "توقيع العقد من قبل الطرفين إلكترونياً",
      duration: "1-2 يوم",
      status: "in_progress",
      progress: 75
    },
    { 
      id: 6, 
      name: "تسليم المركبة", 
      description: "تسليم المركبة وبدء سريان العقد",
      duration: "1 يوم",
      status: "pending"
    },
    { 
      id: 7, 
      name: "المتابعة الدورية", 
      description: "متابعة تنفيذ العقد والتواصل مع العميل",
      duration: "مستمر",
      status: "pending"
    },
    { 
      id: 8, 
      name: "انتهاء العقد", 
      description: "استلام المركبة وإنهاء العقد أو التجديد",
      duration: "1 يوم",
      status: "pending"
    }
  ];

  // Active contracts in different stages
  const contractsInStages = [
    { stage: "إعداد العرض", count: 8, contracts: ["C156", "C157", "C158"] },
    { stage: "مراجعة العميل", count: 12, contracts: ["C148", "C149", "C150"] },
    { stage: "الموافقة النهائية", count: 5, contracts: ["C142", "C143"] },
    { stage: "إعداد العقد", count: 3, contracts: ["C139", "C140"] },
    { stage: "التوقيع الإلكتروني", count: 7, contracts: ["C134", "C135", "C136"] },
    { stage: "تسليم المركبة", count: 4, contracts: ["C130", "C131"] },
    { stage: "المتابعة الدورية", count: 89, contracts: ["C001", "C002", "C003"] },
    { stage: "انتهاء العقد", count: 2, contracts: ["C045", "C046"] }
  ];

  // Contract lifecycle metrics
  const lifecycleMetrics = {
    avgTimeToSign: 5.2,
    avgTimeToDeliver: 1.8,
    completionRate: 94.5,
    customerSatisfaction: 4.6,
    renewalRate: 78.5,
    avgCycleDuration: 8.5
  };

  // Sample contract details
  const contractDetails = {
    id: "C001",
    customerName: "أحمد محمد العلي",
    vehicleModel: "تويوتا كامري 2023",
    startDate: "2024-01-15",
    currentStage: 5,
    nextAction: "انتظار توقيع العميل",
    estimatedCompletion: "2024-01-22",
    priority: "عالي"
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in_progress": return <Clock className="h-5 w-5 text-blue-600" />;
      case "pending": return <AlertTriangle className="h-5 w-5 text-gray-400" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
      case "in_progress": return <Badge className="bg-blue-100 text-blue-800">قيد التنفيذ</Badge>;
      case "pending": return <Badge variant="outline">في الانتظار</Badge>;
      default: return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-primary" />
            دورة حياة العقود
          </h2>
          <p className="text-muted-foreground">تتبع مراحل العقد من البداية للنهاية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            عرض الجدولة
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Lifecycle Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت التوقيع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{lifecycleMetrics.avgTimeToSign} يوم</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت التسليم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{lifecycleMetrics.avgTimeToDeliver} يوم</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">معدل الإنجاز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{lifecycleMetrics.completionRate}%</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">رضا العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lifecycleMetrics.customerSatisfaction}/5</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">معدل التجديد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{lifecycleMetrics.renewalRate}%</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط مدة الدورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{lifecycleMetrics.avgCycleDuration} أشهر</div>
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>مراحل دورة حياة العقد</CardTitle>
          <CardDescription>تتبع تفصيلي لجميع مراحل العقد - العقد رقم {contractDetails.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Contract Info */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">العميل:</span>
                  <div className="font-medium">{contractDetails.customerName}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">المركبة:</span>
                  <div className="font-medium">{contractDetails.vehicleModel}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">الإجراء التالي:</span>
                  <div className="font-medium text-blue-600">{contractDetails.nextAction}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">الأولوية:</span>
                  <Badge variant={contractDetails.priority === 'عالي' ? 'destructive' : 'secondary'}>
                    {contractDetails.priority}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Lifecycle Steps */}
            <div className="space-y-4">
              {lifecycleStages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-shrink-0">
                    {getStageIcon(stage.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{stage.name}</h3>
                      {getStatusBadge(stage.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{stage.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>المدة المتوقعة: {stage.duration}</span>
                      {stage.completedAt && (
                        <span>تم في: {new Date(stage.completedAt).toLocaleDateString('ar-SA')}</span>
                      )}
                    </div>
                    {stage.status === 'in_progress' && stage.progress && (
                      <div className="mt-2">
                        <Progress value={stage.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground mt-1">{stage.progress}% مكتمل</span>
                      </div>
                    )}
                  </div>

                  {index < lifecycleStages.length - 1 && stage.status === 'completed' && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts by Stage */}
      <Card>
        <CardHeader>
          <CardTitle>العقود في كل مرحلة</CardTitle>
          <CardDescription>توزيع العقود الحالية على مراحل الدورة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contractsInStages.map((stage, index) => (
              <Card key={index} className="hover-scale cursor-pointer transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm">{stage.stage}</h3>
                    <Badge variant="outline">{stage.count}</Badge>
                  </div>
                  <div className="space-y-2">
                    {stage.contracts.slice(0, 3).map((contractId) => (
                      <div key={contractId} className="text-xs p-2 bg-muted rounded flex items-center justify-between">
                        <span className="font-mono">{contractId}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-1">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {stage.count > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{stage.count - 3} عقد آخر
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Optimization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              تحسينات مُطبقة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">التوقيع الإلكتروني</h3>
                <p className="text-sm text-green-700">تقليل وقت التوقيع من 3 أيام إلى 1.5 يوم</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">تنبيهات تلقائية</h3>
                <p className="text-sm text-green-700">تذكير العملاء في المواعيد المناسبة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">نماذج موحدة</h3>
                <p className="text-sm text-green-700">استخدام قوالب جاهزة لتسريع العملية</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              فرص التحسين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-yellow-800">مرحلة مراجعة العميل</h3>
                <p className="text-sm text-yellow-700">تقليل وقت المراجعة عبر عروض تفاعلية</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-yellow-800">التسليم السريع</h3>
                <p className="text-sm text-yellow-700">تطوير نظام تسليم في نفس اليوم</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-yellow-800">المتابعة الذكية</h3>
                <p className="text-sm text-yellow-700">أتمتة المتابعة بالذكاء الاصطناعي</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}