import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AIContractAnalysis from './AIContractAnalysis';
import AutomatedWorkflows from './AutomatedWorkflows';
import {
  Zap,
  Brain,
  Target,
  TrendingUp,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Plus,
  Play,
  Pause,
  Edit,
  Eye,
  Calendar,
  DollarSign,
  Shield,
  Lightbulb,
  Workflow,
  Bot,
  Star,
  Download
} from 'lucide-react';

import PredictiveAnalytics from './PredictiveAnalytics';

export function AutomatedContracts() {
  const [automationRules, setAutomationRules] = useState([
    { id: 1, name: "تجديد تلقائي للعقود الشهرية", enabled: true, triggerDays: 7 },
    { id: 2, name: "تذكير انتهاء العقد", enabled: true, triggerDays: 3 },
    { id: 3, name: "موافقة العقود الصغيرة", enabled: false, maxAmount: 5000 },
    { id: 4, name: "إرسال فواتير تلقائية", enabled: true, dayOfMonth: 1 }
  ]);

  // Smart contract templates
  const smartTemplates = [
    {
      id: "ST001",
      name: "عقد إيجار شهري ذكي",
      description: "عقد يومي مع تجديد تلقائي وتعديل أسعار ديناميكي",
      usageCount: 45,
      successRate: 94.2,
      avgCompletionTime: "1.2 يوم",
      features: ["تجديد تلقائي", "تسعير ديناميكي", "تنبيهات ذكية"]
    },
    {
      id: "ST002", 
      name: "عقد مؤسسي متقدم",
      description: "عقد للشركات مع خصومات تدريجية وشروط مرنة",
      usageCount: 23,
      successRate: 97.8,
      avgCompletionTime: "2.8 يوم",
      features: ["خصومات تلقائية", "شروط مرنة", "تقارير دورية"]
    },
    {
      id: "ST003",
      name: "عقد سياحي موسمي",
      description: "عقد للسياح مع تسعير موسمي وخدمات إضافية",
      usageCount: 67,
      successRate: 89.5,
      avgCompletionTime: "0.8 يوم",
      features: ["تسعير موسمي", "خدمات إضافية", "تأمين شامل"]
    }
  ];

  // AI-powered insights
  const aiInsights = [
    {
      type: "recommendation",
      title: "توصية بتعديل السعر",
      description: "يُنصح برفع أسعار العقود الشهرية بنسبة 8% بناءً على تحليل السوق",
      confidence: 92,
      potentialImpact: "+15% في الإيرادات"
    },
    {
      type: "prediction",
      title: "توقع انتهاء العقود",
      description: "12 عقد معرض للإنهاء في الشهر القادم - يُنصح بالتواصل المبكر",
      confidence: 87,
      potentialImpact: "توفير 65% من العقود"
    },
    {
      type: "optimization",
      title: "تحسين شروط التجديد",
      description: "تعديل شروط التجديد يمكن أن يزيد معدل الاحتفاظ بالعملاء",
      confidence: 94,
      potentialImpact: "+12% معدل تجديد"
    }
  ];

  // Automation metrics
  const automationMetrics = {
    contractsAutomated: 156,
    timeSaved: 248,
    errorReduction: 78.5,
    customerSatisfaction: 91.2,
    costSaving: 45000,
    processEfficiency: 85.7
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "recommendation": return <Target className="h-4 w-4 text-blue-600" />;
      case "prediction": return <Brain className="h-4 w-4 text-purple-600" />;
      case "optimization": return <Zap className="h-4 w-4 text-green-600" />;
      default: return <Bot className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case "recommendation": return <Badge className="bg-blue-100 text-blue-800">توصية</Badge>;
      case "prediction": return <Badge className="bg-purple-100 text-purple-800">توقع</Badge>;
      case "optimization": return <Badge className="bg-green-100 text-green-800">تحسين</Badge>;
      default: return <Badge variant="outline">عام</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            العقود الذكية والأتمتة
          </h2>
          <p className="text-muted-foreground">أتمتة العمليات وتحليل ذكي لتحسين كفاءة إدارة العقود</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Settings className="h-4 w-4" />
                إعدادات الأتمتة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إعدادات الأتمتة</DialogTitle>
                <DialogDescription>تخصيص قواعد الأتمتة حسب احتياجاتك</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="auto-renewal">التجديد التلقائي</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="auto-renewal" />
                    <span className="text-sm text-muted-foreground">تفعيل التجديد التلقائي للعقود</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="reminder-days">أيام التذكير</Label>
                  <Input id="reminder-days" type="number" placeholder="7" />
                </div>
                <div>
                  <Label htmlFor="auto-approve">الموافقة التلقائية</Label>
                  <Input id="auto-approve" type="number" placeholder="حد المبلغ للموافقة التلقائية" />
                </div>
                <Button className="w-full">حفظ الإعدادات</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            تقرير الأتمتة
          </Button>
        </div>
      </div>

      {/* Automation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4" />
              العقود المؤتمتة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{automationMetrics.contractsAutomated}</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              الوقت الموفر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{automationMetrics.timeSaved} ساعة</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              تقليل الأخطاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{automationMetrics.errorReduction}%</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">رضا العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{automationMetrics.customerSatisfaction}%</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">التوفير في التكاليف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{automationMetrics.costSaving.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">كفاءة العمليات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{automationMetrics.processEfficiency}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Contract Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            قوالب العقود الذكية
          </CardTitle>
          <CardDescription>قوالب محسنة بالذكاء الاصطناعي لأنواع العقود المختلفة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smartTemplates.map((template) => (
              <Card key={template.id} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge variant="outline">{template.id}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">مرات الاستخدام:</span>
                        <div className="font-medium">{template.usageCount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">معدل النجاح:</span>
                        <div className="font-medium text-green-600">{template.successRate}%</div>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <span className="text-muted-foreground">متوسط وقت الإنجاز:</span>
                      <div className="font-medium text-blue-600">{template.avgCompletionTime}</div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">المميزات:</span>
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        معاينة
                      </Button>
                      <Button size="sm" className="flex-1">
                        استخدام
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            رؤى الذكاء الاصطناعي
          </CardTitle>
          <CardDescription>تحليلات وتوصيات ذكية لتحسين أداء العقود</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <Card key={index} className="hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          {getInsightBadge(insight.type)}
                          <Badge variant="outline">ثقة {insight.confidence}%</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">{insight.potentialImpact}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            تفاصيل
                          </Button>
                          <Button size="sm">
                            تطبيق
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            قواعد الأتمتة النشطة
          </CardTitle>
          <CardDescription>إدارة وتخصيص قواعد الأتمتة للعمليات المختلفة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Switch 
                    checked={rule.enabled}
                    onCheckedChange={(checked) => {
                      setAutomationRules(prev => 
                        prev.map(r => r.id === rule.id ? {...r, enabled: checked} : r)
                      );
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{rule.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rule.triggerDays && `تفعيل قبل ${rule.triggerDays} أيام`}
                      {rule.maxAmount && `للمبالغ أقل من ${rule.maxAmount.toLocaleString()} ريال`}
                      {rule.dayOfMonth && `في اليوم ${rule.dayOfMonth} من كل شهر`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    تعديل
                  </Button>
                  <Button variant="ghost" size="sm">
                    إحصائيات
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover-scale bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Zap className="h-5 w-5" />
              الميزات القادمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-blue-800">التفاوض التلقائي</h3>
                <p className="text-sm text-blue-700">نظام ذكي للتفاوض على الأسعار والشروط</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-blue-800">التحليل التنبؤي المتقدم</h3>
                <p className="text-sm text-blue-700">توقع احتياجات العملاء وسلوكهم</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-blue-800">البلوك تشين للعقود</h3>
                <p className="text-sm text-blue-700">عقود آمنة ولا مركزية باستخدام البلوك تشين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Target className="h-5 w-5" />
              التأثير المتوقع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">توفير 60% من الوقت</h3>
                <p className="text-sm text-green-700">تقليل وقت إعداد العقود من أسابيع إلى ساعات</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">زيادة الدقة 95%</h3>
                <p className="text-sm text-green-700">تقليل الأخطاء البشرية إلى أقل من 5%</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-green-800">تحسين رضا العملاء 25%</h3>
                <p className="text-sm text-green-700">تجربة أسرع وأكثر سلاسة للعملاء</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}