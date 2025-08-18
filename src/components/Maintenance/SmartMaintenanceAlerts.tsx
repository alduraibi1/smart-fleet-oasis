
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Wrench,
  Clock,
  CheckCircle,
  Settings,
  Filter,
  BellRing,
  AlertCircle,
  Info
} from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';

export const SmartMaintenanceAlerts = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [alertSettings, setAlertSettings] = useState({
    overdueAlerts: true,
    upcomingAlerts: true,
    highPriorityAlerts: true,
    costThresholdAlerts: true
  });

  const { maintenanceRecords, schedules } = useMaintenance();

  // Mock smart alerts data - في النظام الحقيقي سيتم حسابها من البيانات
  const smartAlerts = [
    {
      id: 1,
      type: 'overdue',
      priority: 'high',
      title: 'صيانة متأخرة - مركبة أ ب ج 1234',
      description: 'صيانة دورية متأخرة منذ 5 أيام',
      vehicle: 'أ ب ج 1234',
      daysOverdue: 5,
      estimatedCost: 450,
      createdAt: '2024-01-15T10:00:00Z',
      isRead: false
    },
    {
      id: 2,
      type: 'upcoming',
      priority: 'medium',
      title: 'صيانة مجدولة قريباً - مركبة د هـ و 5678',
      description: 'صيانة مجدولة خلال 3 أيام',
      vehicle: 'د هـ و 5678',
      daysUntil: 3,
      estimatedCost: 300,
      createdAt: '2024-01-14T15:30:00Z',
      isRead: true
    },
    {
      id: 3,
      type: 'cost_threshold',
      priority: 'high',
      title: 'تجاوز حد التكلفة - مركبة ز ح ط 9012',
      description: 'تكلفة الصيانة تجاوزت 1000 ريال شهرياً',
      vehicle: 'ز ح ط 9012',
      monthlyCost: 1250,
      threshold: 1000,
      createdAt: '2024-01-13T08:45:00Z',
      isRead: false
    },
    {
      id: 4,
      type: 'predictive',
      priority: 'low',
      title: 'توقع صيانة - مركبة ي ك ل 3456',
      description: 'الذكاء الاصطناعي يتوقع حاجة لصيانة خلال أسبوعين',
      vehicle: 'ي ك ل 3456',
      confidence: 78,
      predictedDate: '2024-02-01',
      createdAt: '2024-01-12T12:20:00Z',
      isRead: true
    }
  ];

  const getAlertIcon = (type: string, priority: string) => {
    if (priority === 'high') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (type === 'upcoming') return <Calendar className="h-4 w-4 text-blue-500" />;
    if (type === 'predictive') return <BellRing className="h-4 w-4 text-purple-500" />;
    return <Info className="h-4 w-4 text-yellow-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالي';
      case 'medium': return 'متوسط';
      default: return 'منخفض';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'overdue': return 'متأخر';
      case 'upcoming': return 'قادم';
      case 'cost_threshold': return 'حد التكلفة';
      case 'predictive': return 'تنبؤي';
      default: return type;
    }
  };

  const activeAlerts = smartAlerts.filter(alert => 
    (activeTab === 'active' && !alert.isRead) ||
    (activeTab === 'all') ||
    (activeTab === 'read' && alert.isRead)
  );

  const alertStats = {
    total: smartAlerts.length,
    unread: smartAlerts.filter(a => !a.isRead).length,
    high: smartAlerts.filter(a => a.priority === 'high').length,
    overdue: smartAlerts.filter(a => a.type === 'overdue').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            التنبيهات الذكية للصيانة
          </h3>
          <p className="text-muted-foreground">
            نظام تنبيهات ذكي لمتابعة حالة الصيانة والتنبؤ بالاحتياجات
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            فلترة
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            إعدادات التنبيهات
          </Button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{alertStats.total}</div>
                <div className="text-xs text-muted-foreground">إجمالي التنبيهات</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{alertStats.unread}</div>
                <div className="text-xs text-muted-foreground">غير مقروء</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{alertStats.high}</div>
                <div className="text-xs text-muted-foreground">أولوية عالية</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{alertStats.overdue}</div>
                <div className="text-xs text-muted-foreground">متأخر</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات التنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">تنبيهات الصيانة المتأخرة</div>
                <div className="text-sm text-muted-foreground">إشعار عند تأخر الصيانة</div>
              </div>
              <Switch
                checked={alertSettings.overdueAlerts}
                onCheckedChange={(checked) => 
                  setAlertSettings(prev => ({ ...prev, overdueAlerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">تنبيهات الصيانة القادمة</div>
                <div className="text-sm text-muted-foreground">إشعار قبل موعد الصيانة</div>
              </div>
              <Switch
                checked={alertSettings.upcomingAlerts}
                onCheckedChange={(checked) => 
                  setAlertSettings(prev => ({ ...prev, upcomingAlerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">تنبيهات الأولوية العالية</div>
                <div className="text-sm text-muted-foreground">إشعار فوري للأولوية العالية</div>
              </div>
              <Switch
                checked={alertSettings.highPriorityAlerts}
                onCheckedChange={(checked) => 
                  setAlertSettings(prev => ({ ...prev, highPriorityAlerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">تنبيهات تجاوز التكلفة</div>
                <div className="text-sm text-muted-foreground">إشعار عند تجاوز حد التكلفة</div>
              </div>
              <Switch
                checked={alertSettings.costThresholdAlerts}
                onCheckedChange={(checked) => 
                  setAlertSettings(prev => ({ ...prev, costThresholdAlerts: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>التنبيهات النشطة</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">نشط ({alertStats.unread})</TabsTrigger>
              <TabsTrigger value="all">الكل ({alertStats.total})</TabsTrigger>
              <TabsTrigger value="read">مقروء</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <Card key={alert.id} className={`${!alert.isRead ? 'border-l-4 border-l-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type, alert.priority)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge variant={getPriorityColor(alert.priority) as any} className="text-xs">
                                {getPriorityLabel(alert.priority)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(alert.type)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {alert.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>المركبة: {alert.vehicle}</span>
                              {alert.estimatedCost && (
                                <span>التكلفة المتوقعة: {alert.estimatedCost} ر.س</span>
                              )}
                              <span>
                                {new Date(alert.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!alert.isRead && (
                            <Button size="sm" variant="outline">
                              تم القراءة
                            </Button>
                          )}
                          <Button size="sm">
                            إجراء
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد تنبيهات في هذه الفئة</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
