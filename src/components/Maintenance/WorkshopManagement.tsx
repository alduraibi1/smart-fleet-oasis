
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Wrench, 
  Users, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Plus,
  BarChart3
} from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';

export const WorkshopManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { maintenanceRecords, mechanics } = useMaintenance();

  // Mock workshop data - في النظام الحقيقي ستأتي من قاعدة البيانات
  const workshops = [
    {
      id: 1,
      name: 'الورشة الرئيسية',
      location: 'الرياض - حي الملك فهد',
      capacity: 8,
      currentJobs: 5,
      mechanics: 6,
      equipment: ['رافعة هيدروليكية', 'مقياس ضغط', 'جهاز تشخيص'],
      status: 'active',
      workingHours: '07:00 - 19:00',
      specializations: ['صيانة عامة', 'إصلاح المحركات', 'صيانة الفرامل']
    },
    {
      id: 2,
      name: 'ورشة التشخيص',
      location: 'الرياض - حي العليا',
      capacity: 4,
      currentJobs: 2,
      mechanics: 3,
      equipment: ['جهاز تشخيص متقدم', 'أوسيلوسكوب', 'مقياس غازات العادم'],
      status: 'active',
      workingHours: '08:00 - 17:00',
      specializations: ['تشخيص أعطال', 'فحص دوري', 'معايرة']
    },
    {
      id: 3,
      name: 'ورشة الطوارئ',
      location: 'الرياض - حي السليمانية',
      capacity: 3,
      currentJobs: 1,
      mechanics: 2,
      equipment: ['معدات إصلاح سريع', 'رافعة متنقلة'],
      status: 'active',
      workingHours: '24/7',
      specializations: ['إصلاحات طارئة', 'خدمة طريق']
    }
  ];

  const workOrders = [
    {
      id: 1,
      vehiclePlate: 'أ ب ج 1234',
      workshopId: 1,
      mechanicId: 'mech-1',
      startTime: '2024-01-15T08:00:00Z',
      estimatedCompletion: '2024-01-15T16:00:00Z',
      status: 'in_progress',
      description: 'صيانة دورية شاملة',
      priority: 'medium'
    },
    {
      id: 2,
      vehiclePlate: 'د هـ و 5678',
      workshopId: 2,
      mechanicId: 'mech-2',
      startTime: '2024-01-15T09:00:00Z',
      estimatedCompletion: '2024-01-15T12:00:00Z',
      status: 'completed',
      description: 'تشخيص عطل المحرك',
      priority: 'high'
    }
  ];

  const getWorkshopUtilization = (workshop: any) => {
    return Math.round((workshop.currentJobs / workshop.capacity) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'maintenance': return 'secondary';
      case 'closed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'maintenance': return 'صيانة';
      case 'closed': return 'مغلق';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const workshopStats = {
    totalWorkshops: workshops.length,
    activeJobs: workshops.reduce((sum, w) => sum + w.currentJobs, 0),
    totalCapacity: workshops.reduce((sum, w) => sum + w.capacity, 0),
    totalMechanics: workshops.reduce((sum, w) => sum + w.mechanics, 0),
    averageUtilization: Math.round(
      workshops.reduce((sum, w) => sum + getWorkshopUtilization(w), 0) / workshops.length
    )
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            إدارة الورش
          </h3>
          <p className="text-muted-foreground">
            متابعة وإدارة جميع الورش ومحطات العمل
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            إعدادات الورش
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            ورشة جديدة
          </Button>
        </div>
      </div>

      {/* Workshop Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{workshopStats.totalWorkshops}</div>
                <div className="text-xs text-muted-foreground">عدد الورش</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{workshopStats.activeJobs}</div>
                <div className="text-xs text-muted-foreground">مهام نشطة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{workshopStats.totalMechanics}</div>
                <div className="text-xs text-muted-foreground">إجمالي الفنيين</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{workshopStats.totalCapacity}</div>
                <div className="text-xs text-muted-foreground">السعة الكلية</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{workshopStats.averageUtilization}%</div>
                <div className="text-xs text-muted-foreground">متوسط الاستغلال</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="workshops">الورش</TabsTrigger>
          <TabsTrigger value="workorders">أوامر العمل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Workshop Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <Card key={workshop.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workshop.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{workshop.location}</p>
                    </div>
                    <Badge variant={getStatusColor(workshop.status) as any}>
                      {getStatusLabel(workshop.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الاستغلال الحالي</span>
                      <span>{workshop.currentJobs}/{workshop.capacity}</span>
                    </div>
                    <Progress value={getWorkshopUtilization(workshop)} className="h-2" />
                    <div className="text-xs text-muted-foreground text-center">
                      {getWorkshopUtilization(workshop)}% مستغل
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{workshop.mechanics} فني</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{workshop.workingHours}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">التخصصات:</p>
                    <div className="flex flex-wrap gap-1">
                      {workshop.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" variant="outline" size="sm">
                    عرض التفاصيل
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workshops" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الورش</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workshops.map((workshop) => (
                  <div key={workshop.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{workshop.name}</h4>
                        <p className="text-muted-foreground">{workshop.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getStatusColor(workshop.status) as any}>
                          {getStatusLabel(workshop.status)}
                        </Badge>
                        <Button size="sm" variant="outline">تعديل</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">المعدات:</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {workshop.equipment.map((eq, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-current" />
                              {eq}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">الإحصائيات:</h5>
                        <div className="text-sm space-y-1">
                          <div>السعة: {workshop.capacity} مركبة</div>
                          <div>المهام الحالية: {workshop.currentJobs}</div>
                          <div>عدد الفنيين: {workshop.mechanics}</div>
                          <div>الاستغلال: {getWorkshopUtilization(workshop)}%</div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">ساعات العمل:</h5>
                        <div className="text-sm text-muted-foreground">
                          {workshop.workingHours}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workorders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أوامر العمل النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">المركبة: {order.vehiclePlate}</h4>
                        <p className="text-sm text-muted-foreground">{order.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(order.priority).replace('text-', 'bg-')}`} />
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status === 'completed' ? 'مكتمل' : 'جاري'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">الورشة: </span>
                        {workshops.find(w => w.id === order.workshopId)?.name}
                      </div>
                      <div>
                        <span className="text-muted-foreground">بدء العمل: </span>
                        {new Date(order.startTime).toLocaleString('ar-SA')}
                      </div>
                      <div>
                        <span className="text-muted-foreground">الإنجاز المتوقع: </span>
                        {new Date(order.estimatedCompletion).toLocaleString('ar-SA')}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        عرض التفاصيل
                      </Button>
                      {order.status !== 'completed' && (
                        <Button size="sm">
                          تحديث الحالة
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
