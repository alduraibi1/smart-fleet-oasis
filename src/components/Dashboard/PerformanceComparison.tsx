
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ComparisonData {
  period: string;
  revenue: number;
  contracts: number;
  utilization: number;
  profit: number;
}

export const PerformanceComparison: React.FC = () => {
  const [comparisonPeriod, setComparisonPeriod] = useState('last_month');

  // Mock comparison data
  const currentData: ComparisonData = {
    period: 'هذا الشهر',
    revenue: 125000,
    contracts: 45,
    utilization: 78,
    profit: 35000
  };

  const comparisonData: Record<string, ComparisonData> = {
    last_month: {
      period: 'الشهر الماضي',
      revenue: 108000,
      contracts: 38,
      utilization: 72,
      profit: 28000
    },
    last_quarter: {
      period: 'الربع الماضي',
      revenue: 98000,
      contracts: 35,
      utilization: 68,
      profit: 25000
    },
    last_year: {
      period: 'العام الماضي',
      revenue: 95000,
      contracts: 32,
      utilization: 65,
      profit: 22000
    }
  };

  const selectedComparison = comparisonData[comparisonPeriod];

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Trend data for charts
  const trendData = [
    { name: 'يناير', current: 95000, previous: 85000 },
    { name: 'فبراير', current: 102000, previous: 88000 },
    { name: 'مارس', current: 108000, previous: 92000 },
    { name: 'أبريل', current: 115000, previous: 95000 },
    { name: 'مايو', current: 125000, previous: 98000 },
  ];

  const categoryComparison = [
    { name: 'سيارات اقتصادية', current: 35, previous: 28 },
    { name: 'سيارات متوسطة', current: 45, previous: 38 },
    { name: 'سيارات فاخرة', current: 25, previous: 22 },
    { name: 'دراجات نارية', current: 15, previous: 12 },
  ];

  const metrics = [
    {
      title: 'إجمالي الإيرادات',
      current: currentData.revenue,
      previous: selectedComparison.revenue,
      format: formatCurrency,
      icon: '💰'
    },
    {
      title: 'عدد العقود',
      current: currentData.contracts,
      previous: selectedComparison.contracts,
      format: (n: number) => n.toString(),
      icon: '📋'
    },
    {
      title: 'معدل الاستخدام',
      current: currentData.utilization,
      previous: selectedComparison.utilization,
      format: (n: number) => `${n}%`,
      icon: '📊'
    },
    {
      title: 'صافي الربح',
      current: currentData.profit,
      previous: selectedComparison.profit,
      format: formatCurrency,
      icon: '📈'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              مقارنات الأداء
            </CardTitle>
            
            <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_month">مقارنة بالشهر الماضي</SelectItem>
                <SelectItem value="last_quarter">مقارنة بالربع الماضي</SelectItem>
                <SelectItem value="last_year">مقارنة بالعام الماضي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => {
              const change = calculateChange(metric.current, metric.previous);
              const changeData = formatChange(change);
              const ChangeIcon = changeData.icon;
              
              return (
                <div key={index} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{metric.icon}</span>
                    <Badge variant={changeData.isPositive ? 'default' : 'destructive'}>
                      <ChangeIcon className="h-3 w-3 mr-1" />
                      {changeData.value}%
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                    {metric.title}
                  </h3>
                  
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {metric.format(metric.current)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedComparison.period}: {metric.format(metric.previous)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
              <TabsTrigger value="categories">الفئات</TabsTrigger>
              <TabsTrigger value="insights">الإحصائيات</TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>اتجاه الإيرادات الشهرية</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line 
                        type="monotone" 
                        dataKey="current" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="الفترة الحالية"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="previous" 
                        stroke="#94a3b8" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name={selectedComparison.period}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>مقارنة الأداء حسب الفئة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="current" fill="#3b82f6" name="الفترة الحالية" />
                      <Bar dataKey="previous" fill="#94a3b8" name={selectedComparison.period} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>الإحصائيات الرئيسية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>أفضل شهر للإيرادات</span>
                        <Badge>مايو</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>أعلى نسبة نمو</span>
                        <Badge variant="default">+15.7%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>متوسط العقود الشهرية</span>
                        <Badge variant="outline">39 عقد</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>معدل النمو السنوي</span>
                        <Badge variant="default">+24.3%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>التوصيات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          📈 الأداء متميز - استمر في الاستراتيجية الحالية
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          🎯 فرصة للنمو في فئة السيارات الاقتصادية
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-800">
                          ⚠️ تحسين معدل الاستخدام يمكن أن يزيد الأرباح
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
