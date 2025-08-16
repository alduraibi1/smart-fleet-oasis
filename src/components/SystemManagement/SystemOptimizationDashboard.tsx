
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  Zap, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useSystemOptimization } from '@/hooks/useSystemOptimization';

export function SystemOptimizationDashboard() {
  const {
    metrics,
    optimization,
    systemHealth,
    performanceScore,
    optimizeMemory,
    updateOptimization,
    monitorPerformance,
    optimizeSystem
  } = useSystemOptimization();

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'fair': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم تحسين النظام</h1>
          <p className="text-muted-foreground">مراقبة وتحسين أداء النظام في الوقت الفعلي</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={monitorPerformance} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث البيانات
          </Button>
          <Button onClick={optimizeSystem}>
            <Zap className="h-4 w-4 mr-2" />
            تحسين تلقائي
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">حالة النظام</p>
                <p className={`text-2xl font-bold ${getHealthColor(systemHealth.status)}`}>
                  {systemHealth.status === 'excellent' ? 'ممتاز' :
                   systemHealth.status === 'good' ? 'جيد' :
                   systemHealth.status === 'fair' ? 'مقبول' : 'ضعيف'}
                </p>
              </div>
              {getHealthIcon(systemHealth.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نقاط الأداء</p>
                <p className="text-2xl font-bold">{performanceScore}</p>
                <Progress value={performanceScore} className="mt-2" />
              </div>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">استخدام الذاكرة</p>
                <p className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</p>
                <Progress value={metrics.memoryUsage} className="mt-2" />
              </div>
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">زمن التحميل</p>
                <p className="text-2xl font-bold">{(metrics.renderTime / 1000).toFixed(2)}s</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              مقاييس الأداء التفصيلية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">استخدام الذاكرة</span>
              <div className="flex items-center gap-2">
                <Progress value={metrics.memoryUsage} className="w-24" />
                <span className="text-sm">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">زمن التحميل</span>
              <span className="text-sm font-mono">{(metrics.renderTime / 1000).toFixed(2)}s</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">زمن استجابة الشبكة</span>
              <span className="text-sm font-mono">{(metrics.networkLatency / 1000).toFixed(2)}s</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">معدل الأخطاء</span>
              <Badge variant={metrics.errorRate > 5 ? 'destructive' : 'secondary'}>
                {metrics.errorRate}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">نقاط رضا المستخدمين</span>
              <Badge variant="default">{metrics.userSatisfactionScore}%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              إعدادات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">تفعيل الافتراضية</p>
                <p className="text-xs text-muted-foreground">تحسين عرض البيانات الكبيرة</p>
              </div>
              <Switch
                checked={optimization.enableVirtualization}
                onCheckedChange={(checked) => 
                  updateOptimization({ enableVirtualization: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">التحميل الكسول للصور</p>
                <p className="text-xs text-muted-foreground">توفير عرض النطاق الترددي</p>
              </div>
              <Switch
                checked={optimization.lazyLoadImages}
                onCheckedChange={(checked) => 
                  updateOptimization({ lazyLoadImages: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">تحميل البيانات المهمة مسبقاً</p>
                <p className="text-xs text-muted-foreground">تحسين تجربة المستخدم</p>
              </div>
              <Switch
                checked={optimization.preloadCriticalData}
                onCheckedChange={(checked) => 
                  updateOptimization({ preloadCriticalData: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">تحسين الرسوم المتحركة</p>
                <p className="text-xs text-muted-foreground">تحسين الأداء البصري</p>
              </div>
              <Switch
                checked={optimization.optimizeAnimations}
                onCheckedChange={(checked) => 
                  updateOptimization({ optimizeAnimations: checked })
                }
              />
            </div>

            <Button onClick={optimizeMemory} className="w-full" variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              تحسين الذاكرة الآن
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Health Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systemHealth.issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                المشاكل المكتشفة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemHealth.issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{issue}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {systemHealth.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <CheckCircle className="h-5 w-5" />
                توصيات التحسين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemHealth.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
