import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SyncSettings } from '@/components/Vehicles/SyncSettings';
import { RefreshCw, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SyncLog {
  id: string;
  sync_date: string;
  sync_type: string;
  records_processed: number;
  records_added: number;
  records_updated: number;
  records_failed: number;
  sync_status: string;
  changes_summary: any;
}

export default function ElmSync() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSyncs: 0,
    successRate: 0,
    lastSync: null as string | null,
    totalRecordsProcessed: 0,
  });

  useEffect(() => {
    loadSyncLogs();
    calculateStats();
  }, []);

  const loadSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('elm_sync_logs')
        .select('*')
        .order('sync_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading sync logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('elm_sync_logs')
        .select('*');

      if (error) throw error;

      const totalSyncs = data.length;
      const successfulSyncs = data.filter(log => log.sync_status === 'completed').length;
      const successRate = totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0;
      const totalRecordsProcessed = data.reduce((sum, log) => sum + (log.records_processed || 0), 0);
      const lastSync = data.length > 0 ? data[0].sync_date : null;

      setStats({
        totalSyncs,
        successRate,
        lastSync,
        totalRecordsProcessed,
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'partial':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      completed: 'default',
      failed: 'destructive',
      partial: 'secondary',
    };

    const labels: Record<string, string> = {
      completed: 'مكتمل',
      failed: 'فاشل',
      partial: 'جزئي',
    };

    return (
      <Badge variant={variants[status] || 'default'} className={status === 'completed' ? 'bg-success text-success-foreground' : ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مزامنة علم</h1>
          <p className="text-muted-foreground">إدارة المزامنة التلقائية مع نظام علم</p>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المزامنات</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSyncs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">السجلات المعالجة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecordsProcessed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر مزامنة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {stats.lastSync 
                ? format(new Date(stats.lastSync), 'dd MMM yyyy', { locale: ar })
                : 'لم تتم بعد'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التبويبات */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">سجل المزامنات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل المزامنات</CardTitle>
              <CardDescription>آخر 50 عملية مزامنة</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد عمليات مزامنة بعد
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(log.sync_status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {format(new Date(log.sync_date), "dd MMMM yyyy 'الساعة' HH:mm", { locale: ar })}
                            </p>
                            {getStatusBadge(log.sync_status)}
                            <Badge variant="outline">
                              {log.sync_type === 'manual' ? 'يدوي' : 
                               log.sync_type === 'scheduled' ? 'مجدول' : 'API'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            معالج: {log.records_processed} | 
                            مضاف: {log.records_added} | 
                            محدث: {log.records_updated}
                            {log.records_failed > 0 && ` | فاشل: ${log.records_failed}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <SyncSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
