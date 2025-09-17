import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SecurityReportData {
  activities_by_day: Array<{ date: string; count: number }>;
  activities_by_table: Array<{ table_name: string; count: number }>;
  activities_by_user: Array<{ user_id: string; count: number }>;
  severity_distribution: Array<{ severity: string; count: number }>;
  failed_logins: Array<{ date: string; count: number }>;
  security_events: Array<{ date: string; count: number }>;
  summary: {
    total_activities: number;
    unique_users: number;
    failed_attempts: number;
    security_incidents: number;
  };
}

export function SecurityReports() {
  const [reportData, setReportData] = useState<SecurityReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('audit');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const { hasRole } = useAuth();
  const { toast } = useToast();

  // Check permissions
  if (!hasRole('admin') && !hasRole('manager')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">غير مخوّل</h3>
            <p className="text-sm text-muted-foreground">
              تحتاج صلاحيات مدير أو مشرف لعرض التقارير الأمنية
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const generateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد نطاق التاريخ",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();

      // Get audit activities by day
      const { data: activitiesByDay } = await supabase
        .from('audit_logs')
        .select('occurred_at')
        .gte('occurred_at', fromDate)
        .lte('occurred_at', toDate);

      // Get activities by table
      const { data: activitiesByTable } = await supabase
        .from('audit_logs')
        .select('table_name')
        .gte('occurred_at', fromDate)
        .lte('occurred_at', toDate);

      // Get activities by user
      const { data: activitiesByUser } = await supabase
        .from('audit_logs')
        .select('actor_id')
        .not('actor_id', 'is', null)
        .gte('occurred_at', fromDate)
        .lte('occurred_at', toDate);

      // Get severity distribution
      const { data: severityData } = await supabase
        .from('audit_logs')
        .select('severity')
        .gte('occurred_at', fromDate)
        .lte('occurred_at', toDate);

      // Get failed logins
      const { data: failedLogins } = await supabase
        .from('failed_login_attempts')
        .select('attempt_time')
        .gte('attempt_time', fromDate)
        .lte('attempt_time', toDate);

      // Get security events
      const { data: securityEvents } = await supabase
        .from('security_audit_log')
        .select('created_at')
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      // Process data for charts
      const processedData: SecurityReportData = {
        activities_by_day: processTimeSeriesData(activitiesByDay || [], 'occurred_at'),
        activities_by_table: processActivitiesByTable(activitiesByTable || []),
        activities_by_user: processActivitiesByUser(activitiesByUser || [], 5),
        severity_distribution: processSeverityDistribution(severityData || []),
        failed_logins: processTimeSeriesData(failedLogins || [], 'attempt_time'),
        security_events: processTimeSeriesData(securityEvents || [], 'created_at'),
        summary: {
          total_activities: activitiesByDay?.length || 0,
          unique_users: new Set(activitiesByUser?.map(u => u.actor_id)).size,
          failed_attempts: failedLogins?.length || 0,
          security_incidents: securityEvents?.length || 0,
        }
      };

      setReportData(processedData);
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء التقرير",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processTimeSeriesData = (data: any[], dateField: string) => {
    const dailyCounts: Record<string, number> = {};
    
    data.forEach(item => {
      const date = format(new Date(item[dateField]), 'yyyy-MM-dd');
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  const processActivitiesByTable = (data: any[]): Array<{ table_name: string; count: number }> => {
    const counts: Record<string, number> = {};
    
    data.forEach(item => {
      const value = item.table_name;
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([table_name, count]) => ({
      table_name,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const processActivitiesByUser = (data: any[], limit?: number): Array<{ user_id: string; count: number }> => {
    const counts: Record<string, number> = {};
    
    data.forEach(item => {
      const value = item.actor_id;
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    let result = Object.entries(counts).map(([user_id, count]) => ({
      user_id,
      count
    })).sort((a, b) => b.count - a.count);

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  };

  const processSeverityDistribution = (data: any[]): Array<{ severity: string; count: number }> => {
    const counts: Record<string, number> = {};
    
    data.forEach(item => {
      const value = item.severity;
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([severity, count]) => ({
      severity,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const exportReport = () => {
    if (!reportData) return;

    const reportContent = {
      generated_at: new Date().toISOString(),
      date_range: {
        from: dateRange?.from?.toISOString(),
        to: dateRange?.to?.toISOString()
      },
      summary: reportData.summary,
      data: reportData
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "تم التصدير",
      description: "تم تصدير التقرير بنجاح",
    });
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              التقارير الأمنية
            </CardTitle>
            <div className="flex items-center gap-2">
              {reportData && (
                <Button onClick={exportReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير التقرير
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="نوع التقرير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audit">تقرير المراجعة</SelectItem>
                <SelectItem value="security">تقرير الأمان</SelectItem>
                <SelectItem value="access">تقرير الوصول</SelectItem>
              </SelectContent>
            </Select>
            
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
            
            <Button 
              onClick={generateReport} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {loading ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إجمالي الأنشطة</p>
                    <p className="text-3xl font-bold">{reportData.summary.total_activities.toLocaleString('ar-SA')}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">المستخدمون النشطون</p>
                    <p className="text-3xl font-bold">{reportData.summary.unique_users.toLocaleString('ar-SA')}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">محاولات الدخول الفاشلة</p>
                    <p className="text-3xl font-bold text-destructive">{reportData.summary.failed_attempts.toLocaleString('ar-SA')}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">الحوادث الأمنية</p>
                    <p className="text-3xl font-bold text-orange-500">{reportData.summary.security_incidents.toLocaleString('ar-SA')}</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Activities Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>الأنشطة حسب التاريخ</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.activities_by_day}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'PPP', { locale: ar })}
                    />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activities by Table */}
            <Card>
              <CardHeader>
                <CardTitle>الأنشطة حسب الجدول</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.activities_by_table}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="table_name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع مستويات الأهمية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.severity_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ severity, percent }) => `${severity} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="severity"
                    >
                      {reportData.severity_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Failed Logins Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>محاولات الدخول الفاشلة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.failed_logins}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'PPP', { locale: ar })}
                    />
                    <Bar dataKey="count" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Active Users */}
          <Card>
            <CardHeader>
              <CardTitle>أكثر المستخدمين نشاطاً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.activities_by_user.map((user, index) => (
                  <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {user.user_id.slice(0, 8)}...
                      </code>
                    </div>
                    <Badge variant="secondary">
                      {user.count.toLocaleString('ar-SA')} نشاط
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}