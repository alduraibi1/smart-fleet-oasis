
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
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">التقارير</h1>
          <p className="text-sm text-muted-foreground">
            مركز التقارير الشامل لجميع أقسام النظام
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? "جاري التحديث..." : "تحديث"}</span>
          </Button>
          <Button size="sm" onClick={exportAllReports}>
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">تصدير</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs">
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">التقارير الأساسية</span>
            <span className="sm:hidden">أساسية</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2 text-xs">
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">التحليلات المتقدمة</span>
            <span className="sm:hidden">متقدمة</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <ReportsOverview />
        </TabsContent>

        <TabsContent value="advanced" className="mt-4">
          <div className="space-y-4">
            {/* Compact Stats for Advanced Reports */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">تقارير متقدمة</p>
                    <p className="text-lg font-bold">{advancedReportTabs.length}</p>
                  </div>
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">آخر تحديث</p>
                    <p className="text-lg font-bold">الآن</p>
                  </div>
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">الفترة</p>
                    <p className="text-lg font-bold">30 يوم</p>
                  </div>
                  <PieChart className="h-6 w-6 text-purple-500" />
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">دقة البيانات</p>
                    <p className="text-lg font-bold">98%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* Current Advanced Report Info */}
            {currentAdvancedReport && (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <currentAdvancedReport.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{currentAdvancedReport.name}</h3>
                      <p className="text-xs text-muted-foreground hidden sm:block">{currentAdvancedReport.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {currentAdvancedReport.category === 'financial' ? 'مالي' :
                     currentAdvancedReport.category === 'operational' ? 'تشغيلي' :
                     currentAdvancedReport.category === 'customer' ? 'عملاء' : 'لوحة تحكم'}
                  </Badge>
                </div>
              </Card>
            )}

            {/* Advanced Reports Tabs - Scrollable on mobile */}
            <Tabs value={activeAdvancedTab} onValueChange={setActiveAdvancedTab}>
              <div className="overflow-x-auto">
                <TabsList className="inline-flex w-max min-w-full">
                  {advancedReportTabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 text-xs whitespace-nowrap">
                      <tab.icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{tab.name}</span>
                      <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {advancedReportTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-4">
                  <div className="min-h-0">
                    <CurrentAdvancedComponent />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
