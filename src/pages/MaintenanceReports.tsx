import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MechanicEfficiencyReports } from '@/components/Maintenance/MechanicEfficiencyReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Clock, TrendingUp } from 'lucide-react';

const MaintenanceReports = () => {
  return (
    <div className="content-spacing">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">تقارير الصيانة المتقدمة</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            تقارير شاملة عن كفاءة الميكانيكيين وأداء قسم الصيانة
          </p>
        </div>
      </div>

      <Tabs defaultValue="efficiency" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="efficiency" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            كفاءة الميكانيكيين
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            تحليل التكاليف
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            إدارة الوقت
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            تقارير الأداء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="efficiency" className="mt-6">
          <MechanicEfficiencyReports />
        </TabsContent>

        <TabsContent value="costs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل التكاليف</CardTitle>
              <CardDescription>
                تحليل مفصل لتكاليف الصيانة ومراكز التكلفة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                تحليل التكاليف قيد التطوير
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الوقت</CardTitle>
              <CardDescription>
                تقارير عن استغلال الوقت وكفاءة العمل
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                تقارير إدارة الوقت قيد التطوير
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>تقارير الأداء</CardTitle>
              <CardDescription>
                مؤشرات الأداء الرئيسية لقسم الصيانة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                تقارير الأداء قيد التطوير
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceReports;