
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Car,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { ReportsOverview } from "./ReportsOverview";
import { AdvancedReportsLayout } from "./AdvancedReportsLayout";

export function UnifiedReportsLayout() {
  const [activeTab, setActiveTab] = useState("overview");

  const reportStats = [
    {
      title: "إجمالي الإيرادات",
      value: "524,000 ر.س",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "العملاء النشطين",
      value: "1,429",
      change: "+8.2%",
      trend: "up", 
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "المركبات المؤجرة",
      value: "256",
      change: "+15.3%",
      trend: "up",
      icon: Car,
      color: "text-purple-600"
    },
    {
      title: "معدل النمو الشهري",
      value: "18.4%",
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="content-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="heading-responsive">التقارير والتحليلات</h1>
          <p className="subheading-responsive">
            تحليل شامل لأداء الأعمال والإحصائيات المالية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="btn-responsive">
            <Filter className="h-4 w-4 mr-2" />
            فلترة
          </Button>
          <Button size="sm" className="btn-responsive">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid mb-8">
        {reportStats.map((stat, index) => (
          <Card key={index} className="metric-card border-border/50 hover:border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${stat.color} bg-transparent`}
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-xs text-muted-foreground">هذا الشهر</span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg bg-background ${stat.color} opacity-80`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            تفاصيل التقارير
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 sm:px-6 border-b border-border/50">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 bg-muted/50 h-auto p-1">
                <TabsTrigger 
                  value="overview" 
                  className="text-sm py-2 data-[state=active]:bg-background"
                >
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="text-sm py-2 data-[state=active]:bg-background"
                >
                  تقارير متقدمة
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4 sm:p-6">
              <TabsContent value="overview" className="mt-0">
                <ReportsOverview />
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-0">
                <AdvancedReportsLayout />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
