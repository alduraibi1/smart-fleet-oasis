import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Download, Calendar as CalendarIcon, Eye, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState<Date>();

  const activityLogs = [
    {
      id: 1,
      user: 'أحمد محمد',
      action: 'تسجيل دخول',
      module: 'النظام',
      details: 'تم تسجيل الدخول بنجاح',
      timestamp: new Date('2024-01-15T10:30:00'),
      ipAddress: '192.168.1.100',
      status: 'success',
      severity: 'low'
    },
    {
      id: 2,
      user: 'فاطمة علي',
      action: 'إضافة مركبة',
      module: 'المركبات',
      details: 'تم إضافة مركبة جديدة: تويوتا كامري 2023',
      timestamp: new Date('2024-01-15T10:25:00'),
      ipAddress: '192.168.1.101',
      status: 'success',
      severity: 'medium'
    },
    {
      id: 3,
      user: 'محمد حسن',
      action: 'محاولة حذف',
      module: 'العملاء',
      details: 'محاولة حذف عميل - تم الرفض لعدم توفر الصلاحية',
      timestamp: new Date('2024-01-15T10:20:00'),
      ipAddress: '192.168.1.102',
      status: 'error',
      severity: 'high'
    },
    {
      id: 4,
      user: 'سارة أحمد',
      action: 'تحديث عقد',
      module: 'العقود',
      details: 'تم تحديث عقد الإيجار رقم #12345',
      timestamp: new Date('2024-01-15T10:15:00'),
      ipAddress: '192.168.1.103',
      status: 'success',
      severity: 'medium'
    },
    {
      id: 5,
      user: 'خالد يوسف',
      action: 'تسجيل خروج',
      module: 'النظام',
      details: 'تم تسجيل الخروج',
      timestamp: new Date('2024-01-15T10:10:00'),
      ipAddress: '192.168.1.104',
      status: 'info',
      severity: 'low'
    },
    {
      id: 6,
      user: 'نادية سالم',
      action: 'فشل تسجيل دخول',
      module: 'النظام',
      details: 'محاولة تسجيل دخول فاشلة - كلمة مرور خاطئة',
      timestamp: new Date('2024-01-15T10:05:00'),
      ipAddress: '192.168.1.105',
      status: 'warning',
      severity: 'high'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    const matchesAction = filterAction === 'all' || log.action.includes(filterAction);
    
    return matchesSearch && matchesUser && matchesAction;
  });

  const uniqueUsers = [...new Set(activityLogs.map(log => log.user))];
  const uniqueActions = [...new Set(activityLogs.map(log => log.action))];

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الأنشطة
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activityLogs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تحذيرات
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activityLogs.filter(log => log.status === 'warning').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              أخطاء
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activityLogs.filter(log => log.status === 'error').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              نجح
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activityLogs.filter(log => log.status === 'success').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* سجل الأنشطة */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">سجل الأنشطة</CardTitle>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            تصدير السجل
          </Button>
        </CardHeader>
        <CardContent>
          {/* أدوات التصفية */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في السجل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="اختر المستخدم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستخدمين</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="نوع النشاط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنشطة</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-48">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterDate ? format(filterDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterDate}
                  onSelect={setFilterDate}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* جدول السجل */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التوقيت</TableHead>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>النشاط</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead>التفاصيل</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>عنوان IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">
                      {format(log.timestamp, 'HH:mm:ss dd/MM/yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {log.user}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {log.action}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.module}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {log.details}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(log.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(log.status)}
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityBadgeVariant(log.severity)}>
                        {log.severity === 'high' ? 'عالية' : 
                         log.severity === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {log.ipAddress}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد أنشطة مطابقة للمرشحات المحددة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;