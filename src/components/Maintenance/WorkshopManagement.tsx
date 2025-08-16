
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Settings,
  Calendar
} from 'lucide-react';

export const WorkshopManagement = () => {
  // Mock workshop data
  const workshopBays = [
    {
      id: 1,
      bayNumber: 'خليج 1',
      type: 'عام',
      status: 'occupied',
      vehicle: 'أ ب ج 1234 - كامري 2020',
      mechanic: 'أحمد محمد',
      progress: 75,
      estimatedCompletion: '14:30',
      workType: 'تغيير زيت'
    },
    {
      id: 2,
      bayNumber: 'خليج 2',
      type: 'تخصص',
      status: 'available',
      vehicle: null,
      mechanic: null,
      progress: 0,
      estimatedCompletion: null,
      workType: null
    },
    {
      id: 3,
      bayNumber: 'خليج 3',
      type: 'تشخيص',
      status: 'maintenance',
      vehicle: null,
      mechanic: null,
      progress: 0,
      estimatedCompletion: null,
      workType: null
    },
    {
      id: 4,
      bayNumber: 'خليج 4',
      type: 'عام',
      status: 'occupied',
      vehicle: 'د هـ و 5678 - كورولا 2019',
      mechanic: 'محمد علي',
      progress: 30,
      estimatedCompletion: '16:00',
      workType: 'صيانة فرامل'
    }
  ];

  const mechanics = [
    {
      id: 1,
      name: 'أحمد محمد',
      specialization: 'محركات',
      status: 'busy',
      currentJob: 'تغيير زيت - خليج 1',
      efficiency: 92
    },
    {
      id: 2,
      name: 'محمد علي',
      specialization: 'فرامل وتعليق',
      status: 'busy',
      currentJob: 'صيانة فرامل - خليج 4',
      efficiency: 87
    },
    {
      id: 3,
      name: 'علي أحمد',
      specialization: 'كهرباء',
      status: 'available',
      currentJob: null,
      efficiency: 95
    },
    {
      id: 4,
      name: 'سالم محمد',
      specialization: 'عام',
      status: 'break',
      currentJob: null,
      efficiency: 78
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'destructive';
      case 'available':
        return 'default';
      case 'maintenance':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'مشغول';
      case 'available':
        return 'متاح';
      case 'maintenance':
        return 'صيانة';
      default:
        return status;
    }
  };

  const getMechanicStatusColor = (status: string) => {
    switch (status) {
      case 'busy':
        return 'destructive';
      case 'available':
        return 'default';
      case 'break':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMechanicStatusLabel = (status: string) => {
    switch (status) {
      case 'busy':
        return 'مشغول';
      case 'available':
        return 'متاح';
      case 'break':
        return 'استراحة';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">إدارة الورشة</h3>
          <p className="text-muted-foreground">
            متابعة حالة الأخلاج والميكانيكيين في الوقت الفعلي
          </p>
        </div>
        <Button className="gap-2">
          <Settings className="h-4 w-4" />
          إعدادات الورشة
        </Button>
      </div>

      {/* Workshop Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الأخلاج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              أخلاج مشغولة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ميكانيكيين نشطين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط الكفاءة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
          </CardContent>
        </Card>
      </div>

      {/* Workshop Bays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            حالة الأخلاج
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workshopBays.map((bay) => (
              <Card key={bay.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{bay.bayNumber}</h4>
                    <p className="text-sm text-muted-foreground">{bay.type}</p>
                  </div>
                  <Badge variant={getStatusColor(bay.status) as any}>
                    {getStatusLabel(bay.status)}
                  </Badge>
                </div>
                
                {bay.status === 'occupied' && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">{bay.vehicle}</p>
                      <p className="text-sm text-muted-foreground">{bay.mechanic}</p>
                      <p className="text-sm text-muted-foreground">{bay.workType}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>التقدم</span>
                        <span>{bay.progress}%</span>
                      </div>
                      <Progress value={bay.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>الانتهاء المتوقع: {bay.estimatedCompletion}</span>
                    </div>
                  </div>
                )}
                
                {bay.status === 'available' && (
                  <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">متاح للحجز</p>
                    </div>
                  </div>
                )}
                
                {bay.status === 'maintenance' && (
                  <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">تحت الصيانة</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mechanics Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            حالة الميكانيكيين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mechanics.map((mechanic) => (
              <Card key={mechanic.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{mechanic.name}</h4>
                    <p className="text-sm text-muted-foreground">{mechanic.specialization}</p>
                  </div>
                  <Badge variant={getMechanicStatusColor(mechanic.status) as any}>
                    {getMechanicStatusLabel(mechanic.status)}
                  </Badge>
                </div>
                
                {mechanic.currentJob && (
                  <div className="mb-3">
                    <p className="text-sm font-medium">المهمة الحالية:</p>
                    <p className="text-sm text-muted-foreground">{mechanic.currentJob}</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>كفاءة الأداء</span>
                    <span>{mechanic.efficiency}%</span>
                  </div>
                  <Progress value={mechanic.efficiency} className="h-2" />
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              جدولة مهمة جديدة
            </Button>
            <Button variant="outline" className="gap-2">
              <Wrench className="h-4 w-4" />
              إعادة تخصيص ميكانيكي
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              إعدادات الخليج
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
