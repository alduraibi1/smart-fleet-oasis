import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, TrendingUp, Users, Database, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  total_audit_events: number;
  recent_deletions: number;
  access_grants_today: number;
  unusual_activity_count: number;
  top_actors: Array<{ actor_id: string; event_count: number }>;
  activity_by_table: Array<{ table_name: string; event_count: number }>;
}

export function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();
  const { toast } = useToast();

  // Check if user has permission to view security dashboard
  if (!hasRole('admin') && !hasRole('manager')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">غير مخوّل</h3>
            <p className="text-sm text-muted-foreground">
              تحتاج صلاحيات مدير أو مشرف لعرض لوحة الأمان
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchSecurityMetrics = async () => {
    setLoading(true);
    try {
      // Fetch basic metrics
      const { data: totalEvents } = await supabase
        .from('audit_logs')
        .select('id')
        .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: recentDeletions } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('action', 'DELETE')
        .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: accessGrants } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('table_name', 'customer_access')
        .eq('action', 'INSERT')
        .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Fetch activity by table (last 7 days)
      const { data: activityByTable } = await supabase
        .from('audit_logs')
        .select('table_name')
        .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch top actors (last 7 days)
      const { data: topActors } = await supabase
        .from('audit_logs')
        .select('actor_id')
        .not('actor_id', 'is', null)
        .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Process activity by table
      const tableActivity = activityByTable?.reduce((acc, log) => {
        acc[log.table_name] = (acc[log.table_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Process top actors
      const actorActivity = topActors?.reduce((acc, log) => {
        acc[log.actor_id!] = (acc[log.actor_id!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setMetrics({
        total_audit_events: totalEvents?.length || 0,
        recent_deletions: recentDeletions?.length || 0,
        access_grants_today: accessGrants?.length || 0,
        unusual_activity_count: 0, // Could implement anomaly detection
        top_actors: Object.entries(actorActivity || {})
          .map(([actor_id, event_count]) => ({ actor_id, event_count }))
          .sort((a, b) => b.event_count - a.event_count)
          .slice(0, 5),
        activity_by_table: Object.entries(tableActivity || {})
          .map(([table_name, event_count]) => ({ table_name, event_count }))
          .sort((a, b) => b.event_count - a.event_count)
      });

    } catch (error: any) {
      toast({
        title: "خطأ في تحميل مؤشرات الأمان",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityMetrics();
  }, []);

  const getTableDisplayName = (tableName: string) => {
    const tableNames = {
      customers: 'العملاء',
      customer_access: 'صلاحيات العملاء',
      vehicles: 'المركبات',
      contracts: 'العقود'
    };
    
    return tableNames[tableName as keyof typeof tableNames] || tableName;
  };

  const getMetricCard = (
    title: string,
    value: number,
    icon: React.ReactNode,
    description: string,
    variant: 'default' | 'warning' | 'danger' = 'default'
  ) => {
    const cardColors = {
      default: 'border-border',
      warning: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950',
      danger: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
    };

    return (
      <Card className={cardColors[variant]}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value.toLocaleString('ar-SA')}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="text-muted-foreground">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p>جاري تحميل مؤشرات الأمان...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p>فشل في تحميل مؤشرات الأمان</p>
            <Button onClick={fetchSecurityMetrics} variant="outline" size="sm">
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">لوحة مراقبة الأمان</h2>
          <p className="text-muted-foreground">
            مراقبة النشاط الأمني ومؤشرات الأداء للأسبوع الماضي
          </p>
        </div>
        <Button onClick={fetchSecurityMetrics} variant="outline" size="sm">
          تحديث البيانات
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getMetricCard(
          "إجمالي الأحداث",
          metrics.total_audit_events,
          <Database className="h-8 w-8" />,
          "آخر 7 أيام"
        )}
        
        {getMetricCard(
          "عمليات الحذف",
          metrics.recent_deletions,
          <AlertTriangle className="h-8 w-8" />,
          "آخر 24 ساعة",
          metrics.recent_deletions > 5 ? 'warning' : 'default'
        )}
        
        {getMetricCard(
          "منح الصلاحيات",
          metrics.access_grants_today,
          <Users className="h-8 w-8" />,
          "اليوم"
        )}
        
        {getMetricCard(
          "النشاط غير العادي",
          metrics.unusual_activity_count,
          <TrendingUp className="h-8 w-8" />,
          "آخر 24 ساعة",
          metrics.unusual_activity_count > 0 ? 'danger' : 'default'
        )}
      </div>

      {/* Detailed Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity by Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              النشاط حسب الجدول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.activity_by_table.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لا توجد أنشطة مسجلة
                </p>
              ) : (
                metrics.activity_by_table.map((item) => (
                  <div key={item.table_name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {getTableDisplayName(item.table_name)}
                    </span>
                    <Badge variant="secondary">
                      {item.event_count.toLocaleString('ar-SA')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              أكثر المستخدمين نشاطاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.top_actors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لا توجد أنشطة مستخدمين
                </p>
              ) : (
                metrics.top_actors.map((actor, index) => (
                  <div key={actor.actor_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                        {actor.actor_id.slice(0, 8)}...
                      </span>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs">
                          الأكثر نشاطاً
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {actor.event_count.toLocaleString('ar-SA')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {(metrics.recent_deletions > 5 || metrics.unusual_activity_count > 0) && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات أمنية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recent_deletions > 5 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    تم رصد {metrics.recent_deletions} عمليات حذف في آخر 24 ساعة - يُنصح بالمراجعة
                  </span>
                </div>
              )}
              {metrics.unusual_activity_count > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>
                    رُصد نشاط غير عادي - يُنصح بمراجعة سجلات التدقيق
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}