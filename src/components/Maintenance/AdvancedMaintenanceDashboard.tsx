
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Wrench, 
  Brain,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { MaintenanceKPIDashboard } from './MaintenanceKPIDashboard';
import { AIMaintenancePredictions } from './AIMaintenancePredictions';
import { WorkshopManagement } from './WorkshopManagement';
import { QualityManagement } from './QualityManagement';
import { SmartMaintenanceAlerts } from './SmartMaintenanceAlerts';

export const AdvancedMaintenanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for overview cards
  const overviewStats = {
    totalVehicles: 127,
    activeMaintenances: 23,
    pendingApprovals: 8,
    completedToday: 12,
    avgCost: 850,
    upcomingServices: 34,
    qualityScore: 94.2,
    workshopUtilization: 78
  };

  const quickStats = [
    {
      title: 'المركبات النشطة',
      value: overviewStats.totalVehicles,
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'صيانات جارية',
      value: overviewStats.activeMaintenances,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'اكتمل اليوم',
      value: overviewStats.completedToday,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'متوسط التكلفة',
      value: `${overviewStats.avgCost} ر.س`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">نظام الصيانة المتقدم</h2>
          <p className="text-muted-foreground">إدارة شاملة وذكية للصيانة مع التنبؤ والتحليلات</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            نظام ذكي
          </Badge>
          <Badge variant="secondary">
            {overviewStats.qualityScore}% جودة
          </Badge>
        </div>
      </div>

      {/* Quick Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <Brain className="h-4 w-4" />
            التنبؤ الذكي
          </TabsTrigger>
          <TabsTrigger value="workshop" className="gap-2">
            <MapPin className="h-4 w-4" />
            إدارة الورشة
          </TabsTrigger>
          <TabsTrigger value="quality" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            إدارة الجودة
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            التنبيهات الذكية
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            التحليلات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MaintenanceKPIDashboard />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <AIMaintenancePredictions />
        </TabsContent>

        <TabsContent value="workshop" className="space-y-6">
          <WorkshopManagement />
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <QualityManagement />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <SmartMaintenanceAlerts />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <MaintenanceKPIDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
