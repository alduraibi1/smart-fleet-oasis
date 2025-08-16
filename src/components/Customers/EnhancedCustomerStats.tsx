
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Star, 
  TrendingUp,
  AlertTriangle,
  Calendar
} from "lucide-react";

interface EnhancedCustomerStatsProps {
  customers: Customer[];
  loading?: boolean;
}

export const EnhancedCustomerStats = ({ customers, loading }: EnhancedCustomerStatsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">جارِ التحميل...</CardTitle>
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.is_active).length,
    inactive: customers.filter(c => !c.is_active).length,
    blacklisted: customers.filter(c => c.blacklisted).length,
    highRated: customers.filter(c => (c.rating || 0) >= 4).length,
    withRentals: customers.filter(c => (c.total_rentals || 0) > 0).length,
    averageRating: customers.length > 0 
      ? customers.reduce((sum, c) => sum + (c.rating || 0), 0) / customers.length 
      : 0,
    totalRentals: customers.reduce((sum, c) => sum + (c.total_rentals || 0), 0),
    expiringLicenses: customers.filter(c => {
      if (!c.license_expiry) return false;
      const expiryDate = new Date(c.license_expiry);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }).length,
    expiredLicenses: customers.filter(c => {
      if (!c.license_expiry) return false;
      const expiryDate = new Date(c.license_expiry);
      const today = new Date();
      return expiryDate < today;
    }).length
  };

  const statCards = [
    {
      title: "إجمالي العملاء",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: null
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
      title: "القائمة السوداء",
      value: stats.blacklisted,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
      percentage: stats.total > 0 ? Math.round((stats.blacklisted / stats.total) * 100) : 0
    },
    {
      title: "متوسط التقييم",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      suffix: "نجمة"
    }
  ];

  const additionalStats = [
    {
      title: "عملاء بتقييم عالي",
      value: stats.highRated,
      description: "4 نجوم فأكثر",
      color: "text-green-600"
    },
    {
      title: "عملاء لديهم إيجارات",
      value: stats.withRentals,
      description: "عميل نشط",
      color: "text-blue-600"
    },
    {
      title: "رخص تنتهي قريباً",
      value: stats.expiringLicenses,
      description: "خلال 30 يوم",
      color: "text-orange-600"
    },
    {
      title: "رخص منتهية",
      value: stats.expiredLicenses,
      description: "تحتاج تجديد",
      color: "text-red-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                {stat.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.suffix}</span>}
              </div>
              {stat.percentage !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {stat.percentage}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">من إجمالي العملاء</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* الإحصائيات الإضافية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            إحصائيات تفصيلية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {additionalStats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium mt-1">{stat.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تحذيرات مهمة */}
      {(stats.expiredLicenses > 0 || stats.expiringLicenses > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              تحذيرات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-800">
            <div className="space-y-2">
              {stats.expiredLicenses > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{stats.expiredLicenses} عميل لديهم رخص منتهية الصلاحية</span>
                </div>
              )}
              {stats.expiringLicenses > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{stats.expiringLicenses} عميل رخصهم تنتهي خلال 30 يوم</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
