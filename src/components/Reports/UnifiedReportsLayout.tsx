
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  PieChart, 
  FileText, 
  Calendar,
  Download,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { ReportsOverview } from "./ReportsOverview";
import { FinancialPerformanceReport } from "./FinancialPerformanceReport";
import { VehicleUtilizationReport } from "./VehicleUtilizationReport";
import { CustomerAnalyticsReport } from "./CustomerAnalyticsReport";
import { ProfitabilityDashboard } from "./ProfitabilityDashboard";
import { KPIDashboard } from "./KPIDashboard";

interface AdvancedReportTab {
  id: string;
  name: string;
  icon: any;
  component: any;
  description: string;
  category: string;
}

const advancedReportTabs: AdvancedReportTab[] = [
  {
    id: "kpi",
    name: "مؤشرات الأداء",
    icon: TrendingUp,
    component: KPIDashboard,
    description: "مؤشرات الأداء الرئيسية والمقاييس الهامة",
    category: "dashboard"
  },
  {
    id: "financial",
    name: "الأداء المالي",
    icon: BarChart3,
    component: FinancialPerformanceReport,
    description: "تحليل شامل للأداء المالي والإيرادات",
    category: "financial"
  },
  {
    id: "profitability",
    name: "تحليل الربحية",
    icon: PieChart,
    component: ProfitabilityDashboard,
    description: "تحليل ربحية المركبات والعملاء",
    category: "financial"
  },
  {
    id: "vehicles",
    name: "استخدام المركبات",
    icon: BarChart3,
    component: VehicleUtilizationReport,
    description: "تقرير معدلات الاستخدام وكفاءة المركبات",
    category: "operational"
  },
  {
    id: "customers",
    name: "تحليل العملاء",
    icon: BarChart3,
    component: CustomerAnalyticsReport,
    description: "سلوك العملاء وأنماط الاستخدام",
    category: "customer"
  }
];

export function UnifiedReportsLayout() {
  const [activeAdvancedTab, setActiveAdvancedTab] = useState("kpi");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const exportAllReports = () => {
    console.log("تصدير جميع التقارير...");
  };

  const getCurrentAdvancedReport = () => {
    return advancedReportTabs.find(tab => tab.id === activeAdvancedTab);
  };

  const currentAdvancedReport = getCurrentAdvancedReport();
  const CurrentAdvancedComponent = currentAdvancedReport?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
          <p className="text-muted-foreground mt-2">
            مركز التقارير الشامل لجميع أقسام النظام
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
          </Button>
          <Button onClick={exportAllReports}>
            <Download className="h-4 w-4 mr-2" />
            تصدير التقارير
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            التقارير الأساسية
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            التحليلات المتقدمة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ReportsOverview />
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <div className="space-y-6">
            {/* Quick Stats for Advanced Reports */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">تقارير متقدمة</p>
                      <p className="text-2xl font-bold">{advancedReportTabs.length}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">آخر تحديث</p>
                      <p className="text-2xl font-bold">الآن</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">الفترة</p>
                      <p className="text-2xl font-bold">30 يوم</p>
                    </div>
                    <PieChart className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">دقة البيانات</p>
                      <p className="text-2xl font-bold">98%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Advanced Report Info */}
            {currentAdvancedReport && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <currentAdvancedReport.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{currentAdvancedReport.name}</h3>
                        <p className="text-sm text-muted-foreground">{currentAdvancedReport.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {currentAdvancedReport.category === 'financial' ? 'مالي' :
                       currentAdvancedReport.category === 'operational' ? 'تشغيلي' :
                       currentAdvancedReport.category === 'customer' ? 'عملاء' : 'لوحة تحكم'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Reports Tabs */}
            <Tabs value={activeAdvancedTab} onValueChange={setActiveAdvancedTab}>
              <TabsList className="grid w-full grid-cols-5">
                {advancedReportTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {advancedReportTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-6">
                  <CurrentAdvancedComponent />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
