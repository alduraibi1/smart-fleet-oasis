
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileText, 
  Calendar,
  DollarSign,
  Car,
  Users,
  Download,
  RefreshCw
} from "lucide-react";
import { FinancialPerformanceReport } from "./FinancialPerformanceReport";
import { VehicleUtilizationReport } from "./VehicleUtilizationReport";
import { CustomerAnalyticsReport } from "./CustomerAnalyticsReport";
import { ProfitabilityDashboard } from "./ProfitabilityDashboard";
import { KPIDashboard } from "./KPIDashboard";

interface ReportTab {
  id: string;
  name: string;
  icon: any;
  component: any;
  description: string;
  category: string;
}

const reportTabs: ReportTab[] = [
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
    icon: DollarSign,
    component: FinancialPerformanceReport,
    description: "تحليل شامل للأداء المالي والإيرادات",
    category: "financial"
  },
  {
    id: "profitability",
    name: "تحليل الربحية",
    icon: BarChart3,
    component: ProfitabilityDashboard,
    description: "تحليل ربحية المركبات والعملاء",
    category: "financial"
  },
  {
    id: "vehicles",
    name: "استخدام المركبات",
    icon: Car,
    component: VehicleUtilizationReport,
    description: "تقرير معدلات الاستخدام وكفاءة المركبات",
    category: "operational"
  },
  {
    id: "customers",
    name: "تحليل العملاء",
    icon: Users,
    component: CustomerAnalyticsReport,
    description: "سلوك العملاء وأنماط الاستخدام",
    category: "customer"
  }
];

export function AdvancedReportsLayout() {
  const [activeTab, setActiveTab] = useState("kpi");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // محاكاة تحديث البيانات
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const exportAllReports = () => {
    console.log("تصدير جميع التقارير...");
    // سيتم تنفيذ منطق التصدير لاحقاً
  };

  const getCurrentReport = () => {
    return reportTabs.find(tab => tab.id === activeTab);
  };

  const currentReport = getCurrentReport();
  const CurrentComponent = currentReport?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التقارير المتقدمة</h1>
          <p className="text-muted-foreground">
            تحليلات شاملة ومؤشرات أداء متقدمة لجميع جوانب النشاط
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تقارير متاحة</p>
                <p className="text-2xl font-bold">{reportTabs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
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
              <BarChart3 className="h-8 w-8 text-purple-500" />
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

      {/* Current Report Info */}
      {currentReport && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <currentReport.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{currentReport.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentReport.description}</p>
                </div>
              </div>
              <Badge variant="outline">
                {currentReport.category === 'financial' ? 'مالي' :
                 currentReport.category === 'operational' ? 'تشغيلي' :
                 currentReport.category === 'customer' ? 'عملاء' : 'لوحة تحكم'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {reportTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {reportTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <CurrentComponent />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
