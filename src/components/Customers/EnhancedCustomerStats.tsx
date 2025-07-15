import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserMinus, 
  Star, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  FileText,
  CreditCard
} from "lucide-react";

interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  blacklisted: number;
  newThisMonth: number;
  averageRating: number;
  totalRentals: number;
  averageRentalValue: number;
  expiringDocuments: number;
  expiredDocuments: number;
  highValueCustomers: number;
  repeatCustomers: number;
}

interface EnhancedCustomerStatsProps {
  stats: CustomerStats;
  isLoading?: boolean;
}

export const EnhancedCustomerStats = ({ stats, isLoading }: EnhancedCustomerStatsProps) => {
  const statCards = [
    {
      title: "إجمالي العملاء",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: stats.newThisMonth > 0 ? `+${stats.newThisMonth} هذا الشهر` : undefined
    },
    {
      title: "العملاء النشطين",
      value: stats.active,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      percentage: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
    },
    {
      title: "العملاء غير النشطين",
      value: stats.inactive,
      icon: UserX,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      percentage: stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0
    },
    {
      title: "القائمة السوداء",
      value: stats.blacklisted,
      icon: UserMinus,
      color: "text-red-600",
      bgColor: "bg-red-50",
      alert: stats.blacklisted > 0
    },
    {
      title: "متوسط التقييم",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      suffix: "نجمة"
    },
    {
      title: "إجمالي الإيجارات",
      value: stats.totalRentals,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "إيجار"
    },
    {
      title: "وثائق تنتهي قريباً",
      value: stats.expiringDocuments,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      alert: stats.expiringDocuments > 0
    },
    {
      title: "وثائق منتهية",
      value: stats.expiredDocuments,
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-50",
      alert: stats.expiredDocuments > 0
    },
    {
      title: "العملاء المتكررين",
      value: stats.repeatCustomers,
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      percentage: stats.total > 0 ? Math.round((stats.repeatCustomers / stats.total) * 100) : 0
    },
    {
      title: "العملاء عالي القيمة",
      value: stats.highValueCustomers,
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "عميل مميز"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className={`relative overflow-hidden ${stat.alert ? 'border-red-200 bg-red-50/30' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {typeof stat.value === 'number' && stat.value >= 1000 
                        ? `${(stat.value / 1000).toFixed(1)}K` 
                        : stat.value}
                    </p>
                    {stat.suffix && (
                      <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                    )}
                  </div>
                  
                  {stat.percentage !== undefined && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {stat.percentage}%
                      </Badge>
                    </div>
                  )}
                  
                  {stat.trend && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.trend}
                    </p>
                  )}
                </div>
                
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>

              {stat.alert && (
                <div className="absolute top-2 left-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};