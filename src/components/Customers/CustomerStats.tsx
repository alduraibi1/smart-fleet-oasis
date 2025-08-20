
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserPlus, Star, CheckCircle, AlertTriangle } from 'lucide-react';

interface CustomerStatsProps {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageRating: number;
  validatedCustomers?: number;
  unvalidatedCustomers?: number;
}

export const CustomerStats = ({ 
  totalCustomers, 
  activeCustomers, 
  newCustomersThisMonth, 
  averageRating,
  validatedCustomers = 0,
  unvalidatedCustomers = 0
}: CustomerStatsProps) => {
  const stats = [
    {
      title: 'إجمالي العملاء',
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'العملاء النشطون',
      value: activeCustomers.toLocaleString(),
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'عملاء جدد هذا الشهر',
      value: newCustomersThisMonth.toLocaleString(),
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'متوسط التقييم',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'بيانات محققة',
      value: validatedCustomers.toLocaleString(),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'تحتاج مراجعة',
      value: unvalidatedCustomers.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
