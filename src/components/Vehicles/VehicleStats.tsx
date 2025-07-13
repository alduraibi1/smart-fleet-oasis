import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, CheckCircle, Clock, Wrench } from 'lucide-react';
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
      .reduce((sum, v) => sum + v.dailyRate, 0)
  };

  const statCards = [
    {
      title: 'إجمالي المركبات',
      value: stats.total,
      icon: Car,
      color: 'text-primary'
    },
    {
      title: 'متاحة للتأجير',
      value: stats.available,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'مؤجرة حالياً',
      value: stats.rented,
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'في الصيانة',
      value: stats.maintenance,
      icon: Wrench,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {index === 1 && stats.total > 0 && (
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.available / stats.total) * 100)}% من الأسطول
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}