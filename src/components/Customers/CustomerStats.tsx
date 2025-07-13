import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Star } from "lucide-react";

interface CustomerStatsProps {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  averageRating: number;
}

export const CustomerStats = ({
  totalCustomers,
  activeCustomers,
  newCustomersThisMonth,
  averageRating
}: CustomerStatsProps) => {
  const stats = [
    {
      title: "إجمالي العملاء",
      value: totalCustomers,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "العملاء النشطين",
      value: activeCustomers,
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "عملاء جدد هذا الشهر",
      value: newCustomersThisMonth,
      icon: UserPlus,
      color: "text-blue-600"
    },
    {
      title: "متوسط التقييم",
      value: averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};