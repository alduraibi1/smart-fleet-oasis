import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  BarChart3,
  FileText,
  Eye,
  Lightbulb,
  Clock,
  DollarSign,
  UserCheck,
  Car,
  Shield
} from 'lucide-react';

interface ContractAnalysis {
  id: string;
  contractId: string;
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  insights: {
    profitability: number;
    customerRisk: number;
    vehicleUtilization: number;
    marketTrends: number;
  };
  recommendations: string[];
  warnings: string[];
  predictions: {
    renewalProbability: number;
    expectedRevenue: number;
    riskFactors: string[];
  };
  aiGeneratedTerms: {
    suggestedRate: number;
    optimalDuration: number;
    recommendedInsurance: number;
  };
}

interface AIContractAnalysisProps {
  contractId?: string;
  onAnalysisComplete?: (analysis: ContractAnalysis) => void;
}

export const AIContractAnalysis: React.FC<AIContractAnalysisProps> = ({
  contractId,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock AI analysis data
  const mockAnalysis: ContractAnalysis = {
    id: 'analysis-001',
    contractId: contractId || 'CR-2024-001',
    score: 85,
    riskLevel: 'low',
    insights: {
      profitability: 92,
      customerRisk: 15,
      vehicleUtilization: 88,
      marketTrends: 75
    },
    recommendations: [
      'زيادة السعر اليومي بنسبة 5% بناءً على تحليل السوق',
      'إضافة تأمين شامل للحصول على أرباح إضافية',
      'تقديم عروض للتجديد المبكر للعميل',
      'مراجعة شروط الإرجاع لتحسين استخدام المركبة'
    ],
    warnings: [
      'العميل لديه تاريخ متأخر في الدفع بمعدل 10%',
      'سعر السوق للمركبة المشابهة أعلى بـ 8%'
    ],
    predictions: {
      renewalProbability: 78,
      expectedRevenue: 45000,
      riskFactors: ['تأخير الدفع', 'تقلبات السوق']
    },
    aiGeneratedTerms: {
      suggestedRate: 320,
      optimalDuration: 365,
      recommendedInsurance: 150
    }
  };

  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI processing
    setTimeout(() => {
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
      onAnalysisComplete?.(mockAnalysis);
    }, 3000);
  };

  useEffect(() => {
    if (contractId) {
      performAIAnalysis();
    }
  }, [contractId]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Brain className="h-16 w-16 text-primary animate-pulse mb-4" />
          <h3 className="text-lg font-semibold mb-2">تحليل العقد بالذكاء الاصطناعي</h3>
          <p className="text-muted-foreground text-center mb-4">
            جاري تحليل العقد وتقييم المخاطر والفرص...
          </p>
          <div className="w-full max-w-md">
            <Progress value={65} className="mb-2" />
            <p className="text-sm text-center text-muted-foreground">معالجة البيانات...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Brain className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">تحليل العقد بالذكاء الاصطناعي</h3>
          <p className="text-muted-foreground text-center mb-4">
            احصل على تحليل شامل ومقترحات ذكية لتحسين العقد
          </p>
          <Button onClick={performAIAnalysis} className="gap-2">
            <Brain className="h-4 w-4" />
            بدء التحليل
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>تحليل العقد بالذكاء الاصطناعي</CardTitle>
                <p className="text-sm text-muted-foreground">
                  تحليل شامل ومقترحات لتحسين الأداء
                </p>
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-primary">{analysis.score}/100</div>
              <Badge variant={getRiskBadgeVariant(analysis.riskLevel)}>
                مخاطر {analysis.riskLevel === 'low' ? 'منخفضة' : analysis.riskLevel === 'medium' ? 'متوسطة' : 'عالية'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">الربحية</span>
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-success">{analysis.insights.profitability}%</div>
            <Progress value={analysis.insights.profitability} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">مخاطر العميل</span>
              <UserCheck className="h-4 w-4 text-warning" />
            </div>
            <div className="text-2xl font-bold text-warning">{analysis.insights.customerRisk}%</div>
            <Progress value={analysis.insights.customerRisk} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">استخدام المركبة</span>
              <Car className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">{analysis.insights.vehicleUtilization}%</div>
            <Progress value={analysis.insights.vehicleUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">اتجاهات السوق</span>
              <TrendingUp className="h-4 w-4 text-info" />
            </div>
            <div className="text-2xl font-bold text-info">{analysis.insights.marketTrends}%</div>
            <Progress value={analysis.insights.marketTrends} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="terms">الشروط المقترحة</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    تحذيرات مهمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.warnings.map((warning, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  مؤشرات الأداء
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>نسبة التجديد المتوقعة</span>
                  <span className="font-bold text-success">{analysis.predictions.renewalProbability}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>الإيرادات المتوقعة</span>
                  <span className="font-bold text-primary">{analysis.predictions.expectedRevenue.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>نقاط المخاطر</span>
                  <span className="font-bold text-warning">{analysis.predictions.riskFactors.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                التوصيات الذكية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      تطبيق
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  التنبؤات المالية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {analysis.predictions.renewalProbability}%
                  </div>
                  <p className="text-sm text-muted-foreground">احتمالية التجديد</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success mb-2">
                    {analysis.predictions.expectedRevenue.toLocaleString()} ر.س
                  </div>
                  <p className="text-sm text-muted-foreground">الإيرادات المتوقعة</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  عوامل المخاطر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.predictions.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                الشروط المقترحة بالذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">
                    {analysis.aiGeneratedTerms.suggestedRate} ر.س
                  </div>
                  <p className="text-sm text-muted-foreground">السعر المقترح يومياً</p>
                </div>

                <div className="text-center p-4 bg-success/5 rounded-lg">
                  <Clock className="h-8 w-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold text-success">
                    {analysis.aiGeneratedTerms.optimalDuration} يوم
                  </div>
                  <p className="text-sm text-muted-foreground">المدة المثلى</p>
                </div>

                <div className="text-center p-4 bg-info/5 rounded-lg">
                  <Shield className="h-8 w-8 text-info mx-auto mb-2" />
                  <div className="text-2xl font-bold text-info">
                    {analysis.aiGeneratedTerms.recommendedInsurance} ر.س
                  </div>
                  <p className="text-sm text-muted-foreground">التأمين المقترح</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  تطبيق الشروط المقترحة
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  معاينة العقد
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIContractAnalysis;