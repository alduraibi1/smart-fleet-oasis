import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Download, Calendar as CalendarIcon, Eye, AlertTriangle, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  actor_id: string | null;
  occurred_at: string;
  severity: string;
  metadata: any;
  ip_addr: string | null;
  user_agent: string | null;
  changed_columns: string[] | null;
  old_data: any;
  new_data: any;
}

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs((data || []).map(item => ({
        ...item,
        ip_addr: item.ip_addr as string | null,
        user_agent: item.user_agent as string | null,
        metadata: item.metadata,
        old_data: item.old_data,
        new_data: item.new_data
      })));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب سجل الأنشطة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

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

  const filteredLogs = auditLogs.filter(log => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = log.action.toLowerCase().includes(searchString) ||
                         log.table_name.toLowerCase().includes(searchString) ||
                         (log.metadata ? JSON.stringify(log.metadata).toLowerCase().includes(searchString) : false);
    
    const matchesUser = filterUser === 'all' || log.actor_id === filterUser;
    const matchesAction = filterAction === 'all' || log.action.includes(filterAction);
    
    return matchesSearch && matchesUser && matchesAction;
  });

  const uniqueUsers = [...new Set(auditLogs.map(log => log.actor_id).filter(Boolean))];
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

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
            <div className="text-2xl font-bold text-foreground">{auditLogs.length}</div>
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
              {auditLogs.filter(log => log.severity === 'warning').length}
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
              {auditLogs.filter(log => log.severity === 'error').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معلومات
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {auditLogs.filter(log => log.severity === 'info').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* سجل الأنشطة */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">سجل الأنشطة</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAuditLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير السجل
            </Button>
          </div>
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
                  <TableHead>النشاط</TableHead>
                  <TableHead>الجدول</TableHead>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>التفاصيل</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>عنوان IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      جاري تحميل السجلات...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(log.occurred_at), 'HH:mm:ss dd/MM/yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {log.action}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.table_name}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.actor_id ? log.actor_id.substring(0, 8) : 'نظام'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {log.metadata ? JSON.stringify(log.metadata).substring(0, 100) + '...' : 'لا توجد تفاصيل'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(log.severity)}>
                          {log.severity === 'critical' ? 'حرج' : 
                           log.severity === 'warning' ? 'تحذير' : 
                           log.severity === 'error' ? 'خطأ' : 'معلومات'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {log.ip_addr || 'غير محدد'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
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