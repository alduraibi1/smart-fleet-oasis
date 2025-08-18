
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { 
  Car, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Wrench,
  Clock
} from "lucide-react";

interface DashboardStats {
  vehicles: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
  };
  contracts: {
    active: number;
    expiring_soon: number;
    completed_this_month: number;
  };
  financial: {
    monthly_revenue: number;
    outstanding_amount: number;
    overdue_payments: number;
  };
  alerts: {
    urgent: number;
    total_unread: number;
  };
}

export const EnhancedStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    vehicles: { total: 0, available: 0, rented: 0, maintenance: 0 },
    contracts: { active: 0, expiring_soon: 0, completed_this_month: 0 },
    financial: { monthly_revenue: 0, outstanding_amount: 0, overdue_payments: 0 },
    alerts: { urgent: 0, total_unread: 0 }
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      // إحصائيات السيارات
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('status');

      const vehicleStats = {
        total: vehicles?.length || 0,
        available: vehicles?.filter(v => v.status === 'available').length || 0,
        rented: vehicles?.filter(v => v.status === 'rented').length || 0,
        maintenance: vehicles?.filter(v => v.status === 'maintenance').length || 0
      };

      // إحصائيات العقود
      const { data: contracts } = await supabase
        .from('rental_contracts')
        .select('status, end_date, created_at');

      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const contractStats = {
        active: contracts?.filter(c => c.status === 'active').length || 0,
        expiring_soon: contracts?.filter(c => 
          c.status === 'active' && 
          new Date(c.end_date) <= threeDaysLater
        ).length || 0,
        completed_this_month: contracts?.filter(c => 
          c.status === 'completed' && 
          new Date(c.created_at) >= monthStart
        ).length || 0
      };

      // الإحصائيات المالية
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount, status, due_date, created_at');

      const monthlyRevenue = invoices?.filter(i => 
        new Date(i.created_at) >= monthStart
      ).reduce((sum, i) => sum + (i.paid_amount || 0), 0) || 0;

      const outstandingAmount = invoices?.filter(i => 
        i.status === 'pending' || i.status === 'partial'
      ).reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0) || 0;

      const overduePayments = invoices?.filter(i => 
        (i.status === 'pending' || i.status === 'partial') &&
        new Date(i.due_date) < today
      ).length || 0;

      // إحصائيات التنبيهات
      const { data: notifications } = await supabase
        .from('smart_notifications')
        .select('priority, status');

      const alertStats = {
        urgent: notifications?.filter(n => 
          n.priority === 'urgent' && n.status === 'unread'
        ).length || 0,
        total_unread: notifications?.filter(n => n.status === 'unread').length || 0
      };

      setStats({
        vehicles: vehicleStats,
        contracts: contractStats,
        financial: {
          monthly_revenue: monthlyRevenue,
          outstanding_amount: outstandingAmount,
          overdue_payments: overduePayments
        },
        alerts: alertStats
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // تحديث الإحصائيات كل دقيقة
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* تنبيهات عاجلة */}
      {stats.alerts.urgent > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                لديك {stats.alerts.urgent} تنبيه عاجل يحتاج متابعة فورية
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* إحصائيات السيارات */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              السيارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.vehicles.total}</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-600">متاحة</span>
                <Badge variant="outline" className="text-green-600">
                  {stats.vehicles.available}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">مؤجرة</span>
                <Badge variant="outline" className="text-blue-600">
                  {stats.vehicles.rented}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">صيانة</span>
                <Badge variant="outline" className="text-orange-600">
                  {stats.vehicles.maintenance}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات العقود */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              العقود
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.contracts.active}</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>نشطة</span>
                <Badge variant="outline">{stats.contracts.active}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">تنتهي قريباً</span>
                <Badge variant="destructive" className="text-xs">
                  {stats.contracts.expiring_soon}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">مكتملة هذا الشهر</span>
                <Badge variant="outline" className="text-green-600">
                  {stats.contracts.completed_this_month}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الإيرادات الشهرية */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              الإيرادات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {stats.financial.monthly_revenue.toLocaleString()} ريال
            </div>
            <div className="text-xs text-muted-foreground">
              للشهر الحالي
            </div>
          </CardContent>
        </Card>

        {/* المبالغ المستحقة */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              المبالغ المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {stats.financial.outstanding_amount.toLocaleString()} ريال
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-red-600">متأخرة</span>
                <Badge variant="destructive" className="text-xs">
                  {stats.financial.overdue_payments}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* معدل الإشغال */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            معدل الإشغال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>النسبة الحالية</span>
              <span className="font-bold">
                {stats.vehicles.total > 0 
                  ? Math.round((stats.vehicles.rented / stats.vehicles.total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.vehicles.total > 0 
                    ? (stats.vehicles.rented / stats.vehicles.total) * 100 
                    : 0}%` 
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-green-600">{stats.vehicles.available}</div>
                <div className="text-muted-foreground">متاحة</div>
              </div>
              <div>
                <div className="font-bold text-blue-600">{stats.vehicles.rented}</div>
                <div className="text-muted-foreground">مؤجرة</div>
              </div>
              <div>
                <div className="font-bold text-orange-600">{stats.vehicles.maintenance}</div>
                <div className="text-muted-foreground">صيانة</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
