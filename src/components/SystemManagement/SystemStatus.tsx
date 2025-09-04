
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Activity, Database, Users, Car, FileText, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  totalUsers: number;
  totalVehicles: number;
  totalContracts: number;
  totalCustomers: number;
  totalInventoryItems: number;
  databaseStatus: 'online' | 'warning' | 'offline';
  lastUpdate: string;
}

const SystemStatus = () => {
  const [loading, setLoading] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    totalVehicles: 0,
    totalContracts: 0,
    totalCustomers: 0,
    totalInventoryItems: 0,
    databaseStatus: 'online',
    lastUpdate: new Date().toISOString()
  });
  const [overallHealth, setOverallHealth] = useState(100);
  const { toast } = useToast();

  const fetchSystemMetrics = async () => {
    try {
      setLoading(true);
      
      // استعلام موازي لجمع إحصائيات النظام
      const [
        usersResult,
        vehiclesResult,
        contractsResult,
        customersResult,
        inventoryResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('vehicles').select('id', { count: 'exact', head: true }),
        supabase.from('rental_contracts').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('inventory_items').select('id', { count: 'exact', head: true })
      ]);

      // التحقق من وجود أخطاء
      const hasErrors = [usersResult, vehiclesResult, contractsResult, customersResult, inventoryResult]
        .some(result => result.error);

      if (hasErrors) {
        throw new Error('فشل في جلب بعض الإحصائيات');
      }

      const metrics: SystemMetrics = {
        totalUsers: usersResult.count || 0,
        totalVehicles: vehiclesResult.count || 0,
        totalContracts: contractsResult.count || 0,
        totalCustomers: customersResult.count || 0,
        totalInventoryItems: inventoryResult.count || 0,
        databaseStatus: 'online',
        lastUpdate: new Date().toISOString()
      };

      setSystemMetrics(metrics);
      setOverallHealth(100); // النظام يعمل بشكل صحيح
      
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      setSystemMetrics(prev => ({
        ...prev,
        databaseStatus: 'warning',
        lastUpdate: new Date().toISOString()
      }));
      setOverallHealth(75); // مشاكل جزئية
      
      toast({
        title: "تحذير",
        description: "فشل في جلب بعض إحصائيات النظام",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
    // تحديث تلقائي كل 30 ثانية
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-500';
    if (health >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthStatus = (health: number) => {
    if (health >= 95) return 'النظام يعمل بشكل مثالي';
    if (health >= 80) return 'النظام يعمل بشكل جيد مع تحذيرات بسيطة';
    if (health >= 60) return 'النظام يعمل مع وجود مشاكل';
    return 'النظام يواجه مشاكل خطيرة';
  };

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>صحة النظام العامة</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSystemMetrics}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-3xl font-bold ${getHealthColor(overallHealth)}`}>
              {overallHealth.toFixed(0)}%
            </div>
            <div>
              <p className="text-lg font-semibold">{getHealthStatus(overallHealth)}</p>
              <p className="text-sm text-muted-foreground">
                آخر تحديث: {new Date(systemMetrics.lastUpdate).toLocaleString('ar-SA')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">قاعدة البيانات</p>
                <div className="flex items-center gap-2">
                  {systemMetrics.databaseStatus === 'online' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-lg font-semibold">
                    {systemMetrics.databaseStatus === 'online' ? 'متصلة' : 'تحذير'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">المستخدمون</p>
                <p className="text-2xl font-bold">{systemMetrics.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">المركبات</p>
                <p className="text-2xl font-bold">{systemMetrics.totalVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">العقود</p>
                <p className="text-2xl font-bold">{systemMetrics.totalContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-sm text-muted-foreground">العملاء</p>
                <p className="text-2xl font-bold">{systemMetrics.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">المخزون</p>
                <p className="text-2xl font-bold">{systemMetrics.totalInventoryItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemStatus;
