import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  History, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  Calendar,
  Edit,
  UserPlus,
  UserMinus,
  Shield,
  ShieldOff,
  FileText,
  Activity,
  Clock,
  Filter
} from 'lucide-react';
import { Customer } from '@/types/index';

interface ChangeLogEntry {
  id: string;
  customer_id: string;
  action: 'create' | 'update' | 'blacklist' | 'unblacklist' | 'delete';
  field_changed?: string;
  old_value?: any;
  new_value?: any;
  changed_by: string;
  change_reason?: string;
  timestamp: string;
  user_name?: string;
  ip_address?: string;
}

interface CustomerChangeHistoryProps {
  customerId?: string;
  customers: Customer[];
}

export function CustomerChangeHistory({ customerId, customers }: CustomerChangeHistoryProps) {
  const [changes, setChanges] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'create' | 'update' | 'blacklist' | 'delete'>('all');

  // محاكاة بيانات تاريخ التغييرات (في التطبيق الحقيقي ستأتي من قاعدة البيانات)
  const mockChanges: ChangeLogEntry[] = [
    {
      id: '1',
      customer_id: 'customer-1',
      action: 'create',
      changed_by: 'admin-1',
      user_name: 'أحمد المدير',
      timestamp: '2024-01-15T10:30:00Z',
      change_reason: 'عميل جديد',
      ip_address: '192.168.1.100',
    },
    {
      id: '2',
      customer_id: 'customer-1',
      action: 'update',
      field_changed: 'phone',
      old_value: '0501234567',
      new_value: '0507654321',
      changed_by: 'employee-1',
      user_name: 'سارة الموظفة',
      timestamp: '2024-01-20T14:15:00Z',
      change_reason: 'تحديث رقم الهاتف بناء على طلب العميل',
      ip_address: '192.168.1.101',
    },
    {
      id: '3',
      customer_id: 'customer-1',
      action: 'update',
      field_changed: 'email',
      old_value: 'old@example.com',
      new_value: 'new@example.com',
      changed_by: 'employee-2',
      user_name: 'محمد الموظف',
      timestamp: '2024-02-01T09:20:00Z',
      change_reason: 'تحديث البريد الإلكتروني',
      ip_address: '192.168.1.102',
    },
    {
      id: '4',
      customer_id: 'customer-2',
      action: 'blacklist',
      field_changed: 'blacklisted',
      old_value: false,
      new_value: true,
      changed_by: 'manager-1',
      user_name: 'فاطمة المديرة',
      timestamp: '2024-02-10T16:45:00Z',
      change_reason: 'عدم سداد المستحقات المالية',
      ip_address: '192.168.1.103',
    },
    {
      id: '5',
      customer_id: 'customer-2',
      action: 'unblacklist',
      field_changed: 'blacklisted',
      old_value: true,
      new_value: false,
      changed_by: 'manager-1',
      user_name: 'فاطمة المديرة',
      timestamp: '2024-02-15T11:30:00Z',
      change_reason: 'تم سداد المستحقات المالية',
      ip_address: '192.168.1.103',
    },
  ];

  useEffect(() => {
    // محاكاة جلب البيانات
    setLoading(true);
    setTimeout(() => {
      const filteredChanges = customerId 
        ? mockChanges.filter(change => change.customer_id === customerId)
        : mockChanges;
      setChanges(filteredChanges);
      setLoading(false);
    }, 1000);
  }, [customerId]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'blacklist':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'unblacklist':
        return <ShieldOff className="h-4 w-4 text-green-500" />;
      case 'delete':
        return <UserMinus className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return 'إنشاء عميل';
      case 'update':
        return 'تحديث بيانات';
      case 'blacklist':
        return 'إضافة للقائمة السوداء';
      case 'unblacklist':
        return 'إزالة من القائمة السوداء';
      case 'delete':
        return 'حذف عميل';
      default:
        return 'نشاط غير معروف';
    }
  };

  const getFieldLabel = (field: string) => {
    const fieldLabels: Record<string, string> = {
      name: 'الاسم',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      address: 'العنوان',
      city: 'المدينة',
      rating: 'التقييم',
      blacklisted: 'القائمة السوداء',
      is_active: 'الحالة',
    };
    return fieldLabels[field] || field;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'blacklist':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'unblacklist':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredChanges = filter === 'all' 
    ? changes 
    : changes.filter(change => change.action === filter);

  const groupedChanges = filteredChanges.reduce((groups, change) => {
    const date = format(new Date(change.timestamp), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(change);
    return groups;
  }, {} as Record<string, ChangeLogEntry[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">سجل التغييرات</h3>
          <p className="text-sm text-muted-foreground">
            {customerId ? 'تاريخ التغييرات على هذا العميل' : 'تاريخ جميع التغييرات على العملاء'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList>
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="create">إنشاء</TabsTrigger>
              <TabsTrigger value="update">تحديث</TabsTrigger>
              <TabsTrigger value="blacklist">قائمة سوداء</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            سجل الأنشطة
          </CardTitle>
          <CardDescription>
            {filteredChanges.length} نشاط في السجل
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChanges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد تغييرات مسجلة</p>
              <p className="text-sm">ستظهر هنا جميع التغييرات على بيانات العملاء</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-6">
                {Object.entries(groupedChanges)
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                  .map(([date, dayChanges]) => (
                    <div key={date}>
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">
                          {format(new Date(date), 'EEEE، d MMMM yyyy', { locale: ar })}
                        </h4>
                      </div>

                      <div className="space-y-4 mr-6">
                        {dayChanges
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((change) => (
                            <div key={change.id} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0">
                              <div className="flex-shrink-0 mt-1">
                                {getActionIcon(change.action)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`text-xs ${getActionColor(change.action)}`}>
                                    {getActionLabel(change.action)}
                                  </Badge>
                                  
                                  <span className="text-sm text-muted-foreground">
                                    {format(new Date(change.timestamp), 'HH:mm')}
                                  </span>
                                  
                                  <span className="text-xs text-muted-foreground">
                                    ({formatDistanceToNow(new Date(change.timestamp), { 
                                      addSuffix: true, 
                                      locale: ar 
                                    })})
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  {change.field_changed && (
                                    <div className="text-sm">
                                      <span className="font-medium">
                                        {getFieldLabel(change.field_changed)}:
                                      </span>
                                      <div className="mt-1 flex items-center gap-2 text-xs">
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                                          {change.old_value?.toString() || 'فارغ'}
                                        </span>
                                        <span>←</span>
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                          {change.new_value?.toString() || 'فارغ'}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="text-xs text-muted-foreground">
                                    بواسطة: {change.user_name || 'مستخدم غير معروف'}
                                  </div>

                                  {change.change_reason && (
                                    <div className="text-xs text-muted-foreground">
                                      السبب: {change.change_reason}
                                    </div>
                                  )}

                                  {change.ip_address && (
                                    <div className="text-xs text-muted-foreground">
                                      العنوان IP: {change.ip_address}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <UserPlus className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {changes.filter(c => c.action === 'create').length}
            </div>
            <div className="text-xs text-muted-foreground">عملاء جدد</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Edit className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">
              {changes.filter(c => c.action === 'update').length}
            </div>
            <div className="text-xs text-muted-foreground">تحديثات</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">
              {changes.filter(c => c.action === 'blacklist').length}
            </div>
            <div className="text-xs text-muted-foreground">قائمة سوداء</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">
              {changes.length > 0 ? formatDistanceToNow(
                new Date(Math.max(...changes.map(c => new Date(c.timestamp).getTime()))),
                { locale: ar }
              ) : '-'}
            </div>
            <div className="text-xs text-muted-foreground">آخر نشاط</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}