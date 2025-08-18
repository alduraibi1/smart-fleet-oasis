
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';

interface ReturnStats {
  totalReturns: number;
  onTimeReturns: number;
  lateReturns: number;
  damageReports: number;
  avgLateFee: number;
  avgDamageFee: number;
}

export default function VehicleReturnStats() {
  const { contracts } = useContracts();
  const [stats, setStats] = useState<ReturnStats>({
    totalReturns: 0,
    onTimeReturns: 0,
    lateReturns: 0,
    damageReports: 0,
    avgLateFee: 0,
    avgDamageFee: 0,
  });

  useEffect(() => {
    const completedContracts = contracts.filter(c => c.status === 'completed');
    
    const totalReturns = completedContracts.length;
    let onTimeReturns = 0;
    let lateReturns = 0;
    let damageReports = 0;
    let totalLateFees = 0;
    let totalDamageFees = 0;

    completedContracts.forEach(contract => {
      if (contract.actual_return_date && contract.end_date) {
        const returnDate = new Date(contract.actual_return_date);
        const endDate = new Date(contract.end_date);
        
        if (returnDate <= endDate) {
          onTimeReturns++;
        } else {
          lateReturns++;
          // افتراض وجود رسوم تأخير في additional_charges
          if (contract.additional_charges) {
            totalLateFees += contract.additional_charges;
          }
        }
      }

      // فحص وجود تقارير أضرار في الملاحظات
      if (contract.notes && contract.notes.includes('الأضرار:')) {
        damageReports++;
        if (contract.additional_charges) {
          totalDamageFees += contract.additional_charges * 0.3; // افتراض 30% من الرسوم للأضرار
        }
      }
    });

    setStats({
      totalReturns,
      onTimeReturns,
      lateReturns,
      damageReports,
      avgLateFee: lateReturns > 0 ? totalLateFees / lateReturns : 0,
      avgDamageFee: damageReports > 0 ? totalDamageFees / damageReports : 0,
    });
  }, [contracts]);

  const onTimePercentage = stats.totalReturns > 0 ? (stats.onTimeReturns / stats.totalReturns) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإرجاعات</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReturns}</div>
          <p className="text-xs text-muted-foreground">
            العقود المكتملة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الإرجاع في الوقت</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.onTimeReturns}</div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {onTimePercentage.toFixed(1)}%
            </Badge>
            <p className="text-xs text-muted-foreground">
              من الإرجاعات
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الإرجاع المتأخر</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.lateReturns}</div>
          <p className="text-xs text-muted-foreground">
            متوسط الرسوم: {stats.avgLateFee.toFixed(0)} ر.س
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">تقارير الأضرار</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.damageReports}</div>
          <p className="text-xs text-muted-foreground">
            متوسط التكلفة: {stats.avgDamageFee.toFixed(0)} ر.س
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
