
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  FileText,
  Settings,
  TrendingUp,
  Wrench,
  Brain,
  Bell
} from 'lucide-react';

// استيراد المكونات المختلفة
import { MaintenanceKPIDashboard } from './MaintenanceKPIDashboard';
import { AIMaintenancePredictions } from './AIMaintenancePredictions';
import { WorkshopManagement } from './WorkshopManagement';
import { QualityManagement } from './QualityManagement';
import { SmartMaintenanceAlerts } from './SmartMaintenanceAlerts';
import { MechanicsManagement } from './MechanicsManagement';
import { MechanicsPerformance } from './MechanicsPerformance';
import { MaintenanceCalendar } from './MaintenanceCalendar';
import { MaintenanceReports } from './MaintenanceReports';

export const MaintenanceDashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // إحصائيات سريعة للهيدر
  const quickStats = {
    activeJobs: 12,
    pendingApprovals: 5,
    overdueTasks: 3,
    mechanicsAvailable: 8
  };

  return (
    <div className="space-y-6">
      {/* الهيدر مع الإحصائيات السريعة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام الصيانة المتقدم</h1>
          <p className="text-muted-foreground">إدارة شاملة وذكية للصيانة مع التنبؤ والتحليلات</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {quickStats.overdueTasks > 0 && (
              <Badge variant="destructive" className="gap-1">
                <Bell className="h-3 w-3" />
                {quickStats.overdueTasks} متأخر
              </Badge>
            )}
            <Badge variant="secondary">
              {quickStats.activeJobs} مهمة نشطة
            </Badge>
            <Badge variant="outline">
              {quickStats.mechanicsAvailable} ميكانيكي متاح
            </Badge>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            الإعدادات
          </Button>
        </div>
      </div>

      {/* التبويبات الرئيسية */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">النظرة العامة</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">التقويم</span>
          </TabsTrigger>
          <TabsTrigger value="mechanics" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">الميكانيكيين</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">الأداء</span>
          </TabsTrigger>
          <TabsTrigger value="workshop" className="gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">الورشة</span>
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">التنبؤ الذكي</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">التقارير</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">التنبيهات</span>
          </TabsTrigger>
        </TabsList>

        {/* محتوى التبويبات */}
        <TabsContent value="overview" className="space-y-6">
          <MaintenanceKPIDashboard />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <MaintenanceCalendar />
        </TabsContent>

        <TabsContent value="mechanics" className="space-y-6">
          <MechanicsManagement />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <MechanicsPerformance />
        </TabsContent>

        <TabsContent value="workshop" className="space-y-6">
          <WorkshopManagement />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <AIMaintenancePredictions />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <MaintenanceReports />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <SmartMaintenanceAlerts />
        </TabsContent>
      </Tabs>
    </div>
  );
};
