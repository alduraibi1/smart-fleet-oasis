import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, CheckCircle, Clock, Wrench, DollarSign, TrendingUp, Gauge } from 'lucide-react';
import { VehicleStats as VehicleStatsType } from '@/types/vehicles';

interface VehicleStatsProps {
  stats: VehicleStatsType;
}

export default function VehicleStats({ stats }: VehicleStatsProps) {

  const statCards = [
    {
      title: 'إجمالي المركبات',
      value: stats.total,
      icon: Car,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'مركبة في الأسطول'
    },
    {
      title: 'متاحة للإيجار',
      value: stats.available,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: `${stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}% من الأسطول`
    },
    {
      title: 'مؤجرة حالياً',
      value: stats.rented,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      description: 'تحقق إيرادات يومية'
    },
    {
      title: 'في الصيانة',
      value: stats.maintenance,
      icon: Wrench,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      description: 'خارج الخدمة مؤقتاً'
    },
    {
      title: 'خارج الخدمة',
      value: stats.out_of_service,
      icon: Wrench,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      description: 'مركبات غير جاهزة'
    },
    {
      title: 'إجمالي القيمة',
      value: `${stats.total_value.toLocaleString()} ريال`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'معدل السعر اليومي'
    },
    {
      title: 'متوسط السعر',
      value: `${Math.round(stats.avg_daily_rate)} ريال`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'سعر يومي متوسط'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
      {statCards.map((stat, index) => (
        <Card 
          key={index} 
          className="hover:shadow-lg transition-all duration-300 hover:scale-105 interactive-hover group cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}