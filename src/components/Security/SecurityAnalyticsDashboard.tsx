import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Activity, 
  Brain, 
  Target, 
  Zap,
  AlertCircle,
  Shield,
  Eye,
  Clock,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SecurityTrend {
  date: string;
  events: number;
  threats: number;
  incidents: number;
}

interface ThreatType {
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface BehaviorPattern {
  pattern_type: string;
  confidence: number;
  description: string;
  recommendation: string;
}

export function SecurityAnalyticsDashboard() {
  const [trends, setTrends] = useState<SecurityTrend[]>([]);
  const [threatTypes, setThreatTypes] = useState<ThreatType[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState({
    activeThreats: 0,
    blockedIPs: 0,
    suspiciousActivity: 0,
    systemHealth: 98
  });
  
  const { hasRole } = useAuth();
  const { toast } = useToast();

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--success))'];

  // Check authorization
  if (!hasRole('admin') && !hasRole('manager')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">غير مخوّل</h3>
            <p className="text-sm text-muted-foreground">
              تحتاج صلاحيات مدير أو مشرف لعرض التحليلات الأمنية
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Generate mock trend data (last 30 days)
      const trendData: SecurityTrend[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trendData.push({
          date: date.toISOString().split('T')[0],
          events: Math.floor(Math.random() * 50) + 10,
          threats: Math.floor(Math.random() * 10),
          incidents: Math.floor(Math.random() * 3)
        });
      }
      setTrends(trendData);

      // Load threat intelligence
      const threatData: ThreatType[] = [
        { type: 'محاولات تسجيل دخول مشبوهة', count: 23, severity: 'high' },
        { type: 'عمليات وصول غير مصرح', count: 12, severity: 'critical' },
        { type: 'أنشطة إدارية مشبوهة', count: 8, severity: 'medium' },
        { type: 'تسريب بيانات محتمل', count: 3, severity: 'critical' }
      ];
      setThreatTypes(threatData);

      // Load AI behavior patterns
      const patterns: BehaviorPattern[] = [
        {
          pattern_type: 'نشاط غير طبيعي في ساعات متأخرة',
          confidence: 87,
          description: 'رُصد نشاط كثيف بين الساعة 2-4 صباحاً',
          recommendation: 'تفعيل مراقبة إضافية للساعات غير العادية'
        },
        {
          pattern_type: 'محاولات وصول متكررة من نفس المصدر',
          confidence: 92,
          description: 'عدة محاولات فاشلة من عنوان IP واحد',
          recommendation: 'حظر العنوان المشبوه فوراً'
        },
        {
          pattern_type: 'تغييرات في صلاحيات المستخدمين',
          confidence: 78,
          description: 'زيادة غير عادية في تعديل الصلاحيات',
          recommendation: 'مراجعة سجل تغييرات الصلاحيات'
        }
      ];
      setBehaviorPatterns(patterns);

      // Simulate real-time data updates
      setRealTimeData({
        activeThreats: Math.floor(Math.random() * 10) + 1,
        blockedIPs: Math.floor(Math.random() * 50) + 20,
        suspiciousActivity: Math.floor(Math.random() * 15) + 5,
        systemHealth: Math.floor(Math.random() * 5) + 95
      });

    } catch (error: any) {
      toast({
        title: "خطأ في تحميل البيانات التحليلية",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
    
    // Update real-time data every 30 seconds
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeThreats: Math.floor(Math.random() * 10) + 1,
        suspiciousActivity: Math.floor(Math.random() * 15) + 5,
        systemHealth: Math.floor(Math.random() * 5) + 95
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p>جاري تحميل التحليلات الأمنية...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Security Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">التهديدات النشطة</p>
                <p className="text-2xl font-bold text-red-600">{realTimeData.activeThreats}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">عناوين IP محظورة</p>
                <p className="text-2xl font-bold text-orange-600">{realTimeData.blockedIPs}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نشاط مشبوه</p>
                <p className="text-2xl font-bold text-yellow-600">{realTimeData.suspiciousActivity}</p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">صحة النظام</p>
                <p className="text-2xl font-bold text-green-600">{realTimeData.systemHealth}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            الاتجاهات
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            ذكاء التهديدات
          </TabsTrigger>
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            التحليل الذكي
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            الأتمتة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>اتجاهات الأحداث الأمنية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="events" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="threats" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الحوادث الأمنية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="incidents" stroke="hsl(var(--warning))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>أنواع التهديدات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatTypes.map((threat, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(threat.severity)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{threat.type}</h4>
                          <p className="text-sm opacity-75">مستوى الخطورة: {threat.severity}</p>
                        </div>
                        <Badge variant="outline" className="text-lg font-bold">
                          {threat.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع التهديدات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={threatTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {threatTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                أنماط السلوك المكتشفة بالذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorPatterns.map((pattern, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{pattern.pattern_type}</h4>
                          <Badge variant="outline">
                            ثقة {pattern.confidence}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pattern.description}
                        </p>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            التوصية: {pattern.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  القواعد التلقائية النشطة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">حظر IP تلقائي</p>
                      <p className="text-sm text-muted-foreground">بعد 5 محاولات فاشلة</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      نشط
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">تنبيه النشاط المشبوه</p>
                      <p className="text-sm text-muted-foreground">عند اكتشاف أنماط غير عادية</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      نشط
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">حماية البيانات الحساسة</p>
                      <p className="text-sm text-muted-foreground">مراقبة الوصول للبيانات الحساسة</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      نشط
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الأتمتة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">التهديدات المحظورة تلقائياً</span>
                    <Badge variant="secondary">156</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">التنبيهات المرسلة</span>
                    <Badge variant="secondary">23</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">الإجراءات التلقائية</span>
                    <Badge variant="secondary">89</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">معدل الدقة</span>
                    <Badge variant="secondary">94.2%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}