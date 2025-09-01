import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, Shield, AlertTriangle, Info, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AuditLog {
  id: string;
  occurred_at: string;
  actor_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  changed_columns: string[] | null;
  severity: string;
  metadata: any;
}

export function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const { hasRole } = useAuth();
  const { toast } = useToast();

  // Check if user has permission to view audit logs
  if (!hasRole('admin') && !hasRole('manager')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">غير مخوّل</h3>
            <p className="text-sm text-muted-foreground">
              تحتاج صلاحيات مدير أو مشرف لعرض سجلات التدقيق
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(100);

      if (actionFilter) {
        query = query.eq('action', actionFilter);
      }

      if (tableFilter) {
        query = query.eq('table_name', tableFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLogs(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل سجلات التدقيق",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, tableFilter]);

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      log.table_name.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      (log.record_id && log.record_id.toLowerCase().includes(searchLower)) ||
      (log.changed_columns && log.changed_columns.some(col => 
        col.toLowerCase().includes(searchLower)
      ))
    );
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      info: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'default'}>
        {severity === 'info' ? 'معلومات' : 
         severity === 'warning' ? 'تحذير' : 
         severity === 'error' ? 'خطأ' : severity}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const colors = {
      INSERT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const labels = {
      INSERT: 'إضافة',
      UPDATE: 'تعديل',
      DELETE: 'حذف'
    };

    return (
      <Badge className={colors[action as keyof typeof colors]}>
        {labels[action as keyof typeof labels] || action}
      </Badge>
    );
  };

  const getTableDisplayName = (tableName: string) => {
    const tableNames = {
      customers: 'العملاء',
      customer_access: 'صلاحيات العملاء',
      vehicles: 'المركبات',
      contracts: 'العقود'
    };
    
    return tableNames[tableName as keyof typeof tableNames] || tableName;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              سجلات التدقيق الأمني
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              مراقبة ومتابعة جميع العمليات الحساسة في النظام
            </p>
          </div>
          <Button
            onClick={fetchAuditLogs}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في السجلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="نوع العملية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع العمليات</SelectItem>
              <SelectItem value="INSERT">إضافة</SelectItem>
              <SelectItem value="UPDATE">تعديل</SelectItem>
              <SelectItem value="DELETE">حذف</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="الجدول" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الجداول</SelectItem>
              <SelectItem value="customers">العملاء</SelectItem>
              <SelectItem value="customer_access">صلاحيات العملاء</SelectItem>
              <SelectItem value="vehicles">المركبات</SelectItem>
              <SelectItem value="contracts">العقود</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          عرض {filteredLogs.length} من أصل {logs.length} سجل
        </div>

        {/* Audit Logs Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التوقيت</TableHead>
                <TableHead>العملية</TableHead>
                <TableHead>الجدول</TableHead>
                <TableHead>معرف السجل</TableHead>
                <TableHead>الحقول المتأثرة</TableHead>
                <TableHead>الأهمية</TableHead>
                <TableHead>المستخدم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>جاري تحميل السجلات...</p>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">لا توجد سجلات مطابقة للمرشحات المحددة</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatDistanceToNow(new Date(log.occurred_at), { 
                            addSuffix: true, 
                            locale: ar 
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.occurred_at).toLocaleString('ar-SA')}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium">
                        {getTableDisplayName(log.table_name)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {log.record_id ? (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {log.record_id.slice(0, 8)}...
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {log.changed_columns && log.changed_columns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {log.changed_columns.slice(0, 3).map((col, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                          {log.changed_columns.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{log.changed_columns.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(log.severity)}
                        {getSeverityBadge(log.severity)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {log.actor_id ? (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {log.actor_id.slice(0, 8)}...
                        </code>
                      ) : (
                        <span className="text-muted-foreground">نظام</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}