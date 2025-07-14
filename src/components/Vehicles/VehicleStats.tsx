import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, CheckCircle, Clock, Wrench, DollarSign, TrendingUp, Gauge } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';

interface VehicleStatsProps {
  vehicles: Vehicle[];
}

export default function VehicleStats({ vehicles }: VehicleStatsProps) {
  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    rented: vehicles.filter(v => v.status === 'rented').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    totalRevenue: vehicles
      .filter(v => v.status === 'rented')
      .reduce((sum, v) => sum + v.dailyRate, 0),
    averageRate: vehicles.length > 0 ? Math.round(vehicles.reduce((sum, v) => sum + v.dailyRate, 0) / vehicles.length) : 0,
    utilizationRate: vehicles.length > 0 ? Math.round((vehicles.filter(v => v.status === 'rented').length / vehicles.length) * 100) : 0
  };

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
      title: 'الإيرادات اليومية',
      value: `${stats.totalRevenue.toLocaleString()} ₪`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'من المركبات المؤجرة'
    },
    {
      title: 'معدل الاستخدام',
      value: `${stats.utilizationRate}%`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'كفاءة الأسطول'
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