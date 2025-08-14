
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ContractDialog } from '@/components/Contracts/ContractDialog';
import { ContractsList } from '@/components/Contracts/ContractsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, DollarSign, TrendingUp, Clock, Users, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContractStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  expired: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  overdueContracts: number;
}

const ContractsMain = () => {
  const [stats, setStats] = useState<ContractStats>({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    expired: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    overdueContracts: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchStats = async () => {
    try {
      const { data: contracts, error } = await supabase
        .from('rental_contracts')
        .select('*');

      if (error) throw error;

      const today = new Date();
      
      const calculatedStats: ContractStats = {
        total: contracts?.length || 0,
        active: contracts?.filter(c => c.status === 'active').length || 0,
        completed: contracts?.filter(c => c.status === 'completed').length || 0,
        cancelled: contracts?.filter(c => c.status === 'cancelled').length || 0,
        expired: contracts?.filter(c => c.status === 'expired').length || 0,
        totalRevenue: contracts?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0,
        totalPaid: contracts?.reduce((sum, c) => sum + (c.paid_amount || 0), 0) || 0,
        totalPending: contracts?.reduce((sum, c) => sum + (c.remaining_amount || 0), 0) || 0,
        overdueContracts: contracts?.filter(c => 
          new Date(c.end_date) < today && c.status === 'active'
        ).length || 0
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching contract stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const handleContractCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة العقود</h1>
            <p className="text-muted-foreground mt-2">
              إدارة شاملة لعقود الإيجار والمتابعة المالية
            </p>
          </div>
          <ContractDialog onContractCreated={handleContractCreated} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                إجمالي العقود
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-xs text-muted-foreground">
                عقد مسجل في النظام
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                العقود النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
              <div className="text-xs text-muted-foreground">
                عقد نشط حالياً
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                إجمالي الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalRevenue.toLocaleString()} ر.س
              </div>
              <div className="text-xs text-muted-foreground">
                من جميع العقود
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                عقود متأخرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.overdueContracts}
              </div>
              <div className="text-xs text-muted-foreground">
                تحتاج متابعة فورية
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                المبالغ المحصلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">
                {stats.totalPaid.toLocaleString()} ر.س
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.totalRevenue > 0 ? 
                  Math.round((stats.totalPaid / stats.totalRevenue) * 100) : 0
                }% من الإجمالي
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                المبالغ المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-orange-600">
                {stats.totalPending.toLocaleString()} ر.س
              </div>
              <div className="text-xs text-muted-foreground">
                في انتظار التحصيل
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                العقود المكتملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-blue-600">
                {stats.completed}
              </div>
              <div className="text-xs text-muted-foreground">
                عقد تم إنجازه بنجاح
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contract Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالات العقود</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">نشط</Badge>
                <span className="text-sm">{stats.active} عقد</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">مكتمل</Badge>
                <span className="text-sm">{stats.completed} عقد</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800">منتهي</Badge>
                <span className="text-sm">{stats.expired} عقد</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">ملغي</Badge>
                <span className="text-sm">{stats.cancelled} عقد</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contracts List */}
        <ContractsList />
      </div>
    </AppLayout>
  );
};

export default ContractsMain;
