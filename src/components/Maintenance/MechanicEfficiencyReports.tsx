import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Award, 
  RefreshCw,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useMaintenanceWorkHours, MechanicEfficiencyReport } from '@/hooks/useMaintenanceWorkHours';

export function MechanicEfficiencyReports() {
  const { getMechanicEfficiencyReports, loading } = useMaintenanceWorkHours();
  const [reports, setReports] = useState<MechanicEfficiencyReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    setRefreshing(true);
    try {
      const data = await getMechanicEfficiencyReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getEfficiencyBadge = (score: number) => {
    if (score >= 8) return { variant: 'default' as const, label: 'ممتاز', color: 'text-green-600' };
    if (score >= 6) return { variant: 'secondary' as const, label: 'جيد جداً', color: 'text-blue-600' };
    if (score >= 4) return { variant: 'outline' as const, label: 'جيد', color: 'text-yellow-600' };
    return { variant: 'destructive' as const, label: 'يحتاج تحسين', color: 'text-red-600' };
  };

  const getTotalStats = () => {
    return {
      totalMechanics: reports.length,
      totalHours: reports.reduce((sum, r) => sum + r.total_work_hours, 0),
      totalJobs: reports.reduce((sum, r) => sum + r.total_jobs_completed, 0),
      totalEarnings: reports.reduce((sum, r) => sum + r.total_earnings, 0),
      averageEfficiency: reports.length > 0 ? 
        reports.reduce((sum, r) => sum + r.efficiency_score, 0) / reports.length : 0
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">تقارير كفاءة الميكانيكيين</h2>
          <p className="text-muted-foreground">
            تحليل أداء وكفاءة فريق الصيانة
          </p>
        </div>
        <Button 
          onClick={loadReports}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">إجمالي الميكانيكيين</p>
                <p className="text-2xl font-bold">{stats.totalMechanics}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">ساعات العمل</p>
                <p className="text-2xl font-bold">{stats.totalHours.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">أعمال مكتملة</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">إجمالي الأرباح</p>
                <p className="text-2xl font-bold">{stats.totalEarnings.toFixed(0)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-sm font-medium">متوسط الكفاءة</p>
                <p className="text-2xl font-bold">{stats.averageEfficiency.toFixed(1)}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-yellow-500" />
                الأكثر كفاءة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports[0] && (
                <div className="text-center">
                  <p className="font-bold text-lg">{reports[0].mechanic_name}</p>
                  <p className="text-2xl font-bold text-yellow-600">{reports[0].efficiency_score.toFixed(1)}/10</p>
                  <p className="text-sm text-muted-foreground">
                    {reports[0].total_jobs_completed} مهمة مكتملة
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-blue-500" />
                الأكثر عملاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.sort((a, b) => b.total_work_hours - a.total_work_hours)[0] && (
                <div className="text-center">
                  <p className="font-bold text-lg">
                    {reports.sort((a, b) => b.total_work_hours - a.total_work_hours)[0].mechanic_name}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reports.sort((a, b) => b.total_work_hours - a.total_work_hours)[0].total_work_hours.toFixed(0)} ساعة
                  </p>
                  <p className="text-sm text-muted-foreground">
                    إجمالي ساعات العمل
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-green-500" />
                الأنشط هذا الشهر
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.sort((a, b) => b.jobs_this_month - a.jobs_this_month)[0] && (
                <div className="text-center">
                  <p className="font-bold text-lg">
                    {reports.sort((a, b) => b.jobs_this_month - a.jobs_this_month)[0].mechanic_name}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.sort((a, b) => b.jobs_this_month - a.jobs_this_month)[0].jobs_this_month} مهمة
                  </p>
                  <p className="text-sm text-muted-foreground">
                    هذا الشهر
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل كفاءة الميكانيكيين</CardTitle>
          <CardDescription>
            تقرير شامل عن أداء كل ميكانيكي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الميكانيكي</TableHead>
                  <TableHead className="text-center">درجة الكفاءة</TableHead>
                  <TableHead className="text-center">إجمالي الساعات</TableHead>
                  <TableHead className="text-center">الأعمال المكتملة</TableHead>
                  <TableHead className="text-center">متوسط وقت المهمة</TableHead>
                  <TableHead className="text-center">إجمالي الأرباح</TableHead>
                  <TableHead className="text-center">هذا الشهر</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const efficiency = getEfficiencyBadge(report.efficiency_score);
                  return (
                    <TableRow key={report.mechanic_id}>
                      <TableCell className="font-medium">
                        {report.mechanic_name}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant={efficiency.variant}>
                            {efficiency.label}
                          </Badge>
                          <span className={`text-sm font-bold ${efficiency.color}`}>
                            {report.efficiency_score.toFixed(1)}/10
                          </span>
                          <Progress 
                            value={report.efficiency_score * 10} 
                            className="w-16 h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {report.total_work_hours.toFixed(1)} ساعة
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {report.total_jobs_completed}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {report.average_job_duration.toFixed(1)} ساعة
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">
                          {report.total_earnings.toFixed(2)} ر.س
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-sm">
                          <div>{report.jobs_this_month} مهمة</div>
                          <div className="text-muted-foreground">
                            {report.hours_this_month.toFixed(1)} ساعة
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {reports.length === 0 && !refreshing && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد بيانات</h3>
              <p className="text-muted-foreground">
                لا توجد سجلات ساعات عمل للميكانيكيين حتى الآن
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}