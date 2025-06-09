
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'primary' 
}: MetricCardProps) {
  const colorClasses = {
    primary: 'text-rental-primary',
    success: 'text-rental-success',
    warning: 'text-rental-warning',
    danger: 'text-rental-danger'
  };

  return (
    <Card className="dashboard-card hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-rental-success' : 'text-rental-danger'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% من الشهر الماضي
          </p>
        )}
      </CardContent>
    </Card>
  );
}
