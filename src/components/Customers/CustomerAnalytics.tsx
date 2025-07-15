import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  TrendingDown,
  Star,
  Calendar,
  MapPin,
  Phone,
  CreditCard
} from 'lucide-react';
import { Customer } from '@/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CustomerAnalyticsProps {
  customers: Customer[];
}

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ customers }) => {
  const analytics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.is_active).length;
    const inactive = total - active;
    const blacklisted = customers.filter(c => c.blacklisted).length;
    
    // تحليل بيانات إضافية
    const withInsurance = customers.filter(c => c.has_insurance).length;
    const highRating = customers.filter(c => c.rating >= 4).length;
    const recentCustomers = customers.filter(c => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(c.created_at) >= oneMonthAgo;
    }).length;
    
    // تحليل المدن
    const cityStats = customers.reduce((acc: Record<string, number>, customer) => {
      const city = customer.city || 'غير محدد';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});
    
    const topCities = Object.entries(cityStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    // تحليل المصادر
    const sourceStats = customers.reduce((acc: Record<string, number>, customer) => {
      const source = customer.customer_source || 'غير محدد';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    
    // متوسط التقييم
    const averageRating = total > 0 ? customers.reduce((sum, c) => sum + c.rating, 0) / total : 0;
    
    return {
      total,
      active,
      inactive,
      blacklisted,
      withInsurance,
      highRating,
      recentCustomers,
      topCities,
      sourceStats,
      averageRating,
      activePercentage: total > 0 ? (active / total) * 100 : 0,
      insurancePercentage: total > 0 ? (withInsurance / total) * 100 : 0,
      highRatingPercentage: total > 0 ? (highRating / total) * 100 : 0,
    };
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{analytics.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">العملاء النشطون</p>
                <p className="text-2xl font-bold text-green-600">{analytics.active}</p>
                <p className="text-xs text-muted-foreground">
                  {analytics.activePercentage.toFixed(1)}% من المجموع
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">عملاء جدد هذا الشهر</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.recentCustomers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط التقييم</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics.averageRating.toFixed(1)}
                  </p>
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </div>
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التحليلات المتقدمة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إحصائيات التأمين والجودة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              إحصائيات متقدمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>العملاء المؤمنون</span>
                <span>{analytics.insurancePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.insurancePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.withInsurance} من {analytics.total} عملاء
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>عملاء بتقييم عالي (4+ نجوم)</span>
                <span>{analytics.highRatingPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.highRatingPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.highRating} من {analytics.total} عملاء
              </p>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">في القائمة السوداء</span>
                <Badge variant={analytics.blacklisted > 0 ? "destructive" : "secondary"}>
                  {analytics.blacklisted}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* أهم المدن */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              التوزيع الجغرافي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topCities.length > 0 ? (
                analytics.topCities.map(([city, count]) => {
                  const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                  return (
                    <div key={city} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{city}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لا توجد بيانات مدن متاحة
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* مصادر العملاء */}
      <Card>
        <CardHeader>
          <CardTitle>مصادر العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.sourceStats).map(([source, count]) => {
              const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
              return (
                <div key={source} className="text-center p-4 rounded-lg border bg-card">
                  <p className="text-2xl font-bold text-primary">{count}</p>
                  <p className="text-sm font-medium">{source}</p>
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};