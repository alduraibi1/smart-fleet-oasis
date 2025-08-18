
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Filter,
  Wrench
} from 'lucide-react';
import { useMaintenance } from '@/hooks/useMaintenance';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';

export const MaintenanceCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const { maintenanceRecords, schedules } = useMaintenance();

  // دمج السجلات والجدولة
  const allMaintenanceItems = [
    ...maintenanceRecords.map(record => ({
      id: record.id,
      type: 'record' as const,
      date: new Date(record.scheduled_date || record.created_at),
      title: record.maintenance_type,
      status: record.status,
      vehicle: record.vehicles?.plate_number || 'غير محدد',
      mechanic: record.mechanics?.name || 'غير محدد',
      priority: record.priority || 'medium',
      description: record.description || record.reported_issue
    })),
    ...schedules.map(schedule => ({
      id: schedule.id,
      type: 'schedule' as const,
      date: new Date(schedule.scheduled_date),
      title: schedule.maintenance_type,
      status: schedule.status,
      vehicle: schedule.vehicles?.plate_number || 'غير محدد',
      mechanic: 'غير محدد',
      priority: schedule.priority,
      description: schedule.notes
    }))
  ];

  // الحصول على العناصر لتاريخ معين
  const getItemsForDate = (date: Date) => {
    return allMaintenanceItems.filter(item => isSameDay(item.date, date));
  };

  // الحصول على العناصر للشهر الحالي
  const getItemsForMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return allMaintenanceItems.filter(item => 
      item.date >= start && item.date <= end
    );
  };

  const selectedDateItems = getItemsForDate(selectedDate);
  const monthItems = getItemsForMonth(selectedDate);

  // إحصائيات الشهر
  const monthStats = {
    total: monthItems.length,
    completed: monthItems.filter(item => item.status === 'completed').length,
    pending: monthItems.filter(item => item.status === 'scheduled' || item.status === 'in_progress').length,
    overdue: monthItems.filter(item => 
      item.status !== 'completed' && item.date < new Date()
    ).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'جاري';
      case 'scheduled':
        return 'مجدول';
      default:
        return 'متأخر';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  // تحديد الأيام التي تحتوي على صيانة
  const modifiers = {
    hasMaintenence: (date: Date) => getItemsForDate(date).length > 0,
    isOverdue: (date: Date) => getItemsForDate(date).some(item => 
      item.status !== 'completed' && item.date < new Date()
    )
  };

  const modifiersStyles = {
    hasMaintenence: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '6px'
    },
    isOverdue: {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'hsl(var(--destructive-foreground))',
      borderRadius: '6px'
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">تقويم الصيانة</h3>
          <p className="text-muted-foreground">جدولة ومتابعة مواعيد الصيانة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            فلترة
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            إضافة موعد
          </Button>
        </div>
      </div>

      {/* إحصائيات الشهر */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{monthStats.total}</div>
                <div className="text-xs text-muted-foreground">إجمالي المواعيد</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{monthStats.completed}</div>
                <div className="text-xs text-muted-foreground">مكتمل</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{monthStats.pending}</div>
                <div className="text-xs text-muted-foreground">معلق</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{monthStats.overdue}</div>
                <div className="text-xs text-muted-foreground">متأخر</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* التقويم */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDate, 'MMMM yyyy', { locale: ar })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ar}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>

        {/* تفاصيل اليوم المحدد */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'dd MMMM yyyy', { locale: ar })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateItems.length > 0 ? (
              <div className="space-y-3">
                {selectedDateItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                        <span className="font-medium text-sm">{item.title}</span>
                      </div>
                      <Badge variant={getStatusColor(item.status)} className="text-xs">
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>المركبة: {item.vehicle}</div>
                      <div>الميكانيكي: {item.mechanic}</div>
                      {item.description && (
                        <div>الوصف: {item.description}</div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        تفاصيل
                      </Button>
                      {item.status !== 'completed' && (
                        <Button size="sm" className="text-xs h-7">
                          تحديث
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">لا توجد مواعيد صيانة</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="h-3 w-3 mr-1" />
                  إضافة موعد
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* المواعيد القادمة */}
      <Card>
        <CardHeader>
          <CardTitle>المواعيد القادمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allMaintenanceItems
              .filter(item => item.date >= new Date() && item.status !== 'completed')
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.vehicle} • {format(item.date, 'dd/MM/yyyy')}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(item.status)} className="text-xs">
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
