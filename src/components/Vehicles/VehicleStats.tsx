import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VehicleStats as VehicleStatsType } from '@/types/vehicle';

interface VehicleStatsProps {
  stats: VehicleStatsType;
}

const VehicleStats = ({ stats }: VehicleStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>إجمالي المركبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">عدد المركبات المسجلة</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المركبات المتاحة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500">{stats.available}</div>
          <div className="text-sm text-muted-foreground">عدد المركبات الجاهزة للإيجار</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المركبات المؤجرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-500">{stats.rented}</div>
          <div className="text-sm text-muted-foreground">عدد المركبات قيد الإيجار حالياً</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المركبات في الصيانة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-500">{stats.maintenance}</div>
          <div className="text-sm text-muted-foreground">عدد المركبات التي تخضع للصيانة</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المركبات خارج الخدمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-500">{stats.out_of_service}</div>
          <div className="text-sm text-muted-foreground">عدد المركبات المتوقفة عن العمل</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>متوسط السعر اليومي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">₪{stats.avg_daily_rate.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">متوسط إيراد كل مركبة في اليوم</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleStats;
