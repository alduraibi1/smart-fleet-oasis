
import React, { useState, useMemo } from 'react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  Car,
  DollarSign
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useContracts } from '@/hooks/useContracts';

interface ContractsDashboardProps {
  onAddContract: () => void;
  onViewContract: (contractId: string) => void;
}

export const ContractsDashboard: React.FC<ContractsDashboardProps> = ({
  onAddContract,
  onViewContract
}) => {
  const { contracts, loading, stats } = useContracts();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Enhanced analytics
  const dashboardStats = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    const nextMonth = addDays(today, 30);

    const expiringThisWeek = contracts.filter(contract => 
      contract.status === 'active' &&
      isAfter(new Date(contract.end_date), today) &&
      isBefore(new Date(contract.end_date), nextWeek)
    );

    const expiringThisMonth = contracts.filter(contract => 
      contract.status === 'active' &&
      isAfter(new Date(contract.end_date), nextWeek) &&
      isBefore(new Date(contract.end_date), nextMonth)
    );

    const overdueContracts = contracts.filter(contract => 
      contract.status === 'active' &&
      isBefore(new Date(contract.end_date), today)
    );

    const totalRevenue = contracts.reduce((sum, contract) => sum + (contract.total_amount || 0), 0);
    const paidAmount = contracts.reduce((sum, contract) => sum + (contract.paid_amount || 0), 0);
    const pendingAmount = totalRevenue - paidAmount;

    return {
      ...stats,
      expiringThisWeek: expiringThisWeek.length,
      expiringThisMonth: expiringThisMonth.length,
      overdue: overdueContracts.length,
      totalRevenue,
      paidAmount,
      pendingAmount,
      collectionRate: totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0,
      contracts: {
        expiringThisWeek,
        expiringThisMonth,
        overdue: overdueContracts
      }
    };
  }, [contracts, stats]);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, color: 'bg-green-500' },
      completed: { variant: 'secondary' as const, color: 'bg-blue-500' },
      cancelled: { variant: 'destructive' as const, color: 'bg-red-500' },
      expired: { variant: 'destructive' as const, color: 'bg-orange-500' },
      pending: { variant: 'outline' as const, color: 'bg-yellow-500' }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    
    return (
      <Badge variant={config.variant}>
        {status === 'active' && 'نشط'}
        {status === 'completed' && 'مكتمل'}
        {status === 'cancelled' && 'ملغي'}
        {status === 'expired' && 'منتهي'}
        {status === 'pending' && 'معلق'}
      </Badge>
    );
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم العقود</h1>
          <p className="text-muted-foreground">إدارة شاملة لجميع عقود الإيجار</p>
        </div>
        <Button onClick={onAddContract} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          عقد جديد
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي العقود"
          value={dashboardStats.total}
          icon={FileText}
          trend={`${dashboardStats.active} نشط حالياً`}
          color="blue"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`${dashboardStats.totalRevenue.toLocaleString()} ريال`}
          icon={DollarSign}
          trend={`معدل التحصيل ${dashboardStats.collectionRate.toFixed(1)}%`}
          color="green"
        />
        <StatCard
          title="العقود المنتهية قريباً"
          value={dashboardStats.expiringThisWeek}
          icon={Clock}
          trend={`${dashboardStats.expiringThisMonth} خلال الشهر`}
          color="orange"
        />
        <StatCard
          title="المبالغ المعلقة"
          value={`${dashboardStats.pendingAmount.toLocaleString()} ريال`}
          icon={AlertTriangle}
          trend={`${dashboardStats.overdue} عقد متأخر`}
          color="red"
        />
      </div>

      {/* Alerts Section */}
      {(dashboardStats.contracts.expiringThisWeek.length > 0 || dashboardStats.contracts.overdue.length > 0) && (
        <div className="space-y-4">
          {dashboardStats.contracts.overdue.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>تنبيه:</strong> يوجد {dashboardStats.contracts.overdue.length} عقد متأخر يحتاج إجراء فوري
              </AlertDescription>
            </Alert>
          )}
          
          {dashboardStats.contracts.expiringThisWeek.length > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>تذكير:</strong> {dashboardStats.contracts.expiringThisWeek.length} عقد سينتهي خلال الأسبوع القادم
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="active">العقود النشطة</TabsTrigger>
          <TabsTrigger value="expiring">المنتهية قريباً</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Contracts */}
            <Card>
              <CardHeader>
                <CardTitle>العقود الحديثة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contracts.slice(0, 5).map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{contract.contract_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {contract.customer?.name}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(contract.status)}
                      <div className="text-sm text-muted-foreground mt-1">
                        {format(new Date(contract.created_at), 'dd/MM/yyyy', { locale: ar })}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Collection Rate */}
            <Card>
              <CardHeader>
                <CardTitle>معدل التحصيل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>المحصل</span>
                    <span>{dashboardStats.paidAmount.toLocaleString()} ريال</span>
                  </div>
                  <Progress value={dashboardStats.collectionRate} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">إجمالي الإيرادات</div>
                    <div className="font-medium">{dashboardStats.totalRevenue.toLocaleString()} ريال</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">المبالغ المعلقة</div>
                    <div className="font-medium text-orange-600">{dashboardStats.pendingAmount.toLocaleString()} ريال</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>العقود النشطة ({dashboardStats.active})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contracts.filter(c => c.status === 'active').map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">{contract.contract_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {contract.customer?.name} | {contract.vehicle?.brand} {contract.vehicle?.model}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{contract.total_amount?.toLocaleString()} ريال</div>
                      <div className="text-sm text-muted-foreground">
                        ينتهي في {format(new Date(contract.end_date), 'dd/MM/yyyy', { locale: ar })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewContract(contract.id)}
                        className="mt-2"
                      >
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <div className="space-y-4">
            {dashboardStats.contracts.overdue.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">عقود متأخرة ({dashboardStats.contracts.overdue.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardStats.contracts.overdue.map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                        <div>
                          <div className="font-medium">{contract.contract_number}</div>
                          <div className="text-sm text-muted-foreground">{contract.customer?.name}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">متأخر</Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            انتهى في {format(new Date(contract.end_date), 'dd/MM/yyyy', { locale: ar })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">ينتهي خلال أسبوع ({dashboardStats.contracts.expiringThisWeek.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats.contracts.expiringThisWeek.map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-3 bg-white border border-orange-200 rounded-lg">
                      <div>
                        <div className="font-medium">{contract.contract_number}</div>
                        <div className="text-sm text-muted-foreground">{contract.customer?.name}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="border-orange-500 text-orange-700">
                          قريب الانتهاء
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          ينتهي في {format(new Date(contract.end_date), 'dd/MM/yyyy', { locale: ar })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الحالة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'active', label: 'نشط', count: dashboardStats.active, color: 'bg-green-500' },
                    { status: 'completed', label: 'مكتمل', count: dashboardStats.completed, color: 'bg-blue-500' },
                    { status: 'expired', label: 'منتهي', count: dashboardStats.expired, color: 'bg-orange-500' },
                    { status: 'pending', label: 'معلق', count: dashboardStats.pending, color: 'bg-yellow-500' }
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.count}</span>
                        <span className="text-sm text-muted-foreground">
                          ({dashboardStats.total > 0 ? ((item.count / dashboardStats.total) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الإيرادات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {dashboardStats.monthlyRevenue.toLocaleString()} ريال
                </div>
                <div className="text-sm text-muted-foreground">
                  متوسط قيمة العقد: {dashboardStats.avgContractValue.toLocaleString()} ريال
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
