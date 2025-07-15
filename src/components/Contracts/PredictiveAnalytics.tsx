import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Car,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  LineChart,
  Lightbulb
} from 'lucide-react';

interface PredictionData {
  id: string;
  category: 'revenue' | 'churn' | 'demand' | 'pricing' | 'renewal';
  title: string;
  prediction: number;
  confidence: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  factors: string[];
  recommendation: string;
}

interface MarketInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'trend';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  probability: number;
  expectedImpact: string;
  actionItems: string[];
}

export const PredictiveAnalytics: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('predictions');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock predictive data
  const predictions: PredictionData[] = [
    {
      id: 'pred-001',
      category: 'revenue',
      title: 'نمو الإيرادات المتوقع',
      prediction: 23.5,
      confidence: 87,
      timeframe: '3 أشهر',
      trend: 'up',
      impact: 'high',
      factors: ['زيادة الطلب الموسمي', 'تحسن أداء التسويق', 'تطوير خدمات جديدة'],
      recommendation: 'زيادة الاستثمار في التسويق وتوسيع الأسطول'
    },
    {
      id: 'pred-002',
      category: 'churn',
      title: 'معدل فقدان العملاء',
      prediction: 12.8,
      confidence: 92,
      timeframe: 'شهر واحد',
      trend: 'down',
      impact: 'medium',
      factors: ['تحسن خدمة العملاء', 'برامج الولاء الجديدة', 'تنوع خيارات الدفع'],
      recommendation: 'الاستمرار في برامج الاحتفاظ بالعملاء'
    },
    {
      id: 'pred-003',
      category: 'demand',
      title: 'الطلب على المركبات الفاخرة',
      prediction: 35.2,
      confidence: 79,
      timeframe: '6 أشهر',
      trend: 'up',
      impact: 'high',
      factors: ['نمو الاقتصاد المحلي', 'فعاليات موسمية', 'زيادة السياحة'],
      recommendation: 'التوسع في مركبات الأعمال والفئة الفاخرة'
    },
    {
      id: 'pred-004',
      category: 'pricing',
      title: 'تحسين استراتيجية التسعير',
      prediction: 18.7,
      confidence: 84,
      timeframe: '2 أشهر',
      trend: 'up',
      impact: 'medium',
      factors: ['تحليل أسعار المنافسين', 'مرونة الطلب', 'التسعير الديناميكي'],
      recommendation: 'تطبيق نموذج التسعير المرن حسب الوقت والطلب'
    }
  ];

  const marketInsights: MarketInsight[] = [
    {
      id: 'insight-001',
      type: 'opportunity',
      title: 'نمو قطاع الأعمال',
      description: 'نمو متوقع في طلب الشركات على خدمات التأجير طويل المدى',
      severity: 'high',
      probability: 89,
      expectedImpact: '+25% في الإيرادات',
      actionItems: [
        'تطوير باقات مخصصة للشركات',
        'إنشاء فريق مبيعات B2B',
        'تحسين عروض الخصم للكميات'
      ]
    },
    {
      id: 'insight-002',
      type: 'threat',
      title: 'زيادة المنافسة',
      description: 'دخول منافسين جدد بأسعار منخفضة في السوق',
      severity: 'medium',
      probability: 76,
      expectedImpact: '-15% في حصة السوق',
      actionItems: [
        'مراجعة استراتيجية التسعير',
        'تعزيز القيمة المضافة للخدمات',
        'تحسين تجربة العميل'
      ]
    },
    {
      id: 'insight-003',
      type: 'trend',
      title: 'تحول نحو المركبات الكهربائية',
      description: 'تزايد الطلب على المركبات الصديقة للبيئة',
      severity: 'medium',
      probability: 83,
      expectedImpact: '+30% في الطلب على الكهربائية',
      actionItems: [
        'الاستثمار في أسطول كهربائي',
        'تطوير شراكات مع محطات الشحن',
        'تدريب الفريق على التقنيات الجديدة'
      ]
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-5 w-5 text-success" />;
      case 'threat': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'trend': return <TrendingUp className="h-5 w-5 text-info" />;
      default: return <Brain className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case 'opportunity': return <Badge className="bg-success/10 text-success">فرصة</Badge>;
      case 'threat': return <Badge className="bg-destructive/10 text-destructive">تهديد</Badge>;
      case 'trend': return <Badge className="bg-info/10 text-info">اتجاه</Badge>;
      default: return <Badge variant="outline">عام</Badge>;
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>التحليلات التنبؤية</CardTitle>
                <p className="text-sm text-muted-foreground">
                  رؤى مستقبلية لاتخاذ قرارات استراتيجية ذكية
                </p>
              </div>
            </div>
            <Button onClick={runAnalysis} disabled={isAnalyzing} className="gap-2">
              {isAnalyzing ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  تحديث التنبؤات
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">دقة التنبؤات</span>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">87.5%</div>
            <Progress value={87.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">الإيرادات المتوقعة</span>
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-success">+23.5%</div>
            <p className="text-xs text-muted-foreground mt-1">خلال 3 أشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">اتجاه السوق</span>
              <TrendingUp className="h-4 w-4 text-info" />
            </div>
            <div className="text-2xl font-bold text-info">إيجابي</div>
            <p className="text-xs text-muted-foreground mt-1">نمو مستمر</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">المخاطر المحتملة</span>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <div className="text-2xl font-bold text-warning">منخفضة</div>
            <p className="text-xs text-muted-foreground mt-1">2 تهديدات</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="insights">رؤى السوق</TabsTrigger>
          <TabsTrigger value="scenarios">السيناريوهات</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(prediction.trend)}
                      <div>
                        <h3 className="font-semibold">{prediction.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          خلال {prediction.timeframe}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {prediction.prediction}%
                      </div>
                      <Badge variant="outline">
                        ثقة {prediction.confidence}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground mb-2 block">
                        العوامل المؤثرة:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        <strong>التوصية:</strong> {prediction.recommendation}
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">مستوى التأثير:</span>
                        <Badge 
                          variant={prediction.impact === 'high' ? 'destructive' : 
                                  prediction.impact === 'medium' ? 'secondary' : 'default'}
                        >
                          {prediction.impact === 'high' ? 'عالي' :
                           prediction.impact === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {marketInsights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          {getInsightBadge(insight.type)}
                          <Badge variant="outline">
                            احتمالية {insight.probability}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      
                      <div className="mb-4">
                        <span className="text-sm font-medium text-success">
                          التأثير المتوقع: {insight.expectedImpact}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          خطوات العمل المقترحة:
                        </span>
                        <ul className="space-y-1">
                          {insight.actionItems.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-success mt-1 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Optimistic Scenario */}
            <Card className="border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-5 w-5" />
                  السيناريو المتفائل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-1">+35%</div>
                  <p className="text-sm text-muted-foreground">نمو الإيرادات</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>الطلب على الخدمات</span>
                    <span className="font-medium">+40%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>رضا العملاء</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>كفاءة العمليات</span>
                    <span className="font-medium">+25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Realistic Scenario */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <BarChart3 className="h-5 w-5" />
                  السيناريو الواقعي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">+23%</div>
                  <p className="text-sm text-muted-foreground">نمو الإيرادات</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>الطلب على الخدمات</span>
                    <span className="font-medium">+25%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>رضا العملاء</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>كفاءة العمليات</span>
                    <span className="font-medium">+15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pessimistic Scenario */}
            <Card className="border-warning/20 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <TrendingDown className="h-5 w-5" />
                  السيناريو المتشائم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-1">+8%</div>
                  <p className="text-sm text-muted-foreground">نمو الإيرادات</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>الطلب على الخدمات</span>
                    <span className="font-medium">+10%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>رضا العملاء</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>كفاءة العمليات</span>
                    <span className="font-medium">+5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;