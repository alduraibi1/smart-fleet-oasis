
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Clock,
  User,
  FileText
} from 'lucide-react';

interface RiskFactors {
  paymentHistory: number;
  contractFrequency: number;
  averageAmount: number;
  cancellationRate: number;
  timeWithCompany: number;
  guarantorQuality: number;
}

interface CustomerRiskAssessmentProps {
  customerId: string;
  customerData?: {
    name?: string;
    total_contracts?: number;
    total_paid?: number;
    outstanding_balance?: number;
    created_at?: string;
    payment_reliability?: number;
  };
}

export function CustomerRiskAssessment({ customerId, customerData }: CustomerRiskAssessmentProps) {
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({
    paymentHistory: 85,
    contractFrequency: 70,
    averageAmount: 60,
    cancellationRate: 90,
    timeWithCompany: 75,
    guarantorQuality: 80
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    calculateRiskScore();
  }, [customerData, riskFactors]);

  const calculateRiskScore = () => {
    // حساب درجة المخاطر بناءً على العوامل المختلفة
    const weights = {
      paymentHistory: 0.25,
      contractFrequency: 0.15,
      averageAmount: 0.15,
      cancellationRate: 0.20,
      timeWithCompany: 0.15,
      guarantorQuality: 0.10
    };

    let score = 0;
    Object.entries(weights).forEach(([factor, weight]) => {
      score += riskFactors[factor as keyof RiskFactors] * weight;
    });

    // تعديل النتيجة بناءً على البيانات الحقيقية
    if (customerData) {
      if (customerData.outstanding_balance && customerData.outstanding_balance > 5000) {
        score -= 15; // خصم نقاط للمتأخرات العالية
      }
      
      if (customerData.payment_reliability && customerData.payment_reliability < 80) {
        score -= 10; // خصم نقاط لضعف الموثوقية في الدفع
      }
    }

    setRiskScore(Math.max(0, Math.min(100, score)));

    // تحديد مستوى المخاطر
    if (score >= 80) {
      setRiskLevel('low');
    } else if (score >= 60) {
      setRiskLevel('medium');
    } else if (score >= 40) {
      setRiskLevel('high');
    } else {
      setRiskLevel('critical');
    }

    // توليد التوصيات
    generateRecommendations(score);
  };

  const generateRecommendations = (score: number) => {
    const newRecommendations: string[] = [];

    if (score < 40) {
      newRecommendations.push('تطبيق شروط دفع صارمة');
      newRecommendations.push('طلب ضمانات إضافية قبل التعاقد');
      newRecommendations.push('مراقبة يومية للمدفوعات');
    } else if (score < 60) {
      newRecommendations.push('مراجعة تاريخ الدفع بانتظام');
      newRecommendations.push('تحديد حد ائتماني منخفض');
      newRecommendations.push('متابعة أسبوعية للحساب');
    } else if (score < 80) {
      newRecommendations.push('مراقبة شهرية للحساب');
      newRecommendations.push('تطبيق شروط دفع عادية');
    } else {
      newRecommendations.push('عميل موثوق - يمكن منح مزايا إضافية');
      newRecommendations.push('أولوية في الخدمات الجديدة');
    }

    setRecommendations(newRecommendations);
  };

  const getRiskLevelInfo = (level: string) => {
    switch (level) {
      case 'low':
        return {
          label: 'مخاطر منخفضة',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: Shield
        };
      case 'medium':
        return {
          label: 'مخاطر متوسطة',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: AlertTriangle
        };
      case 'high':
        return {
          label: 'مخاطر عالية',
          color: 'bg-orange-500',
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: AlertTriangle
        };
      case 'critical':
        return {
          label: 'مخاطر حرجة',
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle
        };
      default:
        return {
          label: 'غير محدد',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: Shield
        };
    }
  };

  const riskInfo = getRiskLevelInfo(riskLevel);
  const RiskIcon = riskInfo.icon;

  return (
    <div className="space-y-6">
      {/* Risk Score Overview */}
      <Card className={`${riskInfo.bgColor} ${riskInfo.borderColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RiskIcon className={`h-5 w-5 ${riskInfo.textColor}`} />
            تقييم مخاطر العميل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${riskInfo.textColor} mb-2`}>
                  {Math.round(riskScore)}
                </div>
                <div className="text-sm text-muted-foreground">درجة المخاطر</div>
                <Progress 
                  value={riskScore} 
                  className="mt-2"
                />
              </div>
              
              <div className="text-center">
                <Badge className={`${riskInfo.color} text-white`}>
                  {riskInfo.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">معلومات سريعة</h4>
              {customerData && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">إجمالي العقود:</span>
                    <div className="font-medium">{customerData.total_contracts || 0}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">إجمالي المدفوع:</span>
                    <div className="font-medium text-green-600">
                      {(customerData.total_paid || 0).toLocaleString()} ر.س
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">المتأخرات:</span>
                    <div className="font-medium text-red-600">
                      {(customerData.outstanding_balance || 0).toLocaleString()} ر.س
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">موثوقية الدفع:</span>
                    <div className="font-medium">
                      {customerData.payment_reliability || 0}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل عوامل المخاطر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(riskFactors).map(([factor, value]) => {
              const factorNames = {
                paymentHistory: 'تاريخ الدفع',
                contractFrequency: 'تكرار التعاقد',
                averageAmount: 'متوسط المبالغ',
                cancellationRate: 'معدل الإلغاء',
                timeWithCompany: 'مدة العلاقة',
                guarantorQuality: 'جودة الضامن'
              };

              return (
                <div key={factor} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {factorNames[factor as keyof typeof factorNames]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {value}%
                    </span>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            التوصيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="text-sm">{recommendation}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Trend Alert */}
      {riskLevel === 'high' || riskLevel === 'critical' ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium text-red-800">
              تحذير: هذا العميل يحمل مخاطر {riskInfo.label.toLowerCase()}
            </div>
            <div className="text-sm text-red-700 mt-1">
              يُنصح بمراجعة شروط التعامل وتطبيق احتياطات إضافية
            </div>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
