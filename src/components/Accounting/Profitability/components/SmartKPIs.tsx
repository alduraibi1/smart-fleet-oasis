
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';

type KPIStatus = 'excellent' | 'good' | 'warning' | 'critical';
type KPITrend = 'up' | 'down' | 'stable';

interface KPIData {
  value: number;
  target?: number;
  previousValue?: number;
  trend: KPITrend;
  status: KPIStatus;
}

interface SmartKPIsProps {
  data: any;
  reportType: 'vehicle' | 'owner' | 'customer';
}

export function SmartKPIs({ data, reportType }: SmartKPIsProps) {
  const kpis = useMemo(() => {
    if (!data) return [];

    const getStatus = (value: number, excellent: number, good: number, warning: number): KPIStatus => {
      if (value > excellent) return 'excellent';
      if (value > good) return 'good';
      if (value > warning) return 'warning';
      return 'critical';
    };

    const getTrend = (value: number, high: number, medium: number): KPITrend => {
      if (value > high) return 'up';
      if (value > medium) return 'stable';
      return 'down';
    };

    if (reportType === 'vehicle') {
      return [
        {
          title: 'هامش الربح',
          value: data.profit_margin || 0,
          target: 25,
          format: 'percentage',
          icon: TrendingUp,
          trend: getTrend(data.profit_margin || 0, 25, 15),
          status: getStatus(data.profit_margin || 0, 25, 15, 5)
        },
        {
          title: 'معدل الاستخدام',
          value: data.utilization_rate || 0,
          target: 80,
          format: 'percentage',
          icon: BarChart3,
          trend: getTrend(data.utilization_rate || 0, 80, 60),
          status: getStatus(data.utilization_rate || 0, 80, 60, 40)
        },
        {
          title: 'العائد على الاستثمار',
          value: data.roi || 0,
          target: 15,
          format: 'percentage',
          icon: DollarSign,
          trend: getTrend(data.roi || 0, 15, 10),
          status: getStatus(data.roi || 0, 15, 10, 5)
        },
        {
          title: 'نقطة التعادل',
          value: data.break_even_days || 0,
          target: 15,
          format: 'days',
          icon: Target,
          // For break-even days, lower is better, so we reverse the logic
          trend: (data.break_even_days || 0) < 15 ? 'up' : (data.break_even_days || 0) < 25 ? 'stable' : 'down',
          status: (data.break_even_days || 0) < 15 ? 'excellent' : (data.break_even_days || 0) < 25 ? 'good' : (data.break_even_days || 0) < 35 ? 'warning' : 'critical'
        }
      ];
    } else if (reportType === 'owner') {
      return [
        {
          title: 'هامش الربح',
          value: data.profit_margin || 0,
          target: 20,
          format: 'percentage',
          icon: TrendingUp,
          trend: getTrend(data.profit_margin || 0, 20, 15),
          status: getStatus(data.profit_margin || 0, 20, 15, 10)
        },
        {
          title: 'متوسط الإيراد للمركبة',
          value: data.avg_revenue_per_vehicle || 0,
          target: 10000,
          format: 'currency',
          icon: DollarSign,
          trend: getTrend(data.avg_revenue_per_vehicle || 0, 10000, 7500),
          status: getStatus(data.avg_revenue_per_vehicle || 0, 10000, 7500, 5000)
        },
        {
          title: 'معدل الاستخدام',
          value: data.utilization_rate || 0,
          target: 75,
          format: 'percentage',
          icon: BarChart3,
          trend: getTrend(data.utilization_rate || 0, 75, 60),
          status: getStatus(data.utilization_rate || 0, 75, 60, 40)
        },
        {
          title: 'عدد المركبات النشطة',
          value: data.vehicle_count || 0,
          format: 'number',
          icon: Users,
          trend: 'stable' as KPITrend,
          status: getStatus(data.vehicle_count || 0, 10, 5, 2)
        }
      ];
    } else if (reportType === 'customer') {
      return [
        {
          title: 'نقاط السلوك المالي',
          value: data.payment_behavior_score || 0,
          target: 90,
          format: 'percentage',
          icon: TrendingUp,
          trend: getTrend(data.payment_behavior_score || 0, 90, 70),
          status: getStatus(data.payment_behavior_score || 0, 90, 70, 50)
        },
        {
          title: 'قيمة العميل مدى الحياة',
          value: data.customer_lifetime_value || 0,
          target: 50000,
          format: 'currency',
          icon: DollarSign,
          trend: getTrend(data.customer_lifetime_value || 0, 50000, 25000),
          status: getStatus(data.customer_lifetime_value || 0, 50000, 25000, 10000)
        },
        {
          title: 'متوسط قيمة العقد',
          value: data.average_contract_value || 0,
          target: 5000,
          format: 'currency',
          icon: BarChart3,
          trend: getTrend(data.average_contract_value || 0, 5000, 3000),
          status: getStatus(data.average_contract_value || 0, 5000, 3000, 1000)
        },
        {
          title: 'معدل تكرار التأجير',
          value: data.total_contracts || 0,
          format: 'number',
          icon: Calendar,
          trend: getTrend(data.total_contracts || 0, 5, 2),
          status: getStatus(data.total_contracts || 0, 5, 2, 1)
        }
      ];
    }

    return [];
  }, [data, reportType]);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('ar-SA', {
          style: 'currency',
          currency: 'SAR',
          minimumFractionDigits: 0
        }).format(value);
      case 'days':
        return `${Math.round(value)} يوم`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getStatusColor = (status: KPIStatus) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusBadge = (status: KPIStatus) => {
    switch (status) {
      case 'excellent':
        return { label: 'ممتاز', variant: 'default' as const };
      case 'good':
        return { label: 'جيد', variant: 'secondary' as const };
      case 'warning':
        return { label: 'تحذير', variant: 'outline' as const };
      case 'critical':
        return { label: 'حرج', variant: 'destructive' as const };
    }
  };

  if (kpis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            مؤشرات الأداء الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            لا توجد بيانات لعرض مؤشرات الأداء
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          مؤشرات الأداء الذكية (KPIs)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const statusBadge = getStatusBadge(kpi.status);
            const progress = kpi.target ? Math.min((kpi.value / kpi.target) * 100, 100) : 0;

            return (
              <Card key={index} className={`border-l-4 ${getStatusColor(kpi.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <Badge variant={statusBadge.variant} className="text-xs">
                      {statusBadge.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatValue(kpi.value, kpi.format)}
                    </p>
                    
                    {kpi.target && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>الهدف: {formatValue(kpi.target, kpi.format)}</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      {kpi.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {kpi.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      {kpi.trend === 'stable' && <BarChart3 className="h-4 w-4 text-blue-600" />}
                      <span className="text-xs text-muted-foreground">
                        {kpi.trend === 'up' && 'اتجاه إيجابي'}
                        {kpi.trend === 'down' && 'اتجاه سلبي'}
                        {kpi.trend === 'stable' && 'مستقر'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
